import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { getMission } from '../../../lib/missions'
import PhoneForm from './PhoneForm'

export const metadata = {
  title: 'Drop Your Number - Algee Smith',
}

export default async function AddPhonePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account')

  const mission = getMission('add-phone')
  const admin   = createAdminClient()

  const [missionRes, profileRes] = await Promise.all([
    admin.from('fan_missions').select('completed_at').eq('user_id', user.id).eq('mission_id', 'add-phone').single(),
    admin.from('profiles').select('phone').eq('id', user.id).single(),
  ])

  return (
    <PhoneForm
      mission={mission}
      alreadyDone={!!missionRes.data}
      existingPhone={profileRes.data?.phone ?? ''}
    />
  )
}
