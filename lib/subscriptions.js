import { createAdminClient } from './supabase/admin'
import { TIERS, getTier } from './tiers'

// ── Tier buy-in pricing ────────────────────────────────────────────────────
// These map to one-time Stripe payments that award enough points to reach the tier.
export const TIER_PRICES = {
  'Day One': { amount: 4.99,  label: 'Day One Access'  },
  'Rider':   { amount: 9.99,  label: 'Rider Access'    },
  'Legend':  { amount: 24.99, label: 'Legend Access'   },
}

// ── Join page plan pricing ─────────────────────────────────────────────────
export const JOIN_PLANS = {
  'inner-circle': {
    name:     'Inner Circle',
    amount:   4.99,
    interval: 'month',            // Stripe recurring
    tier:     'Day One',
    label:    'Inner Circle - Monthly',
  },
  'bundle': {
    name:     'The Bundle',
    amount:   34.99,
    interval: null,               // one-time
    tier:     'Legend',
    label:    'The Bundle - Full Access',
  },
}

// ── Get a user's active subscription ──────────────────────────────────────
export async function getUserSubscription(userId) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('fan_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}

// ── Effective tier: max of points-based and subscription tier ─────────────
export function getEffectiveTier(points, subscription) {
  const pointsTier = getTier(points)
  if (!subscription) return pointsTier

  const order = TIERS.map(t => t.name)  // ['Free','Day One','Rider','Legend']
  const subTierIdx   = order.indexOf(subscription.tier_name)
  const pointsTierIdx = order.indexOf(pointsTier.name)

  return subTierIdx > pointsTierIdx
    ? TIERS[subTierIdx]
    : pointsTier
}

// ── Points needed to reach a tier (for direct buy-ins) ────────────────────
export function pointsNeededForTier(tierName, currentPoints) {
  const tier = TIERS.find(t => t.name === tierName)
  if (!tier) return 0
  return Math.max(0, tier.min - currentPoints)
}
