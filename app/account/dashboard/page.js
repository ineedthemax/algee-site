import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { getUserPoints, getTier, getNextTier } from '../../../lib/points'
import { isAdmin } from '../../../lib/isAdmin'
import { TIERS } from '../../../lib/tiers'
import FanDashboard from './FanDashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Account | Algee Smith',
  description: 'Your Algee Smith fan account.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account')

  if (isAdmin(user.email)) redirect('/admin')

  const points   = await getUserPoints(user.id)
  const tier     = getTier(points)
  const nextTier = getNextTier(points)

  const admin = createAdminClient()

  // Fetch active announcements
  const { data: announcements = [] } = await admin
    .from('announcements')
    .select('id, title, body, type, created_at')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch fan purchases (last 5)
  const { data: purchases = [] } = await admin
    .from('fan_purchases')
    .select('id, amount, item_name, notes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Check birthday
  const { data: profile } = await admin
    .from('profiles')
    .select('birthday_month, birthday_day')
    .eq('id', user.id)
    .single()

  const today = new Date()
  const isBirthday = profile?.birthday_month === (today.getMonth() + 1) &&
                     profile?.birthday_day   === today.getDate()

  // Fetch exclusive content — only items the user's tier can access
  const tierOrder = TIERS.map(t => t.name)           // ['Free','Day One','Rider','Legend']
  const userTierIdx = tierOrder.indexOf(tier.name)   // e.g. 1 for Day One

  const { data: exclusiveItems = [] } = await admin
    .from('exclusive_content')
    .select('id, title, description, type, content_url, content_body, min_tier, created_at')
    .eq('active', true)
    .order('created_at', { ascending: false })

  // Tag each item with whether it's unlocked for this user
  const exclusive = (exclusiveItems ?? []).map(item => ({
    ...item,
    unlocked: userTierIdx >= tierOrder.indexOf(item.min_tier),
  }))

  return (
    <FanDashboard
      user={user}
      points={points}
      tier={tier}
      nextTier={nextTier}
      announcements={announcements ?? []}
      exclusive={exclusive}
      purchases={purchases ?? []}
      isBirthday={isBirthday}
    />
  )
}
