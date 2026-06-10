import { createAdminClient } from './supabase/admin'
export { TIERS, getTier, getNextTier } from './tiers'

// ─── Week helpers ──────────────────────────────────────────────────────────
// Returns ISO string for Monday 00:00:00 of the current week (UTC-aware)
export function getWeekStart() {
  const now = new Date()
  const day  = now.getUTCDay()             // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day   // back to Monday
  const mon  = new Date(now)
  mon.setUTCDate(now.getUTCDate() + diff)
  mon.setUTCHours(0, 0, 0, 0)
  return mon.toISOString()
}

// ─── Weekly leaderboard ────────────────────────────────────────────────────
export async function getWeeklyLeaderboard(limit = 50) {
  const supabase  = createAdminClient()
  const weekStart = getWeekStart()

  const [pointsRes, profilesRes] = await Promise.all([
    supabase
      .from('fan_points_events')
      .select('user_id, points')
      .gte('created_at', weekStart),
    supabase
      .from('profiles')
      .select('id, email, username, city'),
  ])

  if (pointsRes.error) {
    console.error('getWeeklyLeaderboard error:', pointsRes.error)
    return []
  }

  const profileMap = {}
  for (const p of (profilesRes.data ?? [])) profileMap[p.id] = p

  const map = {}
  for (const row of (pointsRes.data ?? [])) {
    const id      = row.user_id
    const profile = profileMap[id] ?? {}
    if (!map[id]) map[id] = { user_id: id, email: profile.email ?? '', username: profile.username ?? null, city: profile.city ?? null, total: 0 }
    map[id].total += row.points
  }

  return Object.values(map)
    .filter(e => e.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
}

// ─── Point values ──────────────────────────────────────────────────────────
export const POINT_ACTIONS = {
  SIGNUP:          { points: 100, label: 'Joined the fan club'     },
  STREAM_MUSIC:    { points:  10, label: 'Streamed Love Lost'       },
  WATCH_VIDEO:     { points:  10, label: 'Watched a video'          },
  VISIT_DAILY:     { points:   5, label: 'Daily visit'              },
  SHARE:           { points:  20, label: 'Shared content'           },
  MERCH_PURCHASE:  { points:  50, label: 'Purchased merch'          },
}

// ─── Get a user's total points ─────────────────────────────────────────────
export async function getUserPoints(userId) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('fan_points_events')
    .select('points')
    .eq('user_id', userId)

  if (error) {
    console.error('getUserPoints error:', error)
    return 0
  }

  return data.reduce((sum, row) => sum + row.points, 0)
}

// ─── Award points (server-side only, uses service role) ────────────────────
export async function awardPoints(userId, actionKey, metadata = {}) {
  const action = POINT_ACTIONS[actionKey]
  if (!action) throw new Error(`Unknown action: ${actionKey}`)

  const supabase = createAdminClient()
  const { error } = await supabase.from('fan_points_events').insert({
    user_id:  userId,
    action:   actionKey,
    points:   action.points,
    metadata,
  })

  if (error) {
    console.error('awardPoints error:', error)
    throw error
  }

  return action.points
}

// ─── Get top N fans by total points ───────────────────────────────────────
export async function getLeaderboard(limit = 50) {
  const supabase = createAdminClient()

  // Two separate queries — no FK join needed
  const [pointsRes, profilesRes] = await Promise.all([
    supabase
      .from('fan_points_events')
      .select('user_id, points'),
    supabase
      .from('profiles')
      .select('id, email, username, city'),
  ])

  if (pointsRes.error) {
    console.error('getLeaderboard points error:', pointsRes.error)
    return []
  }
  if (profilesRes.error) {
    console.error('getLeaderboard profiles error:', profilesRes.error)
    return []
  }

  // Build a quick profile lookup map
  const profileMap = {}
  for (const p of (profilesRes.data ?? [])) {
    profileMap[p.id] = p
  }

  // Aggregate points per user
  const map = {}
  for (const row of (pointsRes.data ?? [])) {
    const id      = row.user_id
    const profile = profileMap[id] ?? {}
    if (!map[id]) {
      map[id] = {
        user_id:  id,
        email:    profile.email    ?? '',
        username: profile.username ?? null,
        city:     profile.city     ?? null,
        total:    0,
      }
    }
    map[id].total += row.points
  }

  // Also include fans who set a username but have no points yet
  for (const p of (profilesRes.data ?? [])) {
    if (p.username && !map[p.id]) {
      map[p.id] = {
        user_id:  p.id,
        email:    p.email    ?? '',
        username: p.username,
        city:     p.city     ?? null,
        total:    0,
      }
    }
  }

  // Show fans who have a username OR have earned points
  return Object.values(map)
    .filter(e => e.username || e.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
}

// ─── Get a single user's rank ──────────────────────────────────────────────
export async function getUserRank(userId) {
  const board = await getLeaderboard(1000)
  const entry = board.find(e => e.user_id === userId)
  return entry ? entry.rank : null
}

// ─── Check if a one-time action was already awarded ─────────────────────────
export async function hasEarned(userId, actionKey) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('fan_points_events')
    .select('id')
    .eq('user_id', userId)
    .eq('action', actionKey)
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('hasEarned error:', error)
  }

  return !!data
}
