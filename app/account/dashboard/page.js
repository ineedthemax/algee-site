import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { getUserPoints, getTier, getNextTier, getUserRank } from '../../../lib/points'
import { isAdmin } from '../../../lib/isAdmin'
import { TIERS } from '../../../lib/tiers'
import FanDashboard from './FanDashboard'

export const metadata = {
  title: 'My Account | Algee Smith',
  description: 'Your Algee Smith fan account.',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account')

  const isAdminUser = isAdmin(user.email)

  const admin = createAdminClient()

  // Run independent queries in parallel
  const [
    points,
    announcementsRes,
    purchasesRes,
    profileRes,
    exclusiveRes,
    totalFansRes,
  ] = await Promise.all([
    getUserPoints(user.id),
    admin.from('announcements').select('id, title, body, type, created_at').eq('active', true).order('created_at', { ascending: false }).limit(5),
    admin.from('fan_purchases').select('id, amount, item_name, notes, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    admin.from('profiles').select('birthday_month, birthday_day').eq('id', user.id).single(),
    admin.from('exclusive_content').select('id, title, description, type, content_url, content_body, min_tier, created_at').eq('active', true).order('created_at', { ascending: false }),
    admin.from('profiles').select('id', { count: 'exact', head: true }),
  ])

  const tier      = getTier(points)
  const nextTier  = getNextTier(points)
  const totalFans = totalFansRes.count ?? 0

  // Fetch rank (depends on points, run after)
  const rank = await getUserRank(user.id).catch(() => null)

  // Birthday check
  const profile    = profileRes.data
  const today      = new Date()
  const isBirthday = profile?.birthday_month === (today.getMonth() + 1) &&
                     profile?.birthday_day   === today.getDate()

  // Tag exclusive content with unlock status
  const tierOrder    = TIERS.map(t => t.name)
  const userTierIdx  = tierOrder.indexOf(tier.name)
  const exclusive    = (exclusiveRes.data ?? []).map(item => ({
    ...item,
    unlocked: userTierIdx >= tierOrder.indexOf(item.min_tier),
  }))

  return (
    <FanDashboard
      user={user}
      points={points}
      tier={tier}
      nextTier={nextTier}
      announcements={announcementsRes.data ?? []}
      exclusive={exclusive}
      purchases={purchasesRes.data ?? []}
      isBirthday={isBirthday}
      isAdminUser={isAdminUser}
      rank={rank}
      totalFans={totalFans}
    />
  )
}
