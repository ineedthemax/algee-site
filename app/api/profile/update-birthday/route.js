import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { month, day } = await request.json()

  // Validate
  if (!month || !day) {
    return NextResponse.json({ error: 'Missing month or day' }, { status: 400 })
  }
  const m = Number(month)
  const d = Number(day)
  if (!Number.isInteger(m) || m < 1 || m > 12) {
    return NextResponse.json({ error: 'Invalid month' }, { status: 400 })
  }
  if (!Number.isInteger(d) || d < 1 || d > 31) {
    return NextResponse.json({ error: 'Invalid day' }, { status: 400 })
  }

  // Update profile using admin client (bypasses RLS)
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ birthday_month: m, birthday_day: d })
    .eq('id', user.id)

  if (error) {
    console.error('update-birthday error:', error)
    return NextResponse.json({ error: 'Failed to save birthday' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
