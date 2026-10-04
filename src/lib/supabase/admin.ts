import { createClient } from '@supabase/supabase-js'

// Bypass RLS. HANYA dipakai di server (route handler / server action).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
