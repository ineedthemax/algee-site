'use client'

import { useState, useEffect } from 'react'

function timeAgo(str) {
  if (!str) return '-'
  const diff  = Date.now() - new Date(str).getTime()
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (hours < 1)  return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function PlaylistTracker() {
  const [placements, setPlacements] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [running,    setRunning]    = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [error,      setError]      = useState(null)

  const fetchPlacements = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/playlist-placements')
      const data = await res.json()
      setPlacements(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const runScan = async () => {
    setRunning(true)
    setLastResult(null)
    try {
      const res  = await fetch('/api/admin/run-playlist-scan', { method: 'POST' })
      const data = await res.json()
      setLastResult(data)
      await fetchPlacements()
    } catch (e) {
      setLastResult({ error: e.message })
    } finally {
      setRunning(false)
    }
  }

  useEffect(() => { fetchPlacements() }, [])

  const active   = placements.filter(p => p.active)
  const inactive = placements.filter(p => !p.active)

  return (
    <div className="pt-wrap">
      <div className="pt-header">
        <div>
          <div className="lm-title">Playlist Tracker</div>
          <div className="lm-sub">
            {active.length} active placement{active.length !== 1 ? 's' : ''} across {[...new Set(active.map(p => p.playlist_id))].length} playlists
          </div>
        </div>
        <button className="lm-btn-new" onClick={runScan} disabled={running}>
          {running ? '⟳ Scanning...' : '⟳ Run Scan Now'}
        </button>
      </div>

      {lastResult && (
        <div className={`pt-result ${lastResult.error ? 'pt-result-error' : 'pt-result-ok'}`}>
          {lastResult.error
            ? `Error: ${lastResult.error}`
            : `✓ Checked ${lastResult.checked} playlists · ${lastResult.newPlacements} new · ${lastResult.removedPlacements} removed`
          }
        </div>
      )}

      <div className="adm-section-label">Active Placements</div>
      {loading ? (
        <div className="adm-loading">Loading placements...</div>
      ) : active.length === 0 ? (
        <div className="adm-card adm-empty">No active placements yet. Run a scan to check.</div>
      ) : (
        <div className="pt-list">
          {active.map(p => (
            <div key={p.id} className="pt-row">
              <div className="pt-row-left">
                <div className="pt-dot pt-dot-active" />
                <div>
                  <div className="pt-track">{p.track_name}</div>
                  <div className="pt-playlist">{p.playlist_name}</div>
                </div>
              </div>
              <div className="pt-row-right">
                <div className="pt-since">Since {timeAgo(p.first_seen)}</div>
                <div className="pt-last">Last seen {timeAgo(p.last_seen)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {inactive.length > 0 && (
        <>
          <div className="adm-section-label">Previously On</div>
          <div className="pt-list">
            {inactive.map(p => (
              <div key={p.id} className="pt-row pt-row-inactive">
                <div className="pt-row-left">
                  <div className="pt-dot" />
                  <div>
                    <div className="pt-track">{p.track_name}</div>
                    <div className="pt-playlist">{p.playlist_name}</div>
                  </div>
                </div>
                <div className="pt-row-right">
                  <div className="pt-since">Removed {timeAgo(p.last_seen)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="pt-note">Scans run automatically every day at 9am UTC via Vercel Cron. Use "Run Scan Now" to check immediately.</div>
    </div>
  )
}
