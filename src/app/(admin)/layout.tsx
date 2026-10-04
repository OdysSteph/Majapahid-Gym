import BottomNav from '@/components/ui/BottomNav'
import { requireStaff } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireStaff()
  return (
    <>
      <main className="pb-28">{children}</main>
      <BottomNav variant="admin" />
    </>
  )
}
