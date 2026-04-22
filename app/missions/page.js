import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { createAdminClient } from '../../lib/supabase/admin'
import { MISSIONS } from '../../lib/missions'
import MissionsHub from './MissionsHub'

export const metadata = {
  title: 'Missions — Algee Smith',
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

  const completedMap = {}
  for (const row of (completed ?? [])) {
    completedMap[row.mission_id] = row
  }

  return <MissionsHub missions={MISSIONS} completedMap={completedMap} />
}
