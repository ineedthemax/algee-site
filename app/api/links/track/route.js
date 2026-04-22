import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'

const CORS = { 'Access-Control-Allow-Origin': '*' }

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

// POST — track a view or click
// body: { slug, type: 'view' | 'click', platform?: string }
export async function POST(request) {
  try {
    const { slug, type, platform } = await request.json()
    if (!slug || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const admin = createAdminClient()

    if (type === 'view') {
      await admin.rpc('increment_view_count', { link_slug: slug })
    }

    if (type === 'click' && platform) {
      await admin
        .from('smart_link_destinations')
        .update({ click_count: admin.rpc('increment', { x: 1 }) })
        .eq('platform', platform)
        .in('link_id', admin.from('smart_links').select('id').eq('slug', slug))

      // Simpler: just increment directly
      const { data: dest } = await admin
        .from('smart_link_destinations')
        .select('id, click_count, link_id, smart_links!inner(slug)')
        .eq('smart_links.slug', slug)
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
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS })
  }
}
