'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Push-notification mission button ──────────────────────────────────────────
function PushMissionButton({ mission, onComplete }) {
  const [state, setState] = useState('idle') // idle | requesting | done | denied | error

  const handleClick = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setState('error')
      return
    }

    setState('requesting')

    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Ask for permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState('denied')
        return
      }

      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      })

      // Save to server + complete mission
      const res  = await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription: sub.toJSON() }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setState('done')
      onComplete?.(data.points)
    } catch (err) {
      console.error('push subscribe error:', err)
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="push-done">
        🔔 Notifications on
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="push-denied">
        Blocked in settings — go to your browser settings to allow notifications for this site.
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="push-denied">
        Not supported on this device. Try Chrome on Android or Safari on iOS 16.4+.
      </div>
    )
  }

  return (
    <button
      className="mission-cta"
      style={{ borderColor: mission.color, color: mission.color }}
      onClick={handleClick}
      disabled={state === 'requesting'}
    >
      {state === 'requesting' ? 'Allowing...' : 'Turn On →'}
    </button>
  )
}

// ── External link mission (open URL → mark complete) ─────────────────────────
function ExternalMissionButton({ mission, onComplete }) {
  const [state, setState] = useState('idle') // idle | done | saving

  const handleClick = async () => {
    window.open(mission.url, '_blank', 'noopener')
    if (state === 'done') return
    setState('saving')
    try {
      await fetch('/api/missions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: mission.id, points: mission.points }),
      })
      setState('done')
      onComplete(mission.points)
    } catch { setState('idle') }
  }

  if (state === 'done') return <div className="push-done">✓ Done · +{mission.points} pts</div>

  return (
    <button
      className="mission-cta"
      style={{ borderColor: mission.color, color: mission.color }}
      onClick={handleClick}
      disabled={state === 'saving'}
    >
      {state === 'saving' ? 'Saving...' : 'Go →'}
    </button>
  )
}

// ── Share mission ─────────────────────────────────────────────────────────────
function ShareMissionButton({ mission, onComplete }) {
  const [state, setState] = useState('idle') // idle | done | saving | fallback

  const handleClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: mission.shareText, url: mission.shareUrl })
      } catch { return } // user cancelled
    } else {
      // Fallback: copy to clipboard
      try { await navigator.clipboard.writeText(mission.shareUrl) } catch {}
      setState('fallback')
    }
    setState('saving')
    try {
      await fetch('/api/missions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: mission.id, points: mission.points }),
      })
      setState('done')
      onComplete(mission.points)
    } catch { setState('idle') }
  }

  if (state === 'done') return <div className="push-done">✓ Shared · +{mission.points} pts</div>
  if (state === 'fallback') return <div className="push-done" style={{ color: '#c4a882' }}>Link copied!</div>

  return (
    <button
      className="mission-cta"
      style={{ borderColor: mission.color, color: mission.color }}
      onClick={handleClick}
      disabled={state === 'saving'}
    >
      {state === 'saving' ? 'Saving...' : 'Share →'}
    </button>
  )
}

function urlBase64ToUint8Array(base64String) {
  const padding  = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData  = atob(base64)
  const arr      = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i)
  return arr
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MissionsHub({ missions, completedMap }) {
  const [localCompleted, setLocalCompleted] = useState({})

  const mergedDone = { ...completedMap, ...localCompleted }

  const totalPoints  = missions.reduce((s, m) => s + m.points, 0)
  const earnedPoints = missions
    .filter(m => mergedDone[m.id])
    .reduce((s, m) => s + m.points, 0)
  const completedCount = Object.keys(mergedDone).length

  const handleMissionComplete = (missionId, points) => {
    setLocalCompleted(prev => ({ ...prev, [missionId]: { points } }))
  }

  return (
    <div className="missions-page">
      <div className="missions-inner">

        {/* Hero */}
        <div className="page-hero">
          <div className="page-hero-label">Fan Missions</div>
          <h1>Complete. <span className="italic">Earn. Level up.</span></h1>
          <p className="page-hero-sub">
            Missions unlock more of the world. Every one you finish earns points.
          </p>
        </div>

        {/* Progress strip */}
        <div className="missions-progress-strip">
          <div className="missions-progress-stat">
            <span className="missions-progress-val">{completedCount}</span>
            <span className="missions-progress-label">of {missions.length} complete</span>
          </div>
          <div className="missions-progress-bar-wrap">
            <div className="missions-progress-bar-track">
              <div
                className="missions-progress-bar-fill"
                style={{ width: `${missions.length ? (completedCount / missions.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="missions-progress-stat" style={{ textAlign: 'right' }}>
            <span className="missions-progress-val">{earnedPoints}</span>
            <span className="missions-progress-label">of {totalPoints} pts earned</span>
          </div>
        </div>

        {/* Mission cards */}
        <div className="missions-list">
          {missions.map(mission => {
            const done = !!mergedDone[mission.id]
            return (
              <div key={mission.id} className={`mission-card${done ? ' mission-done' : ''}`}>
                <div className="mission-card-left">
                  <div className="mission-icon" style={{ color: done ? '#555' : mission.color }}>
                    {done ? '✓' : mission.icon}
                  </div>
                  <div className="mission-info">
                    <div className="mission-category">{mission.category}</div>
                    <div className="mission-title">{mission.title}</div>
                    <div className="mission-desc">{mission.description}</div>
                    {done && (
                      <div className="mission-done-label">
                        Completed · +{mission.points} pts earned
                      </div>
                    )}
                  </div>
                </div>
                <div className="mission-card-right">
                  {done ? (
                    <div className="mission-pts-done">+{mission.points}</div>
                  ) : (
                    <>
                      <div className="mission-pts">+{mission.points} pts</div>
                      {mission.type === 'push' ? (
                        <>
                          <PushMissionButton
                            mission={mission}
                            onComplete={(pts) => handleMissionComplete(mission.id, pts)}
                          />
                          <div className="push-ios-hint">
                            📱 iPhone? Add this site to your Home Screen first, then come back and tap Turn On.
                          </div>
                        </>
                      ) : mission.type === 'external' ? (
                        <ExternalMissionButton
                          mission={mission}
                          onComplete={(pts) => handleMissionComplete(mission.id, pts)}
                        />
                      ) : mission.type === 'share' ? (
                        <ShareMissionButton
                          mission={mission}
                          onComplete={(pts) => handleMissionComplete(mission.id, pts)}
                        />
                      ) : (
                        <Link
                          href={`/missions/${mission.id}`}
                          className="mission-cta"
                          style={{ borderColor: mission.color, color: mission.color }}
                        >
                          Start →
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
