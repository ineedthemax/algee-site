'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import DashboardTour from './DashboardTour'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '../../../lib/supabase/client'
import { CountdownCard } from '../../components/CountdownTimer'
import { useRouter } from 'next/navigation'
import { MISSIONS } from '../../../lib/missions'

/* ── Tier config ─────────────────────────────────────────────── */
const TIER_COLORS = { 'Day One': '#c4222e', 'Rider': '#e8a020', 'Legend': '#9b59b6', 'Free': '#666' }

const TIER_JOURNEY = [
  { name: 'Free',    min: 0,    color: '#888',    icon: '◻' },
  { name: 'Day One', min: 200,  color: '#c4222e', icon: '✦' },
  { name: 'Rider',   min: 600,  color: '#e8a020', icon: '◈' },
  { name: 'Legend',  min: 1500, color: '#9b59b6', icon: '★' },
]

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
        <CountdownCard />
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

/* ── Push helper ─────────────────────────────────────────────── */
function urlBase64ToUint8Array(b64) {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4)
  const base64  = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  const arr     = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

/* ── Inline mission: push notifications ──────────────────────── */
function DashPushMission({ mission, onComplete }) {
  const [state, setState] = useState('idle') // idle | requesting | done | denied | error

  const handleClick = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setState('error')
      return
    }
    setState('requesting')
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setState('denied'); return }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      })
      const res  = await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription: sub.toJSON() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setState('done')
      onComplete(data.points)
    } catch {
      setState('error')
    }
  }

  if (state === 'done')    return <div className="fd-mp-success">✓ Notifications on · +{mission.points} pts</div>
  if (state === 'denied')  return <div className="fd-mp-hint">Blocked — allow notifications in your browser settings</div>
  if (state === 'error')   return <div className="fd-mp-hint">Not supported on this device</div>

  return (
    <button
      className="fd-mp-action-btn"
      style={{ '--mc': mission.color }}
      onClick={handleClick}
      disabled={state === 'requesting'}
    >
      {state === 'requesting' ? 'Allowing...' : 'Enable →'}
    </button>
  )
}

