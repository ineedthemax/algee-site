'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

function AccountForm() {
  const [email,   setEmail]   = useState('')
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('error')) {
      setError('That link has expired. Enter your email to get a new one.')
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()

    // Send magic link
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/account/callback`,
        // Pass phone through so we can save it after they verify
        data: { phone: phone.trim() || null },
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
      <div className="account-sent">
        <div className="account-sent-icon">✦</div>
        <h2 className="account-sent-headline">Check your email.</h2>
        <p className="account-sent-sub">
          We sent a magic link to <strong>{email}</strong>.<br />
          Click it to enter the world.
        </p>
        <button
          className="account-resend"
          onClick={() => { setSent(false); setEmail(''); setPhone('') }}
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Social proof */}
      <div className="account-social-proof">
        <div className="account-proof-avatars">
          {['75','91','94','83','79'].map(n => (
            <img key={n} src={`https://randomuser.me/api/portraits/women/${n}.jpg`} alt="Fan" className="account-proof-avatar" />
          ))}
        </div>
        <span className="account-proof-text">Join 10K+ fans already in the world</span>
      </div>

      <h1 className="account-headline">
        Join the<br /><span className="italic">World.</span>
      </h1>
      <p className="account-sub">
        Get early access to drops, exclusive content, and direct updates from Algee.
      </p>

      <form className="account-form" onSubmit={handleSubmit}>
        <input
          className="account-input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          disabled={loading}
        />

        <div className="account-phone-wrap">
          <input
            className="account-input"
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
          <span className="account-phone-note">
            📲 Get texts first when drops go live. Standard rates apply.
          </span>
        </div>

        {error && <div className="account-error">{error}</div>}

        <button
          className="account-btn"
          type="submit"
          disabled={loading || !email.trim()}
        >
          {loading ? 'Sending...' : 'Get Access →'}
        </button>
      </form>

      <p className="account-note">
        Already a member? Same flow — just enter your email.
      </p>
    </>
  )
}

export default function AccountPage() {
  return (
    <div className="account-page">
      <div className="account-inner">
        <div className="account-glow" aria-hidden="true" />

        <div className="account-brand">
          <span className="account-brand-dot" />
          Algee Smith
        </div>

        <Suspense fallback={null}>
          <AccountForm />
        </Suspense>

        <a href="/admin/login" className="account-admin-link">Admin sign-in →</a>
      </div>

      <div className="account-bg-text" aria-hidden="true">ACCESS</div>
    </div>
  )
}
