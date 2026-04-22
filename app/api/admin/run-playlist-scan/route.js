import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { isAdmin } from '../../../../lib/isAdmin'
import { getArtistTracks, getPlaylistTracks } from '../../../../lib/spotify'
import { NextResponse } from 'next/server'

const ALGEE_ARTIST_ID = '10gHoEHUPNcTFsyVR2YyeA'


const SEED_PLAYLISTS = [
  { spotify_id: '37i9dQZF1DX4SBhb3fqCJd', name: 'RapCaviar'           },
  { spotify_id: '37i9dQZF1DWUZv56b3K0Ax', name: 'New Music Friday'     },
  { spotify_id: '37i9dQZF1DWXbttAJcbphz', name: 'R&B Rotation'         },
  { spotify_id: '37i9dQZF1DX2RxBh64BHjQ', name: 'Most Necessary'       },
  { spotify_id: '37i9dQZF1DX2UgsUIg75Vg', name: 'Are & Be'             },
  { spotify_id: '37i9dQZF1DWY6tYEFs22tW', name: 'Soul & R&B'           },
  { spotify_id: '37i9dQZF1DX4JAvHpjipBk', name: 'New Music Friday R&B' },
  { spotify_id: '37i9dQZF1DWVqfgj8NZEp1', name: 'Feelin Myself'        },
  { spotify_id: '37i9dQZF1DWY4xHQp97fN6', name: 'Get Turnt'            },
  { spotify_id: '37i9dQZF1DX4dyzvuaRJ0n', name: 'mint'                 },
]

export async function POST(request) {
  // Auth check — admin only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin   = createAdminClient()
  const results = { checked: 0, newPlacements: 0, removedPlacements: 0, errors: [] }

  try {
    // Get Algee's tracks using hardcoded artist ID (avoids /search 403)
    const artistTracks = await getArtistTracks(ALGEE_ARTIST_ID)
    const trackIds     = new Set(artistTracks.map(t => t.id))
    const trackNames   = Object.fromEntries(artistTracks.map(t => [t.id, t.name]))

    // Seed playlists
    await Promise.all(SEED_PLAYLISTS.map(p =>
      admin.from('spotify_playlists').upsert(p, { onConflict: 'spotify_id', ignoreDuplicates: true })
    ))

    // Fetch all active playlists
    const { data: playlists } = await admin
      .from('spotify_playlists')
      .select('spotify_id, name')
      .eq('active', true)

    // Check each playlist
    for (const playlist of (playlists ?? [])) {
      try {
        const tracks        = await getPlaylistTracks(playlist.spotify_id)
        const algeeTrackIds = tracks.filter(t => trackIds.has(t.id)).map(t => t.id)
        results.checked++

        // Mark removed
        const { data: existing } = await admin
          .from('playlist_placements')
          .select('track_id')
          .eq('playlist_id', playlist.spotify_id)
          .eq('active', true)

        for (const row of (existing ?? [])) {
          if (!algeeTrackIds.includes(row.track_id)) {
            await admin.from('playlist_placements')
              .update({ active: false, last_seen: new Date().toISOString() })
              .eq('playlist_id', playlist.spotify_id)
              .eq('track_id', row.track_id)
            results.removedPlacements++
          }
        }

        // Upsert active
        for (const trackId of algeeTrackIds) {
          const { data: found } = await admin
            .from('playlist_placements')
            .select('id, active')
            .eq('playlist_id', playlist.spotify_id)
            .eq('track_id', trackId)
            .single()

          if (!found) {
            await admin.from('playlist_placements').insert({
              playlist_id:   playlist.spotify_id,
              playlist_name: playlist.name,
              track_id:      trackId,
              track_name:    trackNames[trackId] ?? 'Unknown',
              active:        true,
            })
            results.newPlacements++
          } else {
            await admin.from('playlist_placements')
              .update({ active: true, last_seen: new Date().toISOString() })
              .eq('playlist_id', playlist.spotify_id)
              .eq('track_id', trackId)
          }
        }
      } catch (e) {
        results.errors.push(`${playlist.name}: ${e.message}`)
      }
    }

    return NextResponse.json({ success: true, ...results })
  } catch (e) {
    console.error('Playlist scan error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
