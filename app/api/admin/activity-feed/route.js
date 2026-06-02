import { NextResponse }      from 'next/server'
import { createClient }      from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin }           from '../../../../lib/isAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  const [signupsRes, missionsRes] = await Promise.all([
    admin
      .from('profiles')
      .select('email, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    admin
      .from('fan_missions')
      .select('mission_id, completed_at')
      .order('completed_at', { ascending: false })
      .limit(10),
  ])

  const events = [
    ...(signupsRes.data ?? []).map(f => ({
      type:  'signup',
      label: f.email,
      time:  f.created_at,
    })),
    ...(missionsRes.data ?? []).map(m => ({
      type:  'mission',
      label: m.mission_id,
      time:  m.completed_at,
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 15)

  return NextResponse.json({ events })
}
