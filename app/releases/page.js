import { createAdminClient } from '../../lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import { CountdownBanner } from '../components/CountdownTimer'
import TeaserCard from './TeaserCard'

export const metadata = {
  title: 'Releases - Algee Smith',
  description: 'Exclusive access to Algee Smith releases.',
}

export const dynamic = 'force-dynamic'

export default async function ReleasesPage() {
  const admin = createAdminClient()

  const [{ data: releases }, { data: teasers }] = await Promise.all([
    admin
      .from('releases')
      .select('*, release_tiers(*)')
      .eq('status', 'live')
      .order('release_date', { ascending: false }),
    admin
      .from('releases')
      .select('id, slug, title, type, artwork_url, release_date')
      .eq('status', 'coming-soon')
      .order('release_date', { ascending: true }),
  ])

  const list        = releases ?? []
  const teaserList  = teasers  ?? []
  const [featured, ...rest] = list

  return (
    <div className="releases-page">
      <div className="releases-inner">

        {/* ─── Page Hero ─── */}
        <div className="page-hero">
          <div className="page-hero-label">Direct Access</div>
          <h1>Releases. <span className="italic">Unlocked.</span></h1>
          <p className="page-hero-sub">
            Get closer to the music. Every release has tiers - pick yours and unlock what&apos;s inside.
          </p>
        </div>

        {/* ─── Countdown Banner ─── */}
        <CountdownBanner />

        {/* ─── Coming Soon Teasers ─── */}
        {(teaserList.length > 0 || true) && (
          <div className="releases-teaser-section">
            <div className="releases-grid-label">Coming Soon</div>
            <div className="releases-grid">
              {/* OTW — standalone landing page */}
              <TeaserCard
                release={{
                  id:          'otw',
                  slug:        'otw',
                  href:        '/otw',
                  title:       'OTW (On The Way)',
                  type:        'Single',
                  artwork_url: '/images/otw-cover.jpg',
                  release_date: '2026-07-07',
                }}
              />
              {teaserList.map(r => (
                <TeaserCard key={r.id} release={r} />
              ))}
            </div>
          </div>
        )}

        {list.length === 0 ? (
          <div className="releases-empty">Nothing live yet. Check back soon.</div>
        ) : (
          <>
            {/* ─── Featured Release ─── */}
            {featured && (() => {
              const tiers = featured.release_tiers?.sort((a, b) => a.position - b.position) ?? []
              const lowestPrice = tiers.length > 0 ? Math.min(...tiers.map(t => Number(t.price))) : null
              return (
                <Link href={`/releases/${featured.slug}`} className="releases-featured">
                  {/* Artwork */}
                  <div className="releases-featured-art">
                    {featured.artwork_url
                      ? <img src={featured.artwork_url} alt={featured.title} className="releases-featured-img" />
                      : <div className="releases-featured-art-ph">◻</div>
                    }
                    <div className="releases-featured-overlay" />
                  </div>

                  {/* Content */}
                  <div className="releases-featured-body">
                    <div className="releases-featured-badge">Featured Drop</div>
                    <div className="releases-featured-type">{featured.type}</div>
                    <div className="releases-featured-title">{featured.title}</div>
                    {featured.description && (
                      <div className="releases-featured-desc">{featured.description}</div>
                    )}
                    <div className="releases-featured-meta">
                      {tiers.length} tier{tiers.length !== 1 ? 's' : ''}
                      {lowestPrice !== null && (
                        <span> · from <strong>{lowestPrice === 0 ? 'Free' : `$${lowestPrice}`}</strong></span>
                      )}
                    </div>
                    <div className="releases-featured-cta">
                      Unlock Access <span>→</span>
                    </div>
                  </div>
                </Link>
              )
            })()}

            {/* ─── Rest of releases grid ─── */}
            {rest.length > 0 && (
              <>
                <div className="releases-grid-label">All Releases</div>
                <div className="releases-grid">
                  {rest.map(r => {
                    const tiers = r.release_tiers?.sort((a, b) => a.position - b.position) ?? []
                    const lowestPrice = tiers.length > 0 ? Math.min(...tiers.map(t => Number(t.price))) : null
                    return (
                      <Link key={r.id} href={`/releases/${r.slug}`} className="releases-card">
                        <div className="releases-card-art">
                          {r.artwork_url
                            ? <img src={r.artwork_url} alt={r.title} className="releases-card-img" />
                            : <div className="releases-card-art-ph">◻</div>
                          }
                          <div className="releases-card-art-overlay" />
                        </div>
                        <div className="releases-card-body">
                          <div className="releases-card-type">{r.type}</div>
                          <div className="releases-card-title">{r.title}</div>
                          <div className="releases-card-meta">
                            {tiers.length} tier{tiers.length !== 1 ? 's' : ''}
                            {lowestPrice !== null && ` · from ${lowestPrice === 0 ? 'Free' : `$${lowestPrice}`}`}
                          </div>
                          <div className="releases-card-cta">View Access →</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
