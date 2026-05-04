import Image from 'next/image'
import { PROJECTS } from '../data/film'
import FilmGrid from '../components/FilmGrid'
import SchemaMarkup from '../components/SchemaMarkup'

export const metadata = {
  title:       'Film & TV — Algee Smith | Acting Credits',
  description: 'Full filmography of Algee Smith — including The Hate U Give, Euphoria (HBO), Detroit, Judas and the Black Messiah, The New Edition Story, and more.',
  openGraph: {
    title: 'Algee Smith — Film & TV Credits',
    description: 'Acting credits from The Hate U Give, Euphoria, Detroit, Judas and the Black Messiah, and more.',
    images: ['/images/film/hate-u-give.webp'],
  },
}

const filmographySchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Algee Smith Filmography',
  description: 'Film and television credits for actor Algee Smith.',
  itemListElement: PROJECTS.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': p.type?.includes('Series') || p.type?.includes('Miniseries') ? 'TVSeries' : 'Movie',
      name: p.title,
      datePublished: p.year,
      description: p.logline,
      actor: { '@type': 'Person', name: 'Algee Smith' },
      ...(p.studio && { productionCompany: { '@type': 'Organization', name: p.studio } }),
    },
  })),
}

const STATS = [
  { value: `${PROJECTS.length}+`, label: 'Credits' },
  { value: '5',                   label: 'Major Studios' },
  { value: '6+',                  label: 'Streaming Platforms' },
  { value: '2017',                label: 'Debut Year' },
]

export default function FilmPage() {
  const featured = PROJECTS[0]

  return (
    <div className="film-page">
      <SchemaMarkup schema={filmographySchema} />

      {/* ─── Page Hero ─── */}
      <div className="page-hero">
        <div className="page-hero-label">Filmography</div>
        <h1>On <span className="italic">Screen.</span></h1>
        <p className="page-hero-sub">
          Actor. Storyteller. Two stages, one soul.
          From BET to HBO to the big screen.
        </p>
      </div>

      {/* ─── Stats Strip ─── */}
      <div className="film-stats-strip">
        {STATS.map((s) => (
          <div key={s.label} className="film-stat">
            <div className="film-stat-value">{s.value}</div>
            <div className="film-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Featured Film ─── */}
      <div className="film-featured-section">

        {/* Full-bleed bg from cover */}
        <div className="film-featured-bg" aria-hidden="true">
          <Image
            src={featured.cover}
            alt=""
            fill
            sizes="100vw"
            className="film-featured-bg-img"
            priority
          />
          <div className="film-featured-bg-overlay" />
        </div>

        <div className="film-featured-inner">
          {/* Poster */}
          <div className="film-featured-poster">
            <Image
              src={featured.cover}
              alt={featured.title}
              fill
              sizes="(max-width: 900px) 60vw, 320px"
              className="film-featured-poster-img"
              priority
            />
          </div>

          {/* Info */}
          <div className="film-featured-info">
            <div className="film-featured-badge">Now Streaming</div>
            <div className="film-meta-row">
              <span className="film-tag">{featured.type}</span>
              <span className="film-year">{featured.year}</span>
            </div>
            <div className="film-featured-title">{featured.title}</div>
            <div className="film-featured-role">as <em>{featured.role}</em></div>
            <p className="film-featured-logline">{featured.logline}</p>

            {featured.watchLinks?.length > 0 && (
              <div className="film-watch-links">
                <div className="film-watch-label">Stream Now</div>
                <div className="film-watch-grid">
                  {featured.watchLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="film-watch-btn"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── All Credits Grid ─── */}
      <div className="film-grid-section">
        <div className="film-grid-header">
          <span className="film-grid-label">All Credits</span>
          <div className="film-grid-line" />
        </div>

        <FilmGrid projects={PROJECTS} />
      </div>

    </div>
  )
}
