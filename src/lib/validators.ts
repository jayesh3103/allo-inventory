import { z } from 'zod'

export const createReservationSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Maximum 100 units per reservation'),
})

export type CreateReservationInput = z.infer<typeof createReservationSchema>
