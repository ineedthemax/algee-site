import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('country_code, country, region, city')
    .not('country_code', 'is', null)

  // Count fans per country
  const countryCounts = {}
  // Count fans per US state
  const stateCounts = {}
  // Top cities
  const cityCounts = {}

  for (const row of data ?? []) {
    // Country rollup
    const key = row.country_code
    if (!countryCounts[key]) {
      countryCounts[key] = { country_code: key, country: row.country, count: 0 }
    }
    countryCounts[key].count++

    // US state breakdown
    if (row.country_code === 'US' && row.region) {
      stateCounts[row.region] = (stateCounts[row.region] ?? 0) + 1
    }

    // City rollup (show city + region for US, city + country elsewhere)
    if (row.city) {
      const cityLabel = row.country_code === 'US' && row.region
        ? `${row.city}, ${row.region}`
        : `${row.city}, ${row.country}`
      cityCounts[cityLabel] = (cityCounts[cityLabel] ?? 0) + 1
    }
  }

  const countries = Object.values(countryCounts).sort((a, b) => b.count - a.count)

  const states = Object.entries(stateCounts)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)

  const cities = Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  return NextResponse.json({ countries, states, cities })
}
