import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import QRDisplay from '@/components/member/QRDisplay'
import { requireUser, getActiveMembership } from '@/lib/auth'
import { fmtDate, todayISO } from '@/lib/utils'

export default async function CheckinPage() {
  const { supabase, user, profile } = await requireUser()
  const membership = await getActiveMembership(supabase, user.id, todayISO())

  return (
    <>
      <PageHeader title="Check-in" subtitle="Tunjukkan QR ini ke staf di pintu masuk." />
      <div className="px-5">
        {membership && membership.end_date ? (
          <>
            <QRDisplay />
            <div className="mt-6 text-center">
              <p className="text-xl font-semibold">{profile.full_name}</p>
              <p className="text-sm text-steel">
                {membership.membership_plans?.name} • sampai {fmtDate(membership.end_date)}
              </p>
              <p className="mt-4 text-xs text-steel">QR diperbarui otomatis. Screenshot tidak akan berlaku.</p>
            </div>
          </>
        ) : (
          <div className="panel p-5 text-center">
            <p className="text-lg font-semibold">Membership belum aktif</p>
            <p className="mt-1 text-sm text-steel">Beli paket dulu supaya QR check-in bisa dipakai.</p>
            <Link href="/membership" className="btn btn-primary mt-4">Lihat paket</Link>
          </div>
        )}
      </div>
    </>
  )
}
