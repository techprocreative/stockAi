import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Simple in-memory store for maintenance mode (should match API settings)
// In production, this should be stored in a shared cache or database
let maintenanceMode = {
  enabled: false,
  message: 'We are currently performing scheduled maintenance. We will be back shortly!',
}

// Function to check if maintenance mode is enabled
export function getMaintenanceMode() {
  return maintenanceMode
}

// Function to update maintenance mode (called from API)
export function setMaintenanceMode(settings: { enabled: boolean; message: string }) {
  maintenanceMode = settings
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Check maintenance mode for non-admin routes
  if (maintenanceMode.enabled && !request.nextUrl.pathname.startsWith('/admin')) {
    // Allow API routes for maintenance mode status check
    if (request.nextUrl.pathname.startsWith('/api/admin/settings')) {
      return response
    }

    // Allow admin users even during maintenance
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_tier === 'admin') {
        return response
      }
    }

    // Redirect non-admin users to maintenance page
    const maintenanceUrl = new URL('/maintenance', request.url)
    return NextResponse.redirect(maintenanceUrl)
  }

  return response
}
