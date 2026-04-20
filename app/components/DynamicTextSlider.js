'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

const WORDS = [
  { label: 'Film',    href: '/film'    },
  { label: 'Music',   href: '/music'   },
  { label: 'Fashion', href: '/fashion' },
]

const ROT_BASE = -2.76
const clamp    = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

export default function DynamicTextSlider() {
  return (
    <section className="dts-section">
      <p className="dts-eyebrow">Explore the world of</p>
      <h2 className="dts-title">Algee Smith</h2>
      <div className="dts-center">
        <Slider />
      </div>
    </section>
  )
}

function Slider() {
  const boxRef    = useRef(null)
  const dragRef   = useRef(null)
  const [W, setW] = useState(600)
  const [pos, setPos]           = useState(0.5)   // 0 = Film, 0.5 = Music, 1 = Fashion
  const [isDragging, setIsDrag] = useState(false)

  /* Measure box width */
  useEffect(() => {
    const measure = () => { if (boxRef.current) setW(boxRef.current.clientWidth) }
    measure()
    const ro = new ResizeObserver(measure)
    if (boxRef.current) ro.observe(boxRef.current)
    return () => ro.disconnect()
  }, [])

  /* Active word */
  const activeIdx  = pos < 0.33 ? 0 : pos > 0.67 ? 2 : 1
  const activeWord = WORDS[activeIdx]

  /* Subtle rotation from handle position */
  const rotation = ROT_BASE + (pos - 0.5) * 3

  /* Clip window: 1/3 of W wide, centered on pos * W */
  const halfWord    = W / 6
  const clipCenter  = pos * W
  const clipLeftPx  = Math.max(0, clipCenter - halfWord)
  const clipRightPx = Math.max(0, W - clipCenter - halfWord)
  const handlePx    = clamp(clipCenter - 16, 0, W - 32)

  /* Drag */
  const onDown = useCallback((e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startPos: pos }
    setIsDrag(true)
  }, [pos])

  const onMove = useCallback((e) => {
    if (!dragRef.current) return
    const { startX, startPos } = dragRef.current
    setPos(clamp(startPos + (e.clientX - startX) / W, 0, 1))
  }, [W])

  const onUp = useCallback(() => { dragRef.current = null; setIsDrag(false) }, [])

  useEffect(() => {
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup',   onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [onMove, onUp])

  return (
    <div className="dts-wrap">
      <div
        ref={boxRef}
        className="dts-box"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Border ring */}
        <div className="dts-box-border" />

        {/* Dim layer — all three words, faint */}
        <div className="dts-words-row dts-words-dim">
          {WORDS.map(w => <span key={w.label} className="dts-word">{w.label}</span>)}
        </div>

        {/* Bright layer — clipped to active word zone */}
        <div
          className="dts-words-row dts-words-bright"
          style={{ clipPath: `inset(0 ${clipRightPx}px 0 ${clipLeftPx}px round 12px)` }}
        >
          {WORDS.map(w => <span key={w.label} className="dts-word">{w.label}</span>)}
        </div>

        {/* Single sliding handle */}
        <button
          className={`dts-handle${isDragging ? ' active' : ''}`}
          style={{ left: handlePx }}
          onPointerDown={onDown}
          aria-label="Drag to explore"
        >
          <span className="dts-bar" />
        </button>
      </div>

      <div className="dts-footer">
        <span className="dts-hint">← drag to explore →</span>
        <Link href={activeWord.href} className="dts-cta">
          Go to {activeWord.label} →
        </Link>
      </div>
    </div>
  )
}
