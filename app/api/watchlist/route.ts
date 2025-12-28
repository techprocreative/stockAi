import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/watchlist - List all watchlist items
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch watchlist with stock data
    const { data: watchlist, error } = await supabase
      .from('watchlists')
      .select(`
        id,
        stock_code,
        created_at,
        stock_fundamentals (
          stock_name,
          price,
          change_percent,
          sector,
          subsector,
          per,
          pbv,
          roe
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error('Watchlist GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

// POST /api/watchlist - Add stock to watchlist
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

    // Check if stock exists in database
    const { data: stockData, error: stockError } = await supabase
      .from('stock_fundamentals')
      .select('stock_code')
      .eq('stock_code', stockCode.toUpperCase())
      .single()

    if (stockError || !stockData) {
      return NextResponse.json(
        { error: 'Stock not found in database' },
        { status: 404 }
      )
    }

    // Check if already in watchlist
    const { data: existing } = await supabase
      .from('watchlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('stock_code', stockCode.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Stock already in watchlist' },
        { status: 409 }
      )
    }

    // Add to watchlist
    const { data: newItem, error: insertError } = await supabase
      .from('watchlists')
      .insert([
        {
          user_id: user.id,
          stock_code: stockCode.toUpperCase(),
        },
      ])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json(
      { message: 'Added to watchlist', item: newItem },
      { status: 201 }
    )
  } catch (error) {
    console.error('Watchlist POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/watchlist?stock_code=BBCA - Remove from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stock code from query params
    const stockCode = request.nextUrl.searchParams.get('stock_code')

    if (!stockCode) {
      return NextResponse.json(
        { error: 'Stock code is required' },
        { status: 400 }
      )
    }

    // Delete from watchlist
    const { error: deleteError } = await supabase
      .from('watchlists')
      .delete()
      .eq('user_id', user.id)
      .eq('stock_code', stockCode.toUpperCase())

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ message: 'Removed from watchlist' })
  } catch (error) {
    console.error('Watchlist DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    )
  }
}
