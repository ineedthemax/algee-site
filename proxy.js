import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll()          { return request.cookies.getAll() },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — keeps auth alive
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect logged-in users away from /account (login page) → dashboard
  if (user && request.nextUrl.pathname === '/account') {
    return NextResponse.redirect(new URL('/account/dashboard', request.url))
  }

  // Protect dashboard — redirect to login if not authed
  if (!user && request.nextUrl.pathname.startsWith('/account/dashboard')) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/account', '/account/dashboard/:path*'],
}
