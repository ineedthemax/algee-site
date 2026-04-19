'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

// ─── Color helpers ─────────────────────────────────────────────
function parseColor(input) {
  if (!input) return { r: 255, g: 255, b: 255 }
  if (input.startsWith('rgb')) {
    const match = input.match(/rgba?\(([^)]+)\)/)
    if (match) {
      const parts = match[1].split(',').map(Number)
      return { r: parts[0] || 255, g: parts[1] || 255, b: parts[2] || 255 }
    }
  } else if (input.startsWith('#')) {
    let hex = input.replace('#', '')
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      }
    }
  }
  return { r: 255, g: 255, b: 255 }
}

function lerpColor(a, b, t) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  }
}

// ─── Component ─────────────────────────────────────────────────
export default function TextGlowHover({
  text            = 'Algee Smith',
  copies          = 90,
  textColor       = '#F5F0EB',
  backgroundColor = '#050505',
  fontFamily      = 'var(--font-display, serif)',
  fontSize        = 'clamp(72px, 14vw, 200px)',
  fontWeight      = 900,
  fontStyle       = 'normal',
  letterSpacing   = '-4px',
  glowStartColor  = '#C4222E',
  glowEndColor    = '#C4622A',
  shadowScaleFactor = 0.008,
  glowBlur        = 36,
  glowOpacity     = 0.9,
}) {
  const [direction, setDirection]   = useState({ horizontal: 0, vertical: 0 })
  const containerRef                = useRef(null)
  const rafRef                      = useRef(null)
  const centerAnimRef               = useRef(null)

  // Inject shared CSS once
  useEffect(() => {
    if (document.getElementById('tgh-style')) return
    const style = document.createElement('style')
    style.id    = 'tgh-style'
    style.innerHTML = `
      .tgh-copy {
        position: absolute;
        left: 50%; top: 50%;
        transform: translate(-50%, -50%)
          translate(
            calc(var(--tgh-i) * var(--tgh-h) * -0.1rem),
            calc(var(--tgh-i) * var(--tgh-v) * -0.1rem)
          )
          scale(calc(1 + var(--tgh-i) * var(--tgh-scale)));
        color: var(--tgh-color);
        filter: blur(0.1rem);
        user-select: none;
        pointer-events: none;
        white-space: pre;
        text-align: center;
        font: inherit;
        letter-spacing: inherit;
        will-change: transform;
        z-index: 0;
      }
    `
    document.head.appendChild(style)
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (centerAnimRef.current) cancelAnimationFrame(centerAnimRef.current)
    if (!containerRef.current) return
    const rect    = containerRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const h       = (clientX - rect.left  - rect.width  / 2) / (rect.width  / 2)
    const v       = (clientY - rect.top   - rect.height / 2) / (rect.height / 2)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() =>
      setDirection({
        horizontal: Math.max(-1, Math.min(1, h)),
        vertical:   Math.max(-1, Math.min(1, v)),
      })
    )
  }, [])

  const handlePointerLeave = useCallback(() => {
    if (centerAnimRef.current) cancelAnimationFrame(centerAnimRef.current)
    const ease = () => {
      setDirection(prev => {
        const h = prev.horizontal * 0.9
        const v = prev.vertical   * 0.9
        if (Math.abs(h) < 0.005 && Math.abs(v) < 0.005) {
          cancelAnimationFrame(centerAnimRef.current)
          return { horizontal: 0, vertical: 0 }
        }
        centerAnimRef.current = requestAnimationFrame(ease)
        return { horizontal: h, vertical: v }
      })
    }
    centerAnimRef.current = requestAnimationFrame(ease)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('mousemove',  handlePointerMove)
    el.addEventListener('touchmove',  handlePointerMove, { passive: true })
    el.addEventListener('mouseleave', handlePointerLeave)
    el.addEventListener('touchend',   handlePointerLeave)
    return () => {
      el.removeEventListener('mousemove',  handlePointerMove)
      el.removeEventListener('touchmove',  handlePointerMove)
      el.removeEventListener('mouseleave', handlePointerLeave)
      el.removeEventListener('touchend',   handlePointerLeave)
      if (rafRef.current)       cancelAnimationFrame(rafRef.current)
      if (centerAnimRef.current) cancelAnimationFrame(centerAnimRef.current)
    }
  }, [handlePointerMove, handlePointerLeave])

  // Pre-compute per-copy RGBA strings
  const colorStrings = useMemo(() => {
    const startRGB = parseColor(glowStartColor)
    const endRGB   = parseColor(glowEndColor)
    return Array.from({ length: copies }, (_, i) => {
      const rgb = lerpColor(startRGB, endRGB, i / (copies - 1))
      return `rgba(${rgb.r},${rgb.g},${rgb.b},${1 / (i + 1)})`
    })
  }, [copies, glowStartColor, glowEndColor])

  const shadowCopies = useMemo(() =>
    Array.from({ length: copies }, (_, i) => (
      <div
        key={i}
        aria-hidden="true"
        className="tgh-copy"
        style={{
          '--tgh-i':     i + 1,
          '--tgh-color': colorStrings[i],
        }}
      >
        {text}
      </div>
    )),
    [copies, text, colorStrings]
  )

  const startRGB       = parseColor(glowStartColor)
  const glowColorAlpha = `rgba(${startRGB.r},${startRGB.g},${startRGB.b},${glowOpacity})`
  const { horizontal: h, vertical: v } = direction

  const fontStyle_ = {
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    letterSpacing,
    lineHeight: 1,
  }

  return (
    <div
      ref={containerRef}
      style={{
        position:   'relative',
        width:      '100%',
        height:     '100%',
        background: backgroundColor,
        overflow:   'hidden',
        touchAction: 'none',
        ...fontStyle_,
        '--tgh-h':     h,
        '--tgh-v':     v,
        '--tgh-scale': shadowScaleFactor,
      }}
    >
      {shadowCopies}

      {/* Main visible text */}
      <div
        style={{
          position:  'absolute',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex:    1,
          userSelect: 'none',
          whiteSpace: 'pre',
          textAlign:  'center',
          color:      textColor,
          ...fontStyle_,
          textShadow: `
            ${h * -2}px ${v * -2}px ${glowBlur}px      ${glowColorAlpha},
            ${h * -4}px ${v * -4}px ${glowBlur * 2}px  ${glowColorAlpha},
            ${h * -1}px ${v * -1}px ${Math.round(glowBlur / 4)}px ${glowColorAlpha}
          `,
        }}
      >
        {text}
      </div>
    </div>
  )
}
