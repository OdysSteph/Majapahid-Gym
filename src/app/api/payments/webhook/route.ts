import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifySignature } from '@/lib/midtrans'
import { addDays, todayISO } from '@/lib/utils'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body || !verifySignature(body)) return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })

  const admin = createAdminClient()
  const { data: payment } = await admin
    .from('payments').select('*').eq('midtrans_order_id', body.order_id).single()
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // pastikan nominal cocok
  if (Math.round(Number(body.gross_amount)) !== payment.amount) {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
  }
  // idempotent: webhook bisa dikirim berkali-kali
  if (payment.status === 'paid') return NextResponse.json({ ok: true })

  const t = body.transaction_status as string
  const fraud = body.fraud_status as string | undefined
  const success = t === 'settlement' || (t === 'capture' && (!fraud || fraud === 'accept'))

  if (success) {
    const { data: membership } = await admin
      .from('memberships').select('*, membership_plans(duration_days)').eq('id', payment.membership_id).single()
    if (membership) {
      const duration = (membership.membership_plans as { duration_days: number }).duration_days

      // kalau masih ada membership aktif, perpanjang mulai sehari setelah berakhir
      const today = todayISO()
      const { data: current } = await admin
        .from('memberships').select('end_date')
        .eq('user_id', payment.user_id).eq('status', 'active').gte('end_date', today)
        .order('end_date', { ascending: false }).limit(1)
      const start = current?.[0]?.end_date ? addDays(current[0].end_date, 1) : today

      await admin.from('memberships').update({
        status: 'active', start_date: start, end_date: addDays(start, duration - 1),
      }).eq('id', membership.id)
    }
    await admin.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', payment.id)
  } else if (t === 'expire') {
    await admin.from('payments').update({ status: 'expired' }).eq('id', payment.id)
    await admin.from('memberships').update({ status: 'cancelled' }).eq('id', payment.membership_id)
  } else if (t === 'deny' || t === 'cancel' || t === 'failure') {
    await admin.from('payments').update({ status: 'failed' }).eq('id', payment.id)
    await admin.from('memberships').update({ status: 'cancelled' }).eq('id', payment.membership_id)
  }
  // 'pending' -> biarkan

  return NextResponse.json({ ok: true })
}
