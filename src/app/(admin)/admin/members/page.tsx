import PageHeader from '@/components/ui/PageHeader'
import { requireStaff } from '@/lib/auth'
import { fmtDate, todayISO } from '@/lib/utils'
import type { Profile } from '@/types'

export default async function MembersPage() {
  const { supabase } = await requireStaff()
  const today = todayISO()

  const [{ data: profiles }, { data: ms }] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'member').order('created_at', { ascending: false }).limit(200),
    supabase.from('memberships').select('user_id, end_date').eq('status', 'active').gte('end_date', today),
  ])

  const endByUser = new Map<string, string>()
  ;(ms ?? []).forEach((m) => {
    if (m.end_date && (!endByUser.has(m.user_id) || m.end_date > endByUser.get(m.user_id)!)) endByUser.set(m.user_id, m.end_date)
  })

  return (
    <>
      <PageHeader title="Member" subtitle={`${(profiles ?? []).length} terdaftar`} />
      <ul className="panel mx-5 divide-y divide-line">
        {((profiles ?? []) as Profile[]).map((p) => {
          const end = endByUser.get(p.id)
          return (
            <li key={p.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.full_name || '(tanpa nama)'}</p>
                <p className="text-sm text-steel">{p.phone ?? 'Tanpa nomor HP'}</p>
              </div>
              <p className={`shrink-0 text-right text-sm ${end ? 'text-ok' : 'text-steel'}`}>
                {end ? `Aktif s/d ${fmtDate(end)}` : 'Tidak aktif'}
              </p>
            </li>
          )
        })}
        {(profiles ?? []).length === 0 && <li className="p-4 text-center text-sm text-steel">Belum ada member.</li>}
      </ul>
    </>
  )
}
