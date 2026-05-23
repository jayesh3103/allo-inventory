export function ReservationStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    PENDING: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    CONFIRMED: { bg: '#d1fae5', color: '#065f46', label: 'Confirmed' },
    RELEASED: { bg: '#e5e7eb', color: '#374151', label: 'Cancelled' },
    EXPIRED: { bg: '#fee2e2', color: '#991b1b', label: 'Expired' },
  }

  const s = styles[status] || styles.PENDING

  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}
