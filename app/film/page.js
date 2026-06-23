import { PROJECTS } from '../data/film'
import FilmPageClient from '../components/FilmPageClient'
import SchemaMarkup from '../components/SchemaMarkup'

export const metadata = {
  title:       'Film & TV - Algee Smith | Acting Credits',
  description: 'Full filmography of Algee Smith - including The Hate U Give, Euphoria (HBO), Detroit, Judas and the Black Messiah, The New Edition Story, and more.',
  openGraph: {
    title: 'Algee Smith - Film & TV Credits',
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

      {/* ─── Featured + Grid (client, interactive) ─── */}
      <FilmPageClient projects={PROJECTS} />
    </div>
  )
}
