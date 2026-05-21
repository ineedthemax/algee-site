import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'

const CORS = { 'Access-Control-Allow-Origin': '*' }

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

// POST - track a view or click with geo + referrer
// body: { slug, type: 'view' | 'click', platform?: string, referrer?: string }
export async function POST(request) {
  try {
    const body = await request.json()
    const { slug, type, platform, referrer } = body
    if (!slug || !type) return NextResponse.json({ ok: true }, { headers: CORS })

    // Geo data from Vercel edge headers (free, no API needed)
    const country = request.headers.get('x-vercel-ip-country')       ?? null
    const region  = request.headers.get('x-vercel-ip-country-region') ?? null
    const city    = request.headers.get('x-vercel-ip-city')
      ? decodeURIComponent(request.headers.get('x-vercel-ip-city'))
      : null

    const admin = createAdminClient()

    // Get link_id from slug
    const { data: link } = await admin
      .from('smart_links')
      .select('id, view_count')
      .eq('slug', slug)
      .single()

    if (!link) return NextResponse.json({ ok: true }, { headers: CORS })

    // Log event
    await admin.from('smart_link_events').insert({
      link_id:  link.id,
      slug,
      type,
      platform: platform ?? null,
      referrer: referrer ? new URL(referrer).hostname.replace('www.', '') : null,
      country,
      region,
      city,
    })

    // Increment counters
    if (type === 'view') {
      await admin
        .from('smart_links')
        .update({ view_count: (link.view_count ?? 0) + 1 })
        .eq('id', link.id)
    }

    if (type === 'click' && platform) {
      const { data: dest } = await admin
        .from('smart_link_destinations')
        .select('id, click_count')
        .eq('link_id', link.id)
        .eq('platform', platform)
        .single()

      if (dest) {
        await admin
          .from('smart_link_destinations')
          .update({ click_count: (dest.click_count ?? 0) + 1 })
          .eq('id', dest.id)
      }
    }

    return NextResponse.json({ ok: true }, { headers: CORS })
  } catch (e) {
    // Never error - tracking should be silent
    return NextResponse.json({ ok: true }, { headers: CORS })
  }
}
