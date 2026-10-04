'use client'

import { useState, useTransition } from 'react'
import { bookClass, cancelBooking } from '@/actions/classes'
import { fmtDateTime, fmtTime } from '@/lib/utils'
import type { GymClass } from '@/types'

export default function ClassCard({ cls, booked, taken }: { cls: GymClass; booked: boolean; taken: number }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const full = taken >= cls.capacity
  const left = Math.max(cls.capacity - taken, 0)

  function onClick() {
    setError('')
    start(async () => {
      const res = booked ? await cancelBooking(cls.id) : await bookClass(cls.id)
      if (res.error) setError(res.error)
    })
  }

  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-tight">{cls.name}</h3>
          <p className="mt-1 text-sm text-steel">{fmtDateTime(cls.starts_at)} – {fmtTime(cls.ends_at)}</p>
          {cls.instructor && <p className="text-sm text-steel">Instruktur: {cls.instructor}</p>}
        </div>
        <p className={`shrink-0 text-sm font-medium ${full ? 'text-bad' : 'text-iron'}`}>
          {full ? 'Penuh' : `${left} slot`}
        </p>
      </div>
      {error && <p className="err mt-3" role="alert">{error}</p>}
      <button
        onClick={onClick}
        disabled={pending || (!booked && full)}
        className={`btn mt-4 ${booked ? 'btn-ghost' : 'btn-primary'}`}
      >
        {pending ? 'Memproses…' : booked ? 'Batalkan booking' : full ? 'Kelas penuh' : 'Booking'}
      </button>
    </article>
  )
}
