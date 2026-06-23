'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import FilmGrid from './FilmGrid'

export default function FilmPageClient({ projects }) {
  const [featured, setFeatured] = useState(projects[0])
  const featuredRef = useRef(null)

  const handleSelect = (film) => {
    if (film.id === featured.id) return
    setFeatured(film)
    setTimeout(() => {
      featuredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <>
      {/* ─── Featured Film ─── */}
      <div className="film-featured-section" ref={featuredRef}>
        {/* Full-bleed bg */}
        <div className="film-featured-bg" aria-hidden="true">
          <Image
            key={featured.id + '-bg'}
            src={featured.cover}
            alt=""
            fill
            sizes="100vw"
            className="film-featured-bg-img film-featured-bg-img--fade"
            priority
          />
          <div className="film-featured-bg-overlay" />
        </div>

        <div className="film-featured-inner">
          {/* Poster */}
          <div className="film-featured-poster">
            <Image
              key={featured.id + '-poster'}
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
            {featured.watchLinks?.length > 0 && (
              <div className="film-featured-badge">Now Streaming</div>
            )}
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
        <FilmGrid projects={projects} selectedId={featured.id} onSelect={handleSelect} />
      </div>
    </>
  )
}
