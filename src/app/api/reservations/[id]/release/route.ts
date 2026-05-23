import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // release the hold
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
        data: { status: 'RELEASED' },
      }),
    ])

    return NextResponse.json({
      id: reservation.id,
      status: 'RELEASED',
      message: 'Reservation cancelled successfully',
    })
  } catch (err) {
    console.error('Release failed:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
