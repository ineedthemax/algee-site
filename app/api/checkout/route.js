import { NextResponse } from 'next/server'
import { getStripe } from '../../../lib/stripe'
import { createAdminClient } from '../../../lib/supabase/admin'
import { createClient as createServerClient } from '../../../lib/supabase/server'

export async function POST(req) {
  try {
    const { tier_id, release_slug } = await req.json()

    if (!tier_id || !release_slug) {
      return NextResponse.json({ error: 'Missing tier_id or release_slug' }, { status: 400 })
    }

    // Get current user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch tier + release
    const admin = createAdminClient()
    const { data: tier } = await admin
      .from('release_tiers')
      .select('*, releases(title, slug, artwork_url)')
      .eq('id', tier_id)
      .single()

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    // Check if already purchased
    const { data: existing } = await admin
      .from('fan_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('tier_id', tier_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 409 })
    }

    const price = Number(tier.price)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thealgeesmith.com'

    // Free tier — grant access directly
    if (price === 0) {
      await admin.from('fan_purchases').insert({
        user_id: user.id,
        tier_id,
        release_id: tier.release_id,
        amount_paid: 0,
        status: 'complete',
      })
      return NextResponse.json({ free: true })
    }

    // Paid tier — create Stripe Checkout session
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier.releases.title} — ${tier.name}`,
              description: tier.description || undefined,
              images: tier.releases.artwork_url ? [tier.releases.artwork_url] : [],
            },
            unit_amount: Math.round(price * 100), // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        tier_id,
        release_id: tier.release_id,
        release_slug,
      },
      success_url: `${baseUrl}/releases/${release_slug}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/releases/${release_slug}`,
      customer_email: user.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
