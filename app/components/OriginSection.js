'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

const STOPS = [
  {
    city:    'Saginaw, MI',
    label:   'The Beginning',
    desc:    'Where the hunger started. Where the dream was born.',
    year:    '1994',
  },
  {
    city:    'Atlanta, GA',
    label:   'The Grind',
    desc:    'Where the work got real. Stage to studio, day after day.',
    year:    '2010s',
  },
  {
    city:    'Los Angeles, CA',
    label:   'Two Stages',
    desc:    'Where the world opened up. Film, music — no limits.',
    year:    'Now',
  },
]

export default function OriginSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  return (
    <section className="origin-section" ref={ref}>

      <motion.div
        className="origin-header"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <div className="origin-eyebrow">The Journey</div>
        <h2 className="origin-headline">
          From <em>Saginaw</em><br />to the World.
        </h2>
      </motion.div>

      <div className="origin-stops">
        {STOPS.map((stop, i) => (
          <motion.div
            key={stop.city}
            className="origin-stop"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.15 }}
          >
            <div className="origin-stop-year">{stop.year}</div>
            <div className="origin-stop-dot">
              <div className="origin-stop-dot-inner" />
            </div>
            <div className="origin-stop-body">
              <div className="origin-stop-city">{stop.city}</div>
              <div className="origin-stop-label">{stop.label}</div>
              <div className="origin-stop-desc">{stop.desc}</div>
            </div>
          </motion.div>
        ))}
        {/* Connecting line */}
        <div className="origin-line" aria-hidden="true" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Link href="/about" className="origin-cta">
          Read the full story →
        </Link>
      </motion.div>

    </section>
  )
}
