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
    .select('country_code, country')
    .not('country_code', 'is', null)

  // Count fans per country
  const counts = {}
  for (const row of data ?? []) {
    const key = row.country_code
    if (!counts[key]) counts[key] = { country_code: key, country: row.country, count: 0 }
    counts[key].count++
  }

  return NextResponse.json({ countries: Object.values(counts) })
}
