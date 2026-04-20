'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { ContainerScroll } from './ContainerScroll'

const MILESTONES = [
  {
    id:    1,
    year:  'Saginaw, MI',
    tag:   'The Beginning',
    title: 'Music Was Always the Language',
    story: 'Before any camera, before any script, there was a voice. Raised in Saginaw, Michigan, music came first. Everything else followed.',
    side:  'right',
  },
  {
    id:    2,
    year:  '2012',
    tag:   'Film',
    title: 'First Camera. First Take.',
    story: 'Let It Shine on Disney Channel. The first screen credit and the first proof that the instinct for storytelling was already fully formed.',
    side:  'left',
    image: '/images/timeline/Let it shine 2.jpg',
    imagePosition: 'center 20%',
  },
  {
    id:    3,
    year:  '2017',
    tag:   'Breakthrough',
    title: 'He Became Ralph Tresvant.',
    story: 'BET\'s The New Edition Story didn\'t just introduce Algee to the country. It announced him. The performance felt lived-in. Millions felt it.',
    side:  'right',
    image: '/images/timeline/New-Edition1.jpg',
  },
  {
    id:    4,
    year:  '2017',
    tag:   'Film',
    title: 'Kathryn Bigelow Called.',
    story: 'Detroit. A harrowing true story. A director who doesn\'t cast twice without reason. He answered.',
    side:  'left',
    image: '/images/timeline/Detroit.webp',
  },
  {
    id:    5,
    year:  '2018',
    tag:   'Film',
    title: 'The Role That Shifted Everything.',
    story: 'Khalil Harris in The Hate U Give. Brief on screen, permanent in memory. The kind of performance that reframes a career.',
    side:  'right',
    image: '/images/timeline/The hate you give 1.jpg',
  },
  {
    id:    6,
    year:  '2019',
    tag:   'Series',
    title: 'A Generation Claimed Him.',
    story: 'Euphoria on HBO. McKay. A new generation found him and didn\'t let go.',
    side:  'left',
    image: '/images/timeline/Euphoria.webp',
  },
  {
    id:    7,
    year:  '2021',
    tag:   'Film',
    title: 'History. On Screen.',
    story: 'Judas and the Black Messiah. Warner Bros. The Black Panther Party. A story that demanded to be told exactly right.',
    side:  'right',
    image: '/images/timeline/Judas.jpg',
  },
  {
    id:    8,
    year:  '2023',
    tag:   'Film',
    title: 'LeBron\'s Origin. His Chapter.',
    story: 'Shooting Stars on Peacock. The untold story of where greatness is born, before the world is watching.',
    side:  'left',
    image: '/images/timeline/SHOOTING-STARS.jpg',
  },
  {
    id:    9,
    year:  '2023',
    tag:   'Film',
    title: 'Sundance. His Story.',
    story: 'Young Wild Free. An independent film that premiered at Sundance. Raw, personal, and entirely his own.',
    side:  'right',
    image: '/images/timeline/Young-wild-free.webp',
  },
  {
    id:    10,
    year:  '2025',
    tag:   'Music',
    title: 'The Music Never Stopped.',
    story: 'Love Lost. His debut album. Direct to the fans who built him. No middleman. No filter. Just the music.',
    side:  'left',
    image: '/images/timeline/Love-Lost.jpg',
  },
  {
    id:      11,
    year:    '2026',
    tag:     'Now',
    title:   'The Story Continues.',
    story:   'The Gates. Now streaming on Apple TV, YouTube, Google Play and Fandango at Home. The journey keeps going.',
    side:    'right',
    image:   '/images/timeline/the-gates.jpg',
    current: true,
  },
]

