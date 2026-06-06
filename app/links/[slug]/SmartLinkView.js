'use client'

import { useEffect, useState } from 'react'

function PresaveForm({ link, dark, text, subColor, cardBg, border }) {
  const [email,     setEmail]     = useState('')
  const [name,      setName]      = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError(null)
    const res = await fetch('/api/links/presave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: link.slug, email: email.trim(), name: name.trim() }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '32px 24px', textAlign: 'center', maxWidth: 480, width: '100%', margin: '0 20px' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔴</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: text, marginBottom: 8 }}>You're in.</div>
        <div style={{ fontSize: 14, color: subColor }}>We'll hit you when it drops.</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 480, padding: '0 20px' }}>
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '28px 24px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: text, marginBottom: 4 }}>Get notified when it drops</div>
        <div style={{ fontSize: 12, color: subColor, marginBottom: 20 }}>Drop your email and we'll hit you the moment it's live.</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="text" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${border}`, background: dark ? '#0a0a0a' : '#f0ede8', color: text, fontSize: 14, outline: 'none' }}
          />
          <input
            type="email" placeholder="Your email *" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${border}`, background: dark ? '#0a0a0a' : '#f0ede8', color: text, fontSize: 14, outline: 'none' }}
          />
          {error && <div style={{ fontSize: 12, color: '#c4222e' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ padding: '14px', background: '#c4222e', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Saving...' : 'Pre-Save →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SmartLinkView({ link, destinations }) {
  const dark = link.theme !== 'light'

  const bg      = dark ? '#050505' : '#f5f0eb'
  const text     = dark ? '#f5f0eb' : '#111'
  const subColor = dark ? '#8a8078' : '#666'
  const cardBg   = dark ? '#0f0f0f' : '#fff'
  const border   = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'

  useEffect(() => {
    // Track view with referrer
    fetch('/api/links/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: link.slug, type: 'view', referrer: document.referrer || null }),
    }).catch(() => {})
  }, [link.slug])

  const handleClick = (dest) => {
    fetch('/api/links/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: link.slug, type: 'click', platform: dest.platform }),
    }).catch(() => {})
    window.open(dest.url, '_blank', 'noopener')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      padding: '0 0 60px',
    }}>
      {/* Cover Art - full width blurred header */}
      <div style={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 40,
        marginBottom: -20,
      }}>
        {link.cover_art_url ? (
          <>
            {/* Blurred background */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${link.cover_art_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(40px) brightness(0.3)',
              transform: 'scale(1.1)',
            }} />
            {/* Cover art square */}
            <div style={{ position: 'relative', paddingTop: 60 }}>
              <img
                src={link.cover_art_url}
                alt={link.title}
                style={{
                  width: 220,
                  height: 220,
                  objectFit: 'cover',
                  borderRadius: 16,
                  boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
                  display: 'block',
                }}
              />
            </div>
          </>
        ) : (
          <div style={{
            width: 220, height: 220, borderRadius: 16,
            background: dark ? '#1a1a1a' : '#eee',
            marginTop: 60,
            position: 'relative',
          }} />
        )}
      </div>

      {/* Info */}
      <div style={{
        position: 'relative',
        textAlign: 'center',
        padding: '32px 24px 24px',
        width: '100%',
        maxWidth: 480,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: subColor,
          marginBottom: 10,
        }}>
          <span style={{
            width: 6, height: 6, background: '#c4222e',
            borderRadius: '50%', display: 'inline-block',
          }} />
          {link.artist}
        </div>

        <h1 style={{
          fontSize: 30,
          fontWeight: 900,
          letterSpacing: -1.2,
          color: text,
          margin: '0 0 8px',
          lineHeight: 1.1,
        }}>
          {link.title}
        </h1>

        {link.subtext && (
          <p style={{
            fontSize: 14,
            color: subColor,
            margin: '0 0 32px',
            lineHeight: 1.6,
          }}>
            {link.subtext}
          </p>
        )}
      </div>

      {/* Presave form (presave + funnel types) */}
      {(link.type === 'presave' || link.type === 'funnel') && (
        <PresaveForm link={link} dark={dark} text={text} subColor={subColor} cardBg={cardBg} border={border} />
      )}

      {/* Platform buttons (streaming type, or presave with destinations) */}
      {(link.type === 'streaming' || (destinations.length > 0 && link.type !== 'funnel')) && (
        <div style={{
          width: '100%',
          maxWidth: 480,
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: link.type === 'presave' ? 16 : 0,
        }}>
          {destinations.map((dest) => {
            const { meta } = dest
            return (
              <button
                key={dest.id}
                onClick={() => handleClick(dest)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '14px 20px',
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  transition: 'transform 0.12s, opacity 0.12s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = meta?.color ?? '#c4222e' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = border }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36,
                    background: meta?.bg ?? '#1a1a1a',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                    dangerouslySetInnerHTML={{ __html: `<svg style="width:20px;height:20px" viewBox="0 0 24 24" fill="${meta?.text ?? '#fff'}">${meta?.icon?.match(/<path[^>]*>/g)?.[0] ?? ''}</svg>` }}
                  />
                  <span style={{ fontSize: 15, fontWeight: 600, color: text, letterSpacing: -0.3 }}>
                    {meta?.label ?? dest.platform}
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={subColor} strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 48,
        fontSize: 11,
        color: dark ? '#333' : '#bbb',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        textAlign: 'center',
      }}>
        Algee Smith · Direct to Fan
      </div>
    </div>
  )
}
