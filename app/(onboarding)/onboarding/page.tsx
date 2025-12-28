'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleCompleteOnboarding = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          Selamat datang di IndoStock AI! 👋
        </CardTitle>
        <CardDescription>
          Onboarding lengkap akan segera hadir. Untuk sementara, klik tombol di bawah untuk melanjutkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Onboarding akan mencakup:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Pilih level trading (Pemula / Menengah / Mahir)</li>
            <li>Tentukan gaya trading (Scalper / Swing / Investor)</li>
            <li>Pilih sektor favorit (Opsional)</li>
          </ul>
          <Button
            onClick={handleCompleteOnboarding}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Lanjutkan ke Dashboard'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
