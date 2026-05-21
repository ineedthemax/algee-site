import { NextResponse }      from 'next/server'
import { getStripe }         from '../../../../lib/stripe'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { pointsNeededForTier } from '../../../../lib/subscriptions'

export async function POST(req) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe webhook] signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // ── checkout.session.completed ─────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session      = event.data.object
    const { checkout_type, user_id } = session.metadata ?? {}
    if (!user_id) return NextResponse.json({ received: true })

    // ── Release tier purchase (original flow) ──────────────────────────
    if (checkout_type === undefined || checkout_type === null || !checkout_type.startsWith('fan_')) {
      const { tier_id, release_id, release_slug } = session.metadata ?? {}
      if (tier_id) {
        await admin.from('fan_purchases').upsert({
          user_id,
          tier_id,
          release_id,
          amount_paid: session.amount_total / 100,
          stripe_session_id: session.id,
          status: 'complete',
        }, { onConflict: 'user_id,tier_id' })

        await admin.from('fan_points_events').insert({
          user_id,
          action: 'MERCH_PURCHASE',
          points: 50,
          metadata: { tier_id, release_id, stripe_session_id: session.id },
        })
      }
      return NextResponse.json({ received: true })
    }

    // ── Direct tier buy-in ─────────────────────────────────────────────
    if (checkout_type === 'fan_tier') {
      const { tier_name, current_points } = session.metadata
      const currentPts = parseInt(current_points ?? '0', 10)
      const needed     = pointsNeededForTier(tier_name, currentPts)

      if (needed > 0) {
        await admin.from('fan_points_events').insert({
          user_id,
          action: 'TIER_PURCHASE',
          points: needed,
          metadata: { tier_name, stripe_session_id: session.id, amount_paid: session.amount_total / 100 },
        })
      }

      await admin.from('fan_purchases').insert({
        user_id,
        amount: session.amount_total / 100,
        item_name: `Fan Tier: ${tier_name}`,
        source: 'stripe',
        notes: `Purchased ${tier_name} tier directly`,
      })

      console.log(`[stripe webhook] fan_tier: ${tier_name} unlocked for ${user_id}, awarded ${needed} pts`)
    }

    // ── Join plan - one-time bundle ────────────────────────────────────
    if (checkout_type === 'fan_plan') {
      const { tier_name, plan } = session.metadata
      const currentPts = await getCurrentPoints(admin, user_id)
      const needed     = pointsNeededForTier(tier_name, currentPts)

      if (needed > 0) {
        await admin.from('fan_points_events').insert({
          user_id,
          action: 'TIER_PURCHASE',
          points: needed,
          metadata: { tier_name, plan, stripe_session_id: session.id, amount_paid: session.amount_total / 100 },
        })
      }

      await admin.from('fan_purchases').insert({
        user_id,
        amount: session.amount_total / 100,
        item_name: `The Bundle`,
        source: 'stripe',
        notes: `Bundle purchase - ${tier_name} tier unlocked`,
      })

      console.log(`[stripe webhook] fan_plan (${plan}): ${tier_name} unlocked for ${user_id}`)
    }

    // ── Subscription checkout complete ─────────────────────────────────
    if (checkout_type === 'fan_subscription') {
      const { tier_name, plan } = session.metadata
      const subscriptionId      = session.subscription
      const customerId          = session.customer

      // Fetch subscription details for period end
      let periodEnd = null
      try {
        const sub = await getStripe().subscriptions.retrieve(subscriptionId)
        periodEnd = new Date(sub.current_period_end * 1000).toISOString()
      } catch {}

      await admin.from('fan_subscriptions').upsert({
        user_id,
        stripe_customer_id:     customerId,
        stripe_subscription_id: subscriptionId,
        tier_name,
        status: 'active',
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_subscription_id' })

      await admin.from('fan_purchases').insert({
        user_id,
        amount: session.amount_total / 100,
        item_name: `Inner Circle - Monthly`,
        source: 'stripe',
        notes: `Subscription started - ${tier_name} tier`,
      })

      // Award signup bonus points for subscribing
      await admin.from('fan_points_events').insert({
        user_id,
        action: 'TIER_PURCHASE',
        points: 50,
        metadata: { tier_name, plan, stripe_session_id: session.id, type: 'subscription_bonus' },
      })

      console.log(`[stripe webhook] fan_subscription: ${tier_name} active for ${user_id}`)
    }
  }

  // ── customer.subscription.updated ─────────────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const sub    = event.data.object
    const status = sub.status // active, past_due, canceled, etc.

    await admin.from('fan_subscriptions')
      .update({
        status: status === 'active' ? 'active' : status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', sub.id)
  }

  // ── customer.subscription.deleted ─────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    await admin.from('fan_subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', sub.id)

    console.log(`[stripe webhook] subscription canceled: ${sub.id}`)
  }

  return NextResponse.json({ received: true })
}

// Helper - get current points total for a user
async function getCurrentPoints(admin, userId) {
  const { data } = await admin
    .from('fan_points_events')
    .select('points')
    .eq('user_id', userId)
  return (data ?? []).reduce((s, r) => s + r.points, 0)
}
