import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MorningBriefingService } from '@/lib/briefing/morning-briefing-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get today's briefing
    let briefing = await MorningBriefingService.getTodaysBriefing()

    // If not found, generate one
    if (!briefing) {
      briefing = await MorningBriefingService.generateBriefing()
    }

    return NextResponse.json(briefing)
  } catch (error) {
    console.error('Briefing API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
