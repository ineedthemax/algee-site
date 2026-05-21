import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { getMission } from '../../../lib/missions'
import BirthdayForm from './BirthdayForm'

export const metadata = {
  title: 'Birthday Mission - Algee Smith',
}

export default async function BirthdayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account')

  const mission = getMission('birthday')

  // Check if already completed
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('fan_missions')
    .select('completed_at')
    .eq('user_id', user.id)
    .eq('mission_id', 'birthday')
    .single()

  return (
    <BirthdayForm
      mission={mission}
      alreadyDone={!!existing}
    />
  )
}
