'use client'

import { useState, useEffect, useRef, useCallback, Component, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

const FanMap = lazy(() => import('../components/FanMap'))
import LinksManager from './LinksManager'
import PlaylistTracker from './PlaylistTracker'
import LinkAnalytics from './LinkAnalytics'
import AnnouncementManager from './AnnouncementManager'
import CampaignManager from './CampaignManager'
import ExclusiveContentManager from './ExclusiveContentManager'
import PushManager from './PushManager'
import SpendingManager from './SpendingManager'
import FanOfMonthManager from './FanOfMonthManager'
import ReleasesManager from './ReleasesManager'
import MissionsViewer from './MissionsViewer'

// ── Error boundary ────────────────────────────────────────────────────────────
class AdminErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#f55', fontFamily: 'monospace', background: '#0a0a0a', minHeight: '100vh' }}>
          <div style={{ fontSize: 18, marginBottom: 16, color: '#fff' }}>⚠ Admin Dashboard Error</div>
          <pre style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: '#f88' }}>{this.state.error?.message}</pre>
          <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap', color: '#888', marginTop: 12 }}>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 24, padding: '10px 20px', background: '#c4222e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const NAV_GROUPS = [
  {
    label: 'Analytics',
    items: [
      { id: 'Overview',   icon: '◉', label: 'Overview'   },
      { id: 'Engagement', icon: '★', label: 'Engagement' },
      { id: 'Fans',       icon: '◎', label: 'Fans'       },
      { id: 'Platform',   icon: '◈', label: 'Platform'   },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'Releases',  icon: '◈',  label: 'Releases'   },
      { id: 'Exclusive', icon: '🔒', label: 'Exclusive'  },
      { id: 'Playlists', icon: '♫',  label: 'Playlists'  },
    ],
  },
  {
    label: 'Engage',
    items: [
      { id: 'Missions',   icon: '⚡', label: 'Missions'    },
      { id: 'Announce',   icon: '📢', label: 'Announce'   },
      { id: 'Campaigns',  icon: '✉',  label: 'Campaigns'  },
      { id: 'Push',       icon: '🔔', label: 'Push'       },
      { id: 'FanOfMonth', icon: '👑', label: 'Fan of Month' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { id: 'Links', icon: '↗', label: 'Smart Links' },
      { id: 'Spend', icon: '$', label: 'Spending'    },
    ],
  },
]

// Flat list for topbar title lookup
const NAV = NAV_GROUPS.flatMap(g => g.items)

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const num = typeof target === 'number' ? target : parseFloat(target) || 0
  useEffect(() => {
    if (num === 0) { setValue(0); return }
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(ease * num))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [num, duration])
  return value
}

function StatCard({ label, value, sub, color, accent, pulse }) {
  const num     = typeof value === 'number' ? value : null
  const counted = useCountUp(num ?? 0)
  const display = num !== null ? counted.toLocaleString() : value

  return (
    <div className={`adm2-stat${accent ? ' adm2-stat-accent' : ''}${pulse ? ' adm2-stat-pulse' : ''}`}>
      <div className="adm2-stat-value" style={color ? { color } : {}}>{display}</div>
      <div className="adm2-stat-label">{label}</div>
      {sub && <div className="adm2-stat-sub">{sub}</div>}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="adm2-section-label">
      <span>{children}</span>
      <div className="adm2-section-line" />
    </div>
  )
}

// Smooth bezier path through points using cardinal spline approach
function smoothCurve(pts) {
  if (pts.length < 2) return ''
  const d = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`]
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 2] ?? pts[i - 1]
    const p1 = pts[i - 1]
    const p2 = pts[i]
    const p3 = pts[i + 1] ?? p2
    // Catmull-Rom → cubic bezier conversion
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`)
  }
  return d.join(' ')
}

