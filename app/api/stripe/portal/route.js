import { NextResponse }      from 'next/server'
import { getStripe }         from '../../../../lib/stripe'
import { createClient }      from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thealgeesmith.com'

export async function POST(req) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const admin = createAdminClient()

    // Look up the fan's Stripe customer ID from their active subscription
    const { data: sub } = await admin
      .from('fan_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer:   sub.stripe_customer_id,
      return_url: `${BASE_URL}/account/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe portal]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
