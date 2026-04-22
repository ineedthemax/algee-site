'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FanProfileForm({ mission, userId, existing }) {
  const router = useRouter()
  const alreadyDone = !!existing

  // Pre-fill if already completed
  const [answers, setAnswers] = useState(() => {
    const init = {}
    mission.questions.forEach(q => {
      init[q.id] = existing?.metadata?.[q.id] ?? ''
    })
    return init
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)
  const [step, setStep]             = useState(0)   // which question we're on
  const [done, setDone]             = useState(alreadyDone)

  const current   = mission.questions[step]
  const isLast    = step === mission.questions.length - 1
  const progress  = Math.round(((step + 1) / mission.questions.length) * 100)

  const handleNext = () => {
    if (!answers[current.id]?.trim()) return // require answer
    if (isLast) {
      handleSubmit()
    } else {
      setStep(s => s + 1)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && current.type !== 'textarea') handleNext()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/missions/complete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ missionId: mission.id, answers }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong')
      setDone(true)
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  // ── Done state ──
  if (done) {
    return (
      <div className="mform-page">
        <div className="mform-inner">
          <div className="mform-done">
            <div className="mform-done-icon">✦</div>
            <h2 className="mform-done-title">
              {alreadyDone ? 'Already complete.' : 'Mission complete.'}
            </h2>
            <p className="mform-done-sub">
              {alreadyDone
                ? 'You already filled this one out.'
                : `+${mission.points} points added to your account.`}
            </p>
            <div className="mform-done-actions">
              <Link href="/missions" className="mform-done-btn">
                Back to Missions →
              </Link>
              <Link href="/account/dashboard" className="mform-done-btn-alt">
                View Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Question form ──
  return (
    <div className="mform-page">
      <div className="mform-inner">

        {/* Header */}
        <div className="mform-header">
          <Link href="/missions" className="mform-back">← Missions</Link>
          <div className="mform-mission-tag" style={{ color: mission.color }}>
            {mission.icon} {mission.category}
          </div>
        </div>

        <h1 className="mform-title">{mission.title}</h1>
        <p className="mform-desc">{mission.description}</p>

        {/* Progress bar */}
        <div className="mform-progress">
          <div className="mform-progress-track">
            <div
              className="mform-progress-fill"
              style={{ width: `${progress}%`, background: mission.color }}
            />
          </div>
          <span className="mform-progress-label">
            {step + 1} of {mission.questions.length}
          </span>
        </div>

        {/* Question card */}
        <div className="mform-card">
          <label className="mform-question-label">
            {current.label}
          </label>

          {current.type === 'textarea' ? (
            <textarea
              className="mform-textarea"
              value={answers[current.id]}
              onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
              placeholder={current.placeholder}
              rows={4}
              autoFocus
            />
          ) : (
            <input
              className="mform-input"
              type="text"
              value={answers[current.id]}
              onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
              placeholder={current.placeholder}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          )}

          {error && <div className="mform-error">{error}</div>}

          <div className="mform-actions">
            {step > 0 && (
              <button
                className="mform-btn-back"
                onClick={() => setStep(s => s - 1)}
                disabled={submitting}
              >
                ← Back
              </button>
            )}
            <button
              className="mform-btn-next"
              style={{ background: answers[current.id]?.trim() ? mission.color : undefined }}
              onClick={handleNext}
              disabled={submitting || !answers[current.id]?.trim()}
            >
              {submitting ? 'Saving...' : isLast ? `Submit · +${mission.points} pts` : 'Next →'}
            </button>
          </div>
        </div>

        {/* Dots navigation */}
        <div className="mform-dots">
          {mission.questions.map((_, i) => (
            <div
              key={i}
              className={`mform-dot${i === step ? ' mform-dot-active' : ''}${answers[mission.questions[i].id]?.trim() ? ' mform-dot-filled' : ''}`}
              style={i === step ? { background: mission.color } : {}}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
