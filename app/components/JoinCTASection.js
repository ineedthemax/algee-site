'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const PERKS = [
  { icon: '🎵', text: 'Early access to new music' },
  { icon: '🎬', text: 'Behind-the-scenes content' },
  { icon: '⭐', text: 'Exclusive fan missions & rewards' },
  { icon: '🎟️', text: 'Priority access to merch drops' },
]

export default function JoinCTASection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  return (
    <section className="join-cta-section" ref={ref}>

      {/* Background texture */}
      <div className="join-cta-bg" aria-hidden="true" />

      <motion.div
        className="join-cta-inner"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="join-cta-eyebrow">The Algee Smith Fan Club</div>
        <h2 className="join-cta-headline">
          Be part of<br /><em>the world.</em>
        </h2>
        <p className="join-cta-sub">
          Free to join. First to know. Closest to the music.
        </p>

        <div className="join-cta-perks">
          {PERKS.map((p) => (
            <div key={p.text} className="join-cta-perk">
              <span className="join-cta-perk-icon">{p.icon}</span>
              <span className="join-cta-perk-text">{p.text}</span>
            </div>
          ))}
        </div>

        <div className="join-cta-actions">
          <Link href="/account" className="join-cta-btn-primary">
            Join Free →
          </Link>
          <Link href="/tiers" className="join-cta-btn-secondary">
            See membership tiers
          </Link>
        </div>

        <div className="join-cta-social-proof">
          Already thousands of fans in the world.
        </div>
      </motion.div>

    </section>
  )
}
