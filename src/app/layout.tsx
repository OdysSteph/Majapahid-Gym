import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import { GYM_NAME } from '@/lib/config'
import './globals.css'

const display = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-barlow' })
const sans = DM_Sans({ subsets: ['latin'], variable: '--font-dm' })

export const metadata: Metadata = {
  title: GYM_NAME,
  description: `Aplikasi member ${GYM_NAME}`,
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: GYM_NAME, statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  themeColor: '#15181C',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable}`}>
      <body>
        <div className="relative mx-auto min-h-dvh w-full max-w-md bg-chalk">{children}</div>
      </body>
    </html>
  )
}
