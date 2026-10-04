import crypto from 'crypto'

const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
const BASE = isProd ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'

export async function createSnapTransaction(p: { orderId: string; amount: number; name: string; email?: string }) {
  const auth = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64')
  const res = await fetch(`${BASE}/snap/v1/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Basic ${auth}` },
    body: JSON.stringify({
      transaction_details: { order_id: p.orderId, gross_amount: p.amount },
      customer_details: { first_name: p.name, email: p.email },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error_messages?.join(', ') ?? 'Gagal membuat transaksi Midtrans')
  return data as { token: string; redirect_url: string }
}

export function verifySignature(body: {
  order_id: string; status_code: string; gross_amount: string; signature_key: string
}) {
  const expected = crypto
    .createHash('sha512')
    .update(body.order_id + body.status_code + body.gross_amount + process.env.MIDTRANS_SERVER_KEY)
    .digest('hex')
  return expected === body.signature_key
}
