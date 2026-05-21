'use client'

import { useState, useEffect, Component, lazy, Suspense } from 'react'
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

const NAV = [
  { id: 'Overview',    icon: '⊞', label: 'Overview'    },
  { id: 'Engagement',  icon: '★', label: 'Engagement'  },
  { id: 'Fans',        icon: '◎', label: 'Fans'        },
  { id: 'Spend',       icon: '$', label: 'Spending'    },
  { id: 'Links',       icon: '↗', label: 'Smart Links' },
  { id: 'Announce',    icon: '📢', label: 'Announce'   },
  { id: 'Campaigns',   icon: '✉',  label: 'Campaigns'  },
  { id: 'Push',        icon: '🔔', label: 'Push'       },
  { id: 'Exclusive',   icon: '🔒', label: 'Exclusive'  },
  { id: 'Playlists',   icon: '♫', label: 'Playlists'  },
  { id: 'Releases',    icon: '◈', label: 'Releases'     },
  { id: 'FanOfMonth',  icon: '👑', label: 'Fan of Month' },
  { id: 'Platform',    icon: '◈', label: 'Platform'   },
]

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

function BarChart({ data }) {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t) }, [])
  const max   = Math.max(...data.map(d => d.count), 1)
  const W     = 600
  const H     = 120
  const pad   = 12
  const pts   = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - pad - (d.count / max) * (H - pad * 2)
    return { x, y, ...d }
  })
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`

  return (
    <div className="adm-linechart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="adm-linechart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(196,34,46,0.3)" />
            <stop offset="100%" stopColor="rgba(196,34,46,0)" />
          </linearGradient>
        </defs>
        {ready && <>
          <path d={areaD} fill="url(#lineGrad)" />
          <path d={pathD} fill="none" stroke="#C4222E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => p.count > 0 && (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#C4222E">
              <title>{p.date}: {p.count} signups</title>
            </circle>
          ))}
        </>}
      </svg>
      <div className="adm-chart-footer">
        <span>{data[0]?.date}</span>
        <span>Today</span>
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
function MirrorCard({ icon, label, tabId, lines, setTab }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      className={`ov-mirror${hovered ? ' ov-mirror-hovered' : ''}`}
      onClick={() => setTab(tabId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="ov-mirror-head">
        <span className="ov-mirror-icon">{icon}</span>
        <span className="ov-mirror-label">{label}</span>
        <span className="ov-mirror-arrow">{hovered ? '↗' : '→'}</span>
      </div>
      <div className="ov-mirror-body">
        {lines.map((line, i) => (
          <div key={i} className="ov-mirror-line">
            <span className="ov-mirror-val" style={line.color ? { color: line.color } : {}}>{line.value}</span>
            <span className="ov-mirror-desc">{line.desc}</span>
          </div>
        ))}
      </div>
    </button>
  )
}

function OverviewTab({ stats, smsRate, engagement, signupChart, recentFans, setTab }) {
  const [ov, setOv]             = useState(null)
  const [mapData, setMapData]   = useState([])

  useEffect(() => {
    fetch('/api/admin/overview').then(r => r.json()).then(setOv).catch(() => {})
    fetch('/api/admin/fan-map').then(r => r.json()).then(d => setMapData(d.countries ?? [])).catch(() => {})
  }, [])

  return (
    <>
      {/* Welcome greeting */}
      <div className="ov-greeting">
        <div className="ov-greeting-title">Dashboard Overview</div>
        <div className="ov-greeting-sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Top grid - chart + key stats side by side */}
      <div className="ov-top-grid">

        {/* Chart card */}
        <div className="ov-chart-card">
          <div className="ov-chart-header">
            <div className="ov-chart-title">Fan Growth</div>
            <div className="ov-chart-sub">Last 30 days</div>
          </div>
          <BarChart data={signupChart} />
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
        <MirrorCard icon="↗" label="Smart Links" tabId="Links" setTab={setTab} lines={[
          { value: ov?.links.count ?? '-',  desc: 'links' },
          { value: ov?.links.views ?? '-',  desc: 'views' },
          { value: ov?.links.clicks ?? '-', desc: 'clicks' },
        ]} />
        <MirrorCard icon="✉" label="Campaigns" tabId="Campaigns" setTab={setTab} lines={[
          { value: ov?.campaigns.sent ?? '-',       desc: 'sent' },
          { value: ov?.campaigns.recipients ?? '-', desc: 'recipients' },
        ]} />
        <MirrorCard icon="$" label="Revenue" tabId="Spend" setTab={setTab} lines={[
          { value: ov ? `$${ov.spending.revenue.toFixed(2)}` : '-', desc: 'total', color: '#4caf50' },
          { value: ov?.spending.purchases ?? '-', desc: 'purchases' },
        ]} />
        <MirrorCard icon="♫" label="Playlists" tabId="Playlists" setTab={setTab} lines={[
          { value: ov?.playlists.active ?? '-', desc: 'active' },
          { value: ov?.playlists.total  ?? '-', desc: 'tracked' },
        ]} />
        <MirrorCard icon="★" label="Engagement" tabId="Engagement" setTab={setTab} lines={[
          { value: engagement.totalPointsAwarded.toLocaleString(), desc: 'points' },
          { value: engagement.missionCount, desc: 'missions' },
        ]} />
      </div>

      {/* Recent signups */}
      <SectionLabel>Recent Signups</SectionLabel>
      <div className="adm2-card">
        {recentFans.length === 0 ? (
          <div className="adm2-empty">No fans yet.</div>
        ) : recentFans.map((fan, i) => (
          <div key={fan.id} className="adm2-row">
            <span className="adm2-row-num">{i + 1}</span>
            <span className="adm2-row-main">{fan.email}</span>
            <div className="adm2-row-meta">
              {fan.phone && <span className="adm-sms-badge">SMS</span>}
              <span className="adm2-row-time">{timeAgo(fan.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

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
    </>
  )
}

function PlatformTab() {
  const [youtube, setYoutube] = useState(null)
  const [discord, setDiscord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchMetrics = async () => {
    setLoading(true); setError(null)
    try {
      const [ytRes, dcRes] = await Promise.all([
        fetch('/api/metrics/youtube'),
        fetch('/api/metrics/discord'),
      ])
      if (ytRes.ok) setYoutube(await ytRes.json())
      if (dcRes.ok) setDiscord(await dcRes.json())
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMetrics() }, [])

  if (loading) return <div className="adm-loading">Loading platform data...</div>
  if (error)   return <div className="adm-error">{error} <button onClick={fetchMetrics}>Retry</button></div>

  return (
    <div>
      <div className="adm-platform-refresh">
        <button className="adm-refresh-btn" onClick={fetchMetrics}>↻ Refresh</button>
        <span className="adm-refresh-time">Updated {new Date().toLocaleTimeString()}</span>
      </div>
      <div className="adm-platform-grid">
        {youtube && (<>
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
        </>)}
        {discord && (
          <div className="adm-platform-card">
            <div className="adm-platform-source">Discord</div>
            <div className="adm-platform-metric">{discord.members?.toLocaleString()}</div>
            <div className="adm-platform-label">Members · {discord.name}</div>
          </div>
        )}
      </div>
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

  const smsRate = stats.total > 0
    ? Math.round((stats.withPhone / stats.total) * 100) : 0

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
          {NAV.map(item => (
            <button
              key={item.id}
              className={`adm2-nav-item${tab === item.id ? ' adm2-nav-active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="adm2-nav-icon">{item.icon}</span>
              <span className="adm2-nav-label">{item.label}</span>
            </button>
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
              stats={stats}
              smsRate={smsRate}
              engagement={engagement}
              signupChart={signupChart}
              recentFans={recentFans}
              setTab={setTab}
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
                    <tr><th>#</th><th>Email</th><th>Phone</th><th>SMS</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="adm2-empty">{fansList.length === 0 ? 'No fans yet.' : 'No results.'}</td></tr>
                    ) : filtered.map((fan, i) => (
                      <tr key={fan.id}>
                        <td className="adm-td-num">{fansList.indexOf(fan) + 1}</td>
                        <td className="adm-td-email">{fan.email}</td>
                        <td className="adm-td-phone">{fan.phone || <span className="adm-none">-</span>}</td>
                        <td>{fan.phone ? <span className="adm-badge sms-yes">Yes</span> : <span className="adm-badge sms-no">No</span>}</td>
                        <td className="adm-td-date">{new Date(fan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      </tr>
                    ))}
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
