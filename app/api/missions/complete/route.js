import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { getMission } from '../../../../lib/missions'
import { getWeekStart } from '../../../../lib/points'
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

  // Check if already completed — weekly missions reset each Monday
  let existingQuery = admin
    .from('fan_missions')
    .select('id')
    .eq('user_id', user.id)
    .eq('mission_id', missionId)

  if (mission.weekly) {
    existingQuery = existingQuery.gte('completed_at', getWeekStart())
  }

  const { data: existing } = await existingQuery.maybeSingle()

  if (existing) {
    return NextResponse.json({ alreadyDone: true, points: 0 })
  }

  // Save completion — weekly missions upsert so the row can be reused each week
  // Non-weekly missions just insert (DB unique constraint prevents double-earning)
  const missionRow = { user_id: user.id, mission_id: missionId, metadata: answers ?? {}, completed_at: new Date().toISOString() }
  const { error: insertError } = mission.weekly
    ? await admin.from('fan_missions').upsert(missionRow, { onConflict: 'user_id,mission_id' })
    : await admin.from('fan_missions').insert(missionRow)

  if (insertError) {
    // 23505 = unique constraint violation — mission already done (race condition)
    if (insertError.code === '23505') {
      return NextResponse.json({ alreadyDone: true, points: 0 })
    }
    console.error('fan_missions insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save mission' }, { status: 500 })
  }

  // If fan-profile mission, sync survey fields back to profiles table
  if (missionId === 'fan-profile' && answers) {
    try {
      const profileUpdate = {}
      const s = (v, max) => v?.trim().slice(0, max) || null  // safe trim + cap

      // City — fan said "Atlanta, GA" or "Yonkers NY" etc.
      if (s(answers.city, 100))        profileUpdate.city        = s(answers.city, 100)
      if (s(answers.fav_song, 200))    profileUpdate.fav_song    = s(answers.fav_song, 200)
      if (s(answers.fav_project, 200)) profileUpdate.fav_project = s(answers.fav_project, 200)
      if (s(answers.discovered, 1000)) profileUpdate.discovered  = s(answers.discovered, 1000)

      if (Object.keys(profileUpdate).length > 0) {
        await admin.from('profiles').update(profileUpdate).eq('id', user.id)
      }
    } catch (e) {
      console.error('Profile sync error:', e)
      // Non-blocking
    }
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
