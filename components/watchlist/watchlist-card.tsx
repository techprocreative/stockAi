'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface WatchlistItem {
  id: string
  stock_code: string
  created_at: string
  stock_fundamentals: {
    stock_name: string
    price: number
    change_percent: number
    sector: string
    subsector: string
    per: number
    pbv: number
    roe: number
  }
}

interface WatchlistCardProps {
  item: WatchlistItem
  onRemove: (stockCode: string) => void
  isRemoving?: boolean
}

export function WatchlistCard({ item, onRemove, isRemoving }: WatchlistCardProps) {
  const priceChange = item.stock_fundamentals?.change_percent || 0
  const isPositive = priceChange >= 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <Link href={`/stock/${item.stock_code}`} className="flex-1">
            <h3 className="text-xl font-bold hover:text-primary-600 transition-colors">
              {item.stock_code}
            </h3>
            <p className="text-sm text-muted-foreground">
              {item.stock_fundamentals?.stock_name || 'N/A'}
            </p>
            {item.stock_fundamentals?.sector && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.stock_fundamentals.sector}
              </p>
            )}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.stock_code)}
            disabled={isRemoving}
          >
            <Star className="h-4 w-4 fill-primary-500 text-primary-500" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">
              Rp {item.stock_fundamentals?.price?.toLocaleString('id-ID') || 'N/A'}
            </p>
            <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-success-600' : 'text-danger-500'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">PER</p>
              <p className="font-semibold">
                {item.stock_fundamentals?.per?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">PBV</p>
              <p className="font-semibold">
                {item.stock_fundamentals?.pbv?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">ROE</p>
              <p className="font-semibold">
                {item.stock_fundamentals?.roe ? `${item.stock_fundamentals.roe.toFixed(2)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
