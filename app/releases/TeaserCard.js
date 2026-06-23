'use client'
import { useState, useEffect } from 'react'

// Same target as the main countdown: July 7 2026 12:00 AM EST
const REVEAL_AT = new Date('2026-07-07T04:00:00Z').getTime()

function pad(n) { return String(n).padStart(2, '0') }

function useRevealed() {
  const [revealed, setRevealed] = useState(false)
  const [time,     setTime]     = useState(null)

  useEffect(() => {
    const calc = () => {
      const diff = REVEAL_AT - Date.now()
      if (diff <= 0) {
        setRevealed(true)
        setTime(null)
        return
      }
      setTime({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return { revealed, time }
}

export default function TeaserCard({ release }) {
  const { revealed, time } = useRevealed()

  if (revealed) {
    // Unblurred — show as a normal clickable card
    const href = release.href ?? `/releases/${release.slug}`
    return (
      <a href={href} className="releases-card teaser-revealed">
        <div className="releases-card-art">
          {release.artwork_url
            ? <img src={release.artwork_url} alt={release.title} className="releases-card-img" />
            : <div className="releases-card-art-ph">◻</div>
          }
          <div className="releases-card-art-overlay" />
        </div>
        <div className="releases-card-body">
          <div className="releases-card-type">{release.type}</div>
          <div className="releases-card-title">{release.title}</div>
          <div className="releases-card-cta">Listen Now →</div>
        </div>
      </a>
    )
  }

  // Blurred — teaser state (clickable if a landing page href is provided)
  const Tag   = release.href ? 'a' : 'div'
  const props = release.href ? { href: release.href } : {}
  return (
    <Tag className="teaser-card" {...props}>
      {/* Blurred artwork */}
      <div className="teaser-art">
        {release.artwork_url && (
          <img
            src={release.artwork_url}
            alt="Coming soon"
            className="teaser-img"
          />
        )}
        <div className="teaser-blur" />
        <div className="teaser-overlay">
          <div className="teaser-badge">Coming Soon</div>
          {release.artwork_url && (
            <img src={release.artwork_url} alt={release.title} className="teaser-cover-preview" />
          )}
          {time && (
            <div className="teaser-countdown">
              <div className="teaser-cd-unit">
                <span className="teaser-cd-num">{pad(time.days)}</span>
                <span className="teaser-cd-label">d</span>
              </div>
              <span className="teaser-cd-sep">:</span>
              <div className="teaser-cd-unit">
                <span className="teaser-cd-num">{pad(time.hours)}</span>
                <span className="teaser-cd-label">h</span>
              </div>
              <span className="teaser-cd-sep">:</span>
              <div className="teaser-cd-unit">
                <span className="teaser-cd-num">{pad(time.minutes)}</span>
                <span className="teaser-cd-label">m</span>
              </div>
              <span className="teaser-cd-sep">:</span>
              <div className="teaser-cd-unit">
                <span className="teaser-cd-num">{pad(time.seconds)}</span>
                <span className="teaser-cd-label">s</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="teaser-body">
        <div className="teaser-type">{release.type}</div>
        <div className="teaser-title">Something&apos;s Coming</div>
        <div className="teaser-hint">Drops July 7 · Midnight EST</div>
      </div>
    </Tag>
  )
}
