import Link from 'next/link'
import { GYM_NAME } from '@/lib/config'

export default function Landing() {
  return (
    <main className="flex min-h-dvh flex-col bg-ink px-6 pb-10 pt-16 text-white">
      <p className="text-sm text-white/60">Member app</p>
      <h1 className="h-display mt-2 text-[5.5rem] uppercase">{GYM_NAME}</h1>
      <p className="mt-6 max-w-xs text-lg text-white/75">
        Cek membership, scan masuk pakai QR, dan booking kelas dari HP.
      </p>
      <div className="mt-auto space-y-3">
        <Link href="/register" className="btn btn-primary">Daftar jadi member</Link>
        <Link href="/login" className="btn border border-white/25 text-white">Sudah punya akun? Masuk</Link>
      </div>
    </main>
  )
}
