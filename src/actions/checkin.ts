'use server'

import { requireStaff, getActiveMembership } from '@/lib/auth'
import { verifyToken } from '@/lib/qr'
import { todayISO, fmtDate } from '@/lib/utils'

export type CheckinResult = { ok: boolean; message: string; name?: string; endDate?: string }

export async function processCheckin(token: string): Promise<CheckinResult> {
  const { supabase, user } = await requireStaff()

  const memberId = verifyToken(token)
  if (!memberId) {
    return { ok: false, message: 'QR tidak valid atau sudah kedaluwarsa. Minta member buka ulang halaman check-in.' }
  }

  const { data: member } = await supabase.from('profiles').select('full_name').eq('id', memberId).single()
  if (!member) return { ok: false, message: 'Member tidak ditemukan.' }

  const membership = await getActiveMembership(supabase, memberId, todayISO())
  if (!membership || !membership.end_date) {
    return { ok: false, name: member.full_name, message: 'Membership tidak aktif. Arahkan ke kasir.' }
  }

  // cegah double scan dalam 10 menit
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from('checkins').select('id').eq('user_id', memberId).gte('checked_in_at', since).limit(1)
  if (recent && recent.length > 0) {
    return { ok: true, name: member.full_name, endDate: fmtDate(membership.end_date), message: 'Sudah check-in barusan.' }
  }

  const { error } = await supabase.from('checkins').insert({ user_id: memberId, checked_in_by: user.id })
  if (error) return { ok: false, name: member.full_name, message: 'Gagal mencatat check-in.' }

  return { ok: true, name: member.full_name, endDate: fmtDate(membership.end_date), message: 'Check-in berhasil.' }
}
