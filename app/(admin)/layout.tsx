import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/sign-in?redirect=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_tier !== 'admin') {
    redirect('/dashboard?error=unauthorized')
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader
          userEmail={user.email || ''}
          userName={profile.full_name}
          avatarUrl={profile.avatar_url}
        />
        <main className="flex-1 p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
