import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { getMission } from '../../../lib/missions'
import FanProfileForm from './FanProfileForm'

export const metadata = {
  title: 'Fan Profile Mission — Algee Smith',
}

export default async function FanProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account')

  const mission = getMission('fan-profile')

  // Check if already completed
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('fan_missions')
    .select('metadata, completed_at')
    .eq('user_id', user.id)
    .eq('mission_id', 'fan-profile')
    .single()

  return (
    <FanProfileForm
      mission={mission}
      userId={user.id}
      existing={existing ?? null}
    />
  )
}
