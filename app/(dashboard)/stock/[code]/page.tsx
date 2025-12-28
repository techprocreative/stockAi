import { createClient } from '@/lib/supabase/server'
import { TradingViewChart } from '@/components/stock/tradingview-chart'
import { FundamentalMetrics } from '@/components/stock/fundamental-metrics'
import { AddToWatchlistButton } from '@/components/stock/add-to-watchlist-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StockDetailPageProps {
  params: {
    code: string
  }
}

export default async function StockDetailPage({ params }: StockDetailPageProps) {
  const { code } = params
  const supabase = await createClient()

  // Fetch stock data from cache
  const { data: stockData } = await supabase
    .from('stock_fundamentals')
    .select('*')
    .eq('stock_code', code.toUpperCase())
    .single()

  if (!stockData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{code.toUpperCase()}</h1>
          <p className="text-muted-foreground">Data saham tidak ditemukan</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Saham {code.toUpperCase()} belum tersedia dalam database.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const priceChange = stockData.change_percent || 0
  const isPositive = priceChange >= 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{stockData.stock_code}</h1>
          <p className="text-muted-foreground">{stockData.stock_name || 'N/A'}</p>
          {stockData.sector && (
            <p className="text-sm text-muted-foreground mt-1">
              {stockData.sector} {stockData.subsector && `• ${stockData.subsector}`}
            </p>
          )}
        </div>
        <AddToWatchlistButton stockCode={code.toUpperCase()} />
      </div>

      {/* Price Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-baseline gap-4">
            <p className="text-4xl font-bold">
              Rp {stockData.price?.toLocaleString('id-ID') || 'N/A'}
            </p>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-success-600' : 'text-danger-500'}`}>
              {isPositive ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <span className="text-xl font-semibold">
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Volume: {stockData.volume?.toLocaleString('id-ID') || 'N/A'}
          </p>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
          <CardDescription>TradingView chart for {stockData.stock_code}</CardDescription>
        </CardHeader>
        <CardContent>
          <TradingViewChart symbol={stockData.stock_code} height={500} />
        </CardContent>
      </Card>

      {/* Fundamentals */}
      <FundamentalMetrics data={stockData} />

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About {stockData.stock_code}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Detailed company information will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
