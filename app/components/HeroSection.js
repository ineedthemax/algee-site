'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function HeroSection() {
  const bgImgRef = useRef(null)

  useEffect(() => {
    // ─── Cursor parallax on hero background ───
    const onMouseMove = (e) => {
      if (!bgImgRef.current) return
      const x = ((e.clientX / window.innerWidth)  - 0.5) * 22
      const y = ((e.clientY / window.innerHeight) - 0.5) * 12
      bgImgRef.current.style.transform = `scale(1.1) translate(${x}px, ${y}px)`
    }
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <section className="hero" aria-label="Hero">
      {/* ─── Full-bleed background photo ─── */}
      <div className="hero-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bgImgRef}
          src="/images/hero/algee-hero.jpg"
          alt="Algee Smith"
          fetchPriority="high"
        />
      </div>

      {/* Dark gradient overlay */}
      <div className="hero-overlay" aria-hidden="true" />

      {/* Ghost watermark */}
      <div className="hero-bg-text" aria-hidden="true">ALGEE</div>

      {/* ─── Hero content ─── */}
      <div className="hero-inner">
        <div className="reveal">
          {/* Eyebrow marker */}
          <div className="hero-marker">
            <div className="hero-marker-line" aria-hidden="true" />
            <span className="hero-marker-text">Two Stages · One Soul</span>
          </div>

          {/* Headline */}
          <h1 className="hero-headline">
            <span className="line"><span>Step Into</span></span>
            <span className="line"><span className="italic">the</span></span>
            <span className="line"><span>World.</span></span>
          </h1>

          {/* Sub */}
          <p className="hero-sub">
            Actor. R&amp;B artist. From Saginaw to Atlanta to Los Angeles.
            Direct from the artist to you. Step inside the music, the film,
            and everything in between.
          </p>

          {/* CTAs */}
          <div className="hero-cta">
            <Link href="/music" className="btn btn-primary">
              <span>Listen Now</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/about" className="btn">
              <span>Enter the World</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}
