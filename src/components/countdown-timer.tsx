'use client'

import { useState, useEffect } from 'react'

export function CountdownTimer({
  expiresAt,
  onExpired,
}: {
  expiresAt: string
  onExpired: () => void
}) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    return Math.max(0, new Date(expiresAt).getTime() - Date.now())
  })

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpired()
      return
    }

    const timer = setInterval(() => {
      const remaining = Math.max(0, new Date(expiresAt).getTime() - Date.now())
      setTimeLeft(remaining)

      if (remaining <= 0) {
        onExpired()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpired, timeLeft])

  const totalSeconds = Math.floor(timeLeft / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const isUrgent = totalSeconds < 120 // less than 2 minutes

  return (
    <div
      className="text-center p-4 rounded-lg"
      style={{
        background: isUrgent ? '#fef2f2' : 'var(--muted-bg)',
        border: isUrgent ? '1px solid #fecaca' : '1px solid var(--card-border)',
      }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
        {timeLeft <= 0 ? 'RESERVATION EXPIRED' : 'TIME REMAINING'}
      </p>
      <p
        className="text-3xl font-bold font-mono"
        style={{ color: isUrgent ? 'var(--danger)' : 'var(--foreground)' }}
      >
        {timeLeft <= 0 ? '00:00' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
      </p>
      {isUrgent && timeLeft > 0 && (
        <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>Hurry! Complete your purchase</p>
      )}
    </div>
  )
}
