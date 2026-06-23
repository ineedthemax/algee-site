'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import FilmTrailerModal from './FilmTrailerModal'

export default function FilmGrid({ projects, selectedId, onSelect }) {
  const [activeTrailer, setActiveTrailer] = useState(null)
  const [activeScene,   setActiveScene]   = useState(null)
  const [tappedId,      setTappedId]      = useState(null)

  const handleTap = (film) => {
    if (onSelect) {
      // In selectable mode: click = feature this film (no overlay toggle)
      onSelect(film)
    } else {
      // Standalone mode: toggle overlay on mobile
      setTappedId(prev => prev === film.id ? null : film.id)
    }
  }

  return (
    <>
      <div className="filmgrid-wrap">
        {projects.map((film, i) => {
          const tapped    = tappedId === film.id
          const isSelected = selectedId === film.id
          return (
            <motion.div
              key={film.id}
              className={`filmgrid-card${tapped ? ' tapped' : ''}${isSelected ? ' filmgrid-card--selected' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -60px 0px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              onClick={() => handleTap(film)}
            >
              {/* Cover */}
              <div className="filmgrid-cover">
                <Image
                  src={film.cover}
                  alt={film.title}
                  fill
                  sizes="(max-width: 600px) 45vw, (max-width: 900px) 30vw, 22vw"
                  className="filmgrid-img"
                />

                {/* Overlay - hover on desktop, tap on mobile */}
                <div className="filmgrid-overlay">
                  <div className="filmgrid-overlay-content">
                    <div className="filmgrid-overlay-type">{film.type} · {film.year}</div>
                    <div className="filmgrid-overlay-title">{film.title}</div>
                    <div className="filmgrid-overlay-role">as {film.role}</div>
                    {film.quote && (
                      <div className="filmgrid-overlay-quote">&ldquo;{film.quote}&rdquo;</div>
                    )}
                    <div className="filmgrid-overlay-actions">
                      {film.trailerYT && (
                        <button
                          className="filmgrid-trailer-btn"
                          onClick={(e) => { e.stopPropagation(); setActiveTrailer(film) }}
                        >
                          ▶ Trailer
                        </button>
                      )}
                      {film.sceneUrl && (
                        <button
                          className="filmgrid-scene-btn"
                          onClick={(e) => { e.stopPropagation(); setActiveScene(film) }}
                        >
                          ◈ Watch Scene
                        </button>
                      )}
                      {film.watchLinks?.length > 0 && (
                        <a
                          href={film.watchLinks[0].href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="filmgrid-watch-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Stream on {film.watchLinks[0].label}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile tap hint - visible until first tap */}
                <div className="filmgrid-tap-hint" aria-hidden="true">tap</div>
              </div>

              {/* Card footer */}
              <div className="filmgrid-footer">
                <div className="filmgrid-footer-title">{film.title}</div>
                <div className="filmgrid-footer-meta">{film.type} · {film.year}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Trailer modal */}
      {activeTrailer && (
        <FilmTrailerModal
          film={activeTrailer}
          mode="trailer"
          onClose={() => setActiveTrailer(null)}
        />
      )}

      {/* Scene modal */}
      {activeScene && (
        <FilmTrailerModal
          film={activeScene}
          mode="scene"
          onClose={() => setActiveScene(null)}
        />
      )}
    </>
  )
}
