import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'
import { NextResponse } from 'next/server'

function auth() {
  return async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user && isAdmin(user.email) ? user : null
  }
}

// GET - all smart links with destinations
export async function GET(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: links } = await admin
    .from('smart_links')
    .select('*, smart_link_destinations(*)')
    .order('created_at', { ascending: false })

  return NextResponse.json(links ?? [])
}

// POST - create a smart link
export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, slug, artist, subtext, cover_art_url, theme, type, goes_live_at, destinations } = await request.json()
  if (!title?.trim() || !slug?.trim()) return NextResponse.json({ error: 'Title and slug required' }, { status: 400 })

  const admin = createAdminClient()

  const { data: link, error } = await admin
    .from('smart_links')
    .insert({ title: title.trim(), slug: slug.trim(), artist: artist || 'Algee', subtext, cover_art_url, theme: theme || 'dark', type: type || 'streaming', goes_live_at: goes_live_at || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insert destinations
  if (destinations?.length) {
    await admin.from('smart_link_destinations').insert(
      destinations.map((d, i) => ({ link_id: link.id, platform: d.platform, url: d.url, sort_order: i }))
    )
  }

  const { data: full } = await admin
    .from('smart_links')
    .select('*, smart_link_destinations(*)')
    .eq('id', link.id)
    .single()

  return NextResponse.json(full)
}

// PATCH - update a smart link + replace destinations
export async function PATCH(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, destinations } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Whitelist updatable fields
  const allowed = ['title', 'slug', 'artist', 'subtext', 'cover_art_url', 'theme', 'type', 'goes_live_at', 'active']
  const fields  = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const admin = createAdminClient()

  const { error } = await admin.from('smart_links').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Replace destinations if provided
  if (destinations !== undefined) {
    await admin.from('smart_link_destinations').delete().eq('link_id', id)
    if (destinations.length) {
      await admin.from('smart_link_destinations').insert(
        destinations.map((d, i) => ({ link_id: id, platform: d.platform, url: d.url, sort_order: i }))
      )
    }
  }

  const { data: full } = await admin
    .from('smart_links')
    .select('*, smart_link_destinations(*)')
    .eq('id', id)
    .single()

  return NextResponse.json(full)
}

// DELETE
export async function DELETE(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const admin = createAdminClient()
  await admin.from('smart_links').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
