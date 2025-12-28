import { getUserGrowthData, getChatVolumeData, getTierDistribution, getProviderPerformance } from '@/lib/admin/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserGrowthChart } from '@/components/admin/analytics/user-growth-chart'
import { ChatVolumeChart } from '@/components/admin/analytics/chat-volume-chart'
import { TierDistributionChart } from '@/components/admin/analytics/tier-distribution-chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

export default async function AnalyticsPage() {
  const userGrowthData = await getUserGrowthData(30)
  const chatVolumeData = await getChatVolumeData(30)
  const tierDistributionData = await getTierDistribution()
  const providerPerformance = await getProviderPerformance()

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

        {/* Provider Performance Table */}
        <Card className="border-brutal shadow-brutal">
          <CardHeader>
            <CardTitle>AI Provider Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-brutal rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-4 border-border">
                    <TableHead className="font-bold">Provider</TableHead>
                    <TableHead className="font-bold">Model</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Requests</TableHead>
                    <TableHead className="font-bold text-right">Avg Response</TableHead>
                    <TableHead className="font-bold text-right">Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providerPerformance.map((provider) => (
                    <TableRow key={provider.id} className="border-b-2 border-border">
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell className="text-muted-foreground">{provider.model}</TableCell>
                      <TableCell>
                        {provider.isActive ? (
                          <Badge variant="outline" className="border-brutal bg-primary/10 text-primary">
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-brutal bg-muted text-muted-foreground">
                            <X className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {provider.totalRequests.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {provider.avgResponseTime}ms
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {provider.successRate}%
                      </TableCell>
                    </TableRow>
                  ))}
                  {providerPerformance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No provider data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
