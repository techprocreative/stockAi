import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      // Create profile if doesn't exist (Google OAuth)
      if (!profile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: data.user.user_metadata.full_name || data.user.email,
          username: data.user.email?.split('@')[0],
          avatar_url: data.user.user_metadata.avatar_url,
        })

        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Redirect based on onboarding status
      if (profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/dashboard`)
      } else {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
