import { createAdminClient } from '../../../lib/supabase/admin'
import { createClient as createServerClient } from '../../../lib/supabase/server'
import { notFound } from 'next/navigation'
import ReleaseView from './ReleaseView'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const admin = createAdminClient()
  const { data } = await admin.from('releases').select('title, description').eq('slug', slug).maybeSingle()
  if (!data) return { title: 'Release Not Found' }
  return { title: `${data.title} - Algee Smith`, description: data.description }
}

export default async function ReleasePage({ params }) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: release } = await admin
    .from('releases')
    .select('*, release_tiers(*, tier_content(*))')
    .eq('slug', slug)
    .eq('status', 'live')
    .maybeSingle()

  if (!release) notFound()

  const tiers = (release.release_tiers ?? [])
    .sort((a, b) => a.position - b.position)
    .map(t => ({
      ...t,
      tier_content: (t.tier_content ?? []).sort((a, b) => a.position - b.position),
    }))

  // Check which tiers current user has purchased
  let purchasedTierIds = []
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const tierIds = tiers.map(t => t.id)
      const { data: purchases } = await admin
        .from('fan_purchases')
        .select('tier_id')
        .eq('user_id', user.id)
        .in('tier_id', tierIds)
        .eq('status', 'complete')
      purchasedTierIds = (purchases ?? []).map(p => p.tier_id)
    }
  } catch (_) {}

  return <ReleaseView release={release} tiers={tiers} purchasedTierIds={purchasedTierIds} />
}
