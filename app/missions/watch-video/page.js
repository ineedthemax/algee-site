import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { getMission } from '../../../lib/missions'
import WatchVideoClient from './WatchVideoClient'

export const metadata = { title: 'Watch a Music Video - Algee Smith' }

export default async function WatchVideoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/account')

  const mission = getMission('watch-video')

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('fan_missions')
    .select('id')
    .eq('user_id', user.id)
    .eq('mission_id', 'watch-video')
    .maybeSingle()

  return (
    <WatchVideoClient
      mission={mission}
      alreadyDone={!!existing}
    />
  )
}
