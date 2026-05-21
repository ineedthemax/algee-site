'use client'

import { useState, useEffect } from 'react'
import { PLATFORMS } from '../../lib/platforms'

const COUNTRY_NAMES = {
  US:'United States',GB:'United Kingdom',CA:'Canada',AU:'Australia',NG:'Nigeria',
  GH:'Ghana',ZA:'South Africa',IE:'Ireland',DE:'Germany',FR:'France',
  BR:'Brazil',MX:'Mexico',JP:'Japan',KR:'South Korea',IN:'India',
  JM:'Jamaica',TT:'Trinidad',BB:'Barbados',
}

const REFERRER_ICONS = {
  'instagram.com':'📸', 'twitter.com':'🐦', 'x.com':'🐦',
  'facebook.com':'👍', 'youtube.com':'▶️', 'tiktok.com':'🎵',
  'snapchat.com':'👻', 'google.com':'🔍', 'linktr.ee':'🌿',
  'spotify.com':'🎧',
}

function flag(code) {
  if (!code || code.length !== 2) return '🌍'
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
}

// Tiny SVG line chart
function LineChart({ data, keys, colors, height = 120 }) {
  if (!data.length) return <div className="la-empty-chart">No data yet</div>

  const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] ?? 0)), 1)
  const w = 600, h = height, pad = 8

  const points = (key) =>
    data.map((d, i) => [
      pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2),
      h - pad - ((d[key] ?? 0) / maxVal) * (h - pad * 2),
    ])

  const path = (pts) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')

  const area = (pts) =>
    `${path(pts)} L ${pts[pts.length - 1][0].toFixed(1)} ${h} L ${pts[0][0].toFixed(1)} ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, display: 'block' }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(r => (
        <line key={r} x1={pad} x2={w - pad}
          y1={h - pad - r * (h - pad * 2)} y2={h - pad - r * (h - pad * 2)}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      {keys.map((key, ki) => {
        const pts = points(key)
        return (
          <g key={key}>
            <path d={area(pts)} fill={colors[ki]} opacity="0.08" />
            <path d={path(pts)} fill="none" stroke={colors[ki]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

// Horizontal bar
function Bar({ label, value, max, color, icon }) {
  const pct = max ? (value / max) * 100 : 0
  return (
    <div className="la-bar-row">
      <div className="la-bar-label">
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {label}
      </div>
      <div className="la-bar-track">
        <div className="la-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="la-bar-val">{value.toLocaleString()}</div>
    </div>
  )
}

export default function LinkAnalytics() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [days,    setDays]    = useState(30)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/link-analytics?days=${days}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [days])

  if (loading) return <div className="adm-loading">Loading analytics...</div>
  if (error)   return <div className="adm-loading" style={{ color: '#c4222e' }}>{error}</div>
  if (!data)   return null

  const { summary, timeline, fanTimeline, topReferrers, topCities, topCountries, topPlatforms, links } = data

  const maxRef  = topReferrers[0]?.count  ?? 1
  const maxCity = topCities[0]?.count     ?? 1
  const maxPlat = topPlatforms[0]?.count  ?? 1
  const maxLink = Math.max(...links.map(l => l.view_count ?? 0), 1)

  return (
    <div className="la-wrap">

      {/* Period selector */}
      <div className="la-header">
        <div className="lm-title">Link Analytics</div>
        <div className="la-period-btns">
          {[7, 30, 90].map(d => (
            <button key={d} className={`la-period-btn${days === d ? ' la-period-active' : ''}`}
              onClick={() => setDays(d)}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="la-stats">
        <div className="la-stat">
          <div className="la-stat-val">{summary.totalViews.toLocaleString()}</div>
          <div className="la-stat-label">Total Views</div>
        </div>
        <div className="la-stat">
          <div className="la-stat-val" style={{ color: '#1DB954' }}>{summary.totalClicks.toLocaleString()}</div>
          <div className="la-stat-label">Total Clicks</div>
        </div>
        <div className="la-stat">
          <div className="la-stat-val" style={{ color: '#e8a020' }}>{summary.ctr}</div>
          <div className="la-stat-label">Click-Through Rate</div>
        </div>
        <div className="la-stat">
          <div className="la-stat-val" style={{ color: '#c4222e' }}>{summary.totalFans.toLocaleString()}</div>
          <div className="la-stat-label">New Fans</div>
        </div>
      </div>

      {/* Views & Clicks chart */}
      <div className="la-card">
        <div className="la-card-header">
          <div className="la-card-title">Page Views & Clicks</div>
          <div className="la-legend">
            <span className="la-legend-dot" style={{ background: '#3b82f6' }} />Views
            <span className="la-legend-dot" style={{ background: '#1DB954' }} />Clicks
          </div>
        </div>
        <LineChart data={timeline} keys={['views', 'clicks']} colors={['#3b82f6', '#1DB954']} height={120} />
        {timeline.length > 0 && (
          <div className="la-chart-dates">
            <span>{timeline[0]?.date}</span>
            <span>{timeline[timeline.length - 1]?.date}</span>
          </div>
        )}
      </div>

      {/* Fan signups chart */}
      {fanTimeline.length > 0 && (
        <div className="la-card">
          <div className="la-card-header">
            <div className="la-card-title">Fan Signups</div>
          </div>
          <LineChart data={fanTimeline} keys={['count']} colors={['#c4222e']} height={80} />
        </div>
      )}

      <div className="la-two-col">

        {/* Top sources */}
        <div className="la-card">
          <div className="la-card-title">Top Sources</div>
          {topReferrers.length === 0
            ? <div className="la-empty">No referrer data yet - share your links!</div>
            : topReferrers.map(r => (
              <Bar key={r.source} label={r.source} value={r.count} max={maxRef}
                color="#3b82f6" icon={REFERRER_ICONS[r.source] ?? '🔗'} />
            ))
          }
        </div>

        {/* Top platforms */}
        <div className="la-card">
          <div className="la-card-title">DSP Clicks</div>
          {topPlatforms.length === 0
            ? <div className="la-empty">No click data yet</div>
            : topPlatforms.map(p => {
                const meta = PLATFORMS.find(pl => pl.id === p.platform)
                return (
                  <Bar key={p.platform} label={meta?.label ?? p.platform} value={p.count}
                    max={maxPlat} color={meta?.bg ?? '#888'} />
                )
              })
          }
        </div>
      </div>

      <div className="la-two-col">

        {/* Top cities */}
        <div className="la-card">
          <div className="la-card-title">Top Cities</div>
          {topCities.length === 0
            ? <div className="la-empty">No location data yet</div>
            : topCities.map((c, i) => (
              <div key={c.city} className="la-city-row">
                <span className="la-city-rank">{i + 1}</span>
                <span className="la-city-name">{c.city}</span>
                <span className="la-city-count">{c.count.toLocaleString()}</span>
              </div>
            ))
          }
        </div>

        {/* Top countries */}
        <div className="la-card">
          <div className="la-card-title">Top Countries</div>
          {topCountries.length === 0
            ? <div className="la-empty">No location data yet</div>
            : topCountries.map(c => (
              <Bar key={c.country}
                label={COUNTRY_NAMES[c.country] ?? c.country}
                value={c.count}
                max={topCountries[0].count}
                color="#9b59b6"
                icon={flag(c.country)}
              />
            ))
          }
        </div>
      </div>

      {/* Per-link performance */}
      <div className="la-card">
        <div className="la-card-title">Link Performance</div>
        {links.length === 0
          ? <div className="la-empty">No links yet</div>
          : links.map(l => (
            <div key={l.id} className="la-link-row">
              <div className="la-link-info">
                <div className="la-link-name">{l.title}</div>
                <div className="la-link-slug">/links/{l.slug}</div>
              </div>
              <div className="la-link-stats">
                <div className="la-link-stat">
                  <div className="la-link-stat-val">{(l.view_count ?? 0).toLocaleString()}</div>
                  <div className="la-link-stat-label">Views</div>
                </div>
                <div className="la-link-stat">
                  <div className="la-link-stat-val" style={{ color: '#1DB954' }}>{l.totalClicks.toLocaleString()}</div>
                  <div className="la-link-stat-label">Clicks</div>
                </div>
                <div className="la-link-stat">
                  <div className="la-link-stat-val" style={{ color: '#e8a020' }}>
                    {l.view_count ? ((l.totalClicks / l.view_count) * 100).toFixed(1) + '%' : '-'}
                  </div>
                  <div className="la-link-stat-label">CTR</div>
                </div>
              </div>
              <div className="la-link-bar-wrap">
                <div className="la-link-bar" style={{ width: `${((l.view_count ?? 0) / maxLink) * 100}%` }} />
              </div>
            </div>
          ))
        }
      </div>

      <div className="la-note">
        Analytics track smart link views and clicks. Location data is provided by Vercel edge network.
        Referrer data depends on browser privacy settings.
      </div>
    </div>
  )
}
