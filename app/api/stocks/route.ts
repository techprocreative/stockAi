import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StockDataFetcher } from '@/lib/data/stock-fetcher'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { stockCode } = await request.json()

    if (!stockCode) {
      return NextResponse.json(
        { error: 'Stock code is required' },
        { status: 400 }
      )
    }

    // Fetch and cache stock data
    const stockData = await StockDataFetcher.fetchAndCache(stockCode, supabase)

    if (!stockData) {
      return NextResponse.json(
        { error: 'Failed to fetch stock data' },
        { status: 404 }
      )
    }

    return NextResponse.json({ stock: stockData })
  } catch (error) {
    console.error('Stock refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/stocks?search=keyword or ?sector=banking
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const sector = searchParams.get('sector')

    let stocks: any[] = []

    if (search) {
      stocks = await StockDataFetcher.searchStocks(search, supabase)
    } else if (sector) {
      stocks = await StockDataFetcher.getStocksBySector(sector, supabase)
    } else {
      // Return all stocks (limit 100)
      const { data } = await supabase
        .from('stock_fundamentals')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(100)

      stocks = data || []
    }

    return NextResponse.json({ stocks })
  } catch (error) {
    console.error('Stock list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
