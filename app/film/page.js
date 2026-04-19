import Image from 'next/image'
import Link from 'next/link'
import { PROJECTS } from '../data/film'
import FilmCardStack from '../components/FilmCardStack'

export const metadata = {
  title:       'Film — Algee Smith',
  description: 'Acting credits, screen roles, and upcoming projects from Algee Smith.',
}

export default function FilmPage() {
  const featured   = PROJECTS[0]
  const rest       = PROJECTS.slice(1)

  return (
    <div className="film-page">

      {/* ─── Page Hero ─── */}
      <div className="page-hero">
        <div className="page-hero-label">Filmography</div>
        <h1>
          On <span className="italic">Screen.</span>
        </h1>
        <p className="page-hero-sub">
          Actor. Storyteller. Two stages, one soul.
          From BET to HBO to the big screen.
        </p>
      </div>

      {/* ─── Featured / Upcoming ─── */}
      <div className="film-featured-section">
        <div className="film-featured reveal">
          <div className="film-featured-cover">
            <Image
              src={featured.cover}
              alt={featured.title}
              width={600}
              height={800}
              priority
            />
            {featured.status === 'upcoming' && (
              <div className="film-status-badge">Upcoming</div>
            )}
          </div>
          <div className="film-featured-info">
            <div className="film-meta-row">
              <span className="film-tag">{featured.type}</span>
              <span className="film-year">{featured.year}</span>
            </div>
            <div className="film-featured-title">{featured.title}</div>
            <div className="film-featured-role">as {featured.role}</div>
            <p className="film-featured-logline">{featured.logline}</p>

            {featured.watchLinks ? (
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
            ) : (
              <div className="film-studio">{featured.studio}</div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Credits Stack ─── */}
      <div className="film-stack-section">
        <div className="film-grid-header">
          <span className="film-grid-label">All Credits</span>
          <div className="film-grid-line" />
        </div>

        <FilmCardStack
          items={PROJECTS.map((p) => ({ ...p, imageSrc: p.cover }))}
          cardWidth={220}
          cardHeight={330}
          maxVisible={5}
          spreadDeg={30}
          overlap={0.42}
          autoAdvance={false}
          loop
          showDots
        />
      </div>

    </div>
  )
}
