'use client'

import { useState } from 'react'
import Link from 'next/link'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export default function BirthdayForm({ mission, alreadyDone }) {
  const [month, setMonth]       = useState('')
  const [day, setDay]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState(null)
  const [done, setDone]         = useState(alreadyDone)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!month || !day) return
    setSubmitting(true)
    setError(null)

    try {
      // Step 1: Save birthday to profile
      const profileRes = await fetch('/api/profile/update-birthday', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ month: Number(month), day: Number(day) }),
      })
      const profileJson = await profileRes.json()
      if (!profileRes.ok) throw new Error(profileJson.error ?? 'Failed to save birthday')

      // Step 2: Complete the mission
      const missionRes = await fetch('/api/missions/complete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ missionId: 'birthday' }),
      })
      const missionJson = await missionRes.json()
      if (!missionRes.ok) throw new Error(missionJson.error ?? 'Failed to complete mission')

      setDone(true)
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  // ── Done / already completed state ──
  if (done) {
    return (
      <div className="mform-page">
        <div className="mform-inner">
          <div className="mform-done">
            <div className="mform-done-icon">🎂</div>
            <h2 className="mform-done-title">
              {alreadyDone ? 'Already complete.' : 'Birthday saved!'}
            </h2>
            <p className="mform-done-sub">
              {alreadyDone
                ? `You already earned +${mission.points} points for this one.`
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

  // ── Form ──
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

        <h1 className="mform-title">When's your birthday?</h1>
        <p className="mform-desc">{mission.description}</p>

        {/* Form card */}
        <div className="mform-card">
          <form onSubmit={handleSubmit}>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {/* Month select */}
              <div style={{ flex: 2 }}>
                <label
                  htmlFor="bday-month"
                  style={{
                    display:      'block',
                    marginBottom: '8px',
                    fontSize:     '13px',
                    color:        'var(--muted)',
                    fontWeight:   600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Month
                </label>
                <select
                  id="bday-month"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  required
                  style={{
                    width:           '100%',
                    background:      'var(--bg)',
                    border:          '1px solid var(--border)',
                    borderRadius:    '8px',
                    color:           month ? 'var(--white)' : 'var(--muted)',
                    fontSize:        '15px',
                    padding:         '12px 14px',
                    outline:         'none',
                    appearance:      'none',
                    cursor:          'pointer',
                  }}
                >
                  <option value="" disabled>Month</option>
                  {MONTHS.map((name, i) => (
                    <option key={name} value={i + 1}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Day select */}
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="bday-day"
                  style={{
                    display:      'block',
                    marginBottom: '8px',
                    fontSize:     '13px',
                    color:        'var(--muted)',
                    fontWeight:   600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Day
                </label>
                <select
                  id="bday-day"
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  required
                  style={{
                    width:           '100%',
                    background:      'var(--bg)',
                    border:          '1px solid var(--border)',
                    borderRadius:    '8px',
                    color:           day ? 'var(--white)' : 'var(--muted)',
                    fontSize:        '15px',
                    padding:         '12px 14px',
                    outline:         'none',
                    appearance:      'none',
                    cursor:          'pointer',
                  }}
                >
                  <option value="" disabled>Day</option>
                  {DAYS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="mform-error">{error}</div>}

            <div className="mform-actions">
              <button
                type="submit"
                className="mform-btn-next"
                style={{
                  background: (month && day) ? mission.color : undefined,
                  width: '100%',
                }}
                disabled={submitting || !month || !day}
              >
                {submitting ? 'Saving...' : `Submit · +${mission.points} pts`}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}
