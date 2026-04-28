import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'

async function guard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user && isAdmin(user.email) ? user : null
}

export async function POST(request) {
  if (!await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, display_name, phone } = await request.json()
  if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const admin = createAdminClient()

  // Check if email already exists in profiles
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'A fan with that email already exists' }, { status: 409 })

  // Insert profile without a linked auth user (manual fan)
  const { data: fan, error } = await admin
    .from('profiles')
    .insert({
      email:        email.trim().toLowerCase(),
      display_name: display_name?.trim() || null,
      phone:        phone?.trim() || null,
      points:       0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ fan })
}
