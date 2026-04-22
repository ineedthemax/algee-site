'use client'

import { useState, useEffect } from 'react'
import LinksManager from './LinksManager'
import PlaylistTracker from './PlaylistTracker'
import LinkAnalytics from './LinkAnalytics'

const TABS = ['Overview', 'Engagement', 'Playlists', 'Platform', 'Links', 'Fans']

function StatCard({ label, value, sub, color }) {
  return (
    <div className="adm-stat-card">
      <div className="adm-stat-value" style={color ? { color } : {}}>{value}</div>
      <div className="adm-stat-label">{label}</div>
      {sub && <div className="adm-stat-sub">{sub}</div>}
    </div>
  )
}

function SectionLabel({ children }) {
  return <div className="adm-section-label">{children}</div>
}

// Mini sparkline bar chart
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="adm-chart">
      {data.map((d, i) => (
        <div key={i} className="adm-chart-col">
          <div
            className="adm-chart-bar"
            style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
            title={`${d.date}: ${d.count} signups`}
          />
        </div>
      ))}
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

// ── Platform metrics (YouTube + Discord) ─────────────────────────────────────
function PlatformTab() {
  const [youtube, setYoutube] = useState(null)
  const [discord, setDiscord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const [ytRes, dcRes] = await Promise.all([
        fetch('/api/metrics/youtube'),
        fetch('/api/metrics/discord'),
      ])
      if (ytRes.ok) setYoutube(await ytRes.json())
      if (dcRes.ok) setDiscord(await dcRes.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
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
        {youtube && (
          <>
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
          </>
        )}
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

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminDashboard({
  fans, stats, signupChart, engagement,
  tierCounts, top5, topActions,
  recentFans, recentPosts, tiers
}) {
  const [tab,    setTab]    = useState('Overview')
  const [search, setSearch] = useState('')

  const filtered = fans.filter(f =>
    f.email?.toLowerCase().includes(search.toLowerCase()) ||
    f.phone?.includes(search)
  )

  const smsRate = stats.total > 0
    ? Math.round((stats.withPhone / stats.total) * 100)
    : 0

  return (
    <div className="adm-page">
      <div className="adm-inner">

        {/* Header */}
        <div className="adm-header">
          <div>
            <div className="adm-eyebrow">Admin</div>
            <h1 className="adm-headline">Dashboard</h1>
          </div>
          <a href="/" className="adm-back">← Back to site</a>
        </div>

        {/* Tabs */}
        <div className="adm-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`adm-tab${tab === t ? ' adm-tab-active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'Overview' && (
          <div className="adm-tab-content">
            {/* Top stats */}
            <div className="adm-stats-row">
              <StatCard label="Total Fans"    value={stats.total}    />
              <StatCard label="Today"         value={stats.today}    color={stats.today > 0 ? '#4caf50' : undefined} />
              <StatCard label="This Week"     value={stats.thisWeek} />
              <StatCard label="This Month"    value={stats.thisMonth}/>
              <StatCard label="SMS Opted In"  value={stats.withPhone} sub={`${smsRate}% rate`} />
              <StatCard label="Points Awarded" value={engagement.totalPointsAwarded.toLocaleString()} />
            </div>

            {/* Signup chart */}
            <SectionLabel>Fan Signups — Last 30 Days</SectionLabel>
            <div className="adm-card">
              <BarChart data={signupChart} />
              <div className="adm-chart-footer">
                <span>{signupChart[0]?.date}</span>
                <span>Today</span>
              </div>
            </div>

            {/* Recent signups */}
            <SectionLabel>Recent Signups</SectionLabel>
            <div className="adm-card adm-recent-list">
              {recentFans.length === 0 ? (
                <div className="adm-empty">No fans yet.</div>
              ) : recentFans.map((fan, i) => (
                <div key={fan.id} className="adm-recent-row">
                  <div className="adm-recent-num">{i + 1}</div>
                  <div className="adm-recent-email">{fan.email}</div>
                  <div className="adm-recent-meta">
                    {fan.phone && <span className="adm-sms-badge">SMS</span>}
                    <span className="adm-recent-time">{timeAgo(fan.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Link analytics inline */}
            <SectionLabel>Link Analytics</SectionLabel>
            <LinkAnalytics />
          </div>
        )}

        {/* ── ENGAGEMENT TAB ── */}
        {tab === 'Engagement' && (
          <div className="adm-tab-content">
            {/* Engagement stats */}
            <div className="adm-stats-row">
              <StatCard label="Total Points Awarded" value={engagement.totalPointsAwarded.toLocaleString()} />
              <StatCard label="Missions Completed"   value={engagement.missionCount} />
              <StatCard label="Fans on Missions"      value={engagement.uniqueMissionFans} />
              <StatCard label="Fan Wall Posts"        value={engagement.wallTotal} />
            </div>

            {/* Tier breakdown */}
            <SectionLabel>Fan Tier Breakdown</SectionLabel>
            <div className="adm-card">
              <div className="adm-tier-rows">
                {tiers.map(tier => {
                  const count = tierCounts[tier.name] ?? 0
                  const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                  return (
                    <div key={tier.name} className="adm-tier-row">
                      <div className="adm-tier-name" style={{ color: tier.color }}>
                        {tier.icon} {tier.name}
                      </div>
                      <div className="adm-tier-bar-wrap">
                        <div className="adm-tier-bar-track">
                          <div
                            className="adm-tier-bar-fill"
                            style={{ width: `${pct}%`, background: tier.color }}
                          />
                        </div>
                      </div>
                      <div className="adm-tier-count">{count} fans</div>
                      <div className="adm-tier-pct">{pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top fans */}
            <SectionLabel>Top 5 Fans by Points</SectionLabel>
            <div className="adm-card adm-top-fans">
              {top5.length === 0 ? (
                <div className="adm-empty">No points data yet.</div>
              ) : top5.map((fan, i) => (
                <div key={i} className="adm-top-fan-row">
                  <div className="adm-top-rank">#{i + 1}</div>
                  <div className="adm-top-email">{fan.email}</div>
                  <div className="adm-top-tier" style={{ color: fan.tier.color }}>{fan.tier.name}</div>
                  <div className="adm-top-pts">{fan.points.toLocaleString()} pts</div>
                </div>
              ))}
            </div>

            {/* Points by action */}
            <SectionLabel>Points by Action</SectionLabel>
            <div className="adm-card">
              <div className="adm-action-rows">
                {topActions.length === 0 ? (
                  <div className="adm-empty">No activity yet.</div>
                ) : topActions.map(({ action, points }) => (
                  <div key={action} className="adm-action-row">
                    <div className="adm-action-name">{action}</div>
                    <div className="adm-action-pts">{points.toLocaleString()} pts</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent fan wall posts */}
            <SectionLabel>Recent Fan Wall Posts</SectionLabel>
            <div className="adm-card">
              {recentPosts.length === 0 ? (
                <div className="adm-empty">No posts yet.</div>
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
          </div>
        )}

        {/* ── PLATFORM TAB ── */}
        {tab === 'Platform' && (
          <div className="adm-tab-content">
            <PlatformTab />
          </div>
        )}

        {/* ── PLAYLISTS TAB ── */}
        {tab === 'Playlists' && (
          <div className="adm-tab-content">
            <PlaylistTracker />
          </div>
        )}

        {/* ── LINKS TAB ── */}
        {tab === 'Links' && (
          <div className="adm-tab-content">
            <LinksManager />
          </div>

        )}

        {/* ── FANS TAB ── */}
        {tab === 'Fans' && (
          <div className="adm-tab-content">
            <div className="adm-search-wrap">
              <input
                className="adm-search"
                type="text"
                placeholder="Search by email or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="adm-count">{filtered.length} of {fans.length} fans</span>
            </div>

            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>SMS</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="adm-empty">{fans.length === 0 ? 'No fans yet.' : 'No results.'}</td></tr>
                  ) : filtered.map((fan, i) => (
                    <tr key={fan.id}>
                      <td className="adm-td-num">{fans.indexOf(fan) + 1}</td>
                      <td className="adm-td-email">{fan.email}</td>
                      <td className="adm-td-phone">{fan.phone || <span className="adm-none">—</span>}</td>
                      <td>
                        {fan.phone
                          ? <span className="adm-badge sms-yes">Yes</span>
                          : <span className="adm-badge sms-no">No</span>}
                      </td>
                      <td className="adm-td-date">
                        {new Date(fan.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="adm-footer-note">
              Export → Supabase → Table Editor → profiles → Export CSV
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
