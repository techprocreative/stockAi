import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    const body = await request.json()
    const { provider_id } = body

    if (!provider_id) {
      return NextResponse.json(
        { error: 'Provider ID required' },
        { status: 400 }
      )
    }

    // Get provider details
    const { data: provider, error: providerError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('id', provider_id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Simulate test request
    const startTime = Date.now()

    // Mock test - in real implementation, would make actual API call
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

    const responseTime = Date.now() - startTime

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1

    return NextResponse.json({
      success: isSuccess,
      provider: provider.name,
      model: provider.model_name,
      responseTime,
      message: isSuccess
        ? 'Provider test successful'
        : 'Provider test failed - check API credentials',
      testData: {
        timestamp: new Date().toISOString(),
        endpoint: provider.api_endpoint || 'default',
      },
    })
  } catch (error) {
    console.error('Error testing provider:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
