import { SupabaseClient } from '@supabase/supabase-js'
import yahooFinance from 'yahoo-finance2'

export interface StockData {
  stock_code: string
  stock_name: string
  price: number
  change_percent: number
  volume: number
  market_cap?: number
  per?: number
  pbv?: number
  roe?: number
  der?: number
  dividend_yield?: number
  sector?: string
  subsector?: string
  updated_at?: string
}

export class StockDataFetcher {
  /**
   * Fetch stock data from database cache
   */
  static async getStockData(
    stockCode: string,
    supabase: SupabaseClient
  ): Promise<StockData | null> {
    const { data, error } = await supabase
      .from('stock_fundamentals')
      .select('*')
      .eq('stock_code', stockCode.toUpperCase())
      .single()

    if (error || !data) {
      return null
    }

    return data as StockData
  }

  /**
   * Fetch real-time stock data from Yahoo Finance
   */
  static async fetchFromYahooFinance(stockCode: string): Promise<Partial<StockData> | null> {
    try {
      // Add .JK suffix for Indonesian stocks
      const symbol = stockCode.includes('.') ? stockCode : `${stockCode}.JK`

      // Fetch quote data
      const quote = await yahooFinance.quote(symbol) as any

      if (!quote) {
        return null
      }

      // Calculate change percent
      const price = quote.regularMarketPrice || 0
      const previousClose = quote.regularMarketPreviousClose || price
      const changePercent = previousClose !== 0
        ? ((price - previousClose) / previousClose) * 100
        : 0

      return {
        stock_code: stockCode.toUpperCase(),
        stock_name: quote.longName || quote.shortName || stockCode,
        price: price,
        change_percent: changePercent,
        volume: quote.regularMarketVolume || 0,
        market_cap: quote.marketCap,
        per: quote.trailingPE,
        pbv: quote.priceToBook,
        dividend_yield: quote.dividendYield ? quote.dividendYield * 100 : undefined,
      }
    } catch (error) {
      console.error(`Failed to fetch Yahoo Finance data for ${stockCode}:`, error)
      return null
    }
  }

  /**
   * Fetch and cache stock data
   */
  static async fetchAndCache(
    stockCode: string,
    supabase: SupabaseClient
  ): Promise<StockData | null> {
    // First, try to get from cache
    const cachedData = await this.getStockData(stockCode, supabase)

    // Check if cache is fresh (less than 1 hour old)
    if (cachedData) {
      const updatedAt = new Date(cachedData.updated_at || 0).getTime()
      const now = Date.now()
      const oneHour = 60 * 60 * 1000

      if (now - updatedAt < oneHour) {
        return cachedData
      }
    }

    // Fetch fresh data from Yahoo Finance
    const freshData = await this.fetchFromYahooFinance(stockCode)

    if (!freshData) {
      return cachedData // Return cached data if fetch failed
    }

    // Update or insert in database
    const { error } = await supabase
      .from('stock_fundamentals')
      .upsert(
        {
          ...freshData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'stock_code',
        }
      )

    if (error) {
      console.error('Failed to cache stock data:', error)
    }

    return { ...cachedData, ...freshData } as StockData
  }

  /**
   * Search stocks by keyword
   */
  static async searchStocks(
    keyword: string,
    supabase: SupabaseClient
  ): Promise<StockData[]> {
    const { data, error } = await supabase
      .from('stock_fundamentals')
      .select('*')
      .or(`stock_code.ilike.%${keyword}%,stock_name.ilike.%${keyword}%`)
      .limit(20)

    if (error || !data) {
      return []
    }

    return data as StockData[]
  }

  /**
   * Get stocks by sector
   */
  static async getStocksBySector(
    sector: string,
    supabase: SupabaseClient
  ): Promise<StockData[]> {
    const { data, error } = await supabase
      .from('stock_fundamentals')
      .select('*')
      .eq('sector', sector)
      .order('market_cap', { ascending: false })

    if (error || !data) {
      return []
    }

    return data as StockData[]
  }
}
