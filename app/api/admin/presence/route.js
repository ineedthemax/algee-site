import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { createClient } from '../../../../lib/supabase/server'
import { isAdmin } from '../../../../lib/isAdmin'

// POST - update own presence (ping every 30s)
export async function POST(req) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  await admin.from('admin_presence').upsert({
    email: user.email,
    last_seen: new Date().toISOString(),
  }, { onConflict: 'email' })

  return NextResponse.json({ ok: true })
}

// GET - return all admins active in last 2 minutes
export async function GET(req) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const since = new Date(Date.now() - 2 * 60 * 1000).toISOString()
  const { data } = await admin
    .from('admin_presence')
    .select('email, last_seen')
    .gte('last_seen', since)

  return NextResponse.json({ active: data ?? [] })
}
