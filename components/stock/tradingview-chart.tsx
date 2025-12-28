'use client'

import { useEffect, useRef } from 'react'

interface TradingViewChartProps {
  symbol: string
  interval?: string
  theme?: 'light' | 'dark'
  height?: number
}

export function TradingViewChart({
  symbol,
  interval = 'D',
  theme = 'light',
  height = 500,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Add .JK suffix for Indonesian stocks
    const chartSymbol = symbol.includes('.') ? symbol : `IDX:${symbol}`

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
          autosize: true,
          symbol: chartSymbol,
          interval: interval,
          timezone: 'Asia/Jakarta',
          theme: theme,
          style: '1',
          locale: 'id',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerRef.current?.id || 'tradingview_chart',
        })
      }
    }

    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [symbol, interval, theme])

  return (
    <div
      id="tradingview_chart"
      ref={containerRef}
      style={{ height: `${height}px` }}
      className="rounded-lg overflow-hidden border"
    />
  )
}

// Type declaration for TradingView widget
declare global {
  interface Window {
    TradingView: any
  }
}
