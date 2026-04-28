'use client'

import Link from 'next/link'
import { getTier } from '../../lib/tiers'

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

function rankLabel(n) {
  if (n <= 3) return RANK_MEDALS[n]
  return `#${n}`
}

function anonymize(email) {
  if (!email) return 'Anonymous'
  const [local] = email.split('@')
  if (local.length <= 3) return local + '***'
  return local.slice(0, 3) + '•'.repeat(Math.min(local.length - 3, 5))
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function LeaderboardView({ board, currentUserId, myPoints, myRank, myTier, fanOfMonth }) {

  return (
    <div className="lb-page">
      <div className="lb-inner">

        {/* Hero */}
        <div className="page-hero">
          <div className="page-hero-label">Community</div>
          <h1>Fan <span className="italic">Leaderboard.</span></h1>
          <p className="page-hero-sub">The real ones. Ranked by points.</p>
        </div>

        {/* Fan of the Month */}
        {fanOfMonth && (
          <div className="fotm-public-card">
            <div className="fotm-public-crown">👑</div>
            <div className="fotm-public-label">{MONTHS[fanOfMonth.month - 1]} {fanOfMonth.year} Fan of the Month</div>
            <div className="fotm-public-name">{fanOfMonth.display_name || anonymize(fanOfMonth.email)}</div>
            {fanOfMonth.reason && (
              <div className="fotm-public-reason">"{fanOfMonth.reason}"</div>
            )}
          </div>
        )}

        {/* Your rank card — only if logged in */}
        {currentUserId && myRank && (
          <div className="lb-my-rank-card">
            <div className="lb-my-rank-left">
              <div className="lb-my-rank-label">Your Rank</div>
              <div className="lb-my-rank-num">#{myRank}</div>
            </div>
            <div className="lb-my-rank-mid">
              <div className="lb-my-tier" style={{ color: myTier?.color }}>
                {myTier?.name} Fan
              </div>
              <div className="lb-my-pts">{myPoints.toLocaleString()} pts</div>
            </div>
            <Link href="/account/dashboard" className="lb-my-rank-cta">
              Dashboard →
            </Link>
          </div>
        )}

        {!currentUserId && (
          <div className="lb-join-nudge">
            <span>Join to claim your spot on the leaderboard.</span>
            <Link href="/account" className="lb-join-link">Join free →</Link>
          </div>
        )}

        {/* Leaderboard table */}
        {board.length === 0 ? (
          <div className="lb-empty">
            No fans yet — be the first.{' '}
            <Link href="/account">Join now →</Link>
          </div>
        ) : (
          <div className="lb-list">
            {/* Top 3 podium */}
            <div className="lb-podium">
              {board.slice(0, 3).map(entry => {
                const tier    = getTier(entry.total)
                const isMe    = entry.user_id === currentUserId
                return (
                  <div
                    key={entry.user_id}
                    className={`lb-podium-card lb-podium-${entry.rank}${isMe ? ' lb-me' : ''}`}
                  >
                    <div className="lb-podium-medal">{RANK_MEDALS[entry.rank]}</div>
                    <div className="lb-podium-name">{anonymize(entry.email)}{isMe ? ' (you)' : ''}</div>
                    <div className="lb-podium-pts" style={{ color: tier.color }}>
                      {entry.total.toLocaleString()}
                      <span className="lb-podium-pts-label"> pts</span>
                    </div>
                    <div className="lb-podium-tier" style={{ color: tier.color }}>{tier.name}</div>
                  </div>
                )
              })}
            </div>

            {/* Rest of the list */}
            {board.length > 3 && (
              <div className="lb-rows">
                {board.slice(3).map(entry => {
                  const tier = getTier(entry.total)
                  const isMe = entry.user_id === currentUserId
                  return (
                    <div key={entry.user_id} className={`lb-row${isMe ? ' lb-me' : ''}`}>
                      <div className="lb-row-rank">{rankLabel(entry.rank)}</div>
                      <div className="lb-row-name">
                        {anonymize(entry.email)}
                        {isMe && <span className="lb-you-tag">you</span>}
                      </div>
                      <div className="lb-row-tier" style={{ color: tier.color }}>{tier.name}</div>
                      <div className="lb-row-pts">{entry.total.toLocaleString()} pts</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* How to climb */}
        <div className="lb-earn-section">
          <div className="lb-earn-title">How to climb the ranks</div>
          <div className="lb-earn-grid">
            <div className="lb-earn-item"><span className="lb-earn-pts">+100</span>Join the fan club</div>
            <div className="lb-earn-item"><span className="lb-earn-pts">+50</span>Buy merch</div>
            <div className="lb-earn-item"><span className="lb-earn-pts">+20</span>Share content</div>
            <div className="lb-earn-item"><span className="lb-earn-pts">+10</span>Stream music</div>
          </div>
        </div>

      </div>
    </div>
  )
}
