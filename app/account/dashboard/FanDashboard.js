'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

const QUICK_LINKS = [
  { label: 'Music',  href: '/music',  desc: 'Love Lost — streaming now'     },
  { label: 'Film',   href: '/film',   desc: 'The Gates — in theaters 2026'  },
  { label: 'Videos', href: '/videos', desc: 'Official visuals'               },
  { label: 'Merch',  href: '/merch',  desc: 'Drop 001 — coming soon'        },
]

export default function FanDashboard({ user }) {
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Derive a display name from email
  const displayName = user.email.split('@')[0]
  const joinedDate  = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  })

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
            <div className="member-badge">Free Fan</div>
            <div className="member-email">{user.email}</div>
            {user.user_metadata?.phone && (
              <div className="member-email" style={{ marginTop: 2 }}>
                {user.user_metadata.phone} · SMS alerts on
              </div>
            )}
            <div className="member-since">Member since {joinedDate}</div>
          </div>
          <div className="member-card-right">
            <div className="member-tier-label">Tier</div>
            <div className="member-tier-value">Free</div>
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
              Exclusive content, early access to drops, and direct messages from Algee — all coming soon.
            </div>
          </div>
        </div>

      </div>

      <div className="dashboard-bg-text" aria-hidden="true">FAN</div>
    </div>
  )
}
