'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
// TIERS imported via lib/tiers — client-safe (no server-only deps)

const QUICK_LINKS = [
  { label: 'Music',      href: '/music',       desc: 'Love Lost — streaming now'     },
  { label: 'Fan Wall',   href: '/fan-wall',    desc: 'Leave your mark'               },
  { label: 'Playlists',  href: '/playlists',   desc: 'Where Algee is landing'        },
  { label: 'Missions',   href: '/missions',    desc: 'Complete challenges, earn pts' },
]

export default function FanDashboard({ user, points = 0, tier, nextTier }) {
  const [signingOut, setSigningOut] = useState(false)
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

  // Progress toward next tier
  const progressPct = nextTier
    ? Math.min(100, Math.round(((points - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100

  const pointsToNext = nextTier ? nextTier.min - points : 0

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">

        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <div className="dashboard-eyebrow">Fan Account</div>
            <h1 className="dashboard-headline">
              Welcome back,<br />
              <span className="italic">{displayName}.</span>
            </h1>
          </div>
          <button
            className="dashboard-signout"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>

        {/* Member card */}
        <div className="dashboard-card member-card">
          <div className="member-card-left">
            <div className="member-badge" style={{ color: tier?.color }}>
              {tier?.name ?? 'Free'} Fan
            </div>
            <div className="member-email">{user.email}</div>
            {user.user_metadata?.phone && (
              <div className="member-email" style={{ marginTop: 2 }}>
                {user.user_metadata.phone} · SMS alerts on
              </div>
            )}
            <div className="member-since">Member since {joinedDate}</div>
          </div>
          <div className="member-card-right">
            <div className="member-tier-label">Points</div>
            <div className="member-tier-value">{points.toLocaleString()}</div>
            <div className="member-tier-label" style={{ marginTop: 6 }}>Tier</div>
            <div className="member-tier-value" style={{ color: tier?.color }}>
              {tier?.name ?? 'Free'}
            </div>
          </div>
        </div>

        {/* Points progress bar */}
        <div className="dashboard-card points-card">
          <div className="points-card-header">
            <span className="points-card-label">Fan Points</span>
            <span className="points-card-total">{points.toLocaleString()} pts</span>
          </div>

          <div className="points-bar-track">
            <div
              className="points-bar-fill"
              style={{ width: `${progressPct}%`, background: tier?.color ?? '#c4222e' }}
            />
          </div>

          {nextTier ? (
            <div className="points-card-sub">
              {pointsToNext} more points to unlock{' '}
              <span style={{ color: nextTier.color, fontWeight: 600 }}>{nextTier.name}</span>
            </div>
          ) : (
            <div className="points-card-sub" style={{ color: tier?.color }}>
              You&apos;ve reached the highest tier. Legend status.
            </div>
          )}

          {/* How to earn */}
          <div className="points-earn-label">How to earn points</div>
          <div className="points-earn-grid">
            <div className="points-earn-item"><span className="points-earn-pts">+100</span> Join the fan club</div>
            <div className="points-earn-item"><span className="points-earn-pts">+20</span> Share content</div>
            <div className="points-earn-item"><span className="points-earn-pts">+10</span> Stream music</div>
            <div className="points-earn-item"><span className="points-earn-pts">+50</span> Buy merch</div>
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

        {/* Coming soon */}
        <div className="dashboard-card coming-card">
          <div className="coming-card-icon">✦</div>
          <div className="coming-card-text">
            <div className="coming-card-title">More coming for fans.</div>
            <div className="coming-card-sub">
              Leaderboard, exclusive content, early access to drops, and direct messages from Algee — all coming soon.
            </div>
          </div>
        </div>

      </div>

      <div className="dashboard-bg-text" aria-hidden="true">FAN</div>
    </div>
  )
}
