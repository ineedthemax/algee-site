import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await request.json()
  const clean = username?.trim().toLowerCase()

  if (!clean || !USERNAME_RE.test(clean)) {
    return NextResponse.json({
      error: 'Username must be 3–20 characters: letters, numbers, underscores only.',
    }, { status: 400 })
  }

  // Block reserved words
  const RESERVED = ['admin', 'algee', 'algeesmith', 'moderator', 'staff', 'support', 'official']
  if (RESERVED.includes(clean)) {
    return NextResponse.json({ error: 'That username is reserved.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check uniqueness (case-insensitive via the unique index)
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .ilike('username', clean)
    .maybeSingle()

  if (existing && existing.id !== user.id) {
    return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
  }

  const { error } = await admin
    .from('profiles')
    .update({ username: clean })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, username: clean })
}
