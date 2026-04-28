import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'
import webpush from 'web-push'

export async function POST(request) {
  // Init VAPID inside handler so env vars are available at runtime
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
  // Admin-only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, body, url, image } = await request.json()
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Title and body required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch all subscriptions
  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!subs?.length) return NextResponse.json({ sent: 0, total: 0, failed: 0 })

  const payload = JSON.stringify({
    title,
    body,
    url:   url  ?? '/',
    image: image ?? null,
  })

  const staleIds = []
  let sent = 0

  await Promise.allSettled(
    subs.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }
      try {
        await webpush.sendNotification(pushSub, payload)
        sent++
      } catch (err) {
        // 410 Gone = subscription expired / user unsubscribed
        if (err.statusCode === 410 || err.statusCode === 404) {
          staleIds.push(sub.id)
        }
      }
    })
  )

  // Clean up expired subscriptions
  if (staleIds.length > 0) {
    await admin.from('push_subscriptions').delete().in('id', staleIds)
  }

  // Log the send
  await admin.from('push_sends').insert({
    title,
    body,
    url:          url ?? '/',
    total:        subs.length,
    sent,
    failed:       subs.length - sent - staleIds.length,
    stale_cleaned: staleIds.length,
  }).catch(() => {}) // non-blocking

  return NextResponse.json({
    sent,
    total:   subs.length,
    failed:  subs.length - sent,
    cleaned: staleIds.length,
  })
}
