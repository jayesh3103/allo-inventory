import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getIdempotentResponse, setIdempotentResponse } from '@/lib/idempotency'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // idempotency check
    const idempotencyKey = request.headers.get('Idempotency-Key')
    const cached = await getIdempotentResponse(idempotencyKey)
    if (cached) {
      return NextResponse.json(cached.body, { status: cached.status })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    if (reservation.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Reservation is already ${reservation.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    // check if expired
    if (new Date() > reservation.expiresAt) {
      // mark as expired and release the reserved units
      await prisma.$transaction([
        prisma.inventory.update({
          where: {
            productId_warehouseId: {
              productId: reservation.productId,
              warehouseId: reservation.warehouseId,
            },
          },
          data: {
            reservedUnits: { decrement: reservation.quantity },
          },
        }),
        prisma.reservation.update({
          where: { id },
          data: { status: 'EXPIRED' },
        }),
      ])

      const expiredBody = { error: 'Reservation has expired' }
      await setIdempotentResponse(idempotencyKey, 410, expiredBody)
      return NextResponse.json(expiredBody, { status: 410 })
    }

    // confirm: decrement both totalUnits and reservedUnits
    // totalUnits goes down because stock is permanently sold
    // reservedUnits goes down because the hold is no longer needed
    await prisma.$transaction([
      prisma.inventory.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          totalUnits: { decrement: reservation.quantity },
          reservedUnits: { decrement: reservation.quantity },
        },
      }),
      prisma.reservation.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      }),
    ])

    const body = {
      id: reservation.id,
      status: 'CONFIRMED',
      message: 'Purchase confirmed successfully',
    }
    await setIdempotentResponse(idempotencyKey, 200, body)
    return NextResponse.json(body)
  } catch (err) {
    console.error('Confirm failed:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
