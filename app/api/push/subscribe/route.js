import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { getMission } from '../../../../lib/missions'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subscription } = await request.json()
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Save / upsert push subscription
  const { error: subError } = await admin
    .from('push_subscriptions')
    .upsert(
      {
        user_id:      user.id,
        endpoint:     subscription.endpoint,
        p256dh:       subscription.keys?.p256dh ?? null,
        auth:         subscription.keys?.auth ?? null,
        user_agent:   request.headers.get('user-agent') ?? null,
      },
      { onConflict: 'endpoint' }
    )

  if (subError) {
    console.error('push_subscriptions upsert error:', subError)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }

  // Complete the push-notifications mission (idempotent)
  const MISSION_ID = 'push-notifications'
  const mission    = getMission(MISSION_ID)

  const { data: existing } = await admin
    .from('fan_missions')
    .select('id')
    .eq('user_id', user.id)
    .eq('mission_id', MISSION_ID)
    .single()

  let pointsAwarded = 0
  if (!existing && mission) {
    await admin.from('fan_missions').insert({
      user_id:      user.id,
      mission_id:   MISSION_ID,
      metadata:     {},
      completed_at: new Date().toISOString(),
    })

    await admin.from('fan_points_events').insert({
      user_id:  user.id,
      action:   `mission:${MISSION_ID}`,
      points:   mission.points,
      metadata: { missionId: MISSION_ID },
    })

    pointsAwarded = mission.points
  }

  return NextResponse.json({ success: true, points: pointsAwarded })
}
