'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const CONTENT_ICONS = { video: '🎬', audio: '🎵', gallery: '🖼', document: '📄', event: '🎟', merch: '👕' }

function ContentItem({ item }) {
  return (
    <div className="rv-content-item">
      <span className="rv-content-icon">{CONTENT_ICONS[item.type] ?? '📦'}</span>
      <div className="rv-content-info">
        <div className="rv-content-title">{item.title}</div>
        {item.description && <div className="rv-content-desc">{item.description}</div>}
      </div>
      <div className="rv-content-locked">🔒</div>
    </div>
  )
}

function TierButton({ tier, releaseSlug, purchasedTierIds }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const price = Number(tier.price)
  const isPurchased = purchasedTierIds.includes(tier.id)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier_id: tier.id, release_slug: releaseSlug }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }

      if (data.free) {
        // Free tier granted — reload page
        window.location.reload()
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isPurchased) {
    return (
      <button className="rv-tier-btn rv-tier-btn-owned" disabled>
        ✓ Unlocked
      </button>
    )
  }

  return (
    <>
      <button
        className="rv-tier-btn"
        onClick={handleClick}
        disabled={loading}
      >
        {loading
          ? 'Loading…'
          : price === 0
            ? 'Get Free Access'
            : `Unlock for $${price.toFixed(0)}`}
      </button>
      {error && <div className="rv-tier-error">{error}</div>}
    </>
  )
}

export default function ReleaseView({ release, tiers, purchasedTierIds = [] }) {
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true)
      // Clean up URL
      window.history.replaceState({}, '', `/releases/${release.slug}`)
    }
  }, [searchParams, release.slug])

  const releaseDate = release.release_date
    ? new Date(release.release_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const tiersWithCumulative = tiers.map((tier, i) => ({
    ...tier,
    allContent: tiers.slice(0, i + 1).flatMap(t => t.tier_content ?? []),
  }))

  return (
    <div className="rv-page">
      <div className="rv-inner">

        {/* Back */}
        <Link href="/releases" className="rv-back">← All Releases</Link>

        {/* Success banner */}
        {showSuccess && (
          <div className="rv-success-banner">
            🎉 You're in! Your access has been unlocked.
          </div>
        )}

        {/* Hero */}
        <div className="rv-hero">
          {release.artwork_url && (
            <div className="rv-hero-art">
              <img src={release.artwork_url} alt={release.title} className="rv-hero-img" />
            </div>
          )}
          <div className="rv-hero-info">
            <div className="rv-hero-type">{release.type}</div>
            <h1 className="rv-hero-title">{release.title}</h1>
            {releaseDate && <div className="rv-hero-date">{releaseDate}</div>}
            {release.description && <p className="rv-hero-desc">{release.description}</p>}
          </div>
        </div>

        {/* Tiers */}
        {tiers.length === 0 ? (
          <div className="rv-no-tiers">Access tiers coming soon.</div>
        ) : (
          <>
            <div className="rv-tiers-label">Choose your access</div>
            <div className="rv-tiers-grid">
              {tiersWithCumulative.map((tier, i) => {
                const isTop = i === tiersWithCumulative.length - 1
                return (
                  <div key={tier.id} className={`rv-tier-card${isTop ? ' rv-tier-top' : ''}`}>
                    {isTop && <div className="rv-tier-badge">Most Access</div>}
                    <div className="rv-tier-name">{tier.name}</div>
                    <div className="rv-tier-price">
                      {Number(tier.price) === 0 ? 'Free' : `$${Number(tier.price).toFixed(0)}`}
                    </div>
                    {tier.description && <div className="rv-tier-desc">{tier.description}</div>}

                    <div className="rv-tier-includes">
                      <div className="rv-tier-includes-label">
                        {i === 0 ? "What's included:" : "Everything below + more:"}
                      </div>
                      {tier.allContent.length === 0 ? (
                        <div className="rv-content-empty">Content coming soon</div>
                      ) : (
                        tier.allContent.map(item => <ContentItem key={item.id} item={item} />)
                      )}
                    </div>

                    <TierButton
                      tier={tier}
                      releaseSlug={release.slug}
                      purchasedTierIds={purchasedTierIds}
                    />
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
