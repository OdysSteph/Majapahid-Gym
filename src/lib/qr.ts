import crypto from 'crypto'

const TTL_MS = 90_000

function sign(payload: string) {
  return crypto.createHmac('sha256', process.env.QR_SECRET!).update(payload).digest('hex').slice(0, 32)
}

export function signToken(userId: string) {
  const ts = Date.now()
  return `${userId}.${ts}.${sign(`${userId}.${ts}`)}`
}

/** Return userId kalau valid & belum kedaluwarsa, selain itu null */
export function verifyToken(token: string): string | null {
  const [userId, ts, sig] = token.trim().split('.')
  if (!userId || !ts || !sig) return null
  const expected = sign(`${userId}.${ts}`)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  if (Date.now() - Number(ts) > TTL_MS) return null
  return userId
}
