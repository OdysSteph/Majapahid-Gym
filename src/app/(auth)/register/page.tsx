'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await createClient().auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name.trim(), phone: form.phone.trim() } },
    })
    setLoading(false)
    if (error) return setError(error.message)
    if (data.session) {
      router.replace('/dashboard')
      router.refresh()
    } else {
      setInfo('Akun dibuat. Cek email lo untuk konfirmasi, lalu masuk.')
    }
  }

  return (
    <main className="px-6 pb-10 pt-16">
      <h1 className="h-display text-5xl uppercase">Daftar</h1>
      <p className="mt-2 text-steel">Cuma butuh satu menit.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="name">Nama lengkap</label>
          <input id="name" required minLength={2} autoComplete="name" className="input" value={form.full_name} onChange={set('full_name')} />
        </div>
        <div>
          <label className="label" htmlFor="phone">No. HP / WhatsApp</label>
          <input id="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="08xxxxxxxxxx" className="input" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} autoComplete="new-password" className="input" value={form.password} onChange={set('password')} />
          <p className="mt-1 text-xs text-steel">Minimal 8 karakter.</p>
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        {info && <p className="okmsg">{info}</p>}
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Memproses…' : 'Buat akun'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-steel">
        Sudah punya akun? <Link href="/login" className="font-semibold text-cobalt">Masuk</Link>
      </p>
    </main>
  )
}
