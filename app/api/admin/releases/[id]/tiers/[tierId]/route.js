import { NextResponse } from 'next/server'
import { createClient } from '../../../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../../../lib/supabase/admin'
import { isAdmin } from '../../../../../../../lib/isAdmin'

async function guard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user && isAdmin(user.email) ? user : null
}

export async function PATCH(request, { params }) {
  if (!await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { tierId } = await params
  const body    = await request.json()
  // Whitelist only the fields editors are allowed to change
  const allowed = ['name', 'description', 'price', 'position', 'stripe_price_id', 'features', 'is_free']
  const update  = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('release_tiers')
    .update(update)
    .eq('id', tierId)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tier: data })
}

export async function DELETE(request, { params }) {
  if (!await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { tierId } = await params
  const admin = createAdminClient()
  const { error } = await admin.from('release_tiers').delete().eq('id', tierId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
