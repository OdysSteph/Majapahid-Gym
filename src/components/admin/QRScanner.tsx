'use client'

import { useRef, useState, useTransition } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { processCheckin, type CheckinResult } from '@/actions/checkin'

export default function QRScanner() {
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [pending, start] = useTransition()
  const busy = useRef(false)

  function handle(raw: string) {
    if (busy.current) return
    busy.current = true
    start(async () => {
      setResult(await processCheckin(raw))
      // jeda 3 detik sebelum boleh scan berikutnya
      setTimeout(() => { busy.current = false }, 3000)
    })
  }

  return (
    <div>
      <div className="overflow-hidden rounded-md border border-line bg-ink">
        <Scanner
          onScan={(codes) => codes[0]?.rawValue && handle(codes[0].rawValue)}
          onError={() => setResult({ ok: false, message: 'Kamera tidak bisa diakses. Izinkan akses kamera di browser.' })}
          constraints={{ facingMode: 'environment' }}
          formats={['qr_code']}
          paused={pending}
        />
      </div>

      <div className="mt-4 min-h-24" aria-live="polite">
        {pending && <p className="text-center text-steel">Memeriksa…</p>}
        {!pending && result && (
          <div className={`rounded-md p-4 ${result.ok ? 'bg-ok text-white' : 'bg-bad text-white'}`}>
            {result.name && <p className="h-display text-3xl uppercase">{result.name}</p>}
            <p className="mt-1 font-medium">{result.message}</p>
            {result.endDate && <p className="text-sm opacity-80">Aktif sampai {result.endDate}</p>}
          </div>
        )}
        {!pending && !result && <p className="text-center text-sm text-steel">Arahkan kamera ke QR member.</p>}
      </div>
    </div>
  )
}
