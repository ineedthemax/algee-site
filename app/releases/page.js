import { createAdminClient } from '../../lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Releases — Algee Smith',
  description: 'Exclusive access to Algee Smith releases.',
}

export const dynamic = 'force-dynamic'

export default async function ReleasesPage() {
  const admin = createAdminClient()
  const { data: releases } = await admin
    .from('releases')
    .select('*, release_tiers(*)')
    .eq('status', 'live')
    .order('release_date', { ascending: false })

  const list = releases ?? []

  return (
    <div className="releases-page">
      <div className="releases-inner">
        <div className="page-hero">
          <div className="page-hero-label">Direct Access</div>
          <h1>Releases. <span className="italic">Unlocked.</span></h1>
          <p className="page-hero-sub">
            Get closer to the music. Every release has tiers — pick yours and unlock what's inside.
          </p>
        </div>

        {list.length === 0 ? (
          <div className="releases-empty">Nothing live yet. Check back soon.</div>
        ) : (
          <div className="releases-grid">
            {list.map(r => {
              const tiers = r.release_tiers?.sort((a, b) => a.position - b.position) ?? []
              const lowestPrice = tiers.length > 0 ? Math.min(...tiers.map(t => Number(t.price))) : null
              return (
                <Link key={r.id} href={`/releases/${r.slug}`} className="releases-card">
                  <div className="releases-card-art">
                    {r.artwork_url
                      ? <img src={r.artwork_url} alt={r.title} className="releases-card-img" />
                      : <div className="releases-card-art-ph">◻</div>
                    }
                  </div>
                  <div className="releases-card-body">
                    <div className="releases-card-type">{r.type}</div>
                    <div className="releases-card-title">{r.title}</div>
                    <div className="releases-card-meta">
                      {tiers.length} tier{tiers.length !== 1 ? 's' : ''}
                      {lowestPrice !== null && ` · from $${lowestPrice === 0 ? 'Free' : lowestPrice}`}
                    </div>
                    <div className="releases-card-cta">View Access →</div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
