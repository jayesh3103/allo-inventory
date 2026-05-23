import { NextResponse } from 'next/server'
import { expireStaleReservations } from '@/lib/reservation-expiry'

export async function GET(request: Request) {
  // verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const count = await expireStaleReservations()
    return NextResponse.json({
      success: true,
      expired: count,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Cron job failed:', err)
    return NextResponse.json(
      { error: 'Failed to expire reservations' },
      { status: 500 }
    )
  }
}
