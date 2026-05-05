'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

const QUICK_LINKS = [
  { label: 'Music',      href: '/music',       icon: '♫', desc: 'Love Lost — streaming now'     },
  { label: 'Fan Wall',   href: '/fan-wall',    icon: '◎', desc: 'Leave your mark'               },
  { label: 'Missions',   href: '/missions',    icon: '★', desc: 'Earn points & rewards'         },
  { label: 'Merch',      href: '/merch',       icon: '◈', desc: 'Official store'                },
]

const EARN_ACTIONS = [
  { pts: '+100', label: 'Join the fan club' },
  { pts: '+50',  label: 'Buy merch or music' },
  { pts: '+20',  label: 'Share content'      },
  { pts: '+10',  label: 'Stream music'       },
]

const ANNOUNCE_COLORS = {
  info:  '#3b82f6',
  music: '#c4222e',
  tour:  '#e8a020',
  merch: '#9b59b6',
}
const ANNOUNCE_ICONS = { info: '📢', music: '🎵', tour: '🎤', merch: '👕' }
const TIER_COLORS    = { 'Day One': '#c4222e', 'Rider': '#e8a020', 'Legend': '#9b59b6', 'Free': '#888' }

/* ── Exclusive content card ─────────────────────────────────── */
function ExclusiveCard({ item }) {
  const [open, setOpen] = useState(false)
  const color = TIER_COLORS[item.min_tier] ?? '#888'

  if (!item.unlocked) {
    return (
      <div className="fd-exc-card fd-exc-locked">
        <div className="fd-exc-lock">🔒</div>
        <div className="fd-exc-title">{item.title}</div>
        {item.description && <div className="fd-exc-desc">{item.description}</div>}
        <div className="fd-exc-tier" style={{ color }}>Requires {item.min_tier}+</div>
      </div>
    )
  }

  return (
    <div className="fd-exc-card fd-exc-unlocked">
      <div className="fd-exc-badge" style={{ background: color }}>Unlocked</div>
      <div className="fd-exc-title">{item.title}</div>
      {item.description && <div className="fd-exc-desc">{item.description}</div>}
      <div className="fd-exc-type-label">{item.min_tier}+ · {item.type}</div>
      {!open ? (
        <button className="fd-exc-reveal" onClick={() => setOpen(true)}>Reveal →</button>
      ) : (
        <div className="fd-exc-content">
          {item.type === 'text'  && <div className="fd-exc-text">{item.content_body}</div>}
          {item.type === 'link'  && item.content_url && (
            <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="fd-exc-link">Open →</a>
          )}
          {item.type === 'audio' && item.content_url && (
            <audio controls src={item.content_url} className="fd-exc-audio" />
          )}
          {item.type === 'video' && item.content_url && (
            <video controls src={item.content_url} className="fd-exc-video" />
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main dashboard ─────────────────────────────────────────── */
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

  const displayName    = user.user_metadata?.full_name || user.email.split('@')[0]
  const joinedDate     = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const tierColor      = tier?.color ?? '#888'
  const progressPct    = nextTier
    ? Math.min(100, Math.round(((points - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100
  const pointsToNext   = nextTier ? nextTier.min - points : 0
  const visibleAnnouncements = announcements.filter(a => !dismissed.includes(a.id))

  return (
    <div className="fd-page">

      {/* ── Top bar ── */}
      <div className="fd-topbar">
        <div className="fd-topbar-left">
          <span className="fd-topbar-label">Fan Dashboard</span>
          <span className="fd-topbar-name">Hey, {displayName} 👋</span>
        </div>
        <div className="fd-topbar-right">
          <Link href="/" className="fd-topbar-link">← Back to site</Link>
          <button className="fd-signout" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? '...' : 'Sign Out'}
          </button>
        </div>
      </div>

      <div className="fd-content">

        {/* ── Birthday banner ── */}
        {isBirthday && (
          <div className="fd-birthday">
            <span>🎂</span>
            <div>
              <div className="fd-birthday-title">Happy Birthday, {displayName}!</div>
              <div className="fd-birthday-sub">Algee and the whole fam are thinking about you today. 🔴</div>
            </div>
          </div>
        )}

        {/* ── Announcements ── */}
        {visibleAnnouncements.length > 0 && (
          <div className="fd-announce-stack">
            {visibleAnnouncements.map(a => (
              <div key={a.id} className="fd-announce" style={{ '--ac': ANNOUNCE_COLORS[a.type] ?? '#3b82f6' }}>
                <span className="fd-announce-icon">{ANNOUNCE_ICONS[a.type] ?? '📢'}</span>
                <div className="fd-announce-body">
                  <div className="fd-announce-title">{a.title}</div>
                  <div className="fd-announce-text">{a.body}</div>
                </div>
                <button className="fd-announce-dismiss" onClick={() => setDismissed(d => [...d, a.id])}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* ── Bento grid ── */}
        <div className="fd-bento">

          {/* Identity card — tall left */}
          <div className="fd-card fd-card-identity" style={{ '--tc': tierColor }}>
            <div className="fd-identity-glow" aria-hidden="true" />
            <div className="fd-identity-eyebrow">Algee Smith Fan Club</div>
            <div className="fd-identity-emblem">{tier?.icon ?? '◻'}</div>
            <div className="fd-identity-name">{displayName}</div>
            <div className="fd-identity-email">{user.email}</div>
            <div className="fd-identity-tier" style={{ color: tierColor }}>{tier?.name ?? 'Free'}</div>
            <div className="fd-identity-since">Member since {joinedDate}</div>
            <Link href="/tiers" className="fd-identity-upgrade">View all tiers →</Link>
          </div>

          {/* Points card */}
          <div className="fd-card fd-card-points">
            <div className="fd-card-label">Total Points</div>
            <div className="fd-card-big-num">{points.toLocaleString()}</div>
            <div className="fd-card-sub">Lifetime earned</div>
          </div>

          {/* Tier card */}
          <div className="fd-card fd-card-tier" style={{ '--tc': tierColor }}>
            <div className="fd-card-label">Current Tier</div>
            <div className="fd-card-big-num" style={{ color: tierColor }}>{tier?.name ?? 'Free'}</div>
            <div className="fd-card-sub">{tier?.icon} {tier?.description ?? 'Keep earning'}</div>
          </div>

          {/* Progress card — full width */}
          <div className="fd-card fd-card-progress" style={{ '--tc': tierColor }}>
            <div className="fd-progress-top">
              <div>
                <div className="fd-card-label">Progress to {nextTier?.name ?? 'Max'}</div>
                <div className="fd-progress-pct">{progressPct}%</div>
              </div>
              {nextTier ? (
                <div className="fd-progress-hint">
                  <span className="fd-progress-pts">{pointsToNext.toLocaleString()}</span>
                  <span className="fd-progress-hint-label">pts to go</span>
                </div>
              ) : (
                <div className="fd-progress-hint">
                  <span className="fd-progress-pts" style={{ color: tierColor }}>MAX</span>
                  <span className="fd-progress-hint-label">tier reached</span>
                </div>
              )}
            </div>
            <div className="fd-progress-track">
              <div className="fd-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            {nextTier && (
              <div className="fd-progress-labels">
                <span>{tier?.name}</span>
                <span style={{ color: nextTier?.color ?? tierColor }}>{nextTier.name}</span>
              </div>
            )}
          </div>

          {/* Earn card */}
          <div className="fd-card fd-card-earn">
            <div className="fd-card-label">How to Earn Points</div>
            <div className="fd-earn-list">
              {EARN_ACTIONS.map(a => (
                <div key={a.label} className="fd-earn-row">
                  <span className="fd-earn-pts">{a.pts}</span>
                  <span className="fd-earn-label">{a.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Quick links ── */}
        <div className="fd-section-label">Explore</div>
        <div className="fd-links-grid">
          {QUICK_LINKS.map(({ label, href, icon, desc }) => (
            <Link key={href} href={href} className="fd-link-card">
              <div className="fd-link-icon">{icon}</div>
              <div className="fd-link-label">{label}</div>
              <div className="fd-link-desc">{desc}</div>
              <div className="fd-link-arrow">→</div>
            </Link>
          ))}
        </div>

        {/* ── Purchases ── */}
        {purchases.length > 0 && (
          <>
            <div className="fd-section-label">Purchase History</div>
            <div className="fd-card fd-card-purchases">
              {purchases.map((p, i) => (
                <div key={p.id} className={`fd-purchase-row${i < purchases.length - 1 ? ' fd-purchase-row-border' : ''}`}>
                  <div>
                    <div className="fd-purchase-item">{p.item_name}</div>
                    {p.notes && <div className="fd-purchase-notes">{p.notes}</div>}
                    <div className="fd-purchase-date">
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="fd-purchase-amount">${Number(p.amount).toFixed(2)}</div>
                </div>
              ))}
              <div className="fd-purchase-total">
                <span>Total Spent</span>
                <span>${purchases.reduce((s, p) => s + Number(p.amount), 0).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {/* ── Exclusive content ── */}
        {exclusive.length > 0 && (
          <>
            <div className="fd-section-label">Exclusive Content</div>
            <div className="fd-exc-grid">
              {exclusive.map(item => <ExclusiveCard key={item.id} item={item} />)}
            </div>
          </>
        )}

        {exclusive.length === 0 && (
          <div className="fd-card fd-card-coming">
            <div className="fd-coming-icon">✦</div>
            <div className="fd-coming-title">More coming for fans.</div>
            <div className="fd-coming-sub">
              Exclusive content, early drops, leaderboard, and direct messages from Algee — all coming soon.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
