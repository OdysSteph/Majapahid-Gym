'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, QrCode, CalendarDays, CreditCard, User,
  LayoutDashboard, ScanLine, Users, Wallet,
} from 'lucide-react'

const memberItems = [
  { href: '/dashboard', label: 'Beranda', Icon: Home },
  { href: '/checkin', label: 'Check-in', Icon: QrCode },
  { href: '/classes', label: 'Kelas', Icon: CalendarDays },
  { href: '/membership', label: 'Paket', Icon: CreditCard },
  { href: '/profile', label: 'Profil', Icon: User },
]

const adminItems = [
  { href: '/admin', label: 'Ringkasan', Icon: LayoutDashboard },
  { href: '/admin/scan', label: 'Scan', Icon: ScanLine },
  { href: '/admin/members', label: 'Member', Icon: Users },
  { href: '/admin/classes', label: 'Kelas', Icon: CalendarDays },
  { href: '/admin/payments', label: 'Bayar', Icon: Wallet },
]

export default function BottomNav({ variant }: { variant: 'member' | 'admin' }) {
  const path = usePathname()
  const items = variant === 'admin' ? adminItems : memberItems

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-line bg-paper/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const active = href === '/admin' ? path === href : path === href || path.startsWith(href + '/')
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${
                  active ? 'text-cobalt' : 'text-steel'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
