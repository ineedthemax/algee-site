'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import FilmTrailerModal from './FilmTrailerModal'

export default function FilmGrid({ projects }) {
  const [activeTrailer, setActiveTrailer] = useState(null)

  return (
    <>
      <div className="filmgrid-wrap">
        {projects.map((film, i) => (
          <motion.div
            key={film.id}
            className="filmgrid-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -60px 0px' }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
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

              {/* Hover overlay */}
              <div className="filmgrid-overlay">
                <div className="filmgrid-overlay-content">
                  <div className="filmgrid-overlay-type">{film.type} · {film.year}</div>
                  <div className="filmgrid-overlay-title">{film.title}</div>
                  <div className="filmgrid-overlay-role">as {film.role}</div>
                  {film.quote && (
                    <div className="filmgrid-overlay-quote">"{film.quote}"</div>
                  )}
                  <div className="filmgrid-overlay-actions">
                    {film.trailerYT && (
                      <button
                        className="filmgrid-trailer-btn"
                        onClick={() => setActiveTrailer(film)}
                      >
                        ▶ Watch Trailer
                      </button>
                    )}
                    {film.watchLinks?.length > 0 && (
                      <a
                        href={film.watchLinks[0].href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="filmgrid-watch-btn"
                      >
                        Stream on {film.watchLinks[0].label}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className="filmgrid-footer">
              <div className="filmgrid-footer-title">{film.title}</div>
              <div className="filmgrid-footer-meta">{film.type} · {film.year}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trailer modal */}
      {activeTrailer && (
        <FilmTrailerModal
          film={activeTrailer}
          onClose={() => setActiveTrailer(null)}
        />
      )}
    </>
  )
}
