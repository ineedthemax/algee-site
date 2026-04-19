import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import FanDashboard from './FanDashboard'

export const metadata = {
  title: 'My Account | Algee Smith',
  description: 'Your Algee Smith fan account.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account')

  return <FanDashboard user={user} />
}
