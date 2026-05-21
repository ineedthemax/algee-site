import { NextResponse }    from 'next/server'
import { getStripe }       from '../../../../lib/stripe'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { createClient }    from '../../../../lib/supabase/server'
import { getUserPoints }   from '../../../../lib/points'
import { TIER_PRICES, JOIN_PLANS, pointsNeededForTier } from '../../../../lib/subscriptions'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thealgeesmith.com'

export async function POST(req) {
  try {
    const body = await req.json()
    // mode: 'tier' = direct buy-in (Day One/Rider/Legend)
    // mode: 'plan' = join page plan (inner-circle / bundle)
    const { mode = 'tier', tier, plan } = body

    // Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const admin = createAdminClient()

    // ── Direct tier buy-in ─────────────────────────────────────────────────
    if (mode === 'tier') {
      const pricing = TIER_PRICES[tier]
      if (!pricing) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })

      // Check if already at or above this tier
      const currentPoints = await getUserPoints(user.id)
      const { TIERS } = await import('../../../../lib/tiers')
      const order = TIERS.map(t => t.name)
      const { getTier } = await import('../../../../lib/tiers')
      const currentTier  = getTier(currentPoints)
      if (order.indexOf(currentTier.name) >= order.indexOf(tier)) {
        return NextResponse.json({ error: 'You already have this tier or higher' }, { status: 409 })
      }

      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `Algee Smith Fan Club - ${pricing.label}` },
            unit_amount: Math.round(pricing.amount * 100),
          },
          quantity: 1,
        }],
        metadata: {
          checkout_type: 'fan_tier',
          user_id: user.id,
          tier_name: tier,
          current_points: String(currentPoints),
        },
        success_url: `${BASE_URL}/account/dashboard?tier_unlocked=${encodeURIComponent(tier)}`,
        cancel_url:  `${BASE_URL}/tiers`,
        customer_email: user.email,
      })

      return NextResponse.json({ url: session.url })
    }

    // ── Join page plan ─────────────────────────────────────────────────────
    if (mode === 'plan') {
      const planConfig = JOIN_PLANS[plan]
      if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

      // Check for existing active subscription
      const { data: existingSub } = await admin
        .from('fan_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
      if (existingSub) return NextResponse.json({ error: 'Already subscribed' }, { status: 409 })

      // One-time (bundle)
      if (!planConfig.interval) {
        const session = await getStripe().checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: { name: `Algee Smith - ${planConfig.label}` },
              unit_amount: Math.round(planConfig.amount * 100),
            },
            quantity: 1,
          }],
          metadata: {
            checkout_type: 'fan_plan',
            user_id: user.id,
            plan,
            tier_name: planConfig.tier,
          },
          success_url: `${BASE_URL}/account/dashboard?plan_unlocked=${plan}`,
          cancel_url:  `${BASE_URL}/join`,
          customer_email: user.email,
        })
        return NextResponse.json({ url: session.url })
      }

      // Subscription (inner-circle)
      const session = await getStripe().checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `Algee Smith - ${planConfig.label}` },
            recurring: { interval: planConfig.interval },
            unit_amount: Math.round(planConfig.amount * 100),
          },
          quantity: 1,
        }],
        metadata: {
          checkout_type: 'fan_subscription',
          user_id: user.id,
          plan,
          tier_name: planConfig.tier,
        },
        success_url: `${BASE_URL}/account/dashboard?plan_unlocked=${plan}`,
        cancel_url:  `${BASE_URL}/join`,
        customer_email: user.email,
      })
      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })

  } catch (err) {
    console.error('[fan-tier checkout]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
