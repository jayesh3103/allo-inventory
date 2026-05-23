import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { expireStaleReservations } from '@/lib/reservation-expiry'

export async function GET() {
  try {
    // lazy cleanup: expire any stale reservations before returning stock
    await expireStaleReservations()

    const products = await prisma.product.findMany({
      include: {
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // map to a cleaner shape with availableUnits calculated
    const result = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      inventory: product.inventory.map((inv) => ({
        warehouseId: inv.warehouseId,
        warehouseName: inv.warehouse.name,
        warehouseLocation: inv.warehouse.location,
        totalUnits: inv.totalUnits,
        reservedUnits: inv.reservedUnits,
        availableUnits: inv.totalUnits - inv.reservedUnits,
      })),
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error('Failed to fetch products:', err)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
