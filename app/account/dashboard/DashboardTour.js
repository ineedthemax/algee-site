'use client'

import { useState, useEffect } from 'react'

const STEPS = [
  {
    target:  null, // centered intro card
    icon:    '◈',
    title:   'Welcome to your dashboard.',
    body:    'This is your home base. Let\'s take 30 seconds to show you around.',
    position: 'center',
  },
  {
    target:  '.fd-card-identity',
    icon:    '✦',
    title:   'Your fan card.',
    body:    'This is you. Your name, tier, and how long you\'ve been part of the world. It levels up as you earn points.',
    position: 'right',
  },
  {
    target:  '.fd-card-points',
    icon:    '★',
    title:   'Your points.',
    body:    'Every action earns points - streaming, missions, sharing, buying merch. Points are how you level up.',
    position: 'right',
  },
  {
    target:  '.fd-card-rank',
    icon:    '◎',
    title:   'Your fan rank.',
    body:    'See where you stand among all fans. The more points you earn, the higher you climb on the leaderboard.',
    position: 'left',
  },
  {
    target:  '.fd-card-progress',
    icon:    '→',
    title:   'Your progress.',
    body:    'This tracks how close you are to the next tier. Day One → Rider → Legend. Each tier unlocks more.',
    position: 'left',
  },
  {
    target:  '.fd-card-earn',
    icon:    '⚡',
    title:   'Earn points fast.',
    body:    'Follow on Spotify, share the album, stream music - every action here drops points straight into your account.',
    position: 'right',
  },
  {
    target:  '.fd-links-grid',
    icon:    '★',
    title:   'Explore the world.',
    body:    'Music, the Fan Wall, Missions, Merch - it\'s all here. Missions are the biggest point earners - start there.',
    position: 'top',
  },
]

export default function DashboardTour({ isNew }) {
  const [step,    setStep]    = useState(0)
  const [visible, setVisible] = useState(false)
  const [pos,     setPos]     = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })

  // Show tour automatically for non-new fans who haven't seen it
  useEffect(() => {
    if (isNew) return // welcome overlay takes priority
    try {
      const done = localStorage.getItem('algee_tour_done')
      if (!done) setVisible(true)
    } catch {}
  }, [isNew])

  // Position tooltip next to the target element
  useEffect(() => {
    if (!visible) return
    const current = STEPS[step]
    if (!current.target) {
      setPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
      return
    }

    const el = document.querySelector(current.target)
    if (!el) {
      setPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
      return
    }

    const rect = el.getBoundingClientRect()
    const gap  = 16

    // Scroll element into view smoothly
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Position tooltip based on preferred side
    if (current.position === 'right') {
      setPos({
        top:       rect.top + window.scrollY + rect.height / 2,
        left:      rect.right + window.scrollX + gap,
        transform: 'translateY(-50%)',
      })
    } else if (current.position === 'left') {
      setPos({
        top:       rect.top + window.scrollY + rect.height / 2,
        left:      rect.left + window.scrollX - gap,
        transform: 'translate(-100%, -50%)',
      })
    } else if (current.position === 'top') {
      setPos({
        top:       rect.top + window.scrollY - gap,
        left:      rect.left + window.scrollX + rect.width / 2,
        transform: 'translate(-50%, -100%)',
      })
    } else {
      setPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
    }
  }, [step, visible])

  const dismiss = () => {
    try { localStorage.setItem('algee_tour_done', '1') } catch {}
    setVisible(false)
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else dismiss()
  }

  const prev = () => { if (step > 0) setStep(s => s - 1) }

  if (!visible) return null

  const current  = STEPS[step]
  const isLast   = step === STEPS.length - 1
  const isCenter = current.position === 'center'

  return (
    <>
      {/* Dim overlay */}
      <div className="tour-backdrop" onClick={dismiss} />

      {/* Tooltip card */}
      <div
        className={`tour-card${isCenter ? ' tour-card-center' : ''}`}
        style={isCenter ? {} : { top: pos.top, left: pos.left, transform: pos.transform }}
      >
        {/* Progress dots */}
        <div className="tour-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`tour-dot${i === step ? ' tour-dot-active' : ''}`} />
          ))}
        </div>

        {/* Content */}
        <div className="tour-icon">{current.icon}</div>
        <div className="tour-title">{current.title}</div>
        <div className="tour-body">{current.body}</div>

        {/* Controls */}
        <div className="tour-controls">
          <button className="tour-skip" onClick={dismiss}>Skip tour</button>
          <div className="tour-nav">
            {step > 0 && (
              <button className="tour-prev" onClick={prev}>← Back</button>
            )}
            <button className="tour-next" onClick={next}>
              {isLast ? 'Done ✓' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
