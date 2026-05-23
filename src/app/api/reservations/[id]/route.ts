import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        product: true,
        warehouse: true,
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // if it's pending and expired, update status
    if (reservation.status === 'PENDING' && new Date() > reservation.expiresAt) {
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

      return NextResponse.json({
        id: reservation.id,
        productId: reservation.productId,
        warehouseId: reservation.warehouseId,
        quantity: reservation.quantity,
        status: 'EXPIRED',
        expiresAt: reservation.expiresAt.toISOString(),
        createdAt: reservation.createdAt.toISOString(),
        product: {
          name: reservation.product.name,
          sku: reservation.product.sku,
          price: reservation.product.price,
        },
        warehouse: {
          name: reservation.warehouse.name,
          location: reservation.warehouse.location,
        },
      })
    }

    return NextResponse.json({
      id: reservation.id,
      productId: reservation.productId,
      warehouseId: reservation.warehouseId,
      quantity: reservation.quantity,
      status: reservation.status,
      expiresAt: reservation.expiresAt.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      product: {
        name: reservation.product.name,
        sku: reservation.product.sku,
        price: reservation.product.price,
      },
      warehouse: {
        name: reservation.warehouse.name,
        location: reservation.warehouse.location,
      },
    })
  } catch (err) {
    console.error('Failed to fetch reservation:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
