'use client'

import { useState, useEffect } from 'react'

export default function AnalyticsMetrics() {
  const [youtube, setYoutube] = useState(null)
  const [discord, setDiscord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  async function fetchMetrics() {
    try {
      setLoading(true)
      setError(null)

      const [youtubeRes, discordRes] = await Promise.all([
        fetch('/api/metrics/youtube'),
        fetch('/api/metrics/discord'),
      ])

      if (!youtubeRes.ok) throw new Error('Failed to fetch YouTube data')
      if (!discordRes.ok) throw new Error('Failed to fetch Discord data')

      const youtubeData = await youtubeRes.json()
      const discordData = await discordRes.json()

      setYoutube(youtubeData)
      setDiscord(discordData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="analytics-grid">
        <div className="metric-card loading">Loading metrics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-grid">
        <div className="metric-card error">
          <p>{error}</p>
          <button onClick={fetchMetrics} className="refresh-btn">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="analytics-controls">
        <button onClick={fetchMetrics} className="refresh-btn">↻ Refresh</button>
      </div>

      <div className="analytics-grid">
        {/* YouTube Section */}
        {youtube && (
          <>
            <div className="metric-card">
              <div className="metric-label">YouTube Subscribers</div>
              <div className="metric-value">{youtube.subscribers?.toLocaleString()}</div>
              <div className="metric-channel">{youtube.title}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Total Views</div>
              <div className="metric-value">{youtube.views?.toLocaleString()}</div>
              <div className="metric-channel">YouTube</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Videos</div>
              <div className="metric-value">{youtube.videos?.toLocaleString()}</div>
              <div className="metric-channel">Published</div>
            </div>
          </>
        )}

        {/* Discord Section */}
        {discord && (
          <div className="metric-card">
            <div className="metric-label">Discord Members</div>
            <div className="metric-value">{discord.members?.toLocaleString()}</div>
            <div className="metric-channel">{discord.name}</div>
          </div>
        )}
      </div>

      <div className="analytics-footer">
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </>
  )
}
