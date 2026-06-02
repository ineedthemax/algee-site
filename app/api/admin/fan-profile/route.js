import { NextResponse }      from 'next/server'
import { createClient }      from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin }           from '../../../../lib/isAdmin'

export async function GET(req) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userId = new URL(req.url).searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const admin = createAdminClient()

  const [missionsRes, pointsRes, purchasesRes, subRes] = await Promise.all([
    admin
      .from('fan_missions')
      .select('mission_id, metadata, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false }),

    admin
      .from('fan_points_events')
      .select('action, points, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),

    admin
      .from('fan_purchases')
      .select('item_name, amount, notes, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    admin
      .from('fan_subscriptions')
      .select('tier_name, status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle(),
  ])

  return NextResponse.json({
    missions:     missionsRes.data  ?? [],
    points:       pointsRes.data    ?? [],
    purchases:    purchasesRes.data ?? [],
    subscription: subRes.data       ?? null,
  })
}
