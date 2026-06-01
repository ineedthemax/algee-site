import { getAccessToken } from '../../../../lib/spotify'
import { isAdmin } from '../../../../lib/isAdmin'
import { createClient } from '../../../../lib/supabase/server'

const ALGEE_ARTIST_ID = '10gHoEHUPNcTFsyVR2YyeA'
const API_BASE        = 'https://api.spotify.com/v1'

async function spotifyGet(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next:    { revalidate: 3600 }, // cache for 1 hour
  })
  if (!res.ok) throw new Error(`Spotify API ${res.status}: ${path}`)
  return res.json()
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const token = await getAccessToken()

    // Fetch artist profile + top tracks in parallel
    const [artist, topTracksData] = await Promise.all([
      spotifyGet(`/artists/${ALGEE_ARTIST_ID}`, token),
      spotifyGet(`/artists/${ALGEE_ARTIST_ID}/top-tracks?market=US`, token),
    ])

    const topTracks = (topTracksData.tracks ?? []).slice(0, 5).map(t => ({
      id:         t.id,
      name:       t.name,
      popularity: t.popularity,
      album:      t.album?.name ?? '',
      previewUrl: t.preview_url ?? null,
    }))

    return Response.json({
      followers:  artist.followers?.total ?? 0,
      popularity: artist.popularity ?? 0,
      genres:     artist.genres ?? [],
      imageUrl:   artist.images?.[0]?.url ?? null,
      topTracks,
    })
  } catch (err) {
    console.error('Spotify metrics error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
