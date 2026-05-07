import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { createAdminClient } from '../../lib/supabase/admin'
import { TIERS, getTier } from '../../lib/tiers'
import { isAdmin } from '../../lib/isAdmin'
import AdminDashboard from './AdminDashboard'

export const metadata = { title: 'Admin Dashboard | Algee Smith' }

export default async function AdminPage() {
  let user
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch (e) {
    console.error('[admin] auth error:', e)
    redirect('/account')
  }

  if (!user) redirect('/account')
  if (!isAdmin(user.email)) redirect('/')

  let fans = [], pointsRows = [], missionRows = [], wallRows = []

  try {
    const admin = createAdminClient()

    const [fansRes, pointsRes, missionsRes, wallRes] = await Promise.allSettled([
      admin.from('profiles').select('*').order('created_at', { ascending: false }),
      admin.from('fan_points_events').select('user_id, points, action'),
      admin.from('fan_missions').select('mission_id, user_id'),
      admin.from('fan_wall_posts')
        .select('id, message, display_name, city, created_at, approved')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    if (fansRes.status === 'fulfilled' && !fansRes.value.error)       fans        = fansRes.value.data ?? []
    if (pointsRes.status === 'fulfilled' && !pointsRes.value.error)   pointsRows  = pointsRes.value.data ?? []
    if (missionsRes.status === 'fulfilled' && !missionsRes.value.error) missionRows = missionsRes.value.data ?? []
    if (wallRes.status === 'fulfilled' && !wallRes.value.error)        wallRows    = wallRes.value.data ?? []

    if (fansRes.value?.error)    console.error('[admin] profiles error:',          fansRes.value.error)
    if (pointsRes.value?.error)  console.error('[admin] fan_points_events error:', pointsRes.value.error)
    if (missionsRes.value?.error) console.error('[admin] fan_missions error:',     missionsRes.value.error)
    if (wallRes.value?.error)    console.error('[admin] fan_wall_posts error:',    wallRes.value.error)
  } catch (e) {
    console.error('[admin] Supabase admin client error:', e)
    // Continue with empty data rather than crashing
  }

  // ── Fan stats ──────────────────────────────────────────────────────────────
  const now       = Date.now()
  const DAY       = 86400000
  const total     = fans.length
  const today     = fans.filter(f => now - new Date(f.created_at) < DAY).length
  const thisWeek  = fans.filter(f => now - new Date(f.created_at) < 7 * DAY).length
  const thisMonth = fans.filter(f => now - new Date(f.created_at) < 30 * DAY).length
  const withPhone = fans.filter(f => f.phone).length

  // Fan signups by day (last 30 days)
  const signupsByDay = {}
  for (let i = 29; i >= 0; i--) {
    const key = new Date(now - i * DAY).toISOString().slice(0, 10)
    signupsByDay[key] = 0
  }
  fans.forEach(f => {
    const key = new Date(f.created_at).toISOString().slice(0, 10)
    if (signupsByDay[key] !== undefined) signupsByDay[key]++
  })
  const signupChart = Object.entries(signupsByDay).map(([date, count]) => ({ date, count }))

  // ── Points + tiers ─────────────────────────────────────────────────────────
  const totalPointsAwarded = pointsRows.reduce((s, r) => s + r.points, 0)

  const userPointMap = {}
  pointsRows.forEach(r => {
    userPointMap[r.user_id] = (userPointMap[r.user_id] ?? 0) + r.points
  })
  const tierCounts = TIERS.reduce((acc, t) => ({ ...acc, [t.name]: 0 }), {})
  Object.values(userPointMap).forEach(pts => { tierCounts[getTier(pts).name]++ })
  tierCounts['Free'] += Math.max(0, total - Object.keys(userPointMap).length)

  const top5 = Object.entries(userPointMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, pts]) => ({
      email: fans.find(f => f.id === userId)?.email ?? '—',
      points: pts,
      tier: getTier(pts),
    }))

  const actionMap = {}
  pointsRows.forEach(r => { actionMap[r.action] = (actionMap[r.action] ?? 0) + r.points })
  const topActions = Object.entries(actionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([action, points]) => ({ action, points }))

  // ── Missions ───────────────────────────────────────────────────────────────
  const missionCount      = missionRows.length
  const uniqueMissionFans = new Set(missionRows.map(r => r.user_id)).size

  // ── Fan Wall ───────────────────────────────────────────────────────────────
  const wallTotal    = wallRows.length
  const wallApproved = wallRows.filter(r => r.approved).length
  const recentPosts  = wallRows.slice(0, 5)

  return (
    <AdminDashboard
      fans={fans}
      stats={{ total, today, thisWeek, thisMonth, withPhone }}
      signupChart={signupChart}
      engagement={{ totalPointsAwarded, missionCount, uniqueMissionFans, wallTotal, wallApproved }}
      tierCounts={tierCounts}
      top5={top5}
      topActions={topActions}
      recentFans={fans.slice(0, 8)}
      recentPosts={recentPosts}
      tiers={TIERS}
    />
  )
}
