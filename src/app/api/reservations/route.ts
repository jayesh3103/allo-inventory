import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createReservationSchema } from '@/lib/validators'
import { getIdempotentResponse, setIdempotentResponse } from '@/lib/idempotency'

const RESERVATION_TTL = parseInt(process.env.RESERVATION_TTL_MINUTES || '10', 10)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createReservationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { productId, warehouseId, quantity } = parsed.data

    // check idempotency
    const idempotencyKey = request.headers.get('Idempotency-Key')
    const cached = await getIdempotentResponse(idempotencyKey)
    if (cached) {
      return NextResponse.json(cached.body, { status: cached.status })
    }

    const expiresAt = new Date(Date.now() + RESERVATION_TTL * 60 * 1000)

    // atomic reservation using a transaction
    // the key insight: we do a conditional UPDATE that only succeeds
    // if there's enough available stock. this is a single SQL statement
    // so it's inherently safe under concurrency - no read-then-write race.
    const result = await prisma.$transaction(async (tx) => {
      // atomic conditional update - this is the race-condition prevention
      const updated = await tx.$executeRawUnsafe(
        `UPDATE "Inventory" 
         SET "reservedUnits" = "reservedUnits" + $1 
         WHERE "productId" = $2 
         AND "warehouseId" = $3 
         AND ("totalUnits" - "reservedUnits") >= $1`,
        quantity,
        productId,
        warehouseId
      )

      if (updated === 0) {
        // either the inventory row doesn't exist or there's not enough stock
        return null
      }

      // create the reservation record
      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: 'PENDING',
          expiresAt,
        },
        include: {
          product: true,
          warehouse: true,
        },
      })

      return reservation
    })

    if (!result) {
      const errorResponse = { error: 'Not enough stock available' }
      await setIdempotentResponse(idempotencyKey, 409, errorResponse)
      return NextResponse.json(errorResponse, { status: 409 })
    }

    const successBody = {
      id: result.id,
      productId: result.productId,
      warehouseId: result.warehouseId,
      quantity: result.quantity,
      status: result.status,
      expiresAt: result.expiresAt.toISOString(),
      product: {
        name: result.product.name,
        sku: result.product.sku,
        price: result.product.price,
      },
      warehouse: {
        name: result.warehouse.name,
        location: result.warehouse.location,
      },
    }

    await setIdempotentResponse(idempotencyKey, 201, successBody)
    return NextResponse.json(successBody, { status: 201 })
  } catch (err) {
    console.error('Reservation failed:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
