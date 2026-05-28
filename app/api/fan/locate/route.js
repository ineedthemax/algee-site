import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'

export async function POST(req) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false })

    // Get IP from Vercel headers
    const ip =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      null

    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      return NextResponse.json({ ok: false, reason: 'local' })
    }

    // Free IP geolocation - no API key needed
    const geo = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'algeesmith-platform/1.0' },
    }).then(r => r.json())

    if (!geo?.country_code) return NextResponse.json({ ok: false })

    const admin = createAdminClient()
    await admin.from('profiles').update({
      country:      geo.country_name  ?? null,
      country_code: geo.country_code  ?? null,
      region:       geo.region        ?? null,   // state / province
      city:         geo.city          ?? null,
    }).eq('id', user.id)

    return NextResponse.json({ ok: true, country: geo.country_name, region: geo.region, city: geo.city })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
