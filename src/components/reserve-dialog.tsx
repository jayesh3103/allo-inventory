'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './toast'

interface ReserveDialogProps {
  product: { id: string; name: string; price: number }
  warehouse: { warehouseId: string; warehouseName: string; availableUnits: number }
  onClose: () => void
  onReserved: () => void
}

export function ReserveDialog({ product, warehouse, onClose, onReserved }: ReserveDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const maxQty = Math.min(warehouse.availableUnits, 10)

  async function handleReserve() {
    setLoading(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          productId: product.id,
          warehouseId: warehouse.warehouseId,
          quantity,
        }),
      })

      const data = await res.json()

      if (res.status === 409) {
        showToast(data.error || 'Not enough stock available', 'error')
        onClose()
        onReserved() // refresh to see updated stock
        return
      }

      if (!res.ok) {
        showToast(data.error || 'Something went wrong', 'error')
        return
      }

      showToast('Reservation created! Redirecting to checkout...', 'success')
      onReserved()
      router.push(`/checkout/${data.id}`)
    } catch {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={onClose}>
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* dialog */}
      <div
        className="relative z-50 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-1">Reserve {product.name}</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
          From {warehouse.warehouseName} · {warehouse.availableUnits} units available
        </p>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-lg border flex items-center justify-center text-lg font-medium transition-colors"
              style={{ borderColor: 'var(--card-border)' }}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="w-9 h-9 rounded-lg border flex items-center justify-center text-lg font-medium transition-colors"
              style={{ borderColor: 'var(--card-border)' }}
              disabled={quantity >= maxQty}
            >
              +
            </button>
          </div>
        </div>

        <div
          className="rounded-lg p-3 mb-5 text-sm"
          style={{ background: 'var(--muted-bg)' }}
        >
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted)' }}>Unit price</span>
            <span>₹{product.price.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between mt-1 font-semibold">
            <span>Total</span>
            <span>₹{(product.price * quantity).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--card-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleReserve}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
            style={{ background: 'var(--primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)' }}
          >
            {loading ? 'Reserving...' : 'Reserve Now'}
          </button>
        </div>

        <p className="text-xs mt-3 text-center" style={{ color: 'var(--muted)' }}>
          You'll have 10 minutes to complete payment
        </p>
      </div>
    </div>
  )
}
