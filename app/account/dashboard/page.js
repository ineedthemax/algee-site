import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { getUserPoints, getTier, getNextTier } from '../../../lib/points'
import { isAdmin } from '../../../lib/isAdmin'
import FanDashboard from './FanDashboard'

export const metadata = {
  title: 'My Account | Algee Smith',
  description: 'Your Algee Smith fan account.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account')

  if (isAdmin(user.email)) redirect('/admin')

  const points  = await getUserPoints(user.id)
  const tier    = getTier(points)
  const nextTier = getNextTier(points)

  return <FanDashboard user={user} points={points} tier={tier} nextTier={nextTier} />
}
