import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { createAdminClient } from '../../lib/supabase/admin'
import { TIERS, getTier } from '../../lib/tiers'
import { isAdmin } from '../../lib/isAdmin'
import AdminDashboard from './AdminDashboard'

export const metadata = { title: 'Admin Dashboard | Algee Smith' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/account')
  if (!isAdmin(user.email)) redirect('/')

  const admin = createAdminClient()

  // ── Fans ──────────────────────────────────────────────────────────────────
  const { data: fans } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const now      = Date.now()
  const DAY      = 86400000
  const total    = fans?.length ?? 0
  const today    = fans?.filter(f => now - new Date(f.created_at) < DAY).length ?? 0
  const thisWeek = fans?.filter(f => now - new Date(f.created_at) < 7 * DAY).length ?? 0
  const thisMonth = fans?.filter(f => now - new Date(f.created_at) < 30 * DAY).length ?? 0
  const withPhone = fans?.filter(f => f.phone).length ?? 0

  // Fan signups by day (last 30 days)
  const signupsByDay = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * DAY)
    const key = d.toISOString().slice(0, 10)
    signupsByDay[key] = 0
  }
  fans?.forEach(f => {
    const key = new Date(f.created_at).toISOString().slice(0, 10)
    if (signupsByDay[key] !== undefined) signupsByDay[key]++
  })
  const signupChart = Object.entries(signupsByDay).map(([date, count]) => ({ date, count }))

  // ── Points + tiers ────────────────────────────────────────────────────────
  const { data: pointsRows } = await admin
    .from('fan_points_events')
    .select('user_id, points, action')

  const totalPointsAwarded = pointsRows?.reduce((s, r) => s + r.points, 0) ?? 0

  // Per-user totals for tier breakdown
  const userPointMap = {}
  pointsRows?.forEach(r => {
    userPointMap[r.user_id] = (userPointMap[r.user_id] ?? 0) + r.points
  })
  const tierCounts = TIERS.reduce((acc, t) => ({ ...acc, [t.name]: 0 }), {})
  Object.values(userPointMap).forEach(pts => {
    const tier = getTier(pts)
    tierCounts[tier.name]++
  })
  // fans with no points are Free
  const fansWithPoints = Object.keys(userPointMap).length
  tierCounts['Free'] += Math.max(0, total - fansWithPoints)

  // Top 5 fans
  const top5 = Object.entries(userPointMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, pts]) => {
      const fan  = fans?.find(f => f.id === userId)
      const tier = getTier(pts)
      return { email: fan?.email ?? '—', points: pts, tier }
    })

  // Points by action breakdown
  const actionMap = {}
  pointsRows?.forEach(r => {
    actionMap[r.action] = (actionMap[r.action] ?? 0) + r.points
  })
  const topActions = Object.entries(actionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([action, points]) => ({ action, points }))

  // ── Missions ──────────────────────────────────────────────────────────────
  const { data: missionRows } = await admin
    .from('fan_missions')
    .select('mission_id, user_id')

  const missionCount = missionRows?.length ?? 0
  const uniqueMissionFans = new Set(missionRows?.map(r => r.user_id)).size

  // ── Fan Wall ──────────────────────────────────────────────────────────────
  const { data: wallRows } = await admin
    .from('fan_wall_posts')
    .select('id, message, display_name, city, created_at, approved')
    .order('created_at', { ascending: false })
    .limit(50)

  const wallTotal    = wallRows?.length ?? 0
  const wallApproved = wallRows?.filter(r => r.approved).length ?? 0
  const recentPosts  = wallRows?.slice(0, 5) ?? []

  // ── Recent signups ────────────────────────────────────────────────────────
  const recentFans = fans?.slice(0, 8) ?? []

  return (
    <AdminDashboard
      fans={fans ?? []}
      stats={{ total, today, thisWeek, thisMonth, withPhone }}
      signupChart={signupChart}
      engagement={{ totalPointsAwarded, missionCount, uniqueMissionFans, wallTotal, wallApproved }}
      tierCounts={tierCounts}
      top5={top5}
      topActions={topActions}
      recentFans={recentFans}
      recentPosts={recentPosts}
      tiers={TIERS}
    />
  )
}
