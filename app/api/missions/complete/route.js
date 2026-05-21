import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { getMission } from '../../../../lib/missions'
import { NextResponse } from 'next/server'

export async function POST(request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { missionId, answers } = await request.json()
  if (!missionId) {
    return NextResponse.json({ error: 'Missing missionId' }, { status: 400 })
  }

  const mission = getMission(missionId)
  if (!mission) {
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
  }

  const admin = createAdminClient()

  // Check if already completed (idempotent)
  const { data: existing } = await admin
    .from('fan_missions')
    .select('id')
    .eq('user_id', user.id)
    .eq('mission_id', missionId)
    .single()

  if (existing) {
    return NextResponse.json({ alreadyDone: true, points: 0 })
  }

  // Save completion + answers
  const { error: insertError } = await admin.from('fan_missions').insert({
    user_id:    user.id,
    mission_id: missionId,
    metadata:   answers ?? {},
  })

  if (insertError) {
    console.error('fan_missions insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save mission' }, { status: 500 })
  }

  // Award points directly (missions use their own point value)
  try {
    await admin.from('fan_points_events').insert({
      user_id:  user.id,
      action:   `mission:${missionId}`,
      points:   mission.points,
      metadata: { missionId },
    })
  } catch (e) {
    console.error('awardPoints error:', e)
    // Non-blocking - mission is saved, points failed
  }

  return NextResponse.json({ success: true, points: mission.points })
}
