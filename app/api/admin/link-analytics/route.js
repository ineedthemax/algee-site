import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') ?? '30')
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const admin = createAdminClient()

  const [eventsRes, linksRes, fansRes] = await Promise.all([
    admin.from('smart_link_events').select('*').gte('created_at', since),
    admin.from('smart_links').select('id, slug, title, view_count, smart_link_destinations(platform, click_count)'),
    admin.from('profiles').select('created_at').gte('created_at', since),
  ])

  const events = eventsRes.data ?? []
  const links  = linksRes.data  ?? []
  const fans   = fansRes.data   ?? []

  // Views + clicks over time (by day)
  const byDay = {}
  for (const e of events) {
    const day = e.created_at.slice(0, 10)
    if (!byDay[day]) byDay[day] = { date: day, views: 0, clicks: 0 }
    if (e.type === 'view')  byDay[day].views++
    if (e.type === 'click') byDay[day].clicks++
  }
  const timeline = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date))

  // Fan signups over time (by day)
  const fansByDay = {}
  for (const f of fans) {
    const day = f.created_at.slice(0, 10)
    fansByDay[day] = (fansByDay[day] ?? 0) + 1
  }
  const fanTimeline = Object.entries(fansByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Top referrers
  const referrers = {}
  for (const e of events.filter(e => e.referrer)) {
    referrers[e.referrer] = (referrers[e.referrer] ?? 0) + 1
  }
  const topReferrers = Object.entries(referrers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }))

  // Top cities
  const cities = {}
  for (const e of events.filter(e => e.city)) {
    const key = `${e.city}${e.country ? ', ' + e.country : ''}`
    cities[key] = (cities[key] ?? 0) + 1
  }
  const topCities = Object.entries(cities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }))

  // Top countries
  const countries = {}
  for (const e of events.filter(e => e.country)) {
    countries[e.country] = (countries[e.country] ?? 0) + 1
  }
  const topCountries = Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }))

  // Top platforms clicked
  const platforms = {}
  for (const e of events.filter(e => e.type === 'click' && e.platform)) {
    platforms[e.platform] = (platforms[e.platform] ?? 0) + 1
  }
  const topPlatforms = Object.entries(platforms)
    .sort((a, b) => b[1] - a[1])
    .map(([platform, count]) => ({ platform, count }))

  // Summary stats
  const totalViews  = events.filter(e => e.type === 'view').length
  const totalClicks = events.filter(e => e.type === 'click').length
  const totalFans   = fans.length

  return NextResponse.json({
    summary: {
      totalViews,
      totalClicks,
      ctr: totalViews ? ((totalClicks / totalViews) * 100).toFixed(1) + '%' : '-',
      totalFans,
    },
    timeline,
    fanTimeline,
    topReferrers,
    topCities,
    topCountries,
    topPlatforms,
    links: links.map(l => ({
      ...l,
      totalClicks: (l.smart_link_destinations ?? []).reduce((s, d) => s + (d.click_count ?? 0), 0),
    })),
  })
}
