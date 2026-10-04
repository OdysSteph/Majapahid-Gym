'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/actions/profile'
import type { Profile } from '@/types'

export default function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, null)
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input className="input bg-chalk text-steel" value={email} disabled readOnly />
      </div>
      <div>
        <label className="label" htmlFor="full_name">Nama lengkap</label>
        <input id="full_name" name="full_name" required defaultValue={profile.full_name} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">No. HP / WhatsApp</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={profile.phone ?? ''} className="input" />
      </div>
      {state?.error && <p className="err" role="alert">{state.error}</p>}
      {state?.ok && <p className="okmsg">Perubahan disimpan.</p>}
      <button className="btn btn-dark" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan perubahan'}</button>
    </form>
  )
}
