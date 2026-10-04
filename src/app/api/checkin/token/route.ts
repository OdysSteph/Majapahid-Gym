import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signToken } from '@/lib/qr'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ token: signToken(user.id) }, { headers: { 'Cache-Control': 'no-store' } })
}
