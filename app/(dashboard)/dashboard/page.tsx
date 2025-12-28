import { createClient } from '@/lib/supabase/server'
import { MorningBriefingCard } from '@/components/dashboard/morning-briefing-card'
import { TrendingUp, MessageSquare, LineChart } from 'lucide-react'

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
    <div className="space-y-8 pb-8">
      {/* Header with asymmetric layout */}
      <div className="relative">
        <div className="inline-block border-brutal bg-accent px-4 py-2 shadow-brutal-sm mb-4 animate-slide-in-left">
          <span className="text-sm font-bold uppercase tracking-wider">Dashboard</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight animate-slide-up">
          Selamat datang,
          <br />
          <span className="text-gradient">{profile?.full_name || 'Trader'}!</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-4 font-medium max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Dashboard IndoStock AI Anda - Tempat semua insight berkumpul
        </p>
      </div>

      {/* Morning Briefing */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <MorningBriefingCard />
      </div>

      {/* Stats Grid - Asymmetric brutalist cards */}
      <div className="grid gap-6 md:grid-cols-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        {/* Watchlist Card - Spans more */}
        <div className="md:col-span-5 border-brutal bg-card p-8 shadow-brutal hover-lift group">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 border-brutal bg-primary shadow-brutal-sm mb-4 group-hover:rotate-6 transition-transform">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Watchlist</h2>
              <p className="text-muted-foreground mt-2 font-medium">Saham yang Anda pantau</p>
            </div>
          </div>
          <div className="mt-6 p-6 bg-muted/50 border-2 border-dashed border-border">
            <p className="text-sm text-muted-foreground text-center font-medium">
              Belum ada saham di watchlist
            </p>
          </div>
          <div className="mt-4 h-1 w-16 bg-primary group-hover:w-24 transition-all" />
        </div>

        {/* Chat Limit Card */}
        <div className="md:col-span-4 border-brutal bg-card p-8 shadow-brutal hover-lift group">
          <div className="inline-flex items-center justify-center w-12 h-12 border-brutal bg-secondary shadow-brutal-sm mb-4 group-hover:rotate-6 transition-transform">
            <MessageSquare className="h-6 w-6 text-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Chat Limit</h2>
          <p className="text-muted-foreground mb-6 font-medium">Sisa chat hari ini</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-secondary">
              {profile?.chat_limit - profile?.daily_chat_count}
            </span>
            <span className="text-3xl font-bold text-muted-foreground">
              /{profile?.chat_limit}
            </span>
          </div>
          <div className="mt-6 h-1 w-16 bg-secondary group-hover:w-24 transition-all" />
        </div>

        {/* Trading Level Card */}
        <div className="md:col-span-3 border-brutal bg-card p-8 shadow-brutal hover-lift group">
          <div className="inline-flex items-center justify-center w-12 h-12 border-brutal bg-accent shadow-brutal-sm mb-4 group-hover:rotate-6 transition-transform">
            <LineChart className="h-6 w-6 text-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Level</h2>
          <p className="text-muted-foreground mb-4 text-sm font-medium">Trading Exp</p>
          <p className="text-2xl font-bold capitalize mb-2">
            {profile?.user_level || 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            {profile?.trading_style || 'N/A'}
          </p>
          <div className="mt-6 h-1 w-12 bg-accent group-hover:w-20 transition-all" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-brutal bg-primary/5 p-8 shadow-brutal-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <a href="/chat" className="inline-block border-brutal bg-primary px-6 py-3 shadow-brutal-sm hover-lift text-primary-foreground font-bold">
            💬 Chat dengan AI
          </a>
          <a href="/screener" className="inline-block border-brutal bg-accent px-6 py-3 shadow-brutal-sm hover-lift font-bold">
            🔍 Stock Screener
          </a>
          <a href="/watchlist" className="inline-block border-brutal bg-secondary px-6 py-3 shadow-brutal-sm hover-lift font-bold">
            📊 Lihat Watchlist
          </a>
        </div>
      </div>
    </div>
  )
}
