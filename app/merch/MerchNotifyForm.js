'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'

export default function MerchNotifyForm() {
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase
      .from('merch_notify')
      .insert({ email: email.trim(), phone: phone.trim() || null })

    setLoading(false)
    if (err && err.code !== '23505') {
      setError('Something went wrong. Try again.')
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="merch-notify-success">
        ✓ You&apos;re on the list.
      </div>
    )
  }

  return (
    <>
      <form className="merch-notify-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email"
          className="merch-notify-input"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="tel"
          placeholder="Phone — text me when it drops"
          className="merch-notify-input merch-notify-phone"
          aria-label="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="merch-notify-btn" disabled={loading}>
          {loading ? '...' : 'Notify Me'}
        </button>
      </form>
      {error && <div style={{ fontSize: 12, color: 'var(--red-bright)', marginTop: 8 }}>{error}</div>}
    </>
  )
}
