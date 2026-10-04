import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Membership, Profile } from '@/types'

export async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!data) redirect('/login')
  return { supabase, user, profile: data as Profile }
}

export async function requireStaff() {
  const ctx = await requireUser()
  if (ctx.profile.role !== 'staff' && ctx.profile.role !== 'admin') redirect('/dashboard')
  return ctx
}

export async function getActiveMembership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  today: string
) {
  const { data } = await supabase
    .from('memberships')
    .select('*, membership_plans(name)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gte('end_date', today)
    .order('end_date', { ascending: false })
    .limit(1)
  return ((data ?? [])[0] ?? null) as Membership | null
}
