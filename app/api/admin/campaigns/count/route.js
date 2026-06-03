import { NextResponse }      from 'next/server'
import { createClient }      from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { isAdmin }           from '../../../../../lib/isAdmin'

export const dynamic = 'force-dynamic'

export async function getEmailsForSegment(admin, segment, location = '') {
  if (segment === 'all') {
    const { data } = await admin.from('profiles').select('email').not('email', 'is', null)
    return (data ?? []).map(f => f.email).filter(Boolean)
  }

  if (segment === 'has-phone') {
    const { data } = await admin
      .from('profiles')
      .select('email')
      .not('email', 'is', null)
      .not('phone',  'is', null)
    return (data ?? []).map(f => f.email).filter(Boolean)
  }

  if (segment === 'inner-circle') {
    const { data: subs } = await admin
      .from('fan_subscriptions')
      .select('user_id')
      .eq('status', 'active')
    const ids = (subs ?? []).map(s => s.user_id).filter(Boolean)
    if (ids.length === 0) return []
    const { data } = await admin.from('profiles').select('email').in('id', ids).not('email', 'is', null)
    return (data ?? []).map(f => f.email).filter(Boolean)
  }

  if (segment === 'profile-complete') {
    const { data: missions } = await admin
      .from('fan_missions')
      .select('user_id')
      .eq('mission_id', 'fan-profile')
    const ids = (missions ?? []).map(m => m.user_id).filter(Boolean)
    if (ids.length === 0) return []
    const { data } = await admin.from('profiles').select('email').in('id', ids).not('email', 'is', null)
    return (data ?? []).map(f => f.email).filter(Boolean)
  }

  if (segment === 'no-profile') {
    const [allRes, doneRes] = await Promise.all([
      admin.from('profiles').select('id, email').not('email', 'is', null),
      admin.from('fan_missions').select('user_id').eq('mission_id', 'fan-profile'),
    ])
    const doneIds = new Set((doneRes.data ?? []).map(m => m.user_id))
    return (allRes.data ?? [])
      .filter(f => !doneIds.has(f.id))
      .map(f => f.email)
      .filter(Boolean)
  }

  if (segment === 'location' && location.trim()) {
    const loc = location.trim()
    const { data } = await admin
      .from('profiles')
      .select('email')
      .not('email', 'is', null)
      .or(`region.ilike.%${loc}%,city.ilike.%${loc}%,country.ilike.%${loc}%`)
    return (data ?? []).map(f => f.email).filter(Boolean)
  }

  return []
}

export async function GET(req) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const segment  = searchParams.get('segment')  ?? 'all'
  const location = searchParams.get('location') ?? ''

  const admin  = createAdminClient()
  const emails = await getEmailsForSegment(admin, segment, location)

  return NextResponse.json({ count: emails.length })
}
