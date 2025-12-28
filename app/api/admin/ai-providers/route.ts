import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Verify admin authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all providers
    const { data: providers, error } = await supabase
      .from('ai_providers')
      .select('*')
      .order('priority', { ascending: true })

    if (error) {
      console.error('Error fetching providers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch providers' },
        { status: 500 }
      )
    }

    return NextResponse.json({ providers })
  } catch (error) {
    console.error('Error in providers GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get provider data from request body
    const body = await request.json()
    const {
      name,
      provider_type,
      model_name,
      api_key,
      api_endpoint,
      priority,
      is_active,
      max_tokens,
      temperature,
      config,
    } = body

    // Validate required fields
    if (!name || !provider_type || !model_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create provider
    const { data, error } = await supabase
      .from('ai_providers')
      .insert({
        name,
        provider_type,
        model_name,
        api_key,
        api_endpoint,
        priority: priority || 100,
        is_active: is_active ?? true,
        max_tokens,
        temperature,
        config,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating provider:', error)
      return NextResponse.json(
        { error: 'Failed to create provider' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in provider creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
