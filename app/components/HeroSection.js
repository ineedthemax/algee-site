'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const HEADLINE_WORDS = ['Step Into', 'the', 'World.']

const wordVariants = {
  hidden: { y: '110%', opacity: 0 },
  show:   { y: '0%',   opacity: 1 },
}

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
}

const CREDITS = [
  { label: 'The Hate U Give', type: 'Film' },
  { label: 'Euphoria · HBO', type: 'Series' },
  { label: 'The Gates', type: 'Now Streaming' },
  { label: 'New Edition Story', type: 'BET' },
  { label: 'Love Lost', type: 'Album Out Now' },
]

const STATS = [
  { value: '17+',    label: 'Film & TV Credits' },
  { value: '2017',   label: 'BET Award Winner'  },
  { value: '∞',      label: 'Love from Fans'   },
]

export default function HeroSection() {
  const bgImgRef   = useRef(null)
  const [tick, setTick] = useState(0)

  // Rotate credits
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % CREDITS.length), 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!bgImgRef.current) return
      const x = ((e.clientX / window.innerWidth)  - 0.5) * 22
      const y = ((e.clientY / window.innerHeight) - 0.5) * 12
      bgImgRef.current.style.transform = `scale(1.1) translate(${x}px, ${y}px)`
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  const credit = CREDITS[tick]

  return (
    <section className="hero" aria-label="Hero">
      {/* ─── Background photo ─── */}
      <div className="hero-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bgImgRef}
          src="/images/hero/algee-hero.webp"
          alt="Algee Smith"
          fetchPriority="high"
        />
      </div>

      {/* Overlays */}
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />

      {/* Ghost watermark */}
      <div className="hero-bg-text" aria-hidden="true">ALGEE</div>

      {/* ─── Rotating credit ticker - top right ─── */}
      <div className="hero-credit-ticker" aria-hidden="true">
        <span className="hero-credit-type">{credit.type}</span>
        <span className="hero-credit-divider">·</span>
        <span className="hero-credit-label">{credit.label}</span>
      </div>

      {/* ─── Hero content ─── */}
      <div className="hero-inner">
        <div className="reveal">
          <div className="hero-marker">
            <div className="hero-marker-line" aria-hidden="true" />
            <span className="hero-marker-text">Two Stages · One Soul</span>
          </div>

          <motion.h1
            className="hero-headline"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {HEADLINE_WORDS.map((word, i) => (
              <span key={i} className="line" style={{ overflow: 'hidden', display: 'block' }}>
                <motion.span
                  variants={wordVariants}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'block' }}
                  className={i === 1 ? 'italic' : ''}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.75 }}
          >
            Actor. R&amp;B artist. From Saginaw to Atlanta to Los Angeles.
            Direct from the artist to you.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.95 }}
          >
            <Link href="/music" className="btn btn-primary">
              <span>Listen Now</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/film" className="btn">
              <span>See the Films</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ─── Stats strip ─── */}
      <div className="hero-stats-strip">
        {STATS.map((s, i) => (
          <div key={i} className="hero-stat">
            <span className="hero-stat-value">{s.value}</span>
            <span className="hero-stat-label">{s.label}</span>
          </div>
        ))}
        <Link href="/join" className="hero-stat hero-stat-cta">
          <span className="hero-stat-value">Join</span>
          <span className="hero-stat-label">The Fan Club →</span>
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}
