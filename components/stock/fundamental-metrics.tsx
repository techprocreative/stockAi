import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FundamentalMetric {
  label: string
  value: string | number
  tooltip?: string
  color?: 'default' | 'success' | 'danger'
}

interface FundamentalMetricsProps {
  data: {
    per?: number
    pbv?: number
    roe?: number
    der?: number
    dividend_yield?: number
    market_cap?: number
    price?: number
    change_percent?: number
    volume?: number
  }
}

export function FundamentalMetrics({ data }: FundamentalMetricsProps) {
  const formatNumber = (num: number | undefined, decimals: number = 2): string => {
    if (num === undefined || num === null) return 'N/A'
    return num.toFixed(decimals)
  }

  const formatMarketCap = (marketCap: number | undefined): string => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1_000_000_000_000) {
      return `Rp ${(marketCap / 1_000_000_000_000).toFixed(2)} T`
    }
    return `Rp ${(marketCap / 1_000_000_000).toFixed(2)} M`
  }

  const getColorClass = (value: number | undefined, type: 'per' | 'pbv' | 'roe' | 'der'): string => {
    if (value === undefined) return 'text-muted-foreground'

    switch (type) {
      case 'per':
        return value < 15 ? 'text-success-600' : value > 25 ? 'text-danger-500' : 'text-foreground'
      case 'pbv':
        return value < 1 ? 'text-success-600' : value > 3 ? 'text-danger-500' : 'text-foreground'
      case 'roe':
        return value > 15 ? 'text-success-600' : value < 10 ? 'text-danger-500' : 'text-foreground'
      case 'der':
        return value < 1 ? 'text-success-600' : value > 2 ? 'text-danger-500' : 'text-foreground'
      default:
        return 'text-foreground'
    }
  }

  const metrics: FundamentalMetric[] = [
    {
      label: 'PER',
      value: formatNumber(data.per),
      tooltip: 'Price to Earnings Ratio - Berapa tahun balik modal',
      color: data.per ? (data.per < 15 ? 'success' : data.per > 25 ? 'danger' : 'default') : 'default',
    },
    {
      label: 'PBV',
      value: formatNumber(data.pbv),
      tooltip: 'Price to Book Value - Harga vs nilai buku',
      color: data.pbv ? (data.pbv < 1 ? 'success' : data.pbv > 3 ? 'danger' : 'default') : 'default',
    },
    {
      label: 'ROE',
      value: data.roe ? `${formatNumber(data.roe)}%` : 'N/A',
      tooltip: 'Return on Equity - Efisiensi modal',
      color: data.roe ? (data.roe > 15 ? 'success' : data.roe < 10 ? 'danger' : 'default') : 'default',
    },
    {
      label: 'DER',
      value: formatNumber(data.der),
      tooltip: 'Debt to Equity Ratio - Rasio hutang',
      color: data.der ? (data.der < 1 ? 'success' : data.der > 2 ? 'danger' : 'default') : 'default',
    },
    {
      label: 'Dividend Yield',
      value: data.dividend_yield ? `${formatNumber(data.dividend_yield)}%` : 'N/A',
      tooltip: 'Yield dividen tahunan',
    },
    {
      label: 'Market Cap',
      value: formatMarketCap(data.market_cap),
      tooltip: 'Kapitalisasi pasar',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fundamental Metrics</CardTitle>
        <CardDescription>Data fundamental saham</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p
                className={`text-2xl font-bold ${
                  metric.color === 'success'
                    ? 'text-success-600'
                    : metric.color === 'danger'
                    ? 'text-danger-500'
                    : 'text-foreground'
                }`}
                title={metric.tooltip}
              >
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
