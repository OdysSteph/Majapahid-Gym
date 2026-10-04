import PageHeader from '@/components/ui/PageHeader'
import PlanList from '@/components/member/PlanList'
import { requireUser, getActiveMembership } from '@/lib/auth'
import { daysLeft, fmtDate, rupiah, todayISO } from '@/lib/utils'
import type { Plan } from '@/types'

export default async function MembershipPage() {
  const { supabase, user } = await requireUser()
  const membership = await getActiveMembership(supabase, user.id, todayISO())

  const { data: plans } = await supabase
    .from('membership_plans').select('*').eq('is_active', true).order('price', { ascending: true })

  const { data: history } = await supabase
    .from('payments').select('id, amount, status, created_at')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)

  const statusLabel: Record<string, string> = { pending: 'Menunggu', paid: 'Lunas', failed: 'Gagal', expired: 'Kedaluwarsa' }

  return (
    <>
      <PageHeader title="Paket" subtitle={
        membership?.end_date
          ? `Aktif sampai ${fmtDate(membership.end_date)} (${daysLeft(membership.end_date)} hari lagi). Perpanjangan disambung dari tanggal berakhir.`
          : 'Pilih paket sesuai kebutuhan latihan lo.'
      } />
      <div className="px-5">
        <PlanList plans={(plans ?? []) as Plan[]} hasActive={!!membership} />

        {(history ?? []).length > 0 && (
          <section className="mt-8">
            <h2 className="mb-2 text-sm font-semibold text-iron">Riwayat pembayaran</h2>
            <ul className="panel divide-y divide-line">
              {(history ?? []).map((h) => (
                <li key={h.id} className="flex items-center justify-between p-3 text-sm">
                  <span>
                    <span className="block font-medium">{rupiah(h.amount)}</span>
                    <span className="text-steel">{fmtDate(h.created_at)}</span>
                  </span>
                  <span className={h.status === 'paid' ? 'font-medium text-ok' : h.status === 'pending' ? 'text-steel' : 'text-bad'}>
                    {statusLabel[h.status]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}
