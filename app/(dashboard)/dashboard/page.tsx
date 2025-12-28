import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MorningBriefingCard } from '@/components/dashboard/morning-briefing-card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Selamat datang, {profile?.full_name || 'Trader'}!
        </h1>
        <p className="text-muted-foreground">
          Dashboard IndoStock AI Anda
        </p>
      </div>

      {/* Morning Briefing */}
      <MorningBriefingCard />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Watchlist</CardTitle>
            <CardDescription>Saham yang Anda pantau</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Belum ada saham di watchlist
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat Limit</CardTitle>
            <CardDescription>Sisa chat hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {profile?.chat_limit - profile?.daily_chat_count}/{profile?.chat_limit}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Level Trading</CardTitle>
            <CardDescription>Pengalaman Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold capitalize">
              {profile?.user_level || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {profile?.trading_style || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
