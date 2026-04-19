'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

/* ── constants ── */
const MIN_RANGE   = 60
const ROT_BASE    = -2.76
const THETA       = ROT_BASE * (Math.PI / 180)
const COS_T       = Math.cos(THETA)
const SIN_T       = Math.sin(THETA)
const clamp       = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

const WORDS = [
  { label: 'Fashion', href: '/fashion' },
  { label: 'Music',   href: '/music'   },
  { label: 'Film',    href: '/film'    },
]

/* ─────────────────────────────────────────
   Main export
───────────────────────────────────────── */
export default function DynamicTextSlider() {
  const measureRef = useRef(null)
  const [textWidth, setTextWidth] = useState(380)

  useEffect(() => {
    const measure = () => {
      if (measureRef.current) setTextWidth(measureRef.current.clientWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    if (measureRef.current) ro.observe(measureRef.current)
    return () => { window.removeEventListener('resize', measure); ro.disconnect() }
  }, [])

  return (
    <section className="dts-section">

      {/* Eyebrow */}
      <p className="dts-eyebrow">Explore the world of</p>

      {/* Large static heading */}
      <h2 className="dts-title">Algee Smith</h2>

      {/* Hidden measurement span — must match slider font exactly */}
      <span ref={measureRef} className="dts-measure" aria-hidden="true">
        Fashion
      </span>

      {/* The slider */}
      <div className="dts-center">
        <Slider width={textWidth} />
      </div>

    </section>
  )
}

/* ─────────────────────────────────────────
   Two-handle slider
───────────────────────────────────────── */
function Slider({ width: rawWidth }) {
  const W           = rawWidth + 48          // add padding
  const HANDLE_W    = 32
  const H           = 80

  const [left,     setLeft]    = useState(0)
  const [right,    setRight]   = useState(W)
  const [dragging, setDragging] = useState(null)
  const [rotation, setRotation] = useState(ROT_BASE)
  const [word,     setWord]    = useState(1)  // 0=Fashion 1=Music 2=Film

  const lRef    = useRef(0)
  const rRef    = useRef(W)
  const dragRef = useRef(null)

  /* keep refs in sync */
  useEffect(() => { lRef.current = left;  rRef.current = right }, [left, right])

  /* reset right when width changes */
  useEffect(() => { setRight(W); rRef.current = W }, [W])

  /* update word + tilt from handle midpoint */
  useEffect(() => {
    if (W <= 0) return
    const mid    = (left + right) / 2
    const ratio  = mid / W
    setWord(ratio < 0.33 ? 0 : ratio > 0.67 ? 2 : 1)
    const dev    = (mid - W / 2) / (W / 2)
    setRotation(ROT_BASE + dev * 3)
  }, [left, right, W])

  /* drag start */
  const onDown = useCallback((handle, e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { handle, sx: e.clientX, sy: e.clientY, il: lRef.current, ir: rRef.current }
    setDragging(handle)
  }, [])

  /* drag move */
  const onMove = useCallback((e) => {
    if (!dragRef.current) return
    const { handle, sx, sy, il, ir } = dragRef.current
    const proj = (e.clientX - sx) * COS_T + (e.clientY - sy) * SIN_T
    if (handle === 'left')  setLeft(clamp(il + proj, 0, rRef.current - MIN_RANGE))
    else                    setRight(clamp(ir + proj, lRef.current + MIN_RANGE, W))
  }, [W])

  /* drag end */
  const onUp = useCallback(() => { dragRef.current = null; setDragging(null) }, [])

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

  const activeWord = WORDS[word]

  return (
    <div className="dts-wrap">
      {/* Rotated slider box */}
      <div
        className="dts-box"
        style={{ width: W, height: H, transform: `rotate(${rotation}deg)` }}
      >
        {/* Border ring */}
        <div className="dts-box-border" />

        {/* Left handle */}
        <button
          className={`dts-handle dts-handle-left${dragging === 'left' ? ' active' : ''}`}
          style={{ left: left }}
          onPointerDown={(e) => onDown('left', e)}
          aria-label="Left handle"
          tabIndex={0}
        >
          <span className="dts-bar" />
        </button>

        {/* Right handle */}
        <button
          className={`dts-handle dts-handle-right${dragging === 'right' ? ' active' : ''}`}
          style={{ left: right - HANDLE_W }}
          onPointerDown={(e) => onDown('right', e)}
          aria-label="Right handle"
          tabIndex={0}
        >
          <span className="dts-bar" />
        </button>

        {/* Clipped text — only visible between handles */}
        <div
          className="dts-clip"
          style={{ clipPath: `inset(0 ${W - right}px 0 ${left}px round 14px)` }}
        >
          {activeWord.label}
        </div>
      </div>

      {/* Below: hint + CTA */}
      <div className="dts-footer">
        <span className="dts-hint">← drag to explore →</span>
        <Link href={activeWord.href} className="dts-cta">
          Go to {activeWord.label} →
        </Link>
      </div>
    </div>
  )
}
