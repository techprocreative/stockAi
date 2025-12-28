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
      // Profile is auto-created by database trigger
      // Wait a bit to ensure trigger has completed
      await new Promise(resolve => setTimeout(resolve, 300))

      // Check onboarding status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      // If profile doesn't exist yet, wait a bit more and retry once
      if (profileError || !profile) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single()

        if (retryProfile) {
          // Profile found on retry
          if (retryProfile.onboarding_completed) {
            return NextResponse.redirect(`${origin}/dashboard`)
          } else {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
        }

        // Profile still doesn't exist after retry - redirect to onboarding anyway
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Redirect based on onboarding status
      if (profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/dashboard`)
      } else {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }

    // Log error for debugging
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}
