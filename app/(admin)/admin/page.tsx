import { getDashboardStats } from '@/lib/admin/analytics'
import { StatsCard } from '@/components/admin/stats-card'
import {
  Users,
  UserPlus,
  Shield,
  MessageSquare,
  Activity,
  Brain,
  Zap,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of system metrics and quick actions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
        />
        <StatsCard
          title="Active Today"
          value={stats.activeToday.toLocaleString()}
          icon={Activity}
        />
        <StatsCard
          title="New This Week"
          value={stats.newThisWeek.toLocaleString()}
          icon={UserPlus}
        />
        <StatsCard
          title="Admin Users"
          value={stats.adminUsers.toLocaleString()}
          icon={Shield}
        />
        <StatsCard
          title="Total Chat Sessions"
          value={stats.totalSessions.toLocaleString()}
          icon={MessageSquare}
        />
        <StatsCard
          title="Chats Today"
          value={stats.chatsToday.toLocaleString()}
          icon={TrendingUp}
        />
        <StatsCard
          title="Active AI Providers"
          value={stats.activeProviders.toLocaleString()}
          icon={Brain}
        />
        <StatsCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime}ms`}
          icon={Zap}
        />
      </div>

      {/* Quick Actions */}
      <div className="border-t-4 border-border pt-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Button
            asChild
            className="border-brutal shadow-brutal-sm hover-lift"
          >
            <Link href="/admin/ai-providers">
              <Brain className="h-4 w-4 mr-2" />
              Manage AI Providers
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-brutal shadow-brutal-sm hover-lift"
          >
            <Link href="/admin/analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
