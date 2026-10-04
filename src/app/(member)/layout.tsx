import BottomNav from '@/components/ui/BottomNav'
import { requireUser } from '@/lib/auth'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return (
    <>
      <main className="pb-28">{children}</main>
      <BottomNav variant="member" />
    </>
  )
}