function GrowthChart({ data }) {
  const svgRef   = useRef(null)
  const [ready,   setReady]   = useState(false)
  const [hover,   setHover]   = useState(null)   // { x, y, date, count, idx }
  const [pathLen, setPathLen] = useState(null)

  const lineRef = useRef(null)

  const W   = 600
  const H   = 140
  const padX = 4
  const padY = 20

  const safeData = Array.isArray(data) && data.length > 1 ? data : null
  const max = safeData ? Math.max(...safeData.map(d => d.count), 1) : 1

  const pts = safeData ? safeData.map((d, i) => ({
    x: padX + (i / (safeData.length - 1)) * (W - padX * 2),
    y: H - padY - (d.count / max) * (H - padY * 2),
    date:  d.date,
    count: d.count,
    idx:   i,
  })) : []

  const linePath = smoothCurve(pts)
  const areaPath = pts.length > 1
    ? `${linePath} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`
    : ''

  // Measure path length for draw animation
  useEffect(() => {
    if (lineRef.current) {
      setPathLen(lineRef.current.getTotalLength())
    }
    const t = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(t)
  }, [linePath])

  // Find nearest point to mouse
  const handleMouseMove = (e) => {
    if (!svgRef.current || pts.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const mx   = ((e.clientX - rect.left) / rect.width) * W
    let closest = pts[0], minDist = Infinity
    for (const p of pts) {
      const dist = Math.abs(p.x - mx)
      if (dist < minDist) { minDist = dist; closest = p }
    }
    setHover(closest)
  }

  const totalSignups = safeData ? safeData.reduce((s, d) => s + d.count, 0) : 0
  const peakDay      = safeData ? safeData.reduce((a, b) => b.count > a.count ? b : a, safeData[0]) : null

  return (
    <div className="gc-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="gc-svg"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="gcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(196,34,46,0.35)" />
            <stop offset="70%"  stopColor="rgba(196,34,46,0.08)" />
            <stop offset="100%" stopColor="rgba(196,34,46,0)" />
          </linearGradient>
          <linearGradient id="gcLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(196,34,46,0.4)" />
            <stop offset="60%"  stopColor="#C4222E" />
            <stop offset="100%" stopColor="#ff4455" />
          </linearGradient>
          <filter id="gcGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="gcClip">
            <rect x="0" y="0" width={W} height={H} />
          </clipPath>
        </defs>

        {/* Subtle horizontal grid lines */}
        {[0.25, 0.5, 0.75].map(t => (
          <line
            key={t}
            x1={0} y1={padY + t * (H - padY * 2)}
            x2={W} y2={padY + t * (H - padY * 2)}
            stroke="rgba(245,240,235,0.04)" strokeWidth="1"
          />
        ))}

        <g clipPath="url(#gcClip)">
          {/* Area fill */}
          {pts.length > 1 && (
            <path
              d={areaPath}
              fill="url(#gcGrad)"
              style={{ transition: 'opacity 0.6s', opacity: ready ? 1 : 0 }}
            />
          )}

          {/* Glow layer (thicker, blurred) */}
          {pts.length > 1 && ready && (
            <path
              d={linePath}
              fill="none"
              stroke="rgba(196,34,46,0.35)"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#gcGlow)"
            />
          )}

          {/* Main line with draw animation */}
          {pts.length > 1 && (
            <path
              ref={lineRef}
              d={linePath}
              fill="none"
              stroke="url(#gcLine)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={pathLen ? {
                strokeDasharray:  pathLen,
                strokeDashoffset: ready ? 0 : pathLen,
                transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
              } : {}}
            />
          )}

          {/* Data points — only show where signups > 0 */}
          {ready && pts.map((p) => p.count > 0 && (
            <g key={p.idx}>
              <circle cx={p.x} cy={p.y} r="5" fill="rgba(196,34,46,0.2)" />
              <circle cx={p.x} cy={p.y} r="3" fill="#C4222E" />
            </g>
          ))}

          {/* Hover crosshair */}
          {hover && (
            <g>
              <line
                x1={hover.x} y1={0} x2={hover.x} y2={H}
                stroke="rgba(245,240,235,0.15)" strokeWidth="1" strokeDasharray="4 3"
              />
              <circle cx={hover.x} cy={hover.y} r="6" fill="rgba(196,34,46,0.25)" />
              <circle cx={hover.x} cy={hover.y} r="4" fill="#ff4455" />
            </g>
          )}
        </g>
      </svg>

      {/* Hover tooltip */}
      <div
        className="gc-tooltip"
        style={{
          opacity:   hover ? 1 : 0,
          transform: hover
            ? `translateX(${Math.min(hover.idx / (pts.length - 1), 0.7) > 0.7 ? -100 : 0}%)`
            : 'none',
          left: hover
            ? `${(hover.x / W) * 100}%`
            : '50%',
        }}
      >
        {hover && (
          <>
            <div className="gc-tooltip-count">{hover.count} signup{hover.count !== 1 ? 's' : ''}</div>
            <div className="gc-tooltip-date">{new Date(hover.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="gc-footer">
        <span className="gc-footer-label">{safeData?.[0]?.date ? new Date(safeData[0].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
        <div className="gc-footer-center">
          {totalSignups > 0 && <span className="gc-peak">Peak: {peakDay?.count} on {peakDay ? new Date(peakDay.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>}
        </div>
        <span className="gc-footer-label">Today</span>
      </div>
    </div>
  )
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ── Overview mirror cards ─────────────────────────────────────────────────────
function MirrorCard({ icon, label, tabId, lines, setTab, color = '#C4222E' }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      className={`ov-mirror${hovered ? ' ov-mirror-hovered' : ''}`}
      onClick={() => setTab(tabId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ '--mc-accent': color }}
    >
      <div className="ov-mirror-accent-bar" />
      <div className="ov-mirror-head">
        <span className="ov-mirror-icon" style={{ color }}>{icon}</span>
        <span className="ov-mirror-label">{label}</span>
        <span className="ov-mirror-arrow">{hovered ? '↗' : '→'}</span>
      </div>
      <div className="ov-mirror-body">
        {lines.map((line, i) => (
          <div key={i} className="ov-mirror-line">
            <span className="ov-mirror-val" style={line.color ? { color: line.color } : i === 0 ? { color: '#fff' } : {}}>{line.value}</span>
            <span className="ov-mirror-desc">{line.desc}</span>
          </div>
        ))}
      </div>
    </button>
  )
}

function OverviewTab({ initialStats, initialSignupChart, initialRecentFans, engagement, setTab, onRefreshDone }) {
  const [ov,                setOv]                = useState(null)
  const [mapData,           setMapData]           = useState([])
  const [stateData,         setStateData]         = useState([])
  const [cityData,          setCityData]          = useState([])
  const [stats,             setStats]             = useState(initialStats)
  const [signupChart,       setSignupChart]       = useState(initialSignupChart)
  const [recentFans,        setRecentFans]        = useState(initialRecentFans)
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([])
  const [refreshing,        setRefreshing]        = useState(false)
  const [lastUpdated,       setLastUpdated]       = useState(null)

  const fetchFanStats = async () => {
    const res = await fetch('/api/admin/fan-stats')
    if (res.ok) {
      const d = await res.json()
      setStats(d.stats)
      setSignupChart(d.signupChart)
      setRecentFans(d.recentFans)
      setUpcomingBirthdays(d.upcomingBirthdays ?? [])
    }
  }

  const fetchOverview = async () => {
    const [ovRes, mapRes] = await Promise.all([
      fetch('/api/admin/overview'),
      fetch('/api/admin/fan-map'),
    ])
    if (ovRes.ok) setOv(await ovRes.json())
    if (mapRes.ok) {
      const geo = await mapRes.json()
      setMapData(geo.countries ?? [])
      setStateData(geo.states   ?? [])
      setCityData(geo.cities    ?? [])
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([fetchFanStats(), fetchOverview()])
      setLastUpdated(new Date())
      if (onRefreshDone) onRefreshDone()
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFanStats()
    fetchOverview()
    // Auto-refresh every 60s
    const id = setInterval(refresh, 60000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const smsRate = stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0

  return (
    <>
      {/* Welcome greeting */}
      <div className="ov-greeting">
        <div>
          <div className="ov-greeting-title">Dashboard Overview</div>
          <div className="ov-greeting-sub">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {lastUpdated && (
              <span className="ov-last-updated"> · Updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            )}
          </div>
        </div>
        <button
          className="ov-refresh-btn"
          onClick={refresh}
          disabled={refreshing}
          title="Refresh dashboard"
        >
          <span className={refreshing ? 'ov-refresh-spinning' : ''} style={{ display: 'inline-block' }}>↻</span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Top grid - chart + key stats side by side */}
      <div className="ov-top-grid">

        {/* Chart card */}
        <div className="ov-chart-card">
          <div className="ov-chart-header">
            <div className="ov-chart-title">Fan Growth</div>
            <div className="ov-chart-sub">Last 30 days</div>
          </div>
          <GrowthChart data={signupChart} />
          <div className="ov-chart-stats">
            <div className="ov-chart-stat">
              <span className="ov-chart-stat-val" style={stats.today > 0 ? { color: '#4caf50' } : {}}>+{stats.today}</span>
              <span className="ov-chart-stat-label">Today</span>
            </div>
            <div className="ov-chart-stat">
              <span className="ov-chart-stat-val">+{stats.thisWeek}</span>
              <span className="ov-chart-stat-label">This week</span>
            </div>
            <div className="ov-chart-stat">
              <span className="ov-chart-stat-val">+{stats.thisMonth}</span>
              <span className="ov-chart-stat-label">This month</span>
            </div>
          </div>
        </div>

        {/* Right stat stack */}
        <div className="ov-stat-stack">
          <div className="ov-big-stat">
            <div className="ov-big-stat-label">Total Fans</div>
            <div className="ov-big-stat-value">{stats.total.toLocaleString()}</div>
            <div className="ov-big-stat-bar">
              <div className="ov-big-stat-bar-fill" style={{ width: `${Math.min(100, (stats.total / 10000) * 100)}%` }} />
            </div>
            <div className="ov-big-stat-hint">Goal: 10,000</div>
          </div>
          <div className="ov-mini-stats">
            <div className="ov-mini-stat">
              <span className="ov-mini-val">{stats.withPhone}</span>
              <span className="ov-mini-label">SMS · {smsRate}%</span>
            </div>
            <div className="ov-mini-stat">
              <span className="ov-mini-val">{engagement.totalPointsAwarded.toLocaleString()}</span>
              <span className="ov-mini-label">Points</span>
            </div>
            <div className="ov-mini-stat">
              <span className="ov-mini-val">{engagement.missionCount}</span>
              <span className="ov-mini-label">Missions</span>
            </div>
          </div>
        </div>

      </div>

      {/* Section tiles */}
      <SectionLabel>Platform</SectionLabel>
      <div className="ov-mirror-grid">
        <MirrorCard icon="↗" label="Smart Links" tabId="Links" setTab={setTab} color="#7C3AED" lines={[
          { value: ov?.links.count ?? '-',  desc: 'links' },
          { value: ov?.links.views ?? '-',  desc: 'views' },
          { value: ov?.links.clicks ?? '-', desc: 'clicks' },
        ]} />
        <MirrorCard icon="✉" label="Campaigns" tabId="Campaigns" setTab={setTab} color="#C4222E" lines={[
          { value: ov?.campaigns.sent ?? '-',       desc: 'sent' },
          { value: ov?.campaigns.recipients ?? '-', desc: 'recipients' },
        ]} />
        <MirrorCard icon="$" label="Revenue" tabId="Spend" setTab={setTab} color="#4CAF50" lines={[
          { value: ov ? `$${ov.spending.revenue.toFixed(2)}` : '-', desc: 'total', color: '#4caf50' },
          { value: ov?.spending.purchases ?? '-', desc: 'purchases' },
        ]} />
        <MirrorCard icon="♫" label="Playlists" tabId="Playlists" setTab={setTab} color="#1DB954" lines={[
          { value: ov?.playlists.active ?? '-', desc: 'active' },
          { value: ov?.playlists.total  ?? '-', desc: 'tracked' },
        ]} />
        <MirrorCard icon="★" label="Engagement" tabId="Engagement" setTab={setTab} color="#F59E0B" lines={[
          { value: engagement.totalPointsAwarded.toLocaleString(), desc: 'points' },
          { value: engagement.missionCount, desc: 'missions' },
        ]} />
      </div>

      {/* Recent signups */}
      <SectionLabel>Recent Signups</SectionLabel>
      <div className="adm2-card">
        {recentFans.length === 0 ? (
          <div className="adm2-empty">No fans yet.</div>
        ) : recentFans.map((fan, i) => {
          const location = fan.city && fan.region
            ? `${fan.city}, ${fan.region}`
            : fan.city || fan.region || fan.country || null
          const initial  = (fan.email || '?')[0].toUpperCase()
          const hue      = (fan.email.charCodeAt(0) * 37 + fan.email.charCodeAt(1) * 17) % 360
          return (
            <div key={fan.id} className="adm2-row adm2-row-fan">
              <div className="adm2-fan-avatar" style={{ background: `hsl(${hue},40%,22%)`, color: `hsl(${hue},60%,65%)` }}>
                {initial}
              </div>
              <div className="adm2-fan-info">
                <span className="adm2-fan-email">{fan.email}</span>
                {fan.username && <span className="adm2-fan-handle">@{fan.username}</span>}
              </div>
              <div className="adm2-row-meta">
                {fan.phone && <span className="adm-sms-badge">SMS</span>}
                {location && <span className="adm2-row-location">📍 {location}</span>}
                <span className="adm2-row-time">{timeAgo(fan.created_at)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <>
          <SectionLabel>🎂 Upcoming Birthdays</SectionLabel>
          <div className="adm2-card">
            {upcomingBirthdays.map((fan, i) => {
              const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
              const dateStr = `${MONTHS[fan.month - 1]} ${fan.day}`
              const handle  = fan.username ? `@${fan.username}` : fan.email
              return (
                <div key={i} className="adm2-row">
                  <span className="adm2-row-num">{fan.isToday ? '🎂' : '🎈'}</span>
                  <span className="adm2-row-main">{handle}</span>
                  <div className="adm2-row-meta">
                    <span className="adm2-row-location">{dateStr}</span>
                    <span className="adm2-row-time">
                      {fan.isToday ? 'Today!' : `in ${fan.daysUntil} day${fan.daysUntil !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Fan World Map */}
      <SectionLabel>Fans Around the World</SectionLabel>
      <div className="adm2-card ov-map-card">
        {mapData.length === 0 ? (
          <div className="adm2-empty">
            Fan locations will appear here as fans sign in.
          </div>
        ) : (
          <>
            <Suspense fallback={<div className="adm2-empty">Loading map…</div>}>
              <FanMap countries={mapData} />
            </Suspense>
            <div className="ov-map-legend">
              {mapData
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map(c => (
                  <div key={c.country_code} className="ov-map-legend-item">
                    <span className="ov-map-dot" />
                    <span className="ov-map-country">{c.country}</span>
                    <span className="ov-map-count">{c.count}</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* State + City breakdown */}
      {(stateData.length > 0 || cityData.length > 0) && (
        <div className="ov-geo-grid">
          {stateData.length > 0 && (
            <div className="adm2-card">
              <div className="ov-geo-header">🇺🇸 US States</div>
              {stateData.slice(0, 10).map(({ state, count }) => (
                <div key={state} className="adm2-row">
                  <span className="adm2-row-main">{state}</span>
                  <span className="adm2-row-pts">{count} fan{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
          {cityData.length > 0 && (
            <div className="adm2-card">
              <div className="ov-geo-header">📍 Top Cities</div>
              {cityData.slice(0, 10).map(({ city, count }) => (
                <div key={city} className="adm2-row">
                  <span className="adm2-row-main">{city}</span>
                  <span className="adm2-row-pts">{count} fan{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function PlatformTab() {
  const [youtube,  setYoutube]  = useState(null)
  const [discord,  setDiscord]  = useState(null)
  const [spotify,  setSpotify]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  const fetchMetrics = async () => {
    setLoading(true); setError(null)
    try {
      const [ytRes, dcRes, spRes] = await Promise.all([
        fetch('/api/metrics/youtube'),
        fetch('/api/metrics/discord'),
        fetch('/api/metrics/spotify'),
      ])
      if (ytRes.ok) setYoutube(await ytRes.json())
      if (dcRes.ok) setDiscord(await dcRes.json())
      if (spRes.ok) setSpotify(await spRes.json())
      setUpdatedAt(new Date())
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMetrics() }, [])

  if (loading) return <div className="adm-loading">Loading platform data...</div>
  if (error)   return <div className="adm-error">{error} <button onClick={fetchMetrics}>Retry</button></div>

  // Popularity bar color
  const popColor = spotify?.popularity >= 60 ? '#1DB954'
    : spotify?.popularity >= 35 ? '#f59e0b'
    : '#6b7280'

  return (
    <div>
      <div className="adm-platform-refresh">
        <button className="adm-refresh-btn" onClick={fetchMetrics}>↻ Refresh</button>
        {updatedAt && <span className="adm-refresh-time">Updated {updatedAt.toLocaleTimeString()}</span>}
      </div>

      {/* ── Spotify ── */}
      {spotify && (
        <>
          <SectionLabel>🎵 Spotify</SectionLabel>
          <div className="adm-platform-grid" style={{ marginBottom: 0 }}>
            <div className="adm-platform-card">
              <div className="adm-platform-source">Spotify</div>
              <div className="adm-platform-metric">{spotify.followers?.toLocaleString()}</div>
              <div className="adm-platform-label">Followers</div>
            </div>
            <div className="adm-platform-card">
              <div className="adm-platform-source">Spotify</div>
              <div className="adm-platform-metric" style={{ color: popColor }}>
                {spotify.popularity}<span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 2 }}>/100</span>
              </div>
              <div className="adm-platform-label">Popularity Score</div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: 'var(--border)' }}>
                <div style={{ width: `${spotify.popularity}%`, height: '100%', borderRadius: 2, background: popColor, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          </div>
          {spotify.topTracks?.length > 0 && (
            <div className="adm2-card" style={{ marginTop: 16 }}>
              <div className="ov-geo-header">🏆 Top Tracks (US)</div>
              {spotify.topTracks.map((track, i) => (
                <div key={track.id} className="adm2-row">
                  <span className="adm2-row-num">{i + 1}</span>
                  <span className="adm2-row-main">{track.name}</span>
                  <div className="adm2-row-meta">
                    <span className="adm2-row-location" style={{ fontSize: 11 }}>{track.album}</span>
                    <span className="adm2-row-pts" style={{ color: popColor }}>
                      {track.popularity}<span style={{ color: 'var(--muted)', fontSize: 10 }}>/100</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── YouTube ── */}
      {youtube && (
        <>
          <SectionLabel style={{ marginTop: 28 }}>📺 YouTube</SectionLabel>
          <div className="adm-platform-grid">
            <div className="adm-platform-card">
              <div className="adm-platform-source">YouTube</div>
              <div className="adm-platform-metric">{youtube.subscribers?.toLocaleString()}</div>
              <div className="adm-platform-label">Subscribers</div>
            </div>
            <div className="adm-platform-card">
              <div className="adm-platform-source">YouTube</div>
              <div className="adm-platform-metric">{youtube.views?.toLocaleString()}</div>
              <div className="adm-platform-label">Total Views</div>
            </div>
            <div className="adm-platform-card">
              <div className="adm-platform-source">YouTube</div>
              <div className="adm-platform-metric">{youtube.videos?.toLocaleString()}</div>
              <div className="adm-platform-label">Videos Published</div>
            </div>
          </div>
        </>
      )}

      {/* ── Discord ── */}
      {discord && (
        <>
          <SectionLabel>💬 Discord</SectionLabel>
          <div className="adm-platform-grid">
            <div className="adm-platform-card">
              <div className="adm-platform-source">Discord</div>
              <div className="adm-platform-metric">{discord.members?.toLocaleString()}</div>
              <div className="adm-platform-label">Members · {discord.name}</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AdminDashboardInner({
  fans, stats, signupChart, engagement,
  tierCounts, top5, topActions,
  recentFans, recentPosts, tiers
}) {
  const [tab,        setTab]        = useState('Overview')
  const [search,     setSearch]     = useState('')
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [fansList,   setFansList]   = useState(fans)
  const [addingFan,  setAddingFan]  = useState(false)
  const [newFan,     setNewFan]     = useState({ email: '', display_name: '', phone: '' })
  const [addingErr,  setAddingErr]  = useState(null)
  const [addingSaving, setAddingSaving] = useState(false)
  const [clock,      setClock]      = useState('')
  const [activeAdmins, setActiveAdmins] = useState([])
  const router = useRouter()

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const [refreshKey, setRefreshKey] = useState(0)
  const bumpRefresh = () => setRefreshKey(k => k + 1)

  // Presence - ping every 30s, fetch active admins every 30s
  useEffect(() => {
    const ping = async () => {
      await fetch('/api/admin/presence', { method: 'POST' })
      const res = await fetch('/api/admin/presence')
      const data = await res.json()
      setActiveAdmins(data.active ?? [])
    }
    ping()
    const id = setInterval(ping, 30000)
    return () => clearInterval(id)
  }, [])

  const handleAddFan = async () => {
    if (!newFan.email.trim()) { setAddingErr('Email is required'); return }
    setAddingSaving(true); setAddingErr(null)
    const res  = await fetch('/api/admin/fans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFan),
    })
    const data = await res.json()
    setAddingSaving(false)
    if (!res.ok) { setAddingErr(data.error); return }
    setFansList(f => [data.fan, ...f])
    setAddingFan(false)
    setNewFan({ email: '', display_name: '', phone: '' })
  }

  const filtered = fansList.filter(f =>
    f.email?.toLowerCase().includes(search.toLowerCase()) ||
    f.phone?.includes(search)
  )

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleNav = (id) => { setTab(id); setMenuOpen(false) }

  const currentNav = NAV.find(n => n.id === tab)

  return (
    <div className="adm2-shell">

      {/* ── Sidebar (desktop) ── */}
      <aside className={`adm2-sidebar${menuOpen ? ' adm2-sidebar-open' : ''}`}>
        <div className="adm2-sidebar-top">
          <div className="adm2-logo">
            <span className="adm2-logo-dot" />
            <span className="adm2-logo-text">Algee Smith</span>
          </div>
          <div className="adm2-sidebar-label">
            <span className="adm2-live-dot" /> Live
          </div>
        </div>

        <nav className="adm2-nav">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="adm2-nav-group">
              <div className="adm2-nav-group-label">{group.label}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`adm2-nav-item${tab === item.id ? ' adm2-nav-active' : ''}`}
                  onClick={() => handleNav(item.id)}
                >
                  <span className="adm2-nav-icon">{item.icon}</span>
                  <span className="adm2-nav-label">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Active admins */}
        {activeAdmins.length > 0 && (
          <div className="adm2-presence">
            <div className="adm2-presence-label">Online now</div>
            {activeAdmins.map(a => (
              <div key={a.email} className="adm2-presence-row">
                <span className="adm2-presence-dot" />
                <span className="adm2-presence-email">{a.email.split('@')[0]}</span>
              </div>
            ))}
          </div>
        )}

        <div className="adm2-sidebar-bottom">
          <a href="/account/dashboard" className="adm2-fan-view-btn">
            <span className="adm2-fan-view-icon">👁</span>
            Fan View
          </a>
          <a href="/" className="adm2-sidebar-link">← Back to site</a>
          <button
            className="adm2-sidebar-link adm2-signout"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {menuOpen && <div className="adm2-overlay" onClick={() => setMenuOpen(false)} />}

      {/* ── Main content ── */}
      <main className="adm2-main">

        {/* Page header */}
        <div className="adm2-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="adm2-hamburger" onClick={() => setMenuOpen(m => !m)}>
              <span /><span /><span />
            </button>
            <div className="adm2-page-title">
              {currentNav?.icon} {currentNav?.label ?? tab}
            </div>
          </div>
          <div className="adm2-topbar-right">
            <a href="/account/dashboard" className="adm2-topbar-fanview">
              <span>👁</span> Fan View
            </a>
            <button
              className="adm2-refresh-btn"
              onClick={bumpRefresh}
              title="Refresh data"
            >
              ↻
            </button>
            <span className="adm2-topbar-clock">{clock}</span>
            <span className="adm2-topbar-date">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="adm2-content">

          {/* ── OVERVIEW ── */}
          {tab === 'Overview' && (
            <OverviewTab
              key={refreshKey}
              initialStats={stats}
              initialSignupChart={signupChart}
              initialRecentFans={recentFans}
              engagement={engagement}
              setTab={setTab}
              onRefreshDone={bumpRefresh}
            />
          )}

          {/* ── ENGAGEMENT ── */}
          {tab === 'Engagement' && (
            <>
              <div className="adm2-stats-grid">
                <StatCard label="Points Awarded"   value={engagement.totalPointsAwarded.toLocaleString()} />
                <StatCard label="Missions Done"    value={engagement.missionCount} />
                <StatCard label="Fans on Missions" value={engagement.uniqueMissionFans} />
                <StatCard label="Fan Wall Posts"   value={engagement.wallTotal} />
              </div>

              <SectionLabel>Tier Breakdown</SectionLabel>
              <div className="adm2-card">
                {tiers.map(tier => {
                  const count = tierCounts[tier.name] ?? 0
                  const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                  return (
                    <div key={tier.name} className="adm-tier-row">
                      <div className="adm-tier-name" style={{ color: tier.color }}>{tier.icon} {tier.name}</div>
                      <div className="adm-tier-bar-wrap">
                        <div className="adm-tier-bar-track">
                          <div className="adm-tier-bar-fill" style={{ width: `${pct}%`, background: tier.color }} />
                        </div>
                      </div>
                      <div className="adm-tier-count">{count} fans</div>
                      <div className="adm-tier-pct">{pct}%</div>
                    </div>
                  )
                })}
              </div>

              <SectionLabel>Top 5 Fans by Points</SectionLabel>
              <div className="adm2-card">
                {top5.length === 0 ? (
                  <div className="adm2-empty">No points data yet.</div>
                ) : top5.map((fan, i) => (
                  <div key={i} className="adm2-row">
                    <span className="adm2-row-num">#{i + 1}</span>
                    <span className="adm2-row-main">{fan.email}</span>
                    <span className="adm2-row-tag" style={{ color: fan.tier.color }}>{fan.tier.name}</span>
                    <span className="adm2-row-pts">{fan.points.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>

              <SectionLabel>Points by Action</SectionLabel>
              <div className="adm2-card">
                {topActions.length === 0 ? (
                  <div className="adm2-empty">No activity yet.</div>
                ) : topActions.map(({ action, points }) => (
                  <div key={action} className="adm2-row">
                    <span className="adm2-row-main">{action}</span>
                    <span className="adm2-row-pts">{points.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>

              <SectionLabel>Recent Fan Wall Posts</SectionLabel>
              <div className="adm2-card">
                {recentPosts.length === 0 ? (
                  <div className="adm2-empty">No posts yet.</div>
                ) : recentPosts.map(post => (
                  <div key={post.id} className="adm-wall-row">
                    <div className="adm-wall-msg">"{post.message}"</div>
                    <div className="adm-wall-meta">
                      <span>{post.display_name || 'Anonymous'}</span>
                      {post.city && <span> · {post.city}</span>}
                      <span className="adm-wall-time"> · {timeAgo(post.created_at)}</span>
                      {!post.approved && <span className="adm-wall-unapproved"> · Pending</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── FANS ── */}
          {tab === 'Fans' && (
            <>
              <div className="adm2-search-row">
                <input
                  className="adm2-search"
                  type="text"
                  placeholder="Search by email or phone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <span className="adm2-count">{filtered.length} of {fansList.length} fans</span>
                <button className="adm2-btn-add" onClick={() => { setAddingFan(f => !f); setAddingErr(null) }}>
                  {addingFan ? 'Cancel' : '+ Add Fan'}
                </button>
              </div>

              {addingFan && (
                <div className="adm2-add-fan-form">
                  <div className="adm2-add-fan-title">Add Fan Manually</div>
                  <div className="adm2-add-fan-fields">
                    <input
                      className="adm2-search"
                      type="email"
                      placeholder="Email address *"
                      value={newFan.email}
                      onChange={e => setNewFan(f => ({ ...f, email: e.target.value }))}
                    />
                    <input
                      className="adm2-search"
                      type="text"
                      placeholder="Display name (optional)"
                      value={newFan.display_name}
                      onChange={e => setNewFan(f => ({ ...f, display_name: e.target.value }))}
                    />
                    <input
                      className="adm2-search"
                      type="tel"
                      placeholder="Phone (optional)"
                      value={newFan.phone}
                      onChange={e => setNewFan(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  {addingErr && <div className="lm-error" style={{ marginTop: 8 }}>{addingErr}</div>}
                  <div className="adm2-add-fan-actions">
                    <button className="lm-btn-cancel" onClick={() => setAddingFan(false)}>Cancel</button>
                    <button className="lm-btn-save" onClick={handleAddFan} disabled={addingSaving}>
                      {addingSaving ? 'Adding...' : 'Add Fan'}
                    </button>
                  </div>
                </div>
              )}
              <div className="adm2-card adm2-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr><th>#</th><th>Email</th><th>Location</th><th>SMS</th><th>Birthday</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="adm2-empty">{fansList.length === 0 ? 'No fans yet.' : 'No results.'}</td></tr>
                    ) : filtered.map((fan) => {
                      const loc = fan.city && fan.region
                        ? `${fan.city}, ${fan.region}`
                        : fan.city || fan.region || fan.country || '—'
                      const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                      const bday = fan.birthday_month && fan.birthday_day
                        ? `${MONTHS[fan.birthday_month - 1]} ${fan.birthday_day}`
                        : '—'
                      return (
                        <tr key={fan.id}>
                          <td className="adm-td-num">{fansList.indexOf(fan) + 1}</td>
                          <td className="adm-td-email">{fan.email}</td>
                          <td className="adm-td-phone">{loc}</td>
                          <td>{fan.phone ? <span className="adm-badge sms-yes">Yes</span> : <span className="adm-badge sms-no">No</span>}</td>
                          <td className="adm-td-date">{bday}</td>
                          <td className="adm-td-date">{new Date(fan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="adm2-footer-note">Export → Supabase → Table Editor → profiles → Export CSV</div>
            </>
          )}

          {/* ── OTHER TABS ── */}
          {tab === 'Spend'     && <SpendingManager />}
          {tab === 'Platform'  && <PlatformTab />}
          {tab === 'Playlists' && <PlaylistTracker />}
          {tab === 'Links'     && (
            <>
              <LinksManager />
              <div style={{ marginTop: 32 }}>
                <LinkAnalytics />
              </div>
            </>
          )}
          {tab === 'Announce'  && <AnnouncementManager />}
          {tab === 'Campaigns' && <CampaignManager />}
          {tab === 'Push'      && <PushManager />}
          {tab === 'Missions'   && <MissionsViewer />}
          {tab === 'Releases'   && <ReleasesManager />}
          {tab === 'FanOfMonth' && <FanOfMonthManager />}
          {tab === 'Exclusive' && <ExclusiveContentManager />}

        </div>
      </main>
    </div>
  )
}

export default function AdminDashboard(props) {
  return (
    <AdminErrorBoundary>
      <AdminDashboardInner {...props} />
    </AdminErrorBoundary>
  )
}
