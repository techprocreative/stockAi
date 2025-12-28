'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold text-primary-600">
          IndoStock AI
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleSignOut}>
            Keluar
          </Button>
        </div>
      </div>
    </nav>
  )
}
