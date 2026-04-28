import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  const [
    { count: pushSubs },
    { data: pushSends },
    { data: campaigns },
    { data: links },
    { data: purchases },
    { data: announcements },
    { data: exclusive },
    { data: playlists },
  ] = await Promise.all([
    admin.from('push_subscriptions').select('*', { count: 'exact', head: true }),
    admin.from('push_sends').select('sent, total').order('created_at', { ascending: false }).limit(1),
    admin.from('email_campaigns').select('recipient_count'),
    admin.from('smart_links').select('id, view_count, smart_link_destinations(click_count)'),
    admin.from('fan_purchases').select('amount'),
    admin.from('announcements').select('active'),
    admin.from('exclusive_content').select('active'),
    admin.from('spotify_playlists').select('active'),
  ])

  // Links aggregates
  const totalViews  = (links ?? []).reduce((s, l) => s + (l.view_count ?? 0), 0)
  const totalClicks = (links ?? []).reduce((s, l) =>
    s + (l.smart_link_destinations ?? []).reduce((c, d) => c + (d.click_count ?? 0), 0), 0)

  // Campaigns
  const campaignsSent       = (campaigns ?? []).length
  const campaignRecipients  = (campaigns ?? []).reduce((s, c) => s + (c.recipient_count ?? 0), 0)

  // Spending
  const totalRevenue  = (purchases ?? []).reduce((s, p) => s + Number(p.amount ?? 0), 0)
  const purchaseCount = (purchases ?? []).length

  // Push
  const lastSend = (pushSends ?? [])[0]

  return NextResponse.json({
    links: {
      count:  (links ?? []).length,
      views:  totalViews,
      clicks: totalClicks,
    },
    push: {
      subscribers: pushSubs ?? 0,
      sends:       (pushSends ?? []).length,
      lastSent:    lastSend?.sent ?? 0,
      lastTotal:   lastSend?.total ?? 0,
    },
    campaigns: {
      sent:       campaignsSent,
      recipients: campaignRecipients,
    },
    spending: {
      revenue:   totalRevenue,
      purchases: purchaseCount,
    },
    announce: {
      active: (announcements ?? []).filter(a => a.active).length,
      total:  (announcements ?? []).length,
    },
    exclusive: {
      active: (exclusive ?? []).filter(e => e.active).length,
      total:  (exclusive ?? []).length,
    },
    playlists: {
      active: (playlists ?? []).filter(p => p.active).length,
      total:  (playlists ?? []).length,
    },
  })
}
