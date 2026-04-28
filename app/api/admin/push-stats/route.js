import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  const [{ count }, { data: sends }] = await Promise.all([
    admin.from('push_subscriptions').select('*', { count: 'exact', head: true }),
    admin.from('push_sends').select('id, title, body, sent, total, created_at').order('created_at', { ascending: false }).limit(20),
  ])

  return NextResponse.json({
    subscribers: count ?? 0,
    sends:       sends ?? [],
  })
}
