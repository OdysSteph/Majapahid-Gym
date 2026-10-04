import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSnapTransaction } from '@/lib/midtrans'

const body = z.object({ planId: z.string().uuid() })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Silakan login dulu.' }, { status: 401 })

  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Paket tidak valid.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: plan } = await admin
    .from('membership_plans').select('*').eq('id', parsed.data.planId).eq('is_active', true).single()
  if (!plan) return NextResponse.json({ error: 'Paket tidak ditemukan.' }, { status: 404 })

  const { data: profile } = await admin.from('profiles').select('full_name').eq('id', user.id).single()

  // harga SELALU dari database, bukan dari client
  const { data: membership, error: mErr } = await admin
    .from('memberships').insert({ user_id: user.id, plan_id: plan.id, status: 'pending' }).select('id').single()
  if (mErr || !membership) return NextResponse.json({ error: 'Gagal membuat membership.' }, { status: 500 })

  const orderId = `GYM-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const { error: pErr } = await admin.from('payments').insert({
    user_id: user.id,
    membership_id: membership.id,
    amount: plan.price,
    status: 'pending',
    midtrans_order_id: orderId,
  })
  if (pErr) return NextResponse.json({ error: 'Gagal membuat pembayaran.' }, { status: 500 })

  try {
    const snap = await createSnapTransaction({
      orderId, amount: plan.price, name: profile?.full_name || 'Member', email: user.email,
    })
    return NextResponse.json({ token: snap.token })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Midtrans error' }, { status: 502 })
  }
}
