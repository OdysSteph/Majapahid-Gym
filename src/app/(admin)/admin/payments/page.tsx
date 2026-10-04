import PageHeader from '@/components/ui/PageHeader'
import { requireStaff } from '@/lib/auth'
import { fmtDateTime, rupiah } from '@/lib/utils'

type Row = { id: string; amount: number; status: string; created_at: string; profiles: { full_name: string } | null }

const label: Record<string, string> = { pending: 'Menunggu', paid: 'Lunas', failed: 'Gagal', expired: 'Kedaluwarsa' }

export default async function PaymentsPage() {
  const { supabase } = await requireStaff()
  const { data } = await supabase
    .from('payments').select('id, amount, status, created_at, profiles(full_name)')
    .order('created_at', { ascending: false }).limit(50)
  const rows = (data ?? []) as unknown as Row[]

  return (
    <>
      <PageHeader title="Pembayaran" subtitle="50 transaksi terakhir" />
      <ul className="panel mx-5 divide-y divide-line">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 p-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{r.profiles?.full_name || 'Member'}</p>
              <p className="text-steel">{fmtDateTime(r.created_at)}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold">{rupiah(r.amount)}</p>
              <p className={r.status === 'paid' ? 'text-ok' : r.status === 'pending' ? 'text-steel' : 'text-bad'}>{label[r.status]}</p>
            </div>
          </li>
        ))}
        {rows.length === 0 && <li className="p-4 text-center text-steel">Belum ada transaksi.</li>}
      </ul>
    </>
  )
}
