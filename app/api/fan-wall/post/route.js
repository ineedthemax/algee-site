import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in to post.' }, { status: 401 })
  }

  const { message, displayName, city } = await request.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }
  if (message.trim().length > 280) {
    return NextResponse.json({ error: 'Message too long.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // One post per user - check for existing
  const { data: existing } = await admin
    .from('fan_wall_posts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'You already have a message on the wall.' }, { status: 409 })
  }

  // Insert post
  const { error: insertError } = await admin.from('fan_wall_posts').insert({
    user_id:      user.id,
    message:      message.trim(),
    display_name: displayName?.trim() || null,
    city:         city?.trim() || null,
    approved:     true,
  })

  if (insertError) {
    console.error('fan_wall_posts insert error:', insertError)
    return NextResponse.json({ error: 'Failed to post. Try again.' }, { status: 500 })
  }

  // Award points (first post only - already guarded by unique check above)
  try {
    await admin.from('fan_points_events').insert({
      user_id:  user.id,
      action:   'fan_wall_post',
      points:   20,
      metadata: {},
    })
  } catch (e) {
    console.error('fan wall points error:', e)
  }

  return NextResponse.json({ success: true, points: 20 })
}
