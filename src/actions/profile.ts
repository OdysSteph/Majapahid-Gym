'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'

const schema = z.object({
  full_name: z.string().trim().min(2, 'Nama minimal 2 huruf').max(80),
  phone: z.string().trim().regex(/^[0-9+\- ]{8,20}$/, 'Nomor HP tidak valid').or(z.literal('')),
})

export type FormState = { error?: string; ok?: boolean } | null

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser()
  const parsed = schema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq('id', user.id)
  if (error) return { error: 'Gagal menyimpan. Coba lagi.' }
  revalidatePath('/profile')
  return { ok: true }
}
