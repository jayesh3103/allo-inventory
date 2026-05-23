'use client'

import { useEffect, useState, useCallback } from 'react'
import { ProductCard } from '@/components/product-card'
import { ToastProvider } from '@/components/toast'

interface InventoryItem {
  warehouseId: string
  warehouseName: string
  warehouseLocation: string
  totalUnits: number
  reservedUnits: number
  availableUnits: number
}

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  price: number
  inventory: InventoryItem[]
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <ToastProvider>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Browse our catalog and reserve items for checkout
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-lg p-5 animate-pulse"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
              >
                <div className="h-6 rounded w-1/2 mb-3" style={{ background: 'var(--muted-bg)' }} />
                <div className="h-4 rounded w-3/4 mb-4" style={{ background: 'var(--muted-bg)' }} />
                <div className="h-20 rounded" style={{ background: 'var(--muted-bg)' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onReserved={fetchProducts}
              />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
            <p className="text-lg">No products available</p>
            <p className="text-sm mt-1">Check back later</p>
          </div>
        )}
      </div>
    </ToastProvider>
  )
}
