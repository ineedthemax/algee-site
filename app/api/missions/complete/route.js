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

  // If fan-profile mission, sync survey fields back to profiles table
  if (missionId === 'fan-profile' && answers) {
    try {
      const profileUpdate = {}

      // City — fan said "Atlanta, GA" or "Yonkers NY" etc.
      if (answers.city?.trim()) {
        profileUpdate.city = answers.city.trim()
      }

      // Favourite song + project stored as display_name-adjacent fields
      // Store in dedicated columns if they exist, else skip gracefully
      if (answers.fav_song?.trim())    profileUpdate.fav_song    = answers.fav_song.trim()
      if (answers.fav_project?.trim()) profileUpdate.fav_project = answers.fav_project.trim()
      if (answers.discovered?.trim())  profileUpdate.discovered  = answers.discovered.trim()

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
