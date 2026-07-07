import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // One SHARE award per UTC day
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { data: existing } = await admin
    .from('fan_points_events')
    .select('id')
    .eq('user_id', user.id)
    .eq('action', 'SHARE')
    .gte('created_at', todayStart.toISOString())
    .limit(1)
    .maybeSingle()

  if (existing) return NextResponse.json({ alreadyDone: true, points: 0 })

  const { error } = await admin.from('fan_points_events').insert({
    user_id:  user.id,
    action:   'SHARE',
    points:   20,
    metadata: {},
  })

  if (error) {
    console.error('share award error:', error)
    return NextResponse.json({ error: 'Failed to award points' }, { status: 500 })
  }

  return NextResponse.json({ success: true, points: 20 })
}
