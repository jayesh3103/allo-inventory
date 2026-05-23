import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // clear existing data
  await prisma.reservation.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.warehouse.deleteMany()

  // create warehouses
  const warehouses = await Promise.all([
    prisma.warehouse.create({
      data: {
        name: 'Mumbai Central',
        location: 'Mumbai, Maharashtra',
      },
    }),
    prisma.warehouse.create({
      data: {
        name: 'Delhi NCR Hub',
        location: 'Gurugram, Haryana',
      },
    }),
    prisma.warehouse.create({
      data: {
        name: 'Bangalore Tech Park',
        location: 'Whitefield, Bangalore',
      },
    }),
  ])

  console.log(`Created ${warehouses.length} warehouses`)

  // create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Allo Delay Spray',
        sku: 'ALLO-DLY-001',
        description: 'Clinically proven lidocaine spray to help you last longer in bed',
        price: 499.0,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Performance Plus Tablets',
        sku: 'ALLO-SDF-050',
        description: 'Prescription-grade Sildenafil (50mg) for strong and lasting erections',
        price: 899.0,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Daily Wellness Gummies',
        sku: 'ALLO-GUM-001',
        description: 'Multi-vitamin gummies for daily energy, stamina, and overall men\'s health',
        price: 599.0,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Stamina Booster Drops',
        sku: 'ALLO-DRP-001',
        description: 'Ayurvedic herbal blend to naturally boost your stamina and performance',
        price: 349.0,
      },
    }),
  ])

  console.log(`Created ${products.length} products`)

  // stock levels - some intentionally low to demo contention
  const stockLevels = [
    // Earbuds: decent stock in Mumbai, low elsewhere
    { product: 0, warehouse: 0, total: 25 },
    { product: 0, warehouse: 1, total: 3 },
    { product: 0, warehouse: 2, total: 12 },
    // Keyboard: low stock everywhere
    { product: 1, warehouse: 0, total: 5 },
    { product: 1, warehouse: 1, total: 2 },
    { product: 1, warehouse: 2, total: 8 },
    // USB-C Hub: good stock
    { product: 2, warehouse: 0, total: 40 },
    { product: 2, warehouse: 1, total: 35 },
    { product: 2, warehouse: 2, total: 50 },
    // Laptop Stand: moderate stock
    { product: 3, warehouse: 0, total: 15 },
    { product: 3, warehouse: 1, total: 10 },
    { product: 3, warehouse: 2, total: 20 },
  ]

  for (const { product, warehouse, total } of stockLevels) {
    await prisma.inventory.create({
      data: {
        productId: products[product].id,
        warehouseId: warehouses[warehouse].id,
        totalUnits: total,
        reservedUnits: 0,
      },
    })
  }

  console.log(`Created ${stockLevels.length} inventory records`)
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
