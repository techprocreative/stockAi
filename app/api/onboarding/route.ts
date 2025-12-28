import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { fullName, userLevel, tradingStyle } = await request.json()

    if (!fullName || !userLevel || !tradingStyle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        user_level: userLevel,
        trading_style: tradingStyle,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // Revalidate paths to clear cache
    revalidatePath('/dashboard', 'layout')
    revalidatePath('/onboarding', 'layout')
    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
