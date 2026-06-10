import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { createAdminClient } from '../../lib/supabase/admin'
import { MISSIONS } from '../../lib/missions'
import { getWeekStart } from '../../lib/points'
import MissionsHub from './MissionsHub'

export const metadata = {
  title: 'Missions - Algee Smith',
  description: 'Complete missions. Earn points. Level up.',
}

export default async function MissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account')

  // Fetch completed missions for this user
  const admin = createAdminClient()
  const { data: completed } = await admin
    .from('fan_missions')
    .select('mission_id, completed_at, metadata')
    .eq('user_id', user.id)

  const weekStart = getWeekStart()

  // Build completedMap — weekly missions only count if completed THIS week
  const completedMap = {}
  for (const row of (completed ?? [])) {
    const mission = MISSIONS.find(m => m.id === row.mission_id)
    if (mission?.weekly) {
      // Only mark as done if completed within the current week
      if (new Date(row.completed_at) >= new Date(weekStart)) {
        completedMap[row.mission_id] = row
      }
    } else {
      completedMap[row.mission_id] = row
    }
  }

  return <MissionsHub missions={MISSIONS} completedMap={completedMap} />
}
