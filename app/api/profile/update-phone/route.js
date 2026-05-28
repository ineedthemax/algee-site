import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone } = await request.json()
  if (!phone?.trim()) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })

  // Strip everything except digits and leading +
  const clean = phone.trim().replace(/[^\d+]/g, '')
  if (clean.length < 7 || clean.length > 16) {
    return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ phone: clean })
    .eq('id', user.id)

  if (error) {
    console.error('update-phone error:', error)
    return NextResponse.json({ error: 'Failed to save phone number' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
