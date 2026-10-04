'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser, getActiveMembership } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { todayISO } from '@/lib/utils'
import type { FormState } from './profile'

export async function bookClass(classId: string): Promise<{ error?: string; ok?: boolean }> {
  const { supabase, user } = await requireUser()

  const membership = await getActiveMembership(supabase, user.id, todayISO())
  if (!membership) return { error: 'Membership kamu belum aktif. Beli paket dulu.' }

  // pakai service role: member nggak boleh lihat booking orang lain, tapi kita perlu hitung kuota
  const admin = createAdminClient()
  const { data: cls } = await admin.from('classes').select('capacity, starts_at').eq('id', classId).single()
  if (!cls || new Date(cls.starts_at) < new Date()) return { error: 'Kelas ini sudah lewat.' }

  const { count } = await admin
    .from('class_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)
    .eq('status', 'booked')
  if ((count ?? 0) >= cls.capacity) return { error: 'Kelas sudah penuh.' }

  const { error } = await admin
    .from('class_bookings')
    .upsert({ user_id: user.id, class_id: classId, status: 'booked' }, { onConflict: 'user_id,class_id' })
  if (error) return { error: 'Gagal booking. Coba lagi.' }

  revalidatePath('/classes')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function cancelBooking(classId: string): Promise<{ error?: string; ok?: boolean }> {
  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from('class_bookings')
    .update({ status: 'cancelled' })
    .eq('class_id', classId)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal membatalkan.' }
  revalidatePath('/classes')
  revalidatePath('/dashboard')
  return { ok: true }
}

const classSchema = z.object({
  name: z.string().trim().min(2, 'Nama kelas wajib diisi'),
  instructor: z.string().trim().optional(),
  starts_at: z.string().min(1, 'Waktu mulai wajib diisi'),
  ends_at: z.string().min(1, 'Waktu selesai wajib diisi'),
  capacity: z.coerce.number().int().min(1, 'Kuota minimal 1'),
})

export async function createClass(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser()
  const parsed = classSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const d = parsed.data

  // input datetime-local dianggap WIB
  const starts = new Date(`${d.starts_at}:00+07:00`)
  const ends = new Date(`${d.ends_at}:00+07:00`)
  if (ends <= starts) return { error: 'Waktu selesai harus setelah waktu mulai.' }

  // RLS: hanya admin yang lolos insert
  const { error } = await supabase.from('classes').insert({
    name: d.name,
    instructor: d.instructor || null,
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    capacity: d.capacity,
  })
  if (error) return { error: 'Gagal menyimpan. Pastikan akun lo role admin.' }
  revalidatePath('/admin/classes')
  revalidatePath('/classes')
  return { ok: true }
}
