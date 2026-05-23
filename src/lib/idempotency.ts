import { redis } from './redis'

interface CachedResponse {
  status: number
  body: unknown
}

const IDEMPOTENCY_TTL = 60 * 60 * 24 // 24 hours

export async function getIdempotentResponse(
  key: string | null
): Promise<CachedResponse | null> {
  if (!key) return null

  try {
    const cached = await redis.get<CachedResponse>(`idempotency:${key}`)
    return cached
  } catch {
    // redis down shouldn't block the request
    return null
  }
}

export async function setIdempotentResponse(
  key: string | null,
  status: number,
  body: unknown
): Promise<void> {
  if (!key) return

  try {
    await redis.set(`idempotency:${key}`, { status, body }, { ex: IDEMPOTENCY_TTL })
  } catch {
    // don't fail the request if redis is down
  }
}
