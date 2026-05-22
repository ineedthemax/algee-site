'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const FILM_CREDITS = [
  { title: 'The Gates',             year: '2026', role: 'Kevin'          },
  { title: 'Euphoria · HBO',        year: '2019', role: 'Chris McKay'    },
  { title: 'The Hate U Give',       year: '2018', role: 'Khalil Harris'  },
  { title: 'New Edition Story',     year: '2017', role: 'Ralph Tresvant' },
  { title: 'Detroit',               year: '2017', role: 'Larry Reed'     },
  { title: 'Judas & The Black Messiah', year: '2021', role: 'Jake Winters'   },
]

const MUSIC_CREDITS = [
  { title: 'Love Lost',    year: '2025', desc: 'Debut Album'       },
  { title: 'Spendin\'',   year: '2024', desc: 'Single'            },
  { title: 'Wait For Me', year: '2023', desc: 'Single'            },
  { title: 'Heard It All', year: '2022', desc: 'Single'           },
  { title: 'Numb',        year: '2021', desc: 'Single'            },
  { title: 'Watch',       year: '2020', desc: 'Single'            },
]

function CreditRow({ item, index, side }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -20px 0px' })

  return (
    <motion.div
      ref={ref}
      className="tw-credit-row"
      initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.07 }}
    >
      <div className="tw-credit-title">
        {'title' in item ? item.title : item.title}
      </div>
      <div className="tw-credit-meta">
        <span className="tw-credit-year">{item.year}</span>
        <span className="tw-credit-role">{'role' in item ? item.role : item.desc}</span>
      </div>
    </motion.div>
  )
}

export default function TwoWorldsSection() {
  const sectionRef = useRef(null)
  const inView     = useInView(sectionRef, { once: true, margin: '0px 0px -100px 0px' })
  const [hovered, setHovered] = useState(false)

  const { scrollYProgress } = useScroll({
    target:  sectionRef,
    offset:  ['start end', 'end start'],
  })

  const leftX   = useTransform(scrollYProgress, [0, 0.5], [-60, 0])
  const rightX  = useTransform(scrollYProgress, [0, 0.5], [60, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const centerY = useTransform(scrollYProgress, [0, 0.4], [40, 0])
  return (
    <section
      className="tw-section"
      ref={sectionRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* ── Hover photo (far left) ── */}
      <motion.div
        className="tw-photo-col"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <div className="tw-photo-wrap">
          <Image
            src="/images/Algee Hover.jpg"
            alt="Algee Smith"
            fill
            sizes="25vw"
            className="tw-photo-img"
            style={{ objectPosition: 'center 30%' }}
            priority={false}
          />
          <div className="tw-photo-overlay" />
        </div>
      </motion.div>

      {/* Center divider label */}
      <motion.div
        className="tw-center"
        style={{ y: centerY, opacity }}
      >
        <div className="tw-center-line" />
        <div className="tw-center-label">Two Stages</div>
        <div className="tw-center-sub">One Soul</div>
        <div className="tw-center-line" />
      </motion.div>

      {/* ── Left: The Actor ── */}
      <motion.div
        className="tw-panel tw-panel-left"
        style={{ x: leftX, opacity }}
      >
        <div className="tw-panel-eyebrow">The Actor</div>
        <div className="tw-panel-headline">Screen.<br /><em>Legacy.</em></div>
        <div className="tw-credits">
          {FILM_CREDITS.map((item, i) => (
            <CreditRow key={item.title} item={item} index={i} side="left" />
          ))}
        </div>
        <Link href="/film" className="tw-panel-cta">View all credits →</Link>
      </motion.div>

      {/* ── Right: The Artist ── */}
      <motion.div
        className="tw-panel tw-panel-right"
        style={{ x: rightX, opacity }}
      >
        <div className="tw-panel-eyebrow">The Artist</div>
        <div className="tw-panel-headline">Sound.<br /><em>Soul.</em></div>
        <div className="tw-credits">
          {MUSIC_CREDITS.map((item, i) => (
            <CreditRow key={item.title} item={item} index={i} side="right" />
          ))}
        </div>
        <Link href="/music" className="tw-panel-cta">Explore the music →</Link>
      </motion.div>

    </section>
  )
}
