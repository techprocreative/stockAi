'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { TrendingUp, LogOut } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="border-b-4 border-border bg-background shadow-brutal-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 border-brutal bg-primary flex items-center justify-center shadow-brutal-sm group-hover:rotate-6 transition-transform">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight block leading-none">
              IndoStock <span className="text-gradient">AI</span>
            </span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Smart Trading
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-brutal shadow-brutal-sm hover-lift font-bold"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>
    </nav>
  )
}
