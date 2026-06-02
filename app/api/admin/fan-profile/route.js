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

  const [profileRes, subRes] = await Promise.all([
    admin
      .from('fan_missions')
      .select('metadata')
      .eq('user_id', userId)
      .eq('mission_id', 'fan-profile')
      .maybeSingle(),

    admin
      .from('fan_subscriptions')
      .select('tier_name, status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle(),
  ])

  return NextResponse.json({
    survey:       profileRes.data?.metadata ?? null,
    subscription: subRes.data               ?? null,
  })
}
