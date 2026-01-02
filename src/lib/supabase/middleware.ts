import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  try {
    // IMPORTANT: Only call getUser if we have at least some session cookies
    // to avoid unnecessary AuthApiErrors for non-logged users
    const hasSession = request.cookies.getAll().some(cookie => 
      cookie.name.includes('supabase-auth-token') || 
      cookie.name.includes('sb-')
    )
    
    if (hasSession) {
      await supabase.auth.getUser()
    }
  } catch (error) {
    // If refreshing fails (e.g. invalid refresh token), 
    // we continue with the response. The client-side or
    // route handlers will handle the unauthorized state.
    console.log('Middleware auth refresh suppressed:', error)
  }

  return supabaseResponse
}
