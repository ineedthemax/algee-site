'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { ContainerScroll } from './ContainerScroll'

const MILESTONES = [
  {
    id:    1,
    year:  'Saginaw, MI',
    tag:   'The Beginning',
    title: 'Music Was Always the Language',
    story: 'Before any camera, before any script, there was a voice. Raised in Saginaw, Michigan, music came first. Everything else followed.',
    image: '/images/timeline/Algee Baby Photo.png',
    imagePosition: 'center top',
    above: true,
  },
  {
    id:    2,
    year:  '2012',
    tag:   'Film',
    title: 'First Camera. First Take.',
    story: 'Let It Shine on Disney Channel. The first screen credit and the first proof that the instinct for storytelling was already fully formed.',
    above: false,
    image: '/images/timeline/Let it shine 2.webp',
    imagePosition: 'center 20%',
  },
  {
    id:    3,
    year:  '2017',
    tag:   'Breakthrough',
    title: 'He Became Ralph Tresvant.',
    story: "BET's The New Edition Story didn't just introduce Algee to the country. It announced him. Millions felt it.",
    above: true,
    image: '/images/timeline/New-Edition1.webp',
  },
  {
    id:    4,
    year:  '2017',
    tag:   'Film',
    title: 'Kathryn Bigelow Called.',
    story: "Detroit. A harrowing true story. A director who doesn't cast twice without reason. He answered.",
    above: false,
    image: '/images/timeline/Detroit.webp',
  },
  {
    id:    5,
    year:  '2017',
    tag:   'Music',
    title: 'His Voice. His Terms.',
    story: 'The Listen EP. While the world was watching him act, the music never stopped. His voice, unfiltered.',
    above: true,
    image: '/images/timeline/Listen-Cover.webp',
  },
  {
    id:    6,
    year:  '2018',
    tag:   'Film',
    title: 'The Role That Shifted Everything.',
    story: 'Khalil Harris in The Hate U Give. Brief on screen, permanent in memory. The kind of performance that reframes a career.',
    above: false,
    image: '/images/timeline/The hate you give 1.webp',
  },
  {
    id:    7,
    year:  '2019',
    tag:   'Series',
    title: 'A Generation Claimed Him.',
    story: "Euphoria on HBO. McKay. A new generation found him and didn't let go.",
    above: true,
    image: '/images/timeline/Euphoria.webp',
  },
  {
    id:    8,
    year:  '2021',
    tag:   'Film',
    title: 'History. On Screen.',
    story: 'Judas and the Black Messiah. Warner Bros. The Black Panther Party. A story that demanded to be told exactly right.',
    above: false,
    image: '/images/timeline/Judas.webp',
  },
  {
    id:    9,
    year:  '2023',
    tag:   'Film',
    title: "LeBron's Origin. His Chapter.",
    story: "Shooting Stars on Peacock. The untold story of where greatness is born, before the world is watching.",
    above: true,
    image: '/images/timeline/SHOOTING-STARS.webp',
  },
  {
    id:    10,
    year:  '2023',
    tag:   'Film',
    title: 'Sundance. His Story.',
    story: 'Young Wild Free. An independent film that premiered at Sundance. Raw, personal, and entirely his own.',
    above: false,
    image: '/images/timeline/Young-wild-free.webp',
  },
  {
    id:    11,
    year:  '2023',
    tag:   'Animation',
    title: 'The Voice Behind the Character.',
    story: 'Solar Opposites on Hulu. Two episodes, two characters, one voice. Skunt and Harrison brought to life.',
    above: true,
    image: '/images/film/Solar-Opposites.webp',
  },
  {
    id:    12,
    year:  '2025',
    tag:   'Music',
    title: 'The Music Never Stopped.',
    story: 'Love Lost. His debut album. Direct to the fans who built him. No middleman. No filter. Just the music.',
    above: false,
    image: '/images/timeline/Love-Lost.webp',
  },
  {
    id:      13,
    year:    '2026',
    tag:     'Now',
    title:   'The Story Continues.',
    story:   'The Gates. Now streaming on Apple TV, YouTube, Google Play and Fandango at Home. The journey keeps going.',
    above:   true,
    image:   '/images/timeline/the-gates.webp',
    current: true,
  },
]

