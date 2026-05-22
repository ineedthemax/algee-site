import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { awardPoints, hasEarned } from '../../../lib/points'
import { isAdmin } from '../../../lib/isAdmin'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/account/dashboard'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/account/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll()      { return cookieStore.getAll() },
          setAll(toSet) {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      const user    = data.user
      const isNew   = !data.session?.user?.last_sign_in_at ||
                      data.session.user.last_sign_in_at === data.session.user.created_at

      // Upsert profile - saves email + phone on first login, updates on return visits
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      await supabase.from('profiles').upsert({
        id:    user.id,
        email: user.email,
        phone: user.user_metadata?.phone ?? null,
      }, { onConflict: 'id' })

      // Send welcome email + award signup points to brand new fans
      if (!existing) {
        try {
          await fetch(`${origin}/api/welcome`, {
            method:  'POST',
            headers: {
              'Content-Type':      'application/json',
              'x-internal-secret': process.env.CRON_SECRET ?? '',
            },
            body:    JSON.stringify({ email: user.email }),
          })
        } catch (e) {
          console.error('Welcome email error:', e)
        }

        // Award 100 signup points (only once, guarded by hasEarned)
        try {
          const alreadyEarned = await hasEarned(user.id, 'SIGNUP')
          if (!alreadyEarned) {
            await awardPoints(user.id, 'SIGNUP')
          }
        } catch (e) {
          console.error('Signup points error:', e)
        }
      }

      // Geolocate fan (fire-and-forget - don't block login)
      try {
        fetch(`${origin}/api/fan/locate`, {
          method:  'POST',
          headers: {
            'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
            'x-real-ip':       request.headers.get('x-real-ip') ?? '',
          },
        }).catch(() => {})
      } catch {}

      // Send admin straight to the admin dashboard
      // New fans get the welcome overlay
      let destination
      if (isAdmin(user.email)) {
        destination = '/admin'
      } else if (!existing) {
        destination = '/account/dashboard?welcome=1'
      } else {
        destination = next
      }

      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/account?error=auth`)
}
