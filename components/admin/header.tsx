'use client'

import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AdminHeaderProps {
  userEmail: string
  userName?: string
  avatarUrl?: string
}

export function AdminHeader({ userEmail, userName, avatarUrl }: AdminHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
    router.refresh()
  }

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase()
    : userEmail[0].toUpperCase()

  return (
    <header className="border-b-4 border-border bg-background px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="border-brutal">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{userName || 'Admin'}</p>
              <p className="text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-brutal shadow-brutal-sm hover-lift"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
