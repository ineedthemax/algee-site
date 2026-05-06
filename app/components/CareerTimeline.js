'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ContainerScroll } from './ContainerScroll'

const MILESTONES = [
  {
    id:    1,
    year:  'Saginaw, MI',
    tag:   'The Beginning',
    title: 'Music Was Always the Language',
    story: 'Before any camera, before any script, there was a voice. Raised in Saginaw, Michigan, music came first. Everything else followed.',
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
    story: 'BET\'s The New Edition Story didn\'t just introduce Algee to the country. It announced him. Millions felt it.',
    above: true,
    image: '/images/timeline/New-Edition1.webp',
  },
  {
    id:    4,
    year:  '2017',
    tag:   'Film',
    title: 'Kathryn Bigelow Called.',
    story: 'Detroit. A harrowing true story. A director who doesn\'t cast twice without reason. He answered.',
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
    story: 'Euphoria on HBO. McKay. A new generation found him and didn\'t let go.',
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
    title: 'LeBron\'s Origin. His Chapter.',
    story: 'Shooting Stars on Peacock. The untold story of where greatness is born, before the world is watching.',
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

function TimelineCard({ milestone }) {
  return (
    <div className="tl-card">
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
            sizes="240px"
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
  )
}

export default function CareerTimeline() {
  const scrollRef = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 20)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20)
  }

  const nudge = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  /* Drag to scroll */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let down = false, startX = 0, initScroll = 0

    const onDown  = e => {
      down = true
      startX = e.pageX - el.offsetLeft
      initScroll = el.scrollLeft
      el.classList.add('dragging')
    }
    const onUp    = () => { down = false; el.classList.remove('dragging') }
    const onLeave = () => { down = false; el.classList.remove('dragging') }
    const onMove  = e => {
      if (!down) return
      e.preventDefault()
      const dx = e.pageX - el.offsetLeft - startX
      el.scrollLeft = initScroll - dx * 1.2
    }

    el.addEventListener('mousedown',  onDown)
    el.addEventListener('mouseup',    onUp)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('mousemove',  onMove, { passive: false })
    el.addEventListener('scroll',     updateArrows)
    updateArrows()

    return () => {
      el.removeEventListener('mousedown',  onDown)
      el.removeEventListener('mouseup',    onUp)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('mousemove',  onMove)
      el.removeEventListener('scroll',     updateArrows)
    }
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
        <div className="tl-chapter-card">
          <div className="tl-chapter-card-bg" />
          <div className="tl-chapter-video-wrap">
            <iframe
              className="tl-chapter-video"
              src="https://www.youtube.com/embed/elwuAOZH12A?rel=0&modestbranding=1&color=white"
              title="Algee Smith"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </ContainerScroll>

      {/* ── Horizontal timeline ── */}
      <div className="tl-h-wrap">

        {/* Controls */}
        <div className="tl-h-controls">
          <div className="tl-h-hint">
            <span className="tl-h-hint-desktop">Drag to explore the journey</span>
            <span className="tl-h-hint-mobile">Swipe to explore</span>
          </div>
          <div className="tl-h-arrows">
            <button
              className="tl-h-arrow"
              onClick={() => nudge(-1)}
              disabled={!canLeft}
              aria-label="Scroll left"
            >←</button>
            <button
              className="tl-h-arrow"
              onClick={() => nudge(1)}
              disabled={!canRight}
              aria-label="Scroll right"
            >→</button>
          </div>
        </div>

        {/* Scrollable track */}
        <div className="tl-h-scroll" ref={scrollRef}>
          <div className="tl-h-inner">

            {/* The horizontal line */}
            <div className="tl-h-line" />

            {/* Milestones */}
            {MILESTONES.map((m, i) => (
              <div
                key={m.id}
                className={`tl-h-item ${m.above ? 'tl-h-above' : 'tl-h-below'}`}
                style={{ '--i': i }}
              >
                {/* Top slot — card if above */}
                <div className="tl-h-top">
                  {m.above && <TimelineCard milestone={m} />}
                </div>

                {/* Dot on the line */}
                <div className="tl-h-mid">
                  <div className="tl-dot-inner" />
                </div>

                {/* Bottom slot — card if below */}
                <div className="tl-h-bot">
                  {!m.above && <TimelineCard milestone={m} />}
                </div>
              </div>
            ))}

            {/* End cap */}
            <div className="tl-h-endcap">
              <div className="tl-h-endcap-top" />
              <div className="tl-h-mid">
                <div className="tl-end-dot" />
              </div>
              <div className="tl-h-endcap-bot">
                <span className="tl-end-label">Story<br />in progress</span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  )
}
