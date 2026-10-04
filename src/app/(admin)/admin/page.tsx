import PageHeader from '@/components/ui/PageHeader'
import { requireStaff } from '@/lib/auth'
import { rupiah, startOfMonthISO, startOfTodayISO, todayISO } from '@/lib/utils'

export default async function AdminHome() {
  const { supabase } = await requireStaff()

  const [active, today, paid, total] = await Promise.all([
    supabase.from('memberships').select('user_id').eq('status', 'active').gte('end_date', todayISO()),
    supabase.from('checkins').select('id', { count: 'exact', head: true }).gte('checked_in_at', startOfTodayISO()),
    supabase.from('payments').select('amount').eq('status', 'paid').gte('paid_at', startOfMonthISO()),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'member'),
  ])

  const activeMembers = new Set((active.data ?? []).map((m) => m.user_id)).size
  const revenue = (paid.data ?? []).reduce((s, p) => s + p.amount, 0)

  const stats = [
    { label: 'Check-in hari ini', value: String(today.count ?? 0) },
    { label: 'Member aktif', value: String(activeMembers) },
    { label: 'Total member terdaftar', value: String(total.count ?? 0) },
  ]

  return (
    <>
      <PageHeader title="Ringkasan" subtitle="Panel staf" />
      <div className="space-y-3 px-5">
        <div className="rounded-md bg-ink p-5 text-white">
          <p className="text-sm text-white/60">Pemasukan bulan ini</p>
          <p className="h-display mt-1 text-5xl">{rupiah(revenue)}</p>
        </div>
        {stats.map((s) => (
          <div key={s.label} className="panel flex items-baseline justify-between p-4">
            <span className="text-iron">{s.label}</span>
            <span className="h-display text-4xl">{s.value}</span>
          </div>
        ))}
      </div>
    </>
  )
}
