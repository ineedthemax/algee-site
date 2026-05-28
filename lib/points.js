import { createAdminClient } from './supabase/admin'
export { TIERS, getTier, getNextTier } from './tiers'

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

  // Pull all events + profile data (username + email fallback)
  const { data, error } = await supabase
    .from('fan_points_events')
    .select('user_id, points, profiles(email, username, city)')

  if (error) {
    console.error('getLeaderboard error:', error)
    return []
  }

  // Aggregate points per user
  const map = {}
  for (const row of data) {
    const id       = row.user_id
    const email    = row.profiles?.email    ?? ''
    const username = row.profiles?.username ?? null
    const city     = row.profiles?.city     ?? null
    if (!map[id]) map[id] = { user_id: id, email, username, city, total: 0 }
    map[id].total += row.points
  }

  return Object.values(map)
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
