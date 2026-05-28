'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardTour from './DashboardTour'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

/* ── Tier config ─────────────────────────────────────────────── */
const TIER_COLORS = { 'Day One': '#c4222e', 'Rider': '#e8a020', 'Legend': '#9b59b6', 'Free': '#666' }

// What fans unlock at each tier - used in the upgrade preview
const TIER_PREVIEWS = [
  { tier: 'Day One', color: '#c4222e', icon: '✦', perks: ['Early access notifications', 'Exclusive content previews', 'Day One badge on leaderboard'] },
  { tier: 'Rider',   color: '#e8a020', icon: '◈', perks: ['Behind-the-scenes content', 'Priority merch drop access', 'Rider badge on leaderboard'] },
  { tier: 'Legend',  color: '#9b59b6', icon: '★', perks: ['Exclusive downloads & extras', 'Direct community access', 'Permanent Legend status'] },
]

const ANNOUNCE_COLORS = { info: '#3b82f6', music: '#c4222e', tour: '#e8a020', merch: '#9b59b6' }
const ANNOUNCE_ICONS  = { info: '📢', music: '🎵', tour: '🎤', merch: '👕' }

/* ── Coming Soon items ───────────────────────────────────────── */
const COMING_SOON = [
  {
    id:       'cs-music',
    category: 'Music',
    icon:     '♫',
    hint:     'Something new is on the way.',
    sub:      'Notifications-only first look - turn them on in Missions.',
    color:    '#c4222e',
    redacted: '█████ █████',
  },
  {
    id:       'cs-film',
    category: 'Film',
    icon:     '◎',
    hint:     'A new project is in the works.',
    sub:      'Day One members get details first. Stay locked in.',
    color:    '#e8a020',
    redacted: '████ ███████ ████',
  },
  {
    id:       'cs-merch',
    category: 'Merch',
    icon:     '◈',
    hint:     'Limited run dropping soon.',
    sub:      'Fan members get early access before the public.',
    color:    '#9b59b6',
    redacted: '██████ ████',
  },
]

