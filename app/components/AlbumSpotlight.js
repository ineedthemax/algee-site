'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { STREAMING } from '../data/music'

const PLATFORM_ICONS = {
  spotify:  'S',
  apple:    '♪',
  youtube:  '▶',
  tidal:    'T',
  amazon:   'a',
  deezer:   'D',
}

export default function AlbumSpotlight() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  return (
    <section className="alb-section" ref={ref}>

      {/* Background glow */}
      <div className="alb-glow" aria-hidden="true" />

      <div className="alb-inner">

        {/* Left — Cover */}
        <motion.div
          className="alb-cover-col"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="alb-cover-wrap">
            <Image
              src="/images/music/love-lost-cover.webp"
              alt="Love Lost — Algee Smith"
              fill
              sizes="(max-width: 900px) 80vw, 380px"
              className="alb-cover-img"
              priority
            />
            {/* Vinyl record peek */}
            <div className="alb-vinyl" aria-hidden="true">
              <div className="alb-vinyl-inner" />
            </div>
          </div>
        </motion.div>

        {/* Right — Info */}
        <motion.div
          className="alb-info-col"
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
        >
          <div className="alb-eyebrow">Debut Album · 2025</div>
          <h2 className="alb-title">
            Love <em>Lost</em>
          </h2>
          <p className="alb-desc">
            Eight tracks about love, loss, and everything in between.
            Raw, honest, and direct from the artist.
          </p>

          {/* Spotify embed */}
          <div className="alb-embed-wrap">
            <iframe
              src="https://open.spotify.com/embed/artist/10gHoEHUPNcTFsyVR2YyeA?utm_source=generator&theme=0"
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="alb-embed"
            />
          </div>

          {/* Streaming links */}
          <div className="alb-streams">
            {STREAMING.map(s => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="alb-stream-btn"
                aria-label={`Listen on ${s.label}`}
              >
                {s.label}
              </a>
            ))}
          </div>

          <Link href="/music" className="alb-full-link">
            Full tracklist + lyrics →
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
