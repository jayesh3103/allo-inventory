import { prisma } from './prisma'

// release any reservations that are past their expiry time
// used by both the cron job and lazy cleanup on product listing
export async function expireStaleReservations() {
  const now = new Date()

  // find all pending reservations that have expired
  const expired = await prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: now },
    },
  })

  if (expired.length === 0) return 0

  // process each one - decrement reservedUnits and mark as EXPIRED
  let count = 0
  for (const reservation of expired) {
    try {
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
          where: { id: reservation.id },
          data: { status: 'EXPIRED' },
        }),
      ])
      count++
    } catch (err) {
      // might have been handled by another process, that's fine
      console.error(`Failed to expire reservation ${reservation.id}:`, err)
    }
  }

  return count
}
