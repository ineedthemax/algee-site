'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PhoneForm({ mission, alreadyDone, existingPhone }) {
  const [phone,      setPhone]      = useState(existingPhone ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [done,       setDone]       = useState(alreadyDone)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return
    setSubmitting(true)
    setError(null)

    try {
      // Step 1: Save phone to profile
      const phoneRes = await fetch('/api/profile/update-phone', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone }),
      })
      const phoneJson = await phoneRes.json()
      if (!phoneRes.ok) throw new Error(phoneJson.error ?? 'Failed to save phone number')

      // Step 2: Complete the mission + award points
      const missionRes = await fetch('/api/missions/complete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ missionId: 'add-phone' }),
      })
      const missionJson = await missionRes.json()
      if (!missionRes.ok) throw new Error(missionJson.error ?? 'Failed to complete mission')

      setDone(true)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  // ── Already done state ──
  if (done) {
    return (
      <div className="mform-page">
        <div className="mform-inner">
          <div className="mform-done">
            <div className="mform-done-icon">📱</div>
            <h2 className="mform-done-title">
              {alreadyDone ? 'Already locked in.' : 'Number saved!'}
            </h2>
            <p className="mform-done-sub">
              {alreadyDone
                ? `You already earned +${mission.points} points for this one.`
                : `+${mission.points} points added. You'll get SMS updates direct from Algee.`}
            </p>
            <div className="mform-done-actions">
              <Link href="/missions" className="mform-done-btn">Back to Missions →</Link>
              <Link href="/account/dashboard" className="mform-done-btn-alt">View Dashboard →</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

        <h1 className="mform-title">Drop your number.</h1>
        <p className="mform-desc">{mission.description}</p>

        <div className="mform-card">
          <form onSubmit={handleSubmit}>

            <label
              htmlFor="phone-input"
              style={{
                display: 'block', marginBottom: '8px',
                fontSize: '13px', color: 'var(--muted)',
                fontWeight: 600, letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Phone Number
            </label>

            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
                autoComplete="tel"
                style={{
                  width:        '100%',
                  background:   'var(--bg)',
                  border:       '1px solid var(--border)',
                  borderRadius: '8px',
                  color:        'var(--white)',
                  fontSize:     '18px',
                  padding:      '14px 16px',
                  outline:      'none',
                  letterSpacing: '0.5px',
                  boxSizing:    'border-box',
                }}
              />
            </div>

            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.6 }}>
              Your number is private and only used for Algee Smith updates. You can opt out any time.
            </p>

            {error && <div className="mform-error">{error}</div>}

            <div className="mform-actions">
              <button
                type="submit"
                className="mform-btn-next"
                style={{
                  background: phone.trim().length >= 7 ? mission.color : undefined,
                  width: '100%',
                }}
                disabled={submitting || phone.trim().length < 7}
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
