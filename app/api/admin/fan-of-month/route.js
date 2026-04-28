import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'

async function guard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user && isAdmin(user.email) ? user : null
}

// GET — current + past fan of the month
export async function GET() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('fan_of_month')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)
  return NextResponse.json(data ?? [])
}

// POST — set new fan of the month
export async function POST(request) {
  if (!await guard()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, display_name, reason, bonus_points } = await request.json()
  if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const admin = createAdminClient()
  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  // Check if fan of month already set for this month
  const { data: existing } = await admin
    .from('fan_of_month')
    .select('id')
    .eq('month', month)
    .eq('year', year)
    .maybeSingle()

  if (existing) {
    // Update existing
    const { data, error } = await admin
      .from('fan_of_month')
      .update({ email, display_name, reason, bonus_points: bonus_points ?? 100 })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Award bonus points if fan has an account
    if (bonus_points > 0) await awardPoints(admin, email, bonus_points ?? 100)
    return NextResponse.json({ record: data })
  }

  // Insert new
  const { data, error } = await admin
    .from('fan_of_month')
    .insert({ email, display_name, reason, bonus_points: bonus_points ?? 100, month, year })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award bonus points
  await awardPoints(admin, email, bonus_points ?? 100)

  return NextResponse.json({ record: data })
}

async function awardPoints(admin, email, points) {
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (!profile?.id) return
  await admin.from('fan_points_events').insert({
    user_id: profile.id,
    points,
    action: 'fan-of-month',
    meta: { reason: 'Fan of the Month bonus' },
  })
}
