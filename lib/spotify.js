// Spotify Client Credentials API client

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_BASE  = 'https://api.spotify.com/v1'

// Cache token in memory for the duration of the process
let _token     = null
let _expiresAt = 0

export async function getAccessToken() {
  if (_token && Date.now() < _expiresAt - 10000) return _token

  const creds    = btoa(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  )

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: {
      Authorization:  `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`)

  const json  = await res.json()
  _token      = json.access_token
  _expiresAt  = Date.now() + json.expires_in * 1000
  return _token
}

async function spotifyFetch(path) {
  const token = await getAccessToken()
  const res   = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Spotify API error ${res.status}: ${path}`)
  return res.json()
}

// Search for Algee Smith's artist ID
export async function findArtistId(name) {
  const data = await spotifyFetch(`/search?q=${encodeURIComponent(name)}&type=artist&limit=5`)
  const artist = data.artists?.items?.find(
    a => a.name.toLowerCase() === name.toLowerCase()
  ) ?? data.artists?.items?.[0]
  return artist ?? null
}

// Algee Smith's known tracks — hardcoded because Spotify restricts artist/album
// catalog endpoints for new apps. Add new track IDs here when new music drops.
export const ALGEE_TRACKS = [
  // Love Lost EP (2025)
  { id: '3Cdv23YQExzOZkxXhEaaJc', name: 'Spiraling (Intro)'   },
  { id: '3Ef87XXzcOXo4qsqTGav5V', name: 'Spiraling'           },
  { id: '1dDIfrFPAErD1CLsNFKTzi', name: 'Honest'              },
  { id: '5kjyhrGaLExHTGMBoCqGDA', name: 'Sinners'             },
  { id: '2jrs5Ma2CaXr2A4FanD2Hq', name: 'Magic City'          },
  { id: '6xSW2u8mLOE752e9v8Uaex', name: 'The Way It Goes'     },
  { id: '1VPQ0gKIFuxz174rASm0l4', name: 'Departed'            },
  { id: '2E6yJ8ozZUGA1JGHAYbRJu', name: 'Numb'               },
  // Singles
  { id: '6m5ZhZd4lPQi4zzNc77p1e', name: 'Honest (single)'    },
  { id: '2v4J4LrMt45IKryNY4dHcO', name: 'Sinners (single)'   },
  { id: '4StBYdPUxrt8Cnk0n8b4Dy', name: 'Spendin\'           },
  { id: '6vQsbVEjc7xs2OLfPmHlsJ', name: 'Peace Of Mind'      },
  { id: '3HjdiL7BQqoVlVq2wyG2sf', name: 'Ooh Ahh'            },
  { id: '2ySs2bAqcuDlKDT6EjGbwZ', name: 'The Hate U Give'    },
  { id: '63GodrNFkFseiG4XNxJRnA', name: 'She Say'            },
  { id: '14OenaY5tSI8Gb32S23zii', name: 'Westside'           },
  { id: '2iOAJ4jUfINTaKtGEhy8QS', name: 'Look'              },
  { id: '3Njpbgp0ryTfNyxT9nYxzN', name: 'Cuddle Babe'        },
  // ATL (2019)
  { id: '1WNfggcOtmYN52IzsgbOzR', name: 'Intro'              },
  { id: '2GuHfeo1ez0Mps142gSHVH', name: '2nd Wind'           },
  { id: '7nLaNuRxtXizqrbqBZiUgn', name: 'All Girls Matter'   },
  { id: '0DQIVCbPyYAedynlMRP8qj', name: 'Ooh Ahh (ATL)'     },
  { id: '6QDZcAK0WnCTsr2IfELUaD', name: 'Zero to 100'        },
  { id: '24zszWwljRNk3XNxCWrpNC', name: 'Fame'              },
  { id: '0d6p66Em2UO8C4X3fBDxL2', name: 'Westside (ATL)'    },
  // Listen EP (2017)
  { id: '55bvpxl117Q6V4xjqnq4g6', name: 'My Kind of Beautiful' },
  { id: '3hkN4dx1DaHZgwRbPP1f1D', name: 'Girl'              },
  { id: '3K6fxJQP324dGBh0ugobb3', name: 'Stay In'           },
  { id: '3lsDtg0uBxpnYegN6DXcrA', name: 'Stressed Out'      },
  { id: '2SoD6N6lXUp9cPmFkEFW3Q', name: 'Steph Curry'       },
  { id: '5CvjyttMuXKAyfBjV1iSJ3', name: 'Back to Love'      },
]

// Returns the hardcoded track list — no API call needed
export async function getArtistTracks(_artistId) {
  return ALGEE_TRACKS
}

// Get tracks in a playlist
export async function getPlaylistTracks(playlistId) {
  const tracks = []
  let url = `/playlists/${playlistId}/tracks?fields=next,items(track(id,name))&limit=100`

  while (url) {
    const data = await spotifyFetch(url)
    data.items?.forEach(item => {
      if (item.track?.id) tracks.push({ id: item.track.id, name: item.track.name })
    })
    // Handle pagination
    url = data.next ? data.next.replace(API_BASE, '') : null
  }

  return tracks
}

// Search for playlists featuring an artist
export async function searchArtistPlaylists(artistName, limit = 20) {
  const data = await spotifyFetch(
    `/search?q=${encodeURIComponent(artistName)}&type=playlist&limit=${limit}`
  )
  return data.playlists?.items?.filter(Boolean) ?? []
}

// Get playlist info
export async function getPlaylist(playlistId) {
  return spotifyFetch(`/playlists/${playlistId}?fields=id,name,followers,images,owner`)
}