function CurvedLine() {
  const svgRef  = useRef(null)
  const pathRef = useRef(null)

  useEffect(() => {
    const path = pathRef.current
    const svg  = svgRef.current
    if (!path || !svg) return

    const length = path.getTotalLength()
    path.style.strokeDasharray  = length
    path.style.strokeDashoffset = length

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          path.style.transition      = 'stroke-dashoffset 2.5s cubic-bezier(0.16, 1, 0.3, 1)'
          path.style.strokeDashoffset = 0
          observer.unobserve(svg)
        }
      },
      { threshold: 0.02 }
    )
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  return (
    <svg
      ref={svgRef}
      className="tl-svg-line"
      viewBox="0 0 80 3200"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tlLineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="4%"   stopColor="rgba(196, 34, 46, 1)" />
          <stop offset="20%"  stopColor="rgba(245, 240, 235, 0.4)" />
          <stop offset="80%"  stopColor="rgba(245, 240, 235, 0.2)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {/* Organic winding road — irregular rhythm, wide swings ±30px from center */}
      <path
        ref={pathRef}
        d="M 40 0
           C 8  220,  72  480,  38  700
           C 6  920,  70 1180,  42 1400
           C 10 1600,  74 1850,  36 2100
           C 5  2300,  75 2550,  40 2750
           C 8  2950,  70 3100,  40 3200"
        fill="none"
        stroke="url(#tlLineGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TimelineItem({ milestone, index }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('tl-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`tl-item tl-${milestone.side}`}
      style={{ '--delay': `${index * 0.08}s` }}
    >
      {/* Dot on the line */}
      <div className="tl-dot">
        <div className="tl-dot-inner" />
      </div>

      {/* Card */}
      <div className="tl-card">
        <div className="tl-card-top">
          <span className="tl-tag">{milestone.tag}</span>
          <span className="tl-year">{milestone.year}</span>
        </div>
        <h3 className="tl-title">{milestone.title}</h3>
        <p className="tl-story">{milestone.story}</p>

        {/* Photo */}
        {milestone.image ? (
          <div className="tl-img-wrap" style={{ aspectRatio: milestone.imageAspect || '16 / 9' }}>
            <Image
              src={milestone.image}
              alt={milestone.title}
              fill
              sizes="(max-width: 640px) 90vw, 380px"
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

        {milestone.current && (
          <div className="tl-current-badge">● Now</div>
        )}
      </div>
    </div>
  )
}

export default function CareerTimeline() {

  return (
    <section className="career-timeline-section">

      {/* ── ContainerScroll intro card ── */}
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
        {/* Cinematic chapter card inside the scroll container */}
        <div className="tl-chapter-card">
          <div className="tl-chapter-card-bg" />
          <div className="tl-chapter-card-content">
            <div className="tl-chapter-divider" />
            <div className="tl-chapter-stats">
              <div className="tl-chapter-stat">
                <span className="tl-chapter-stat-value">2012</span>
                <span className="tl-chapter-stat-label">First Film</span>
              </div>
              <div className="tl-chapter-sep">—</div>
              <div className="tl-chapter-stat">
                <span className="tl-chapter-stat-value">10+</span>
                <span className="tl-chapter-stat-label">Screen Credits</span>
              </div>
              <div className="tl-chapter-sep">—</div>
              <div className="tl-chapter-stat">
                <span className="tl-chapter-stat-value">1</span>
                <span className="tl-chapter-stat-label">Album</span>
              </div>
              <div className="tl-chapter-sep">—</div>
              <div className="tl-chapter-stat">
                <span className="tl-chapter-stat-value">∞</span>
                <span className="tl-chapter-stat-label">Stories</span>
              </div>
            </div>
            <div className="tl-chapter-divider" />
            <p className="tl-chapter-sub">
              Two stages. One soul. This is how it unfolded.
            </p>
          </div>
        </div>
      </ContainerScroll>

      {/* ── Timeline track ── */}
      <div className="tl-track">

        {/* Animated curved SVG line */}
        <CurvedLine />

        {/* Milestones */}
        {MILESTONES.map((m, i) => (
          <TimelineItem key={m.id} milestone={m} index={i} />
        ))}

        {/* End cap */}
        <div className="tl-end">
          <div className="tl-end-dot" />
          <span className="tl-end-label">Story in progress</span>
        </div>
      </div>

    </section>
  )
}
