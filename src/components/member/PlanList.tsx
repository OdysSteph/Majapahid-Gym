'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { rupiah } from '@/lib/utils'
import type { Plan } from '@/types'

type SnapCallbacks = {
  onSuccess?: () => void; onPending?: () => void; onError?: () => void; onClose?: () => void
}
declare global {
  interface Window { snap?: { pay: (token: string, cb: SnapCallbacks) => void } }
}

const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
const SNAP_URL = isProd ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js'

function loadSnap() {
  return new Promise<void>((resolve, reject) => {
    if (window.snap) return resolve()
    const s = document.createElement('script')
    s.src = SNAP_URL
    s.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '')
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Gagal memuat Midtrans'))
    document.body.appendChild(s)
  })
}

export default function PlanList({ plans, hasActive }: { plans: Plan[]; hasActive: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'err' | 'ok'; text: string } | null>(null)

  async function buy(planId: string) {
    setBusy(planId)
    setMsg(null)
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gagal memulai pembayaran')
      await loadSnap()
      window.snap!.pay(data.token, {
        onSuccess: () => { setMsg({ type: 'ok', text: 'Pembayaran berhasil. Membership sedang diaktifkan…' }); setTimeout(() => router.refresh(), 2500) },
        onPending: () => setMsg({ type: 'ok', text: 'Menunggu pembayaran. Selesaikan sesuai instruksi, status akan update otomatis.' }),
        onError: () => setMsg({ type: 'err', text: 'Pembayaran gagal. Coba lagi.' }),
        onClose: () => setBusy(null),
      })
    } catch (e) {
      setMsg({ type: 'err', text: e instanceof Error ? e.message : 'Terjadi kesalahan' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-3">
      {msg && <p className={msg.type === 'err' ? 'err' : 'okmsg'} role="status">{msg.text}</p>}
      {plans.map((p) => (
        <article key={p.id} className="panel flex items-center justify-between gap-3 p-4">
          <div>
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="text-sm text-steel">{p.duration_days} hari</p>
            <p className="mt-1 font-semibold">{rupiah(p.price)}</p>
          </div>
          <button onClick={() => buy(p.id)} disabled={busy !== null} className="btn btn-primary !w-auto">
            {busy === p.id ? 'Memproses…' : hasActive ? 'Perpanjang' : 'Beli'}
          </button>
        </article>
      ))}
    </div>
  )
}
