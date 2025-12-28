import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Morning Briefing</CardTitle>
            <CardDescription>Ringkasan pasar hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fitur akan segera hadir
            </p>
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
