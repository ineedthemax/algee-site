'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error('[admin] page error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      gap: 16, padding: 32, fontFamily: 'sans-serif', color: '#f5f0eb',
    }}>
      <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#c4222e' }}>Admin Error</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Dashboard failed to load</h1>
      <pre style={{
        background: '#111', border: '1px solid #222', borderRadius: 8,
        padding: '12px 16px', fontSize: 12, color: '#f88', maxWidth: 560, whiteSpace: 'pre-wrap',
      }}>
        {error?.message ?? 'Unknown error'}
      </pre>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={reset}
          style={{
            background: '#c4222e', color: '#fff', border: 'none', borderRadius: 6,
            padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          Try again
        </button>
        <Link href="/" style={{ color: '#888', fontSize: 13, lineHeight: '38px' }}>← Back to site</Link>
      </div>
    </div>
  )
}
