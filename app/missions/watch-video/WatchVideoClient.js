'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const WATCH_SECONDS = 30

export default function WatchVideoClient({ mission, alreadyDone }) {
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS)
  const [started,     setStarted]     = useState(false)
  const [unlocked,    setUnlocked]    = useState(alreadyDone)
  const [completing,  setCompleting]  = useState(false)
  const [done,        setDone]        = useState(alreadyDone)
  const intervalRef = useRef(null)
  const router = useRouter()

  // Start countdown when iframe is interacted with (or auto-start)
  const startTimer = () => {
    if (started || unlocked) return
    setStarted(true)
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setUnlocked(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const handleComplete = async () => {
    setCompleting(true)
    await fetch('/api/missions/complete', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ missionId: mission.id, points: mission.points }),
    })
    setDone(true)
    setCompleting(false)
    setTimeout(() => router.push('/missions'), 1800)
  }

  const pct = Math.round(((WATCH_SECONDS - secondsLeft) / WATCH_SECONDS) * 100)

  return (
    <div className="mission-page-wrap">
      <div className="mission-page-inner">

        {/* Back */}
        <a href="/missions" className="mission-page-back">← All Missions</a>

        {/* Header */}
        <div className="mission-page-header">
          <div className="mission-page-icon" style={{ color: mission.color }}>{mission.icon}</div>
          <div className="mission-page-cat">{mission.category}</div>
          <h1 className="mission-page-title">{mission.title}</h1>
          <div className="mission-page-pts">+{mission.points} pts</div>
          <p className="mission-page-desc">{mission.description}</p>
        </div>

        {/* Video embed */}
        <div className="watch-video-wrap" onClick={startTimer}>
          <iframe
            className="watch-video-iframe"
            src={`https://www.youtube.com/embed/${mission.videoId}?rel=0&modestbranding=1`}
            title="Music Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={startTimer}
          />
          {!started && !unlocked && (
            <div className="watch-video-overlay" onClick={startTimer}>
              <div className="watch-video-overlay-text">▶ Press play to start the timer</div>
            </div>
          )}
        </div>

        {/* Timer / progress */}
        {!alreadyDone && (
          <div className="watch-timer-wrap">
            {!unlocked ? (
              <>
                <div className="watch-timer-bar-track">
                  <div className="watch-timer-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="watch-timer-label">
                  {started
                    ? `${secondsLeft}s left - keep watching`
                    : 'Press play above to start the timer'}
                </div>
              </>
            ) : (
              <div className="watch-timer-ready">✓ 30 seconds watched - you're good!</div>
            )}
          </div>
        )}

        {/* Complete button */}
        {done ? (
          <div className="mission-success">
            <div className="mission-success-icon">✓</div>
            <div className="mission-success-title">+{mission.points} pts earned!</div>
            <div className="mission-success-sub">Redirecting you back...</div>
          </div>
        ) : unlocked ? (
          <button
            className="mission-submit-btn"
            style={{ background: mission.color }}
            onClick={handleComplete}
            disabled={completing}
          >
            {completing ? 'Saving...' : `Mark Complete · +${mission.points} pts`}
          </button>
        ) : (
          <button className="mission-submit-btn" style={{ background: '#333', cursor: 'not-allowed' }} disabled>
            Watch 30 seconds to unlock
          </button>
        )}

      </div>
    </div>
  )
}
