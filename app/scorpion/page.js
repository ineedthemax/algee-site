'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'

export default function ScorpionPage() {
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  const handleNotify = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase
      .from('scorpion_notify')
      .insert({ email: email.trim() })

    setLoading(false)
    if (err && err.code !== '23505') { // ignore duplicate
      setError('Something went wrong. Try again.')
    } else {
      setSubmitted(true)
    }
  }

  return (
    <div className="scorpion-page">

      {/* Background glow */}
      <div className="scorpion-glow" aria-hidden="true" />

      <div className="scorpion-inner">

        {/* Label */}
        <div className="scorpion-eyebrow">
          <span className="scorpion-eyebrow-line" />
          New Project
          <span className="scorpion-eyebrow-line" />
        </div>

        {/* Title */}
        <h1 className="scorpion-title">
          Scorpion<br />
          <span className="italic">in Me</span>
        </h1>

        {/* Tagline */}
        <p className="scorpion-tagline">
          The next chapter. Coming soon.
        </p>

        {/* Lock badge */}
        <div className="scorpion-lock-badge">
          <span>🔒</span>
          Inner Circle gets first listen
        </div>

        {/* Bundle offer */}
        <div className="scorpion-bundle-card reveal">
          <div className="scorpion-bundle-label">The Bundle — $34.99</div>
          <h3 className="scorpion-bundle-title">Get everything.</h3>
          <ul className="scorpion-bundle-list">
            <li><span className="tier-check">✓</span> Scorpion in Me — early digital download</li>
            <li><span className="tier-check">✓</span> Love Lost Collection shirt</li>
            <li><span className="tier-check">✓</span> Signed digital poster</li>
            <li><span className="tier-check">✓</span> 3 months Inner Circle membership</li>
          </ul>
          <Link href="/join" className="scorpion-bundle-btn">
            View All Access Tiers →
          </Link>
        </div>

        {/* Notify form */}
        <div className="scorpion-notify-wrap reveal">
          <div className="scorpion-notify-label">
            Not ready to commit? Get notified when it drops.
          </div>

          {submitted ? (
            <div className="scorpion-notify-success">
              <span>✦</span> You&apos;re on the early access list.
            </div>
          ) : (
            <form className="scorpion-notify-form" onSubmit={handleNotify}>
              <input
                type="email"
                className="scorpion-notify-input"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="submit"
                className="scorpion-notify-btn"
                disabled={loading || !email.trim()}
              >
                {loading ? '...' : 'Notify Me'}
              </button>
            </form>
          )}

          {error && <div className="account-error">{error}</div>}
        </div>

      </div>

      {/* Ghost watermark */}
      <div className="scorpion-bg-text" aria-hidden="true">SCORPION</div>

    </div>
  )
}
