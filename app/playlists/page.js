import { createAdminClient } from '../../lib/supabase/admin'
import PlaylistsView from './PlaylistsView'

export const metadata = {
  title: 'Playlist Placements - Algee Smith',
  description: 'Every playlist Algee Smith has landed on. Share the love.',
}

export const dynamic   = 'force-dynamic'
export const revalidate = 3600 // refresh every hour

export default async function PlaylistsPage() {
  const admin = createAdminClient()

  const { data: placements } = await admin
    .from('playlist_placements')
    .select('*')
    .eq('active', true)
    .order('first_seen', { ascending: false })

  return <PlaylistsView placements={placements ?? []} />
}