function ComingSoonSection() {
  return (
    <div className="fd-cs-section">
      <div className="fd-cs-header">
        <div className="fd-section-label" style={{ margin: 0 }}>What&apos;s Next</div>
        <div className="fd-cs-pulse-wrap">
          <span className="fd-cs-pulse" />
          <span className="fd-cs-pulse-label">Dropping Soon</span>
        </div>
      </div>
      <div className="fd-cs-grid">
        {COMING_SOON.map((item, i) => (
          <div
            key={item.id}
            className="fd-cs-card"
            style={{ '--cc': item.color, '--ci': i }}
          >
            {/* Top row */}
            <div className="fd-cs-card-top">
              <div className="fd-cs-cat" style={{ color: item.color }}>
                <span className="fd-cs-cat-icon">{item.icon}</span>
                {item.category}
              </div>
              <div className="fd-cs-soon-badge">SOON</div>
            </div>

            {/* Redacted title */}
            <div className="fd-cs-redacted">{item.redacted}</div>

            {/* Hint text */}
            <div className="fd-cs-hint">{item.hint}</div>
            <div className="fd-cs-sub">{item.sub}</div>

            {/* Bottom glow line */}
            <div className="fd-cs-glow-line" style={{ background: item.color }} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Earn action rows - clickable ────────────────────────────── */
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

/* ── Welcome overlay - new fan aha moment ─────────────────────── */
const FAN_TYPES = [
  { id: 'music', icon: '♫', label: 'Music Fan',  sub: 'Here for the sound'   },
  { id: 'film',  icon: '◎', label: 'Film Fan',   sub: 'Here for the stories' },
  { id: 'both',  icon: '★', label: 'Both',       sub: 'All of it'            },
]

const FREE_UNLOCKS = [
  'Fan account & profile',
  'Full music catalog access',
  'Film & video access',
  'Fan leaderboard & missions',
  'First to see announcements',
]

function WelcomeOverlay({ displayName, signupPoints, onDone }) {
  const [step,    setStep]    = useState(1)   // 1 = welcome+question, 2 = unlocked
  const [fanType, setFanType] = useState(null)
  const [counted, setCounted] = useState(0)

  // Animate points counter on mount
  useEffect(() => {
    if (step !== 1) return
    let start = null
    const duration = 1200
    const target   = signupPoints
    const tick = (ts) => {
      if (!start) start = ts
      const pct = Math.min((ts - start) / duration, 1)
      setCounted(Math.round(pct * target))
      if (pct < 1) requestAnimationFrame(tick)
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [step, signupPoints])

  const handleNext = () => {
    if (fanType) {
      try { localStorage.setItem('algee_fan_type', fanType) } catch {}
    }
    setStep(2)
  }

  return (
    <div className="wl-overlay">
      <div className="wl-inner">

        {step === 1 && (
          <div className="wl-step wl-step-enter">
            {/* Brand */}
            <div className="wl-brand">
              <span className="wl-brand-dot" />
              Algee Smith
            </div>

            {/* Hero */}
            <h1 className="wl-headline">
              You&rsquo;re<br />
              <span className="wl-headline-em">in.</span>
            </h1>

            <p className="wl-sub">
              Welcome to the world, <strong>{displayName}</strong>.
            </p>

            {/* Points reveal */}
            <div className="wl-points-reveal">
              <div className="wl-points-num">+{counted}</div>
              <div className="wl-points-label">points just dropped into your account</div>
            </div>

            <div className="wl-divider" />

            {/* Personalization */}
            <div className="wl-question">
              <div className="wl-question-label">What brings you here?</div>
              <div className="wl-fan-types">
                {FAN_TYPES.map(ft => (
                  <button
                    key={ft.id}
                    className={`wl-fan-type${fanType === ft.id ? ' wl-fan-type-active' : ''}`}
                    onClick={() => setFanType(ft.id)}
                  >
                    <span className="wl-fan-type-icon">{ft.icon}</span>
                    <span className="wl-fan-type-name">{ft.label}</span>
                    <span className="wl-fan-type-sub">{ft.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="wl-btn"
              onClick={handleNext}
              disabled={!fanType}
            >
              See what you unlocked →
            </button>

            {!fanType && (
              <p className="wl-skip" onClick={handleNext}>Skip</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="wl-step wl-step-unlocked">
            <div className="wl-brand">
              <span className="wl-brand-dot" />
              Algee Smith
            </div>

            <div className="wl-unlocked-badge">✦ Unlocked</div>

            <h2 className="wl-unlocked-headline">
              Here&rsquo;s what<br />you just got.
            </h2>

            <ul className="wl-unlocks-list">
              {FREE_UNLOCKS.map((item, i) => (
                <li key={i} className="wl-unlock-item" style={{ animationDelay: `${i * 90}ms` }}>
                  <span className="wl-unlock-check">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="wl-divider" />

            <p className="wl-unlocked-hint">
              Earn more points to unlock <strong>Day One</strong>, <strong>Rider</strong>, and <strong>Legend</strong> tier perks - early drops, exclusives, merch access, and more.
            </p>

            <button className="wl-btn" onClick={onDone}>
              Enter the World →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

/* ── Avatar upload ───────────────────────────────────────────── */
function AvatarUpload({ userId, currentUrl, displayName, tierColor }) {
  const [url,       setUrl]       = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState(null)
  const inputRef = useRef(null)

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Max 5MB'); return }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const ext  = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (upErr) throw upErr

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`

      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      setUrl(publicUrl)
    } catch (err) {
      setError('Upload failed. Try again.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fd-avatar-wrap">
      <button
        className="fd-avatar-btn"
        onClick={() => inputRef.current?.click()}
        title="Change profile photo"
        disabled={uploading}
        style={{ '--tc': tierColor }}
      >
        {url ? (
          <img src={url} alt={displayName} className="fd-avatar-img" />
        ) : (
          <span className="fd-avatar-initials">{initials}</span>
        )}
        <div className="fd-avatar-overlay">
          <span className="fd-avatar-camera">{uploading ? '…' : '📷'}</span>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      {error && <div className="fd-avatar-error">{error}</div>}
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
  isNew = false,
}) {
  const [signingOut,    setSigningOut]    = useState(false)
  const [dismissed,     setDismissed]     = useState([])
  const [copied,        setCopied]        = useState(false)
  const [showWelcome,   setShowWelcome]   = useState(isNew)
  const [tourKey,       setTourKey]       = useState(0)
  const [displayPoints, setDisplayPoints] = useState(0)
  const router = useRouter()

  // Animate points counter on mount
  useEffect(() => {
    let start = null
    const duration = 1200
    const target = points
    const tick = (ts) => {
      if (!start) start = ts
      const pct = Math.min((ts - start) / duration, 1)
      setDisplayPoints(Math.round(pct * target))
      if (pct < 1) requestAnimationFrame(tick)
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [points])

  const restartTour = useCallback(() => {
    try { localStorage.removeItem('algee_tour_done') } catch {}
    setTourKey(k => k + 1)
  }, [])

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

      {/* ── Dashboard tour ── */}
      <DashboardTour key={tourKey} isNew={showWelcome} />

      {/* ── Welcome overlay (new fans only) ── */}
      {showWelcome && (
        <WelcomeOverlay
          displayName={displayName}
          signupPoints={100}
          onDone={() => {
            setShowWelcome(false)
            // Clean the URL param without a reload
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, '', '/account/dashboard')
            }
          }}
        />
      )}

      {/* ── Admin preview bar ── */}
      {isAdminUser && (
        <div className="fd-admin-bar">
          <span className="fd-admin-bar-badge">👁 Admin Preview</span>
          <span className="fd-admin-bar-label">You&apos;re viewing the fan experience</span>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="fd-topbar">
        <div className="fd-topbar-right" style={{ marginLeft: 'auto' }}>
          <button className="fd-tour-btn" onClick={restartTour} title="Take the dashboard tour">?</button>
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

        {/* ── Algee photo banner ── */}
        <div className="fd-algee-banner">
          <Image
            src="/images/hero/algee-hero.webp"
            alt="Algee Smith"
            fill
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
            aria-hidden="true"
          />
          <div className="fd-algee-banner-overlay" />
        </div>

        {/* ── Bento grid ── */}
        <div className="fd-bento fd-bento-animate">

          {/* Identity card */}
          <div className="fd-card fd-card-identity fd-card-animate" style={{ '--tc': tierColor, '--i': 0 }}>
            <div className="fd-identity-glow" aria-hidden="true" />
            <div className="fd-identity-eyebrow">Algee Smith Fan Club</div>

            {/* Profile photo */}
            <AvatarUpload
              userId={user.id}
              currentUrl={user.user_metadata?.avatar_url}
              displayName={displayName}
              tierColor={tierColor}
            />

            <div className="fd-identity-name">{displayName}</div>
            <div className="fd-identity-email">{user.email}</div>
            <div className="fd-identity-tier" style={{ color: tierColor }}>
              <span style={{ marginRight: 6 }}>{tier?.icon ?? '◈'}</span>
              {tier?.name ?? 'Free'}
            </div>
            <div className="fd-identity-since">Member since {joinedDate}</div>
            <Link href="/tiers" className="fd-identity-upgrade">View all tiers →</Link>
          </div>

          {/* Points card */}
          <div className="fd-card fd-card-points fd-card-animate" style={{ '--i': 1 }}>
            <div className="fd-card-label">Total Points</div>
            <div className="fd-card-big-num">{displayPoints.toLocaleString()}</div>
            <div className="fd-card-sub">Lifetime earned</div>
            <div className="fd-points-glow" aria-hidden="true" />
          </div>

          {/* Rank card */}
          <div className="fd-card fd-card-rank fd-card-animate" style={{ '--i': 2 }}>
            <div className="fd-card-label">Fan Rank</div>
            <div className="fd-card-big-num" style={{ color: tierColor }}>
              {rank ? `#${rank.toLocaleString()}` : '-'}
            </div>
            <div className="fd-card-sub">
              {totalFans > 0 ? `of ${totalFans.toLocaleString()} fans` : 'Keep earning to rank up'}
            </div>
            <Link href="/leaderboard" className="fd-rank-link">See leaderboard →</Link>
          </div>

          {/* Progress card */}
          <div className="fd-card fd-card-progress fd-card-animate" style={{ '--tc': tierColor, '--i': 3 }}>
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

          {/* Earn actions - clickable */}
          <div className="fd-card fd-card-earn fd-card-animate" style={{ '--i': 4 }}>
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
              <div className="fd-link-desc">Love Lost - streaming now</div>
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

        {/* ── Coming Soon ── */}
        <ComingSoonSection />

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

        {/* ── Back to admin (bottom, admin only) ── */}
        {isAdminUser && (
          <div className="fd-admin-back-wrap">
            <a href="/admin" className="fd-admin-back-btn">← Back to Admin Dashboard</a>
          </div>
        )}

      </div>
    </div>
  )
}
