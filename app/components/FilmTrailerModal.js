'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FilmTrailerModal({ film, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!film) return null

  return (
    <AnimatePresence>
      <motion.div
        className="trailer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="trailer-modal"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="trailer-header">
            <div>
              <div className="trailer-label">{film.type} · {film.year}</div>
              <div className="trailer-film-title">{film.title}</div>
              <div className="trailer-role">as {film.role}</div>
            </div>
            <button className="trailer-close" onClick={onClose} aria-label="Close trailer">✕</button>
          </div>

          <div className="trailer-embed-wrap">
            <iframe
              src={`https://www.youtube.com/embed/${film.trailerYT}?autoplay=1&rel=0`}
              title={`${film.title} — Official Trailer`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="trailer-embed"
            />
          </div>

          {film.watchLinks?.length > 0 && (
            <div className="trailer-footer">
              <span className="trailer-stream-label">Stream Now</span>
              <div className="trailer-stream-links">
                {film.watchLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="trailer-stream-btn"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
