import { createAdminClient } from '../../../lib/supabase/admin'
import { NextResponse } from 'next/server'

// Public endpoint — returns aggregate playlist placement stats
export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET() {
  try {
    const admin = createAdminClient()

    const [placementsRes, playlistsRes] = await Promise.all([
      admin.from('playlist_placements').select('*').order('first_seen', { ascending: false }),
      admin.from('spotify_playlists').select('spotify_id, name, active'),
    ])

    const placements = placementsRes.data ?? []
    const playlists  = playlistsRes.data ?? []

    const active   = placements.filter(p => p.active)
    const inactive = placements.filter(p => !p.active)

    return NextResponse.json({
      active,
      inactive,
      stats: {
        activePlacements:   active.length,
        totalPlacements:    placements.length,
        playlistsMonitored: playlists.filter(p => p.active).length,
        uniquePlaylists:    [...new Set(active.map(p => p.playlist_id))].length,
        lastUpdated:        active[0]?.last_seen ?? null,
      },
    }, { headers: CORS })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS })
  }
}
