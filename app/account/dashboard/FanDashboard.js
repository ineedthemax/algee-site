'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

/* ── Tier config ─────────────────────────────────────────────── */
const TIER_COLORS = { 'Day One': '#c4222e', 'Rider': '#e8a020', 'Legend': '#9b59b6', 'Free': '#666' }

// What fans unlock at each tier — used in the upgrade preview
const TIER_PREVIEWS = [
  { tier: 'Day One', color: '#c4222e', icon: '✦', perks: ['Early access notifications', 'Exclusive content previews', 'Day One badge on leaderboard'] },
  { tier: 'Rider',   color: '#e8a020', icon: '◈', perks: ['Behind-the-scenes content', 'Priority merch drop access', 'Rider badge on leaderboard'] },
  { tier: 'Legend',  color: '#9b59b6', icon: '★', perks: ['Exclusive downloads & extras', 'Direct community access', 'Permanent Legend status'] },
]

const ANNOUNCE_COLORS = { info: '#3b82f6', music: '#c4222e', tour: '#e8a020', merch: '#9b59b6' }
const ANNOUNCE_ICONS  = { info: '📢', music: '🎵', tour: '🎤', merch: '👕' }

/* ── Earn action rows — clickable ────────────────────────────── */
const EARN_ACTIONS = [
  { pts: '+100', label: 'Join the fan club',   href: '/tiers',    done: true  },
  { pts: '+50',  label: 'Buy merch or music',  href: '/merch',    done: false },
  { pts: '+20',  label: 'Share with a friend', href: null,        done: false, share: true },
  { pts: '+10',  label: 'Stream the album',    href: '/music',    done: false },
]

/* ── Exclusive content card ──────────────────────────────────── */
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

/* ── Tier upgrade preview (locked cards) ─────────────────────── */
function TierPreview({ currentTierName }) {
  const lockedTiers = TIER_PREVIEWS.filter(t => {
    const order = ['Free', 'Day One', 'Rider', 'Legend']
    return order.indexOf(t.tier) > order.indexOf(currentTierName)
  })
  if (!lockedTiers.length) return null

  return (
    <div className="fd-tier-preview-grid">
      {lockedTiers.map(t => (
        <div key={t.tier} className="fd-tier-preview-card" style={{ '--tc': t.color }}>
          <div className="fd-tier-preview-lock">🔒</div>
          <div className="fd-tier-preview-icon" style={{ color: t.color }}>{t.icon}</div>
          <div className="fd-tier-preview-name" style={{ color: t.color }}>{t.tier}</div>
          <ul className="fd-tier-preview-perks">
            {t.perks.map(p => <li key={p}>{p}</li>)}
          </ul>
          <Link href="/tiers" className="fd-tier-preview-cta" style={{ borderColor: t.color, color: t.color }}>
            How to unlock →
          </Link>
        </div>
      ))}
    </div>
  )
}

