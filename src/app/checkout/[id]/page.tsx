'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CountdownTimer } from '@/components/countdown-timer'
import { ReservationStatusBadge } from '@/components/reservation-status'
import { ToastProvider, useToast } from '@/components/toast'

interface ReservationData {
  id: string
  productId: string
  warehouseId: string
  quantity: number
  status: string
  expiresAt: string
  createdAt: string
  product: {
    name: string
    sku: string
    price: number
  }
  warehouse: {
    name: string
    location: string
  }
}

function CheckoutContent() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [reservation, setReservation] = useState<ReservationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchReservation = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservations/${params.id}`)
      if (!res.ok) {
        showToast('Reservation not found', 'error')
        router.push('/')
        return
      }
      const data = await res.json()
      setReservation(data)
    } catch {
      showToast('Failed to load reservation', 'error')
    } finally {
      setLoading(false)
    }
  }, [params.id, router, showToast])

  useEffect(() => {
    fetchReservation()
  }, [fetchReservation])

  async function handleConfirm() {
    if (!reservation) return
    setActionLoading(true)

    try {
      const res = await fetch(`/api/reservations/${reservation.id}/confirm`, {
        method: 'POST',
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
        },
      })

      const data = await res.json()

      if (res.status === 410) {
        showToast('Reservation has expired', 'error')
        setReservation((prev) => prev ? { ...prev, status: 'EXPIRED' } : null)
        return
      }

      if (!res.ok) {
        showToast(data.error || 'Failed to confirm', 'error')
        return
      }

      showToast('Purchase confirmed!', 'success')
      setReservation((prev) => prev ? { ...prev, status: 'CONFIRMED' } : null)
    } catch {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    if (!reservation) return
    setActionLoading(true)

    try {
      const res = await fetch(`/api/reservations/${reservation.id}/release`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || 'Failed to cancel', 'error')
        return
      }

      showToast('Reservation cancelled', 'info')
      setReservation((prev) => prev ? { ...prev, status: 'RELEASED' } : null)
    } catch {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  function handleExpired() {
    setReservation((prev) => prev ? { ...prev, status: 'EXPIRED' } : null)
    showToast('Your reservation has expired', 'error')
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="animate-pulse" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="p-6">
            <div className="h-6 rounded w-1/2 mb-4" style={{ background: 'var(--muted-bg)' }} />
            <div className="h-4 rounded w-3/4 mb-2" style={{ background: 'var(--muted-bg)' }} />
            <div className="h-4 rounded w-1/2 mb-6" style={{ background: 'var(--muted-bg)' }} />
            <div className="h-16 rounded mb-4" style={{ background: 'var(--muted-bg)' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="text-center py-12">
        <p className="text-lg" style={{ color: 'var(--muted)' }}>Reservation not found</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 rounded-lg text-sm text-white"
          style={{ background: 'var(--primary)' }}
        >
          Back to Products
        </button>
      </div>
    )
  }

  const isPending = reservation.status === 'PENDING'
  const isTerminal = ['CONFIRMED', 'RELEASED', 'EXPIRED'].includes(reservation.status)

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => router.push('/')}
        className="text-sm mb-4 flex items-center gap-1 hover:underline"
        style={{ color: 'var(--primary)' }}
      >
        ← Back to Products
      </button>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        {/* header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Checkout</h1>
            <ReservationStatusBadge status={reservation.status} />
          </div>

          {/* order summary */}
          <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--muted-bg)' }}>
            <h3 className="font-medium mb-2">{reservation.product.name}</h3>
            <div className="space-y-1 text-sm" style={{ color: 'var(--muted)' }}>
              <p>SKU: {reservation.product.sku}</p>
              <p>Warehouse: {reservation.warehouse.name}</p>
              <p>Quantity: {reservation.quantity}</p>
            </div>
            <div className="mt-3 pt-3 flex justify-between font-semibold" style={{ borderTop: '1px solid var(--card-border)' }}>
              <span>Total</span>
              <span>₹{(reservation.product.price * reservation.quantity).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* countdown - only show for pending */}
          {isPending && (
            <CountdownTimer
              expiresAt={reservation.expiresAt}
              onExpired={handleExpired}
            />
          )}

          {/* terminal state messages */}
          {reservation.status === 'CONFIRMED' && (
            <div className="text-center p-4 rounded-lg" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p className="text-2xl mb-1">✓</p>
              <p className="font-semibold" style={{ color: '#166534' }}>Purchase Confirmed!</p>
              <p className="text-sm mt-1" style={{ color: '#15803d' }}>Your order has been placed successfully</p>
            </div>
          )}

          {reservation.status === 'RELEASED' && (
            <div className="text-center p-4 rounded-lg" style={{ background: 'var(--muted-bg)', border: '1px solid var(--card-border)' }}>
              <p className="text-2xl mb-1">✕</p>
              <p className="font-semibold">Reservation Cancelled</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>The reserved stock has been released</p>
            </div>
          )}

          {reservation.status === 'EXPIRED' && (
            <div className="text-center p-4 rounded-lg" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <p className="text-2xl mb-1">⏰</p>
              <p className="font-semibold" style={{ color: '#991b1b' }}>Reservation Expired</p>
              <p className="text-sm mt-1" style={{ color: '#b91c1c' }}>The hold has been released. Please try again.</p>
            </div>
          )}
        </div>

        {/* actions */}
        <div className="p-6 pt-2">
          {isPending && (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60"
                style={{ borderColor: 'var(--card-border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
                style={{ background: 'var(--success)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#15803d' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--success)' }}
              >
                {actionLoading ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          )}

          {isTerminal && (
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)' }}
            >
              Back to Products
            </button>
          )}
        </div>
      </div>

      {/* reservation ID footer */}
      <p className="text-center text-xs mt-4 font-mono" style={{ color: 'var(--muted)' }}>
        Reservation ID: {reservation.id}
      </p>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <ToastProvider>
      <CheckoutContent />
    </ToastProvider>
  )
}
