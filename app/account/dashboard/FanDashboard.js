'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

const QUICK_LINKS = [
  { label: 'Music',      href: '/music',       desc: 'Love Lost — streaming now'     },
  { label: 'Fan Wall',   href: '/fan-wall',    desc: 'Leave your mark'               },
  { label: 'Playlists',  href: '/playlists',   desc: 'Where Algee is landing'        },
  { label: 'Missions',   href: '/missions',    desc: 'Complete challenges, earn pts' },
]

const ANNOUNCE_COLORS = {
  info:  '#3b82f6',
  music: '#c4222e',
  tour:  '#e8a020',
  merch: '#9b59b6',
}
const ANNOUNCE_ICONS = { info: '📢', music: '🎵', tour: '🎤', merch: '👕' }

const TIER_ORDER = ['Free', 'Day One', 'Rider', 'Legend']
const TIER_COLORS = { 'Day One': '#c4222e', 'Rider': '#e8a020', 'Legend': '#9b59b6', 'Free': '#888' }

// ── Exclusive content card ──────────────────────────────────────────────────
function ExclusiveCard({ item }) {
  const [open, setOpen] = useState(false)
  const color = TIER_COLORS[item.min_tier] ?? '#888'

  if (!item.unlocked) {
    return (
      <div className="exc-card exc-card-locked">
        <div className="exc-lock-icon">🔒</div>
        <div className="exc-card-body">
          <div className="exc-card-title">{item.title}</div>
          {item.description && <div className="exc-card-desc">{item.description}</div>}
          <div className="exc-card-tier" style={{ color }}>
            Requires {item.min_tier}+ tier
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="exc-card exc-card-unlocked">
      <div className="exc-card-body">
        <div className="exc-card-title">{item.title}</div>
        {item.description && <div className="exc-card-desc">{item.description}</div>}
        <div className="exc-card-tier" style={{ color }}>
          {item.min_tier}+ · {item.type}
        </div>
        {!open && (
          <button className="exc-reveal-btn" onClick={() => setOpen(true)}>
            Reveal →
          </button>
        )}
        {open && (
          <div className="exc-content">
            {item.type === 'text' && (
              <div className="exc-content-text">{item.content_body}</div>
            )}
            {(item.type === 'link') && item.content_url && (
              <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="exc-content-link">
                Open link →
              </a>
            )}
            {item.type === 'audio' && item.content_url && (
              <audio controls src={item.content_url} className="exc-content-audio" />
            )}
            {item.type === 'video' && item.content_url && (
              <video controls src={item.content_url} className="exc-content-video" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function FanDashboard({
  user, points = 0, tier, nextTier,
  announcements = [], exclusive = [],
  purchases = [], isBirthday = false
}) {
  const [signingOut, setSigningOut] = useState(false)
  const [dismissed,  setDismissed]  = useState([])
  const router = useRouter()

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = user.email.split('@')[0]
  const joinedDate  = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  })

  const progressPct = nextTier
    ? Math.min(100, Math.round(((points - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100

  const pointsToNext = nextTier ? nextTier.min - points : 0

  const visibleAnnouncements = announcements.filter(a => !dismissed.includes(a.id))

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">

        {/* ── Birthday Banner ── */}
        {isBirthday && (
          <div className="birthday-banner">
            <span className="birthday-banner-emoji">🎂</span>
            <div>
              <div className="birthday-banner-title">Happy Birthday, {displayName}!</div>
              <div className="birthday-banner-sub">Algee and the whole fam are thinking about you today. 🔴</div>
            </div>
          </div>
        )}

        {/* ── Announcements ── */}
        {visibleAnnouncements.length > 0 && (
          <div className="announce-stack">
            {visibleAnnouncements.map(a => (
              <div
                key={a.id}
                className="announce-banner"
                style={{ borderLeftColor: ANNOUNCE_COLORS[a.type] ?? '#3b82f6' }}
              >
                <div className="announce-banner-left">
                  <span className="announce-icon">{ANNOUNCE_ICONS[a.type] ?? '📢'}</span>
                  <div>
                    <div className="announce-title">{a.title}</div>
                    <div className="announce-body">{a.body}</div>
                  </div>
                </div>
                <button
                  className="announce-dismiss"
                  onClick={() => setDismissed(d => [...d, a.id])}
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Fan ID Card ── */}
        <div className="fan-id-card" style={{ '--tier-color': tier?.color ?? '#888' }}>
          {/* Scorpion watermark */}
          <div className="fan-id-watermark" aria-hidden="true">✦</div>

          {/* Top row */}
          <div className="fan-id-top">
            <div className="fan-id-eyebrow">Algee Smith · Fan Club</div>
            <button
              className="dashboard-signout"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? '...' : 'Sign Out'}
            </button>
          </div>

          {/* Emblem + identity */}
          <div className="fan-id-body">
            <div className="fan-id-emblem">
              <div className="fan-id-emblem-icon">{tier?.icon ?? '◻'}</div>
            </div>
            <div className="fan-id-identity">
              <div className="fan-id-name">{displayName}</div>
              <div className="fan-id-email">{user.email}</div>
              <div className="fan-id-since">Member since {joinedDate}</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="fan-id-stats">
            <div className="fan-id-stat">
              <span className="fan-id-stat-val">{points.toLocaleString()}</span>
              <span className="fan-id-stat-label">Points</span>
            </div>
            <div className="fan-id-divider" />
            <div className="fan-id-stat">
              <span className="fan-id-stat-val" style={{ color: tier?.color }}>{tier?.name ?? 'Free'}</span>
              <span className="fan-id-stat-label">Tier</span>
            </div>
            <div className="fan-id-divider" />
            <div className="fan-id-stat">
              <span className="fan-id-stat-val">{progressPct}%</span>
              <span className="fan-id-stat-label">To Next</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="fan-id-bar-track">
            <div className="fan-id-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          {nextTier ? (
            <div className="fan-id-bar-hint">
              {pointsToNext} pts to <span style={{ color: nextTier.color }}>{nextTier.name}</span>
            </div>
          ) : (
            <div className="fan-id-bar-hint" style={{ color: tier?.color }}>Legend status. Max tier reached.</div>
          )}
        </div>

        {/* How to earn points */}
        <div className="dashboard-card points-earn-card">
          <div className="points-earn-label">How to earn points</div>
          <div className="points-earn-grid">
            <div className="points-earn-item"><span className="points-earn-pts">+100</span> Join the fan club</div>
            <div className="points-earn-item"><span className="points-earn-pts">+50</span> Buy merch or music</div>
            <div className="points-earn-item"><span className="points-earn-pts">+20</span> Share content</div>
            <div className="points-earn-item"><span className="points-earn-pts">+10</span> Stream music</div>
          </div>
        </div>

        {/* Quick links */}
        <div className="dashboard-section-label">Explore</div>
        <div className="dashboard-links-grid">
          {QUICK_LINKS.map(({ label, href, desc }) => (
            <Link key={href} href={href} className="dashboard-link-card">
              <div className="dashboard-link-label">{label}</div>
              <div className="dashboard-link-desc">{desc}</div>
              <span className="dashboard-link-arrow">→</span>
            </Link>
          ))}
        </div>

        {/* ── Spending History ── */}
        {purchases.length > 0 && (
          <>
            <div className="dashboard-section-label" style={{ marginTop: 32 }}>Your Purchases</div>
            <div className="dashboard-card" style={{ padding: '4px 0' }}>
              {purchases.map(p => (
                <div key={p.id} className="spend-row">
                  <div className="spend-row-left">
                    <div className="spend-item">{p.item_name}</div>
                    {p.notes && <div className="spend-notes">{p.notes}</div>}
                  </div>
                  <div className="spend-row-right">
                    <div className="spend-amount">${Number(p.amount).toFixed(2)}</div>
                    <div className="spend-date">{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
              ))}
              <div className="spend-total-row">
                <span className="spend-total-label">Total Spent</span>
                <span className="spend-total-val">${purchases.reduce((s, p) => s + Number(p.amount), 0).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {/* ── Exclusive Content ── */}
        {exclusive.length > 0 && (
          <>
            <div className="dashboard-section-label" style={{ marginTop: 32 }}>
              Exclusive Content
            </div>
            <div className="exc-grid">
              {exclusive.map(item => (
                <ExclusiveCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}

        {/* Coming soon — only show if no exclusive content yet */}
        {exclusive.length === 0 && (
          <div className="dashboard-card coming-card">
            <div className="coming-card-icon">✦</div>
            <div className="coming-card-text">
              <div className="coming-card-title">More coming for fans.</div>
              <div className="coming-card-sub">
                Leaderboard, exclusive content, early access to drops, and direct messages from Algee — all coming soon.
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="dashboard-bg-text" aria-hidden="true">FAN</div>
    </div>
  )
}