/* ── Main dashboard ──────────────────────────────────────────── */
export default function FanDashboard({
  user, points = 0, tier, nextTier,
  announcements = [], exclusive = [],
  purchases = [], isBirthday = false,
  isAdminUser = false,
  rank = null, totalFans = 0,
}) {
  const [signingOut, setSigningOut] = useState(false)
  const [dismissed,  setDismissed]  = useState([])
  const [copied,     setCopied]     = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleShare = async () => {
    const text = `I'm a ${tier?.name ?? 'fan'} of Algee Smith. Join the fan club →`
    const url  = 'https://thealgeesmith.com/account'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Algee Smith Fan Club', text, url })
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {}
  }

  const displayName  = user.user_metadata?.full_name || user.email.split('@')[0]
  const joinedDate   = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const tierColor    = tier?.color ?? '#666'
  const progressPct  = nextTier
    ? Math.min(100, Math.round(((points - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100
  const pointsToNext = nextTier ? nextTier.min - points : 0
  const visibleAnnouncements = announcements.filter(a => !dismissed.includes(a.id))

  return (
    <div className="fd-page">

      {/* ── Admin preview bar ── */}
      {isAdminUser && (
        <div className="fd-admin-bar">
          <span className="fd-admin-bar-badge">👁 Admin Preview</span>
          <span className="fd-admin-bar-label">You&apos;re viewing the fan experience</span>
          <a href="/admin" className="fd-admin-bar-back">← Back to Admin</a>
        </div>
      )}

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

        {/* ── Latest drop hero ── */}
        <div className="fd-drop-hero">
          <div className="fd-drop-hero-img">
            <Image
              src="https://img.youtube.com/vi/TjOHVPo5iwM/maxresdefault.jpg"
              alt="Spiraling"
              fill
              sizes="600px"
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
            />
            <div className="fd-drop-hero-overlay" />
          </div>
          <div className="fd-drop-hero-content">
            <div className="fd-drop-hero-eyebrow">Latest Drop</div>
            <div className="fd-drop-hero-title">Spiraling</div>
            <div className="fd-drop-hero-sub">Official Visual · Out Now</div>
            <div className="fd-drop-hero-actions">
              <a
                href="https://www.youtube.com/watch?v=TjOHVPo5iwM"
                target="_blank"
                rel="noopener noreferrer"
                className="fd-drop-hero-btn"
              >
                ▶ Watch Now
              </a>
              <Link href="/music" className="fd-drop-hero-ghost">Stream →</Link>
            </div>
          </div>
        </div>

        {/* ── Bento grid ── */}
        <div className="fd-bento">

          {/* Identity card */}
          <div className="fd-card fd-card-identity" style={{ '--tc': tierColor }}>
            <div className="fd-identity-photo">
              <Image
                src="/images/hero/algee-hero.webp"
                alt=""
                fill
                sizes="160px"
                style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
                aria-hidden="true"
              />
              <div className="fd-identity-photo-overlay" />
            </div>
            <div className="fd-identity-glow" aria-hidden="true" />
            <div className="fd-identity-eyebrow">Algee Smith Fan Club</div>
            <div className="fd-identity-emblem" style={{ color: tierColor, borderColor: `${tierColor}40` }}>
              {tier?.icon ?? '◈'}
            </div>
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

          {/* Rank card */}
          <div className="fd-card fd-card-rank">
            <div className="fd-card-label">Fan Rank</div>
            <div className="fd-card-big-num" style={{ color: tierColor }}>
              {rank ? `#${rank.toLocaleString()}` : '—'}
            </div>
            <div className="fd-card-sub">
              {totalFans > 0 ? `of ${totalFans.toLocaleString()} fans` : 'Keep earning to rank up'}
            </div>
            <Link href="/leaderboard" className="fd-rank-link">See leaderboard →</Link>
          </div>

          {/* Progress card */}
          <div className="fd-card fd-card-progress" style={{ '--tc': tierColor }}>
            <div className="fd-progress-top">
              <div>
                <div className="fd-card-label">Progress to {nextTier?.name ?? 'Max Tier'}</div>
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

          {/* Earn actions — clickable */}
          <div className="fd-card fd-card-earn">
            <div className="fd-card-label">Earn Points</div>
            <div className="fd-earn-list">
              {EARN_ACTIONS.map(a => {
                if (a.share) {
                  return (
                    <button key={a.label} className="fd-earn-row fd-earn-row-btn" onClick={handleShare}>
                      <span className="fd-earn-pts">{a.pts}</span>
                      <span className="fd-earn-label">{a.label}</span>
                      <span className="fd-earn-cta">{copied ? '✓ Copied!' : 'Share →'}</span>
                    </button>
                  )
                }
                if (a.done) {
                  return (
                    <div key={a.label} className="fd-earn-row fd-earn-row-done">
                      <span className="fd-earn-pts fd-earn-pts-done">✓</span>
                      <span className="fd-earn-label">{a.label}</span>
                      <span className="fd-earn-cta fd-earn-cta-done">Done</span>
                    </div>
                  )
                }
                return (
                  <Link key={a.label} href={a.href} className="fd-earn-row fd-earn-row-link">
                    <span className="fd-earn-pts">{a.pts}</span>
                    <span className="fd-earn-label">{a.label}</span>
                    <span className="fd-earn-cta">Go →</span>
                  </Link>
                )
              })}
            </div>
          </div>

        </div>

        {/* ── Explore ── */}
        <div className="fd-section-label">Explore</div>
        <div className="fd-links-grid">

          <a
            href="https://open.spotify.com/artist/1GdbNDHVJMggEpbWCIAulO"
            target="_blank"
            rel="noopener noreferrer"
            className="fd-link-card fd-link-card-music"
          >
            <div className="fd-link-album-art">
              <Image
                src="https://img.youtube.com/vi/TjOHVPo5iwM/mqdefault.jpg"
                alt="Love Lost"
                fill
                sizes="200px"
                style={{ objectFit: 'cover' }}
              />
              <div className="fd-link-album-overlay" />
            </div>
            <div className="fd-link-content">
              <div className="fd-link-icon">♫</div>
              <div className="fd-link-label">Music</div>
              <div className="fd-link-desc">Love Lost — streaming now</div>
            </div>
            <div className="fd-link-arrow">→</div>
          </a>

          <Link href="/fan-wall" className="fd-link-card">
            <div className="fd-link-icon">◎</div>
            <div className="fd-link-label">Fan Wall</div>
            <div className="fd-link-desc">Leave your mark for Algee</div>
            <div className="fd-link-arrow">→</div>
          </Link>

          <Link href="/missions" className="fd-link-card fd-link-card-missions">
            <div className="fd-link-icon">★</div>
            <div className="fd-link-label">Missions</div>
            <div className="fd-link-desc">Earn points & unlock rewards</div>
            <div className="fd-link-pts-badge">+pts</div>
            <div className="fd-link-arrow">→</div>
          </Link>

          <Link href="/merch" className="fd-link-card">
            <div className="fd-link-icon">◈</div>
            <div className="fd-link-label">Merch</div>
            <div className="fd-link-desc">Official store</div>
            <div className="fd-link-arrow">→</div>
          </Link>

        </div>

        {/* ── Exclusive content ── */}
        {exclusive.length > 0 && (
          <>
            <div className="fd-section-label">Exclusive Content</div>
            <div className="fd-exc-grid">
              {exclusive.map(item => <ExclusiveCard key={item.id} item={item} />)}
            </div>
          </>
        )}

        {/* ── Tier upgrade preview ── */}
        {tier?.name !== 'Legend' && (
          <>
            <div className="fd-section-label">
              {exclusive.length > 0 ? 'More to Unlock' : 'Unlock with Higher Tiers'}
            </div>
            <TierPreview currentTierName={tier?.name ?? 'Free'} />
            <div className="fd-upgrade-cta-wrap">
              <Link href="/tiers" className="fd-upgrade-cta-btn">
                See how to level up →
              </Link>
            </div>
          </>
        )}

        {/* ── Purchase history ── */}
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

      </div>
    </div>
  )
}
