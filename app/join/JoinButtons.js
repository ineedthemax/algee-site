'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinCheckoutBtn({ plan, children, className }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/checkout/fan-tier', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mode: 'plan', plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Not signed in → redirect to account first
        if (res.status === 401) { router.push('/account?redirect=/join'); return }
        throw new Error(data.error ?? 'Something went wrong')
      }
      window.location.href = data.url
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <button className={className} onClick={handleClick} disabled={loading}>
        {loading ? 'Redirecting...' : children}
      </button>
      {error && <div style={{ fontSize: 12, color: '#f55', marginTop: 6, textAlign: 'center' }}>{error}</div>}
    </div>
  )
}
