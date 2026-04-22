import { createClient } from '../../../../lib/supabase/server'
import { isAdmin } from '../../../../lib/isAdmin'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId     = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  // Show what we have (masked)
  const debug = {
    clientId:     clientId ? `${clientId.slice(0, 6)}...${clientId.slice(-4)}` : 'MISSING',
    clientSecret: clientSecret ? `${clientSecret.slice(0, 4)}...${clientSecret.slice(-4)}` : 'MISSING',
    clientIdLen:  clientId?.length ?? 0,
    secretLen:    clientSecret?.length ?? 0,
  }

  // Try the actual auth call and return full response
  try {
    const creds = btoa(`${clientId}:${clientSecret}`)
    const res   = await fetch('https://accounts.spotify.com/api/token', {
      method:  'POST',
      headers: {
        Authorization:  `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const body = await res.json()
    return NextResponse.json({ status: res.status, body, debug })
  } catch (e) {
    return NextResponse.json({ error: e.message, debug })
  }
}
