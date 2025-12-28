import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendLabel?: string
}

export function StatsCard({ title, value, icon: Icon, trend, trendLabel }: StatsCardProps) {
  return (
    <Card className="border-brutal shadow-brutal-sm hover-lift transition-transform">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
        {trend && trendLabel && (
          <p className="text-xs text-muted-foreground mt-2">
            <span className={trend.startsWith('+') ? 'text-primary' : 'text-destructive'}>
              {trend}
            </span>{' '}
            {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
