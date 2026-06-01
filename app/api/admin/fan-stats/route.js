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

  const { data: fans, error } = await admin
    .from('profiles')
    .select('id, email, phone, created_at, city, region, country, birthday_month, birthday_day, username')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const now      = Date.now()
  const DAY      = 86400000
  const total    = fans.length
  const today    = fans.filter(f => now - new Date(f.created_at) < DAY).length
  const thisWeek = fans.filter(f => now - new Date(f.created_at) < 7 * DAY).length
  const thisMonth= fans.filter(f => now - new Date(f.created_at) < 30 * DAY).length
  const withPhone= fans.filter(f => f.phone).length

  // Last 30 days chart
  const signupsByDay = {}
  for (let i = 29; i >= 0; i--) {
    const key = new Date(now - i * DAY).toISOString().slice(0, 10)
    signupsByDay[key] = 0
  }
  fans.forEach(f => {
    const key = new Date(f.created_at).toISOString().slice(0, 10)
    if (signupsByDay[key] !== undefined) signupsByDay[key]++
  })
  const signupChart = Object.entries(signupsByDay).map(([date, count]) => ({ date, count }))

  // Upcoming birthdays — next 30 days
  const todayDate = new Date()
  const todayM    = todayDate.getMonth() + 1
  const todayD    = todayDate.getDate()

  const upcomingBirthdays = fans
    .filter(f => f.birthday_month && f.birthday_day)
    .map(f => {
      const bM = f.birthday_month
      const bD = f.birthday_day
      // Days until birthday this year (or next year if already passed)
      let bDate = new Date(todayDate.getFullYear(), bM - 1, bD)
      const todayMidnight = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
      if (bDate < todayMidnight) bDate.setFullYear(bDate.getFullYear() + 1)
      const daysUntil = Math.round((bDate - todayMidnight) / DAY)
      return {
        email:    f.email,
        username: f.username ?? null,
        month:    bM,
        day:      bD,
        daysUntil,
        isToday:  bM === todayM && bD === todayD,
      }
    })
    .filter(f => f.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  return NextResponse.json({
    stats: { total, today, thisWeek, thisMonth, withPhone },
    signupChart,
    recentFans: fans.slice(0, 8),
    upcomingBirthdays,
    allFans: fans,
  })
}
