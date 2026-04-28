import { NextResponse } from 'next/server'
import { createClient } from '../../../../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../../../../lib/supabase/admin'
import { isAdmin } from '../../../../../../../../lib/isAdmin'

async function guard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user && isAdmin(user.email) ? user : null
}

export async function POST(request, { params }) {
  if (!await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: release_id, tierId: tier_id } = await params
  const { type, title, description, url, meta } = await request.json()
  if (!type || !title?.trim()) return NextResponse.json({ error: 'Type and title required' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('tier_content')
    .insert({ tier_id, release_id, type, title: title.trim(), description, url, meta: meta ?? {} })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ content: data })
}

export async function DELETE(request, { params }) {
  if (!await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const contentId = searchParams.get('contentId')
  if (!contentId) return NextResponse.json({ error: 'contentId required' }, { status: 400 })
  const { error } = await admin.from('tier_content').delete().eq('id', contentId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