/* ── Catmull-Rom → cubic bezier SVG path ─────────────────────── */
function catmullRomPath(pts) {
  if (pts.length < 2) return ''
  const t = 1 / 6
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]
    const cp1x = p1.x + (p2.x - p0.x) * t
    const cp1y = p1.y + (p2.y - p0.y) * t
    const cp2x = p2.x - (p3.x - p1.x) * t
    const cp2y = p2.y - (p3.y - p1.y) * t
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

/* ── Timeline card ────────────────────────────────────────────── */
function TimelineCard({ milestone, side }) {
  return (
    <div className={`tl-v-card tl-v-card-${side}`}>
      <div className="tl-card-top">
        <span className="tl-tag">{milestone.tag}</span>
        <span className="tl-year">{milestone.year}</span>
      </div>
      <h3 className="tl-title">{milestone.title}</h3>
      <p className="tl-story">{milestone.story}</p>
      {milestone.image ? (
        <div className="tl-img-wrap">
          <Image
            src={milestone.image}
            alt={milestone.title}
            fill
            sizes="(max-width: 768px) 90vw, 420px"
            style={{ objectFit: 'cover', objectPosition: milestone.imagePosition || 'center' }}
          />
        </div>
      ) : (
        <div className="tl-img-placeholder">
          <div className="tl-img-placeholder-inner">
            <span className="tl-img-icon">◻</span>
            <span className="tl-img-label">Photo coming soon</span>
          </div>
        </div>
      )}
      {milestone.current && <div className="tl-current-badge">● Now</div>}
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────── */
export default function CareerTimeline() {
  const containerRef = useRef(null)
  const itemRefs     = useRef([])   // one ref per milestone row — for Y measurement
  const [svgState, setSvgState] = useState({ path: '', dots: [], arms: [], h: 0, w: 0 })
  const [visible,  setVisible]  = useState(new Set())

  const recalc = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const cRect  = container.getBoundingClientRect()
    const w      = container.offsetWidth
    const h      = container.offsetHeight
    const centerX = w / 2

    // Dot X positions: left cards pull to ~30%, right cards pull to ~70%
    // This creates a dramatic visible S-curve between them
    const LEFT_X  = w * 0.28
    const RIGHT_X = w * 0.72

    const pts  = []   // main curve control points
    const arms = []   // connector lines from dot to card inner edge

    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const y = r.top - cRect.top + r.height / 2
      const isLeft = MILESTONES[i]?.above

      const dotX = isLeft ? LEFT_X : RIGHT_X
      pts.push({ x: dotX, y })

      // Arm: horizontal connector from the dot toward the center
      // Left cards: arm goes right (dot → center)
      // Right cards: arm goes left (center → dot)
      arms.push({
        x1: isLeft ? dotX  : centerX,
        y1: y,
        x2: isLeft ? centerX : dotX,
        y2: y,
        isLeft,
        isCurrent: !!MILESTONES[i]?.current,
      })
    })

    setSvgState({ path: catmullRomPath(pts), dots: pts, arms, h, w })
  }, [])

  useEffect(() => {
    const t = setTimeout(recalc, 150)
    const ro = new ResizeObserver(recalc)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', recalc)
    return () => { clearTimeout(t); ro.disconnect(); window.removeEventListener('resize', recalc) }
  }, [recalc])

  /* Scroll-reveal per item */
  useEffect(() => {
    const items = containerRef.current?.querySelectorAll('.tl-v-item')
    if (!items) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setVisible(prev => new Set([...prev, e.target.dataset.idx]))
      })
    }, { threshold: 0.12 })
    items.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section className="career-timeline-section">

      {/* ── ContainerScroll intro ── */}
      <ContainerScroll
        titleComponent={
          <div className="tl-scroll-header">
            <div className="label tl-scroll-label">The Journey</div>
            <h2 className="tl-scroll-headline">
              From Saginaw<br />
              <span className="italic">to Everywhere.</span>
            </h2>
          </div>
        }
      >
        <div className="tl-chapter-card">
          <div className="tl-chapter-card-bg" />
          <div className="tl-chapter-video-wrap">
            <iframe
              className="tl-chapter-video"
              src="https://www.youtube.com/embed/uO5GjsL0f8M?rel=0&modestbranding=1&color=white"
              title="Algee Smith"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </ContainerScroll>

      {/* ── Vertical timeline ── */}
      <div className="tl-v-section">
        <div className="tl-v-container" ref={containerRef}>

          {/* ── SVG overlay: curve + arms + dots ── */}
          {svgState.path && (
            <svg
              className="tl-v-svg"
              style={{ width: svgState.w, height: svgState.h }}
              viewBox={`0 0 ${svgState.w} ${svgState.h}`}
              aria-hidden="true"
            >
              <defs>
                {/* Curve gradient: red at top → dim at bottom */}
                <linearGradient id="tl-curve-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="rgba(196,34,46,1)"   />
                  <stop offset="60%"  stopColor="rgba(196,34,46,0.6)" />
                  <stop offset="100%" stopColor="rgba(245,240,235,0.15)" />
                </linearGradient>
                {/* Glow filter on the path */}
                <filter id="tl-glow" x="-50%" y="-10%" width="200%" height="120%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Glow copy of the main path (blurred, behind) */}
              <path
                d={svgState.path}
                stroke="rgba(196,34,46,0.3)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                filter="url(#tl-glow)"
              />

              {/* Main S-curve */}
              <path
                d={svgState.path}
                stroke="url(#tl-curve-grad)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Connector arms — horizontal lines from curve to card */}
              {svgState.arms.map((arm, i) => (
                <line
                  key={i}
                  x1={arm.x1} y1={arm.y1}
                  x2={arm.x2} y2={arm.y2}
                  stroke={arm.isCurrent ? 'rgba(196,34,46,0.6)' : 'rgba(245,240,235,0.12)'}
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
              ))}

              {/* Dots on the curve */}
              {svgState.dots.map((pt, i) => {
                const m = MILESTONES[i]
                return (
                  <g key={i}>
                    {/* Outer glow ring */}
                    <circle cx={pt.x} cy={pt.y} r="10" fill="rgba(196,34,46,0.08)" />
                    {/* Inner filled dot */}
                    <circle
                      cx={pt.x} cy={pt.y} r="5"
                      fill={m?.current ? '#c4222e' : '#111'}
                      stroke={m?.current ? '#c4222e' : 'rgba(245,240,235,0.4)'}
                      strokeWidth="1.5"
                    />
                    {/* Current milestone pulse ring */}
                    {m?.current && (
                      <circle cx={pt.x} cy={pt.y} r="9" fill="none" stroke="rgba(196,34,46,0.4)" strokeWidth="1" />
                    )}
                  </g>
                )
              })}
            </svg>
          )}

          {/* ── Milestone rows ── */}
          {MILESTONES.map((m, i) => (
            <div
              key={m.id}
              ref={el => { itemRefs.current[i] = el }}
              className={`tl-v-item ${m.above ? 'tl-v-left' : 'tl-v-right'} ${visible.has(String(i)) ? 'tl-v-visible' : ''}`}
              data-idx={i}
              style={{ '--delay': `${i * 50}ms` }}
            >
              <div className="tl-v-side tl-v-side-left">
                {m.above && <TimelineCard milestone={m} side="left" />}
              </div>
              <div className="tl-v-center-spacer" />
              <div className="tl-v-side tl-v-side-right">
                {!m.above && <TimelineCard milestone={m} side="right" />}
              </div>
            </div>
          ))}

          {/* End cap */}
          <div className="tl-v-endcap">
            <div className="tl-v-side" />
            <div className="tl-v-center tl-v-endcap-center">
              <div className="tl-end-dot" />
              <span className="tl-end-label">Story<br />in progress</span>
            </div>
            <div className="tl-v-side" />
          </div>

        </div>
      </div>

    </section>
  )
}
