'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRDisplay() {
  const [token, setToken] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const res = await fetch('/api/checkin/token', { cache: 'no-store' })
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (alive) { setToken(data.token); setFailed(false) }
      } catch {
        if (alive) setFailed(true)
      }
    }
    load()
    const t = setInterval(load, 40_000) // token berlaku 90 detik, diperbarui tiap 40 detik
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => { alive = false; clearInterval(t); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  return (
    <div className="mx-auto flex aspect-square w-64 items-center justify-center rounded-md border border-line bg-white p-4">
      {token ? (
        <QRCodeSVG value={token} size={224} level="M" />
      ) : failed ? (
        <p className="text-center text-sm text-bad">Gagal memuat QR. Cek koneksi lo.</p>
      ) : (
        <p className="text-sm text-steel">Memuat QR…</p>
      )}
    </div>
  )
}
