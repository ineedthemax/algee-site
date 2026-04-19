'use client'
import { useEffect, useRef } from 'react'
import { ContainerScroll } from './ContainerScroll'

const MILESTONES = [
  {
    id:    1,
    year:  'Saginaw, MI',
    tag:   'The Beginning',
    title: 'Music Was Always the Language',
    story: 'Before any camera, before any script — there was a voice. Raised in Saginaw, Michigan, music came first. Everything else followed.',
    side:  'right',
  },
  {
    id:    2,
    year:  '2012',
    tag:   'Film',
    title: 'First Camera. First Take.',
    story: 'Young Wild Free. An independent film and an early signal that the instinct for storytelling was already fully formed.',
    side:  'left',
  },
  {
    id:    3,
    year:  '2017',
    tag:   'Breakthrough',
    title: 'He Became Ralph Tresvant.',
    story: 'BET\'s The New Edition Story didn\'t just introduce Algee to the country — it announced him. The performance felt lived-in. Millions felt it.',
    side:  'right',
  },
  {
    id:    4,
    year:  '2017',
    tag:   'Film',
    title: 'Kathryn Bigelow Called.',
    story: 'Detroit. A harrowing true story. A director who doesn\'t cast twice without reason. He answered.',
    side:  'left',
  },
  {
    id:    5,
    year:  '2018',
    tag:   'Film',
    title: 'The Role That Shifted Everything.',
    story: 'Khalil Harris in The Hate U Give. Brief on screen, permanent in memory. The kind of performance that reframes a career.',
    side:  'right',
  },
  {
    id:    6,
    year:  '2019',
    tag:   'Series',
    title: 'A Generation Claimed Him.',
    story: 'Euphoria on HBO. McKay. A new generation found him — and didn\'t let go.',
    side:  'left',
  },
  {
    id:    7,
    year:  '2021',
    tag:   'Film',
    title: 'History. On Screen.',
    story: 'Judas and the Black Messiah. Warner Bros. The Black Panther Party. A story that demanded to be told exactly right.',
    side:  'right',
  },
  {
    id:    8,
    year:  '2023',
    tag:   'Film',
    title: 'LeBron\'s Origin. His Chapter.',
    story: 'Shooting Stars on Peacock. The untold story of where greatness is born, before the world is watching.',
    side:  'left',
  },
  {
    id:    9,
    year:  '2025',
    tag:   'Music',
    title: 'The Music Never Stopped.',
    story: 'Love Lost — his debut album. Direct to the fans who built him. No middleman. No filter. Just the music.',
    side:  'right',
  },
  {
    id:      10,
    year:    '2026',
    tag:     'Now',
    title:   'The Story Continues.',
    story:   'The Gates. Now streaming on Apple TV, YouTube, Google Play and Fandango at Home. The journey keeps going.',
    side:    'left',
    current: true,
  },
]

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

        {/* Photo placeholder */}
        <div className="tl-img-placeholder">
          <div className="tl-img-placeholder-inner">
            <span className="tl-img-icon">◻</span>
            <span className="tl-img-label">Photo coming soon</span>
          </div>
        </div>

        {milestone.current && (
          <div className="tl-current-badge">● Now</div>
        )}
      </div>
    </div>
  )
}

export default function CareerTimeline() {
  const lineRef = useRef(null)

  useEffect(() => {
    const el = lineRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('tl-line-animate')
          observer.unobserve(el)
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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

        {/* Animated vertical line */}
        <div className="tl-line-wrap" ref={lineRef}>
          <div className="tl-line" />
        </div>

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
