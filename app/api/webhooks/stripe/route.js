import { NextResponse } from 'next/server'
import { getStripe } from '../../../../lib/stripe'
import { createAdminClient } from '../../../../lib/supabase/admin'

export async function POST(req) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { user_id, tier_id, release_id } = session.metadata

    if (!user_id || !tier_id) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Record purchase
    const { error: purchaseErr } = await admin.from('fan_purchases').upsert({
      user_id,
      tier_id,
      release_id,
      amount_paid: session.amount_total / 100,
      stripe_session_id: session.id,
      status: 'complete',
    }, { onConflict: 'user_id,tier_id' })

    if (purchaseErr) {
      console.error('Purchase insert error:', purchaseErr)
      return NextResponse.json({ error: purchaseErr.message }, { status: 500 })
    }

    // Award fan points (50 pts per purchase)
    await admin.from('fan_points_events').insert({
      user_id,
      event_type: 'purchase',
      points: 50,
      metadata: { tier_id, release_id, stripe_session_id: session.id },
    })
  }

  return NextResponse.json({ received: true })
}
