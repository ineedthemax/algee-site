'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FilmGrid from './FilmGrid'

export default function FilmPageClient({ projects }) {
  const [featured, setFeatured] = useState(projects[0])
  const featuredRef = useRef(null)

  const handleSelect = (film) => {
    setFeatured(film)
    featuredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* ─── Featured Film ─── */}
      <div className="film-featured-section" ref={featuredRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={featured.id}
            className="film-featured-bg"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={featured.cover}
              alt=""
              fill
              sizes="100vw"
              className="film-featured-bg-img"
              priority
            />
            <div className="film-featured-bg-overlay" />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={featured.id}
            className="film-featured-inner"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
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
          </motion.div>
        </AnimatePresence>
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