/* ── Inline mission: phone number ─────────────────────────────── */
function DashPhoneMission({ mission, onComplete }) {
  const [expanded,   setExpanded]   = useState(false)
  const [phone,      setPhone]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [done,       setDone]       = useState(false)

  const handleSubmit = async () => {
    if (phone.trim().length < 7) return
    setSubmitting(true)
    setError(null)
    try {
      await fetch('/api/profile/update-phone', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone }),
      })
      const res = await fetch('/api/missions/complete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ missionId: mission.id }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
      onComplete(mission.points)
    } catch {
      setError('Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  if (done) return <div className="fd-mp-success">✓ Number saved · +{mission.points} pts</div>

  if (!expanded) {
    return (
      <button className="fd-mp-action-btn" style={{ '--mc': mission.color }} onClick={() => setExpanded(true)}>
        Add Number →
      </button>
    )
  }

  return (
    <div className="fd-mp-form">
      <input
        type="tel"
        className="fd-mp-input"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="+1 (555) 000-0000"
        autoComplete="tel"
        autoFocus
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      {error && <div className="fd-mp-error">{error}</div>}
      <button
        className="fd-mp-action-btn"
        style={{ '--mc': mission.color }}
        onClick={handleSubmit}
        disabled={submitting || phone.trim().length < 7}
      >
        {submitting ? 'Saving...' : `Save · +${mission.points} pts`}
      </button>
    </div>
  )
}

/* ── Inline mission: fan profile (step-by-step) ───────────────── */
function DashProfileMission({ mission, onComplete }) {
  const [expanded,   setExpanded]   = useState(false)
  const [step,       setStep]       = useState(0)
  const [answers,    setAnswers]    = useState(() => {
    const init = {}
    mission.questions.forEach(q => { init[q.id] = '' })
    return init
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [done,       setDone]       = useState(false)

  const q       = mission.questions[step]
  const isLast  = step === mission.questions.length - 1
  const pct     = Math.round(((step + 1) / mission.questions.length) * 100)

  const handleNext = async () => {
    if (!answers[q.id]?.trim()) return
    if (!isLast) { setStep(s => s + 1); return }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/missions/complete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ missionId: mission.id, answers }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
      onComplete(mission.points)
    } catch {
      setError('Something went wrong.')
      setSubmitting(false)
    }
  }

  if (done) return <div className="fd-mp-success">✓ Profile complete · +{mission.points} pts</div>

  if (!expanded) {
    return (
      <button className="fd-mp-action-btn" style={{ '--mc': mission.color }} onClick={() => setExpanded(true)}>
        Start →
      </button>
    )
  }

  return (
    <div className="fd-mp-form">
      <div className="fd-mp-progress">
        <div className="fd-mp-progress-fill" style={{ width: `${pct}%`, background: mission.color }} />
      </div>
      <div className="fd-mp-q-meta">{step + 1} / {mission.questions.length}</div>
      <div className="fd-mp-q-text">{q.label}</div>
      {q.type === 'textarea' ? (
        <textarea
          className="fd-mp-input fd-mp-textarea"
          value={answers[q.id]}
          onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
          placeholder={q.placeholder}
          rows={3}
          autoFocus
        />
      ) : (
        <input
          type="text"
          className="fd-mp-input"
          value={answers[q.id]}
          onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
          placeholder={q.placeholder}
          onKeyDown={e => e.key === 'Enter' && handleNext()}
          autoFocus
        />
      )}
      {error && <div className="fd-mp-error">{error}</div>}
      <div className="fd-mp-q-row">
        {step > 0 && (
          <button className="fd-mp-back-btn" onClick={() => setStep(s => s - 1)}>← Back</button>
        )}
        <button
          className="fd-mp-action-btn"
          style={{ '--mc': mission.color }}
          onClick={handleNext}
          disabled={submitting || !answers[q.id]?.trim()}
        >
          {submitting ? '...' : isLast ? `Submit · +${mission.points} pts` : 'Next →'}
        </button>
      </div>
    </div>
  )
}

/* ── Dashboard missions grid (top 3 by points, interactive) ───── */
function DashboardMissions({ onPointsEarned }) {
  const topMissions = MISSIONS.slice().sort((a, b) => b.points - a.points).slice(0, 3)

  return (
    <div className="fd-mp-grid">
      {topMissions.map(m => (
        <div key={m.id} className="fd-mp-card" style={{ '--mc': m.color ?? '#c4222e' }}>
          <div className="fd-mp-top">
            <span className="fd-mp-icon">{m.icon}</span>
            <div className="fd-mp-pts">+{m.points} pts</div>
          </div>
          <div className="fd-mp-title">{m.title}</div>
          <div className="fd-mp-desc">{m.description.split('.')[0]}.</div>
          {m.type === 'weekly' && (
            <div className="fd-mp-weekly">Weekly · resets Monday</div>
          )}
          <div className="fd-mp-action">
            {m.type === 'push' ? (
              <DashPushMission mission={m} onComplete={onPointsEarned} />
            ) : m.questions ? (
              <DashProfileMission mission={m} onComplete={onPointsEarned} />
            ) : (
              <DashPhoneMission mission={m} onComplete={onPointsEarned} />
            )}
          </div>
        </div>
      ))}
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

/* ── Manage subscription button (hits portal API) ───────────── */
function ManageSubscriptionBtn() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // silent - if it fails the button just stops spinning
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className="fd-ic-manage"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Loading…' : 'Manage subscription →'}
    </button>
  )
}

/* ── Weekly Progress Card ────────────────────────────────────── */
function WeeklyProgressCard({ weeklyPoints, lastWeekPoints, missionsCompleted, totalMissions }) {
  const diff    = weeklyPoints - lastWeekPoints
  const hasData = weeklyPoints > 0 || lastWeekPoints > 0

  return (
    <div className="fd-card fd-card-weekly fd-card-animate" style={{ '--i': 5 }}>
      <div className="fd-card-label">This Week</div>
      <div className="fd-weekly-pts">
        {weeklyPoints.toLocaleString()}
        <span className="fd-weekly-pts-label"> pts</span>
      </div>
      {hasData && (
        <div className={`fd-weekly-trend${diff >= 0 ? ' fd-weekly-up' : ' fd-weekly-down'}`}>
          {diff >= 0 ? '↑' : '↓'} {Math.abs(diff)} vs last week
        </div>
      )}
      {!hasData && (
        <div className="fd-weekly-trend" style={{ color: 'var(--muted)' }}>
          Start earning to get on the board
        </div>
      )}
      <div className="fd-weekly-missions">
        <div className="fd-weekly-missions-bar">
          <div
            className="fd-weekly-missions-fill"
            style={{ width: `${totalMissions > 0 ? (missionsCompleted / totalMissions) * 100 : 0}%` }}
          />
        </div>
        <div className="fd-weekly-missions-label">
          {missionsCompleted} / {totalMissions} missions complete (lifetime)
        </div>
      </div>
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
  username = null,
  subscription = null,
  discordInvite = null,
  weeklyPoints = 0,
  lastWeekPoints = 0,
  missionsCompleted = 0,
}) {
  const [signingOut,      setSigningOut]      = useState(false)
  const [dismissed,       setDismissed]       = useState([])
  const [copied,          setCopied]          = useState(false)
  const [showWelcome,     setShowWelcome]     = useState(isNew)
  const [tourKey,         setTourKey]         = useState(0)
  const [displayPoints,   setDisplayPoints]   = useState(0)
  const [currentUsername, setCurrentUsername] = useState(username)
  const [usernameInput,   setUsernameInput]   = useState('')
  const [usernameError,   setUsernameError]   = useState(null)
  const [usernameSaving,  setUsernameSaving]  = useState(false)
  const [usernameSaved,   setUsernameSaved]   = useState(false)
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

  // Award daily visit points once per UTC day; refresh server data if awarded
  useEffect(() => {
    fetch('/api/points/daily-visit', { method: 'POST' })
      .then(r => r.json())
      .then(data => { if (data.success) router.refresh() })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSetUsername = async () => {
    const val = usernameInput.trim().toLowerCase()
    if (!val) return
    setUsernameSaving(true)
    setUsernameError(null)
    try {
      const res  = await fetch('/api/profile/set-username', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: val }),
      })
      const data = await res.json()
      if (!res.ok) { setUsernameError(data.error); return }
      setCurrentUsername(val)
      setUsernameSaved(true)
    } catch {
      setUsernameError('Something went wrong. Try again.')
    } finally {
      setUsernameSaving(false)
    }
  }

  const displayName  = currentUsername || user.user_metadata?.full_name || user.email.split('@')[0]
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
          <a href="/admin" className="fd-admin-bar-back">← Back to Admin</a>
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

        {/* ── Username prompt (shown until fan sets one) ── */}
        {!currentUsername && (
          <div className="fd-username-prompt">
            <div className="fd-username-prompt-left">
              <div className="fd-username-prompt-title">
                {usernameSaved ? '✓ Username set!' : 'Claim your fan name'}
              </div>
              <div className="fd-username-prompt-sub">
                {usernameSaved
                  ? `You're now @${currentUsername} on the leaderboard.`
                  : 'Your username shows on the leaderboard — not your email.'}
              </div>
            </div>
            {!usernameSaved && (
              <div className="fd-username-prompt-right">
                <div className="fd-username-input-wrap">
                  <span className="fd-username-at">@</span>
                  <input
                    className="fd-username-input"
                    type="text"
                    placeholder="yourname"
                    maxLength={20}
                    value={usernameInput}
                    onChange={e => {
                      setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                      setUsernameError(null)
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSetUsername()}
                  />
                </div>
                <button
                  className="fd-username-save-btn"
                  onClick={handleSetUsername}
                  disabled={usernameSaving || usernameInput.trim().length < 3}
                >
                  {usernameSaving ? '…' : 'Save'}
                </button>
              </div>
            )}
            {usernameError && <div className="fd-username-error">{usernameError}</div>}
          </div>
        )}

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
            {weeklyPoints > 0 ? (
              <div className="fd-points-velocity">
                <span className="fd-points-vel-gain">+{weeklyPoints}</span>
                <span className="fd-points-vel-sub">this week</span>
              </div>
            ) : (
              <div className="fd-card-sub">Lifetime earned</div>
            )}
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

          {/* Weekly progress card */}
          <WeeklyProgressCard
            weeklyPoints={weeklyPoints}
            lastWeekPoints={lastWeekPoints}
            missionsCompleted={missionsCompleted}
            totalMissions={MISSIONS.length}
          />

          {/* Tier progress card — 4-tier journey strip */}
          <div className="fd-card fd-card-progress fd-card-animate" style={{ '--tc': tierColor, '--i': 3 }}>
            <div className="fd-card-label">Your Journey</div>
            <div className="fd-journey-strip">
              {(() => {
                const items = []
                TIER_JOURNEY.forEach((t, i) => {
                  if (i > 0) {
                    const prevMin   = TIER_JOURNEY[i - 1].min
                    const segFilled = points >= t.min
                    const segActive = !segFilled && points >= prevMin
                    const fillWidth = segFilled ? 100 : segActive ? progressPct : 0
                    items.push(
                      <div key={`seg-${i}`} className="fd-journey-seg">
                        {fillWidth > 0 && (
                          <div
                            className="fd-journey-seg-fill"
                            style={{ width: `${fillWidth}%`, background: TIER_JOURNEY[i - 1].color }}
                          />
                        )}
                      </div>
                    )
                  }
                  const isCurrent = t.name === tier?.name
                  const isFuture  = (tier?.min ?? 0) < t.min
                  items.push(
                    <div
                      key={t.name}
                      className={`fd-journey-node${isCurrent ? ' fd-journey-node-active' : ''}${isFuture ? ' fd-journey-node-future' : ''}`}
                    >
                      {isCurrent && (
                        <div className="fd-journey-you-badge" style={{ background: t.color }}>YOU</div>
                      )}
                      <div className="fd-journey-icon" style={{ color: isFuture ? 'rgba(255,255,255,0.15)' : t.color }}>
                        {t.icon}
                      </div>
                      <div className="fd-journey-tier-name" style={{ color: isFuture ? 'rgba(255,255,255,0.15)' : t.color }}>
                        {t.name}
                      </div>
                    </div>
                  )
                })
                return items
              })()}
            </div>
            {nextTier ? (
              <div className="fd-journey-footer">
                <span>{points.toLocaleString()} pts earned</span>
                <span>
                  {pointsToNext.toLocaleString()} to{' '}
                  <span style={{ color: nextTier.color ?? tierColor }}>{nextTier.name}</span>
                </span>
              </div>
            ) : (
              <div className="fd-journey-footer">
                <span style={{ color: tierColor }}>★ Maximum tier reached</span>
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

        {/* ── Top Missions Preview ── */}
        <div className="fd-section-label">Earn Points</div>
        <DashboardMissions onPointsEarned={() => router.refresh()} />

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

        {/* ── Inner Circle membership ── */}
        {subscription ? (
          <>
            <div className="fd-section-label">Inner Circle</div>
            <div className="fd-card fd-inner-circle-card">
              <div className="fd-ic-header">
                <div className="fd-ic-badge">
                  {subscription.tier_name === 'bundle' ? '📦 The Bundle' : '👑 Inner Circle'}
                </div>
                <div className="fd-ic-status">
                  {subscription.tier_name === 'bundle'
                    ? `Discord access · expires ${new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : `Active · renews ${new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  }
                </div>
              </div>
              <p className="fd-ic-desc">
                {subscription.tier_name === 'bundle'
                  ? "You're in for 3 months. Early access, exclusives, and Discord — all included with your bundle."
                  : "You're in. Early access, exclusives, and a direct line to Algee — all yours."
                }
              </p>
              {discordInvite && (
                <a
                  href={discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fd-ic-discord-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                  Join the Discord Server
                </a>
              )}
              <ManageSubscriptionBtn />
            </div>
          </>
        ) : (
          <>
            <div className="fd-section-label">Inner Circle</div>
            <div className="fd-card fd-inner-circle-locked">
              <div className="fd-ic-locked-icon">👑</div>
              <div className="fd-ic-locked-title">Join the Inner Circle</div>
              <div className="fd-ic-locked-desc">
                $4.99/month · Early access, exclusives, Discord community &amp; a direct line to Algee.
              </div>
              <a href="/join" className="fd-ic-join-btn">See membership options →</a>
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
