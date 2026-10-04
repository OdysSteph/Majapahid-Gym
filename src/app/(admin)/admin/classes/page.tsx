import PageHeader from '@/components/ui/PageHeader'
import ClassForm from '@/components/admin/ClassForm'
import { requireStaff } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { fmtDateTime } from '@/lib/utils'
import type { GymClass } from '@/types'

export default async function AdminClassesPage() {
  const { supabase, profile } = await requireStaff()
  const { data } = await supabase
    .from('classes').select('*').gte('starts_at', new Date().toISOString()).order('starts_at').limit(30)
  const classes = (data ?? []) as GymClass[]

  const taken: Record<string, number> = {}
  if (classes.length) {
    const { data: b } = await createAdminClient()
      .from('class_bookings').select('class_id').in('class_id', classes.map((c) => c.id)).eq('status', 'booked')
    ;(b ?? []).forEach((x) => { taken[x.class_id] = (taken[x.class_id] ?? 0) + 1 })
  }

  return (
    <>
      <PageHeader title="Kelas" subtitle="Jadwal mendatang" />
      <div className="space-y-3 px-5">
        {profile.role === 'admin' && <ClassForm />}
        {classes.map((c) => (
          <div key={c.id} className="panel flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-steel">{fmtDateTime(c.starts_at)}{c.instructor ? ` • ${c.instructor}` : ''}</p>
            </div>
            <p className="h-display text-3xl">{taken[c.id] ?? 0}<span className="text-lg text-steel">/{c.capacity}</span></p>
          </div>
        ))}
        {classes.length === 0 && <p className="panel p-4 text-center text-sm text-steel">Belum ada kelas.</p>}
      </div>
    </>
  )
}
