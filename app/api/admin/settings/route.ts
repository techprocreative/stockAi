import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { setMaintenanceMode } from '@/lib/supabase/middleware'

// Simple in-memory store for settings (in production, use database)
const settings = {
  chatLimits: {
    free: 10,
    pro: 50,
    whale: 200,
    admin: 999999,
  },
  maintenanceMode: {
    enabled: false,
    message: 'We are currently performing scheduled maintenance. We will be back shortly!',
  },
}

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

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
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

    const body = await request.json()

    // Update settings
    if (body.chatLimits) {
      settings.chatLimits = body.chatLimits
    }

    // Update maintenance mode if provided
    if (body.maintenanceMode !== undefined) {
      settings.maintenanceMode = { ...settings.maintenanceMode, ...body.maintenanceMode }
      // Update middleware state
      setMaintenanceMode(settings.maintenanceMode)
    }

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
