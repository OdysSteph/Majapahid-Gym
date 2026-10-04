import Link from 'next/link'
import { requireUser, getActiveMembership } from '@/lib/auth'
import { daysLeft, fmtDate, fmtDateTime, startOfMonthISO, todayISO } from '@/lib/utils'

type BookingRow = { id: string; classes: { name: string; instructor: string | null; starts_at: string } }

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireUser()
  const today = todayISO()

  const [membership, bookingsRes, monthRes, lastRes] = await Promise.all([
    getActiveMembership(supabase, user.id, today),
    supabase
      .from('class_bookings')
      .select('id, classes!inner(name, instructor, starts_at)')
      .eq('user_id', user.id)
      .eq('status', 'booked')
      .gte('classes.starts_at', new Date().toISOString())
      .order('starts_at', { referencedTable: 'classes', ascending: true })
      .limit(1),
    supabase.from('checkins').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('checked_in_at', startOfMonthISO()),
    supabase.from('checkins').select('id, checked_in_at')
      .eq('user_id', user.id).order('checked_in_at', { ascending: false }).limit(3),
  ])

  const nextClass = ((bookingsRes.data ?? []) as unknown as BookingRow[])[0]
  const left = membership?.end_date ? daysLeft(membership.end_date) : 0
  const isStaff = profile.role !== 'member'

  return (
    <div className="px-5 pt-8" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}>
      <p className="text-sm text-steel">Halo,</p>
      <h1 className="h-display text-4xl uppercase">{profile.full_name.split(' ')[0] || 'Member'}</h1>

      {/* Kartu member: satu-satunya blok gelap di halaman */}
      <section className="mt-5 rounded-md bg-ink p-5 text-white">
        {membership && membership.end_date ? (
          <>
            <p className="text-sm text-white/60">{membership.membership_plans?.name}</p>
            <p className="h-display mt-2 text-8xl">{left}</p>
            <p className="-mt-1 text-lg text-white/80">hari tersisa</p>
            <p className="mt-4 border-t border-white/15 pt-3 text-sm text-white/60">
              Aktif sampai {fmtDate(membership.end_date)}
            </p>
            {left <= 7 && (
              <Link href="/membership" className="btn btn-primary mt-4">Perpanjang sekarang</Link>
            )}
          </>
        ) : (
          <>
            <p className="h-display text-4xl uppercase">Belum ada membership</p>
            <p className="mt-2 text-white/70">Pilih paket untuk mulai latihan dan booking kelas.</p>
            <Link href="/membership" className="btn btn-primary mt-4">Lihat paket</Link>
          </>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-iron">Kelas berikutnya</h2>
        {nextClass ? (
          <div className="panel p-4">
            <p className="text-lg font-semibold">{nextClass.classes.name}</p>
            <p className="text-sm text-steel">
              {fmtDateTime(nextClass.classes.starts_at)}
              {nextClass.classes.instructor ? ` • ${nextClass.classes.instructor}` : ''}
            </p>
          </div>
        ) : (
          <div className="panel p-4 text-sm text-steel">
            Belum ada kelas yang di-booking. <Link href="/classes" className="font-semibold text-cobalt">Cari kelas</Link>
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-iron">Latihan bulan ini</h2>
        <div className="panel p-4">
          <p><span className="h-display text-5xl">{monthRes.count ?? 0}</span> <span className="text-steel">kali datang</span></p>
          {(lastRes.data ?? []).length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-line pt-3 text-sm text-steel">
              {(lastRes.data ?? []).map((c) => <li key={c.id}>{fmtDateTime(c.checked_in_at)}</li>)}
            </ul>
          )}
        </div>
      </section>

      {isStaff && (
        <Link href="/admin" className="btn btn-ghost mt-6">Buka panel staf</Link>
      )}
    </div>
  )
}
