'use client'

import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Image from 'next/image'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

function wrapIndex(n, len) {
  if (len <= 0) return 0
  return ((n % len) + len) % len
}

function signedOffset(i, active, len, loop) {
  const raw = i - active
  if (!loop || len <= 1) return raw
  const alt = raw > 0 ? raw - len : raw + len
  return Math.abs(alt) < Math.abs(raw) ? alt : raw
}

export default function FilmCardStack({
  items,
  initialIndex      = 0,
  maxVisible        = 5,
  cardWidth         = 220,
  cardHeight        = 330,
  overlap           = 0.45,
  spreadDeg         = 32,
  perspectivePx     = 1100,
  depthPx           = 120,
  tiltXDeg          = 10,
  activeLiftPx      = 28,
  activeScale       = 1.06,
  inactiveScale     = 0.93,
  springStiffness   = 280,
  springDamping     = 28,
  loop              = true,
  autoAdvance       = false,
  intervalMs        = 3000,
  pauseOnHover      = true,
  showDots          = true,
  className,
  onChangeIndex,
}) {
  const reduceMotion = useReducedMotion()
  const len = items.length

  const [active, setActive] = React.useState(() => wrapIndex(initialIndex, len))
  const [hovering, setHovering] = React.useState(false)

  React.useEffect(() => {
    setActive((a) => wrapIndex(a, len))
  }, [len])

  React.useEffect(() => {
    if (!len) return
    onChangeIndex?.(active, items[active])
  }, [active]) // eslint-disable-line

  const maxOffset   = Math.max(0, Math.floor(maxVisible / 2))
  const cardSpacing = Math.max(10, Math.round(cardWidth * (1 - overlap)))
  const stepDeg     = maxOffset > 0 ? spreadDeg / maxOffset : 0

  const canGoPrev = loop || active > 0
  const canGoNext = loop || active < len - 1

  const prev = React.useCallback(() => {
    if (!len || !canGoPrev) return
    setActive((a) => wrapIndex(a - 1, len))
  }, [canGoPrev, len])

  const next = React.useCallback(() => {
    if (!len || !canGoNext) return
    setActive((a) => wrapIndex(a + 1, len))
  }, [canGoNext, len])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft')  prev()
    if (e.key === 'ArrowRight') next()
  }

  React.useEffect(() => {
    if (!autoAdvance || reduceMotion || !len) return
    if (pauseOnHover && hovering) return
    const id = window.setInterval(() => {
      if (loop || active < len - 1) next()
    }, Math.max(700, intervalMs))
    return () => window.clearInterval(id)
  }, [autoAdvance, intervalMs, hovering, pauseOnHover, reduceMotion, len, loop, active, next])

  if (!len) return null

  const activeItem = items[active]

  return (
    <div
      className={cn('w-full', className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* ── Stage ── */}
      <div
        className="relative w-full"
        style={{ height: cardHeight + 100 }}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label="Film credits carousel"
      >
        {/* depth shadow */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto rounded-full"
          style={{
            height: 60,
            width: '60%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
            filter: 'blur(18px)',
          }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ perspective: `${perspectivePx}px` }}
        >
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const off     = signedOffset(i, active, len, loop)
              const abs     = Math.abs(off)
              const visible = abs <= maxOffset
              if (!visible) return null

              const rotateZ = off * stepDeg
              const x       = off * cardSpacing
              const y       = abs * 8
              const z       = -abs * depthPx
              const isActive = off === 0
              const scale   = isActive ? activeScale : inactiveScale
              const lift    = isActive ? -activeLiftPx : 0
              const rotateX = isActive ? 0 : tiltXDeg
              const zIndex  = 100 - abs

              const dragProps = isActive ? {
                drag: 'x',
                dragConstraints: { left: 0, right: 0 },
                dragElastic: 0.18,
                onDragEnd: (_e, info) => {
                  if (reduceMotion) return
                  const threshold = Math.min(120, cardWidth * 0.22)
                  if (info.offset.x > threshold || info.velocity.x > 550) prev()
                  else if (info.offset.x < -threshold || info.velocity.x < -550) next()
                },
              } : {}

              return (
                <motion.div
                  key={item.id}
                  className={cn(
                    'absolute bottom-0 overflow-hidden',
                    'will-change-transform select-none',
                    isActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                  )}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    zIndex,
                    transformStyle: 'preserve-3d',
                    borderRadius: 6,
                    boxShadow: isActive
                      ? '0 40px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(245,240,235,0.1)'
                      : '0 20px 40px rgba(0,0,0,0.5)',
                  }}
                  initial={reduceMotion ? false : { opacity: 0, y: y + 40, x, rotateZ, rotateX, scale }}
                  animate={{ opacity: 1, x, y: y + lift, rotateZ, rotateX, scale }}
                  transition={{ type: 'spring', stiffness: springStiffness, damping: springDamping }}
                  onClick={() => setActive(i)}
                  {...dragProps}
                >
                  <div
                    className="h-full w-full"
                    style={{ transform: `translateZ(${z}px)`, transformStyle: 'preserve-3d' }}
                  >
                    <FilmPosterCard item={item} active={isActive} />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Active card info ── */}
      <div className="film-stack-info">
        <div className="film-stack-meta">
          <span className="film-tag">{activeItem.type}</span>
          <span className="film-year">{activeItem.year}</span>
        </div>
        <div className="film-stack-title">{activeItem.title}</div>
        <div className="film-stack-role">as {activeItem.role}</div>
      </div>

      {/* ── Dot nav ── */}
      {showDots && (
        <div className="film-stack-dots">
          {items.map((it, idx) => (
            <button
              key={it.id}
              onClick={() => setActive(idx)}
              className={cn('film-stack-dot', idx === active ? 'active' : '')}
              aria-label={`Go to ${it.title}`}
            />
          ))}
        </div>
      )}

      {/* ── Arrow nav ── */}
      <div className="film-stack-arrows">
        <button
          onClick={prev}
          disabled={!canGoPrev}
          className="film-stack-arrow"
          aria-label="Previous"
        >
          ←
        </button>
        <button
          onClick={next}
          disabled={!canGoNext}
          className="film-stack-arrow"
          aria-label="Next"
        >
          →
        </button>
      </div>
    </div>
  )
}

function FilmPosterCard({ item, active }) {
  return (
    <div className="relative h-full w-full">
      {/* Cover image */}
      <div className="absolute inset-0">
        {item.cover ? (
          <Image
            src={item.cover}
            alt={item.title}
            fill
            sizes="260px"
            className="object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#111]">
            <span style={{ color: '#5A554F', fontSize: 12 }}>No image</span>
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.3) 45%, transparent 75%)',
        }}
      />

      {/* Status badge */}
      {item.status === 'upcoming' && (
        <div
          className="absolute"
          style={{
            top: 10, left: 10,
            background: '#C4222E',
            color: '#F5F0EB',
            fontFamily: 'var(--font-label)',
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 100,
          }}
        >
          Upcoming
        </div>
      )}

      {/* Bottom text — only on active */}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: 9,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#C4622A',
              marginBottom: 4,
            }}
          >
            {item.type}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 18,
              letterSpacing: '-0.5px',
              textTransform: 'uppercase',
              color: '#F5F0EB',
              lineHeight: 1,
            }}
          >
            {item.title}
          </div>
        </div>
      )}
    </div>
  )
}
