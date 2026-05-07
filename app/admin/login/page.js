'use client'

import { useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

export default function AdminLoginPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/account/callback?next=/admin`,
      },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="adm-login-page">
        <div className="adm-login-box">
          <div className="adm-login-logo">
            <span className="adm-login-dot" />
            Algee Smith
          </div>
          <div className="adm-login-sent-icon">✓</div>
          <h2 className="adm-login-heading">Check your email</h2>
          <p className="adm-login-sub">
            Magic link sent to <strong>{email}</strong>.<br />
            Click it to access the admin panel.
          </p>
          <button
            className="adm-login-ghost"
            onClick={() => { setSent(false); setEmail('') }}
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="adm-login-page">
      <div className="adm-login-box">

        <div className="adm-login-logo">
          <span className="adm-login-dot" />
          Algee Smith
        </div>

        <div className="adm-login-badge">Admin Access</div>

        <h1 className="adm-login-heading">Sign in</h1>
        <p className="adm-login-sub">
          Enter your admin email. We&apos;ll send a magic link.
        </p>

        <form className="adm-login-form" onSubmit={handleSubmit}>
          <input
            className="adm-login-input"
            type="email"
            placeholder="admin@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            disabled={loading}
            autoComplete="email"
          />

          {error && <div className="adm-login-error">{error}</div>}

          <button
            className="adm-login-btn"
            type="submit"
            disabled={loading || !email.trim()}
          >
            {loading ? 'Sending...' : 'Send Magic Link →'}
          </button>
        </form>

        <a href="/account" className="adm-login-fan-link">
          Fan sign-in →
        </a>

      </div>

      <div className="adm-login-bg" aria-hidden="true" />
    </div>
  )
}
