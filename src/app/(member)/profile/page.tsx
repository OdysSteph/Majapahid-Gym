import PageHeader from '@/components/ui/PageHeader'
import ProfileForm from '@/components/member/ProfileForm'
import { requireUser } from '@/lib/auth'
import { signOut } from '@/actions/auth'

export default async function ProfilePage() {
  const { user, profile } = await requireUser()
  return (
    <>
      <PageHeader title="Profil" />
      <div className="px-5">
        <ProfileForm profile={profile} email={user.email ?? ''} />
        <form action={signOut} className="mt-4">
          <button className="btn btn-ghost !text-bad">Keluar</button>
        </form>
      </div>
    </>
  )
}
