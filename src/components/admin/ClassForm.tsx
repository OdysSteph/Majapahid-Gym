'use client'

import { useActionState, useRef, useEffect } from 'react'
import { createClass } from '@/actions/classes'

export default function ClassForm() {
  const [state, action, pending] = useActionState(createClass, null)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => { if (state?.ok) ref.current?.reset() }, [state])

  return (
    <form ref={ref} action={action} className="panel space-y-3 p-4">
      <h2 className="font-semibold">Tambah kelas</h2>
      <div><label className="label" htmlFor="name">Nama kelas</label><input id="name" name="name" required className="input" /></div>
      <div><label className="label" htmlFor="instructor">Instruktur</label><input id="instructor" name="instructor" className="input" /></div>
      <div><label className="label" htmlFor="starts_at">Mulai</label><input id="starts_at" name="starts_at" type="datetime-local" required className="input" /></div>
      <div><label className="label" htmlFor="ends_at">Selesai</label><input id="ends_at" name="ends_at" type="datetime-local" required className="input" /></div>
      <div><label className="label" htmlFor="capacity">Kuota</label><input id="capacity" name="capacity" type="number" min={1} defaultValue={15} required className="input" /></div>
      {state?.error && <p className="err" role="alert">{state.error}</p>}
      {state?.ok && <p className="okmsg">Kelas ditambahkan.</p>}
      <button className="btn btn-dark" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan kelas'}</button>
    </form>
  )
}
