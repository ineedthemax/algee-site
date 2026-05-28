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

  // Fetch missions and profiles separately (user_id → auth.users, not profiles)
  const [{ data: rows, error }, { data: profiles }] = await Promise.all([
    admin
      .from('fan_missions')
      .select('id, user_id, mission_id, metadata, completed_at')
      .order('completed_at', { ascending: false }),
    admin
      .from('profiles')
      .select('id, email'),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Build email lookup map
  const emailMap = {}
  for (const p of profiles ?? []) emailMap[p.id] = p.email

  // Group by mission_id
  const byMission = {}
  for (const row of rows ?? []) {
    if (!byMission[row.mission_id]) byMission[row.mission_id] = []
    byMission[row.mission_id].push({
      email:        emailMap[row.user_id] ?? '—',
      metadata:     row.metadata ?? {},
      completed_at: row.completed_at,
    })
  }

  // Completion counts per mission
  const counts = Object.entries(byMission)
    .map(([mission_id, entries]) => ({ mission_id, count: entries.length }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({ byMission, counts, total: (rows ?? []).length })
}
