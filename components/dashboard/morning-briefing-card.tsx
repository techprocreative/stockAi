'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Newspaper, DollarSign, Loader2 } from 'lucide-react'

interface GlobalMarket {
  value: number
  change: number
}

interface MacroData {
  value: number
  change: number
}

interface BriefingData {
  global_markets: {
    dow: GlobalMarket
    sp500: GlobalMarket
    nikkei: GlobalMarket
  }
  macro_data: {
    usd_idr: MacroData
    gold: MacroData
    oil: MacroData
  }
  ai_sentiment: string
  top_news: Array<{
    title: string
    url: string
    source: string
  }>
}

export function MorningBriefingCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['morning-briefing'],
    queryFn: async () => {
      const response = await fetch('/api/briefing')
      if (!response.ok) {
        throw new Error('Failed to fetch briefing')
      }
      return response.json() as Promise<BriefingData>
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Morning Briefing
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Markets */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Pasar Global</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Dow Jones', ...data.global_markets.dow },
              { name: 'S&P 500', ...data.global_markets.sp500 },
              { name: 'Nikkei', ...data.global_markets.nikkei },
            ].map((market) => (
              <div key={market.name} className="text-center">
                <p className="text-xs text-muted-foreground">{market.name}</p>
                <p className="text-lg font-bold">{market.value.toLocaleString()}</p>
                <div
                  className={`flex items-center justify-center gap-1 text-sm ${
                    market.change >= 0 ? 'text-success-600' : 'text-danger-500'
                  }`}
                >
                  {market.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {market.change >= 0 ? '+' : ''}
                    {market.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Macro Data */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Data Makro</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'USD/IDR', value: data.macro_data.usd_idr.value, change: data.macro_data.usd_idr.change },
              { name: 'Gold', value: data.macro_data.gold.value, change: data.macro_data.gold.change },
              { name: 'Oil (WTI)', value: data.macro_data.oil.value, change: data.macro_data.oil.change },
            ].map((macro) => (
              <div key={macro.name} className="text-center">
                <p className="text-xs text-muted-foreground">{macro.name}</p>
                <p className="text-lg font-bold">{macro.value.toLocaleString()}</p>
                <div
                  className={`flex items-center justify-center gap-1 text-sm ${
                    macro.change >= 0 ? 'text-success-600' : 'text-danger-500'
                  }`}
                >
                  {macro.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {macro.change >= 0 ? '+' : ''}
                    {macro.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Sentiment */}
        <div className="bg-background rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Sentimen AI</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-muted-foreground whitespace-pre-line">{data.ai_sentiment}</p>
          </div>
        </div>

        {/* Top News */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Berita Utama</h3>
          <div className="space-y-2">
            {data.top_news.map((news, index) => (
              <a
                key={index}
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded hover:bg-background transition-colors"
              >
                <p className="text-sm font-medium">{news.title}</p>
                <p className="text-xs text-muted-foreground">{news.source}</p>
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
