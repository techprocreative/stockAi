import { getUserGrowthData, getChatVolumeData, getTierDistribution } from '@/lib/admin/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserGrowthChart } from '@/components/admin/analytics/user-growth-chart'
import { ChatVolumeChart } from '@/components/admin/analytics/chat-volume-chart'
import { TierDistributionChart } from '@/components/admin/analytics/tier-distribution-chart'

export default async function AnalyticsPage() {
  const userGrowthData = await getUserGrowthData(30)
  const chatVolumeData = await getChatVolumeData(30)
  const tierDistributionData = await getTierDistribution()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Visualize platform usage and growth metrics
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6">
        {/* User Growth Chart */}
        <Card className="border-brutal shadow-brutal">
          <CardHeader>
            <CardTitle>User Growth (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={userGrowthData} />
          </CardContent>
        </Card>

        {/* Chat Volume Chart */}
        <Card className="border-brutal shadow-brutal">
          <CardHeader>
            <CardTitle>Chat Volume (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatVolumeChart data={chatVolumeData} />
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card className="border-brutal shadow-brutal">
          <CardHeader>
            <CardTitle>Subscription Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <TierDistributionChart data={tierDistributionData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
