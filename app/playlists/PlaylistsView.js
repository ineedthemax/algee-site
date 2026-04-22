'use client'

import { useState } from 'react'

function timeAgo(str) {
  if (!str) return ''
  const diff = Date.now() - new Date(str).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1)  return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return new Date(str).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function shareText(placement) {
  return `🎵 "${placement.track_name}" by Algee Smith just hit ${placement.playlist_name} on Spotify! Stream it now 👇 https://algee-site.vercel.app/music`
}

function ShareButtons({ placement }) {
  const [copied, setCopied] = useState(false)
  const text = shareText(placement)

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareInstagram = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="pl-share-btns">
      <button className="pl-share-btn pl-share-x" onClick={shareTwitter} title="Share on X">
        𝕏
      </button>
      <button className="pl-share-btn pl-share-copy" onClick={copyLink} title="Copy shoutout">
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  )
}

export default function PlaylistsView({ placements }) {
  const [filter, setFilter] = useState('all')

  // Group by track name for filter tabs
  const tracks = [...new Set(placements.map(p => p.track_name))]

  const filtered = filter === 'all'
    ? placements
    : placements.filter(p => p.track_name === filter)

  return (
    <div className="pl-page">
      <div className="pl-inner">

        {/* Hero */}
        <div className="page-hero">
          <div className="page-hero-label">On The Radar</div>
          <h1>Playlist <span className="italic">Placements.</span></h1>
          <p className="page-hero-sub">
            Every playlist Algee has landed on. Shout them out and help the songs spread.
          </p>
        </div>

        {/* Stats strip */}
        <div className="pl-stats">
          <div className="pl-stat">
            <div className="pl-stat-val">{placements.length}</div>
            <div className="pl-stat-label">Active Placements</div>
          </div>
          <div className="pl-stat">
            <div className="pl-stat-val">{[...new Set(placements.map(p => p.playlist_id))].length}</div>
            <div className="pl-stat-label">Playlists</div>
          </div>
          <div className="pl-stat">
            <div className="pl-stat-val">{tracks.length}</div>
            <div className="pl-stat-label">Songs Placed</div>
          </div>
        </div>

        {/* Filter tabs */}
        {tracks.length > 1 && (
          <div className="pl-filters">
            <button
              className={`pl-filter${filter === 'all' ? ' pl-filter-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {tracks.map(t => (
              <button
                key={t}
                className={`pl-filter${filter === t ? ' pl-filter-active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Placements */}
        {placements.length === 0 ? (
          <div className="pl-empty">
            Checking playlists now. Check back soon.
          </div>
        ) : (
          <div className="pl-grid">
            {filtered.map(p => (
              <div key={p.id} className="pl-card">
                <div className="pl-card-top">
                  <div className="pl-live-dot" />
                  <span className="pl-live-label">Live on playlist</span>
                  <span className="pl-since">{timeAgo(p.first_seen)}</span>
                </div>

                <div className="pl-track">{p.track_name}</div>
                <div className="pl-playlist-name">{p.playlist_name}</div>

                <div className="pl-card-footer">
                  <a
                    href={`https://open.spotify.com/playlist/${p.playlist_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pl-spotify-link"
                  >
                    Open on Spotify →
                  </a>
                  <ShareButtons placement={p} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fan CTA */}
        <div className="pl-cta-strip">
          <div className="pl-cta-text">
            Help Algee climb the charts. Share these placements with your people.
          </div>
        </div>

      </div>
    </div>
  )
}
