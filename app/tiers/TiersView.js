'use client'

import Link from 'next/link'
// No server-only imports here - tiers/points data passed as props from server page

export default function TiersView({ tiers, currentUserId, myPoints, myTier, nextTier }) {
  const progressPct = nextTier
    ? Math.min(100, Math.round(((myPoints - myTier.min) / (nextTier.min - myTier.min)) * 100))
    : 100

  const pointsToNext = nextTier ? nextTier.min - myPoints : 0

  return (
    <div className="tiers-page">
      <div className="tiers-inner">

        {/* Hero */}
        <div className="page-hero">
          <div className="page-hero-label">Fan Community</div>
          <h1>The <span className="italic">Tiers.</span></h1>
          <p className="page-hero-sub">
            Every point you earn moves you closer. Four levels. Real rewards.
          </p>
        </div>

        {/* Current status bar - logged in only */}
        {currentUserId && (
          <div className="tiers-status-bar">
            <div className="tiers-status-left">
              <span className="tiers-status-tier" style={{ color: myTier.color }}>
                {myTier.icon} {myTier.name}
              </span>
              <span className="tiers-status-pts">{myPoints.toLocaleString()} pts</span>
            </div>
            <div className="tiers-status-right">
              {nextTier ? (
                <>
                  <div className="tiers-status-bar-track">
                    <div
                      className="tiers-status-bar-fill"
                      style={{ width: `${progressPct}%`, background: myTier.color }}
                    />
                  </div>
                  <span className="tiers-status-next">
                    {pointsToNext} pts to{' '}
                    <span style={{ color: nextTier.color }}>{nextTier.name}</span>
                  </span>
                </>
              ) : (
                <span className="tiers-status-next" style={{ color: myTier.color }}>
                  Maximum tier reached.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tier cards */}
        <div className="tiers-grid">
          {tiers.map((tier, i) => {
            const isCurrentTier = currentUserId && myTier.name === tier.name
            const isUnlocked    = currentUserId && myPoints >= tier.min
            const isLocked      = currentUserId && myPoints < tier.min
            // For logged-out users, only Free tier is truly accessible
            const isFree        = tier.min === 0
            const ptsAway       = tier.min - myPoints

            return (
              <div
                key={tier.name}
                className={`tier-card${isCurrentTier ? ' tier-card-active' : ''}${isLocked ? ' tier-card-locked' : ''}`}
                style={isCurrentTier ? { borderColor: tier.color } : {}}
              >
                {/* Active badge */}
                {isCurrentTier && (
                  <div className="tier-card-badge" style={{ background: tier.color }}>
                    Your Tier
                  </div>
                )}

                {/* Locked badge for logged-out users on paid tiers */}
                {!currentUserId && !isFree && (
                  <div className="tier-card-badge tier-card-badge-locked">
                    🔒 Earn to unlock
                  </div>
                )}

                {/* Icon + name */}
                <div className="tier-card-icon" style={{ color: isLocked ? '#444' : (!currentUserId && !isFree ? '#444' : tier.color) }}>
                  {tier.icon}
                </div>
                <div className="tier-card-name" style={{ color: isLocked ? '#555' : (!currentUserId && !isFree ? '#555' : tier.color) }}>
                  {tier.name}
                </div>
                <div className="tier-card-min">
                  {tier.min === 0 ? 'Free to join' : `${tier.min.toLocaleString()}+ points`}
                </div>
                <div className="tier-card-tagline">{tier.tagline}</div>

                {/* Divider */}
                <div className="tier-card-divider" style={{ background: (isLocked || (!currentUserId && !isFree)) ? '#222' : tier.color }} />

                {/* Perks */}
                <ul className="tier-card-perks">
                  {tier.perks.map((perk, j) => {
                    const dimmed = isLocked || (!currentUserId && !isFree)
                    return (
                      <li key={j} className={`tier-perk${dimmed ? ' tier-perk-locked' : ''}`}>
                        <span className="tier-perk-dot" style={{ color: dimmed ? '#444' : tier.color }}>
                          {dimmed ? '○' : '●'}
                        </span>
                        {perk}
                      </li>
                    )
                  })}
                </ul>

                {/* CTA - only Free tier gets a join button for logged-out users */}
                {!currentUserId && isFree && (
                  <Link href="/account" className="tier-card-cta" style={{ borderColor: tier.color, color: tier.color }}>
                    Join free →
                  </Link>
                )}
                {!currentUserId && !isFree && (
                  <div className="tier-card-locked-label">
                    Join free → earn {tier.min.toLocaleString()} pts to unlock
                  </div>
                )}
                {isCurrentTier && (
                  <Link href="/account/dashboard" className="tier-card-cta" style={{ borderColor: tier.color, color: tier.color }}>
                    View Dashboard →
                  </Link>
                )}
                {isUnlocked && !isCurrentTier && (
                  <div className="tier-card-unlocked-label" style={{ color: tier.color }}>
                    ✓ Unlocked
                  </div>
                )}
                {isLocked && (
                  <div className="tier-card-locked-label">
                    {ptsAway.toLocaleString()} pts away
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Not logged in CTA */}
        {!currentUserId && (
          <div className="tiers-join-strip">
            <div className="tiers-join-text">
              Start at Free. Earn points. Unlock everything.
            </div>
            <Link href="/account" className="tiers-join-btn">
              Join the fan club →
            </Link>
          </div>
        )}

        {/* Points guide */}
        <div className="tiers-earn-section">
          <div className="tiers-earn-title">How to earn points</div>
          <div className="tiers-earn-grid">
            <div className="tiers-earn-row">
              <span className="tiers-earn-action">Join the fan club</span>
              <span className="tiers-earn-pts">+100 pts</span>
            </div>
            <div className="tiers-earn-row">
              <span className="tiers-earn-action">Buy merch</span>
              <span className="tiers-earn-pts">+50 pts</span>
            </div>
            <div className="tiers-earn-row">
              <span className="tiers-earn-action">Share content</span>
              <span className="tiers-earn-pts">+20 pts</span>
            </div>
            <div className="tiers-earn-row">
              <span className="tiers-earn-action">Stream music</span>
              <span className="tiers-earn-pts">+10 pts</span>
            </div>
            <div className="tiers-earn-row">
              <span className="tiers-earn-action">Watch a video</span>
              <span className="tiers-earn-pts">+10 pts</span>
            </div>
            <div className="tiers-earn-row">
              <span className="tiers-earn-action">Daily visit</span>
              <span className="tiers-earn-pts">+5 pts</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
