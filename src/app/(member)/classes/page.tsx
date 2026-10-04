import PageHeader from '@/components/ui/PageHeader'
import ClassCard from '@/components/member/ClassCard'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import type { GymClass } from '@/types'

export default async function ClassesPage() {
  const { supabase, user } = await requireUser()

  const { data } = await supabase
    .from('classes').select('*').gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true }).limit(30)
  const classes = (data ?? []) as GymClass[]

  // hitung kuota terpakai (member tidak boleh baca booking orang lain, jadi pakai service role)
  const ids = classes.map((c) => c.id)
  const taken: Record<string, number> = {}
  if (ids.length) {
    const { data: all } = await createAdminClient()
      .from('class_bookings').select('class_id').in('class_id', ids).eq('status', 'booked')
    ;(all ?? []).forEach((b) => { taken[b.class_id] = (taken[b.class_id] ?? 0) + 1 })
  }

  const { data: mine } = await supabase
    .from('class_bookings').select('class_id').eq('user_id', user.id).eq('status', 'booked')
  const mineSet = new Set((mine ?? []).map((b) => b.class_id))

  return (
    <>
      <PageHeader title="Kelas" subtitle="Booking butuh membership aktif." />
      <div className="space-y-3 px-5">
        {classes.length === 0 && (
          <div className="panel p-5 text-center text-sm text-steel">Belum ada kelas terjadwal. Cek lagi nanti.</div>
        )}
        {classes.map((c) => (
          <ClassCard key={c.id} cls={c} booked={mineSet.has(c.id)} taken={taken[c.id] ?? 0} />
        ))}
      </div>
    </>
  )
}
