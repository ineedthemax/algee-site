import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { getUserPoints, getTier, getNextTier, getUserRank, getWeekStart } from '../../../lib/points'
import { isAdmin } from '../../../lib/isAdmin'
import { TIERS } from '../../../lib/tiers'
import FanDashboard from './FanDashboard'

export const metadata = {
  title: 'My Account | Algee Smith',
  description: 'Your Algee Smith fan account.',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account')

  const params = await searchParams
  const isNew = params?.welcome === '1'

  const isAdminUser = isAdmin(user.email)

  const admin = createAdminClient()

  // Run independent queries in parallel
  const weekStart     = getWeekStart()
  const lastWeekStart = new Date(new Date(weekStart).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    points,
    announcementsRes,
    purchasesRes,
    profileRes,
    exclusiveRes,
    totalFansRes,
    subscriptionRes,
    weeklyPointsRes,
    lastWeekPointsRes,
    missionsRes,
  ] = await Promise.all([
    getUserPoints(user.id),
    admin.from('announcements').select('id, title, body, type, created_at').eq('active', true).order('created_at', { ascending: false }).limit(5),
    admin.from('fan_purchases').select('id, amount, item_name, notes, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    admin.from('profiles').select('birthday_month, birthday_day, username').eq('id', user.id).single(),
    admin.from('exclusive_content').select('id, title, description, type, content_url, content_body, min_tier, created_at').eq('active', true).order('created_at', { ascending: false }),
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('fan_subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').gt('current_period_end', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('fan_points_events').select('points').eq('user_id', user.id).gte('created_at', weekStart),
    admin.from('fan_points_events').select('points').eq('user_id', user.id).gte('created_at', lastWeekStart).lt('created_at', weekStart),
    admin.from('fan_missions').select('mission_id').eq('user_id', user.id),
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
  const username   = profile?.username ?? null

  // Tag exclusive content with unlock status
  const tierOrder    = TIERS.map(t => t.name)
  const userTierIdx  = tierOrder.indexOf(tier.name)
  const exclusive    = (exclusiveRes.data ?? []).map(item => ({
    ...item,
    unlocked: userTierIdx >= tierOrder.indexOf(item.min_tier),
  }))

  const subscription  = subscriptionRes.data ?? null
  const discordInvite = subscription ? (process.env.DISCORD_INVITE_URL ?? null) : null

  const weeklyPoints   = (weeklyPointsRes.data   ?? []).reduce((s, r) => s + r.points, 0)
  const lastWeekPoints = (lastWeekPointsRes.data  ?? []).reduce((s, r) => s + r.points, 0)
  const missionsCompleted = (missionsRes.data ?? []).length

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
      isNew={isNew}
      username={username}
      subscription={subscription}
      discordInvite={discordInvite}
      weeklyPoints={weeklyPoints}
      lastWeekPoints={lastWeekPoints}
      missionsCompleted={missionsCompleted}
    />
  )
}
