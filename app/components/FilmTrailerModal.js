'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// mode: 'trailer' = YouTube embed  |  'scene' = native MP4
export default function FilmTrailerModal({ film, mode = 'trailer', onClose }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Pause native video when modal closes
  useEffect(() => {
    return () => {
      if (videoRef.current) videoRef.current.pause()
    }
  }, [])

  if (!film) return null

  const isScene   = mode === 'scene'
  const heading   = isScene ? 'Algee\'s Scene' : 'Official Trailer'

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
          {/* Header */}
          <div className="trailer-header">
            <div>
              <div className="trailer-label">
                {film.type} · {film.year}
                <span className="trailer-mode-badge">{heading}</span>
              </div>
              <div className="trailer-film-title">{film.title}</div>
              <div className="trailer-role">as {film.role}</div>
            </div>
            <button className="trailer-close" onClick={onClose} aria-label="Close">✕</button>
          </div>

          {/* Video area */}
          <div className="trailer-embed-wrap">
            {isScene ? (
              /* Native MP4 player */
              <video
                ref={videoRef}
                className="trailer-embed trailer-native-video"
                src={film.sceneUrl}
                controls
                autoPlay
                playsInline
                preload="metadata"
              >
                Your browser does not support video playback.
              </video>
            ) : (
              /* YouTube embed */
              <iframe
                src={`https://www.youtube.com/embed/${film.trailerYT}?autoplay=1&rel=0`}
                title={`${film.title} - Official Trailer`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="trailer-embed"
              />
            )}
          </div>

          {/* Stream links */}
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
