import { NextResponse } from 'next/server'
import { createClient } from '../../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../../lib/supabase/admin'
import { isAdmin } from '../../../../../../lib/isAdmin'

async function guard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user && isAdmin(user.email) ? user : null
}

export async function POST(request, { params }) {
  if (!await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: release_id } = await params
  const { name, price, description, position } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Tier name required' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('release_tiers')
    .insert({ release_id, name: name.trim(), price: price ?? 0, description, position: position ?? 0 })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tier: data })
}
