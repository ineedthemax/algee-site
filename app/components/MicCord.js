'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

// The cord path — weaves left/right down the page
// ViewBox: 200 wide, 3200 tall. Centers at x=100.
const CORD_PATH = `
  M 100 0
  C 170 120, 170 220, 100 300
  C 30  380,  30  480, 100 560
  C 170 640, 170 740, 100 820
  C 30  900,  30 1000, 100 1080
  C 170 1160, 170 1260, 100 1340
  C 30 1420,  30 1520, 100 1600
  C 170 1680, 170 1780, 100 1860
  C 30 1940,  30 2040, 100 2120
  C 170 2200, 170 2300, 100 2380
  C 30 2460,  30 2560, 100 2640
  C 170 2720, 170 2820, 100 2900
  C 30 2980,  30 3080, 100 3160
`

// Mic plug SVG at the top
function MicPlug() {
  return (
    <g transform="translate(100, 0)">
      {/* Jack body */}
      <rect x="-6" y="-28" width="12" height="20" rx="3" fill="#1a1a1a" stroke="#C4222E" strokeWidth="1.5"/>
      {/* Tip */}
      <rect x="-3" y="-44" width="6" height="18" rx="3" fill="#C4222E"/>
      {/* Band rings */}
      <rect x="-7" y="-20" width="14" height="3" rx="1" fill="#C4222E" opacity="0.7"/>
      <rect x="-7" y="-14" width="14" height="3" rx="1" fill="#C4222E" opacity="0.4"/>
    </g>
  )
}

// Small connector dot at the bottom
function CordEnd() {
  return (
    <g transform="translate(100, 3160)">
      <circle r="6" fill="#C4222E" opacity="0.8"/>
      <circle r="3" fill="#0A0A0A"/>
    </g>
  )
}

export default function MicCord() {
  const ref           = useRef(null)
  const pathRef       = useRef(null)
  const [pathLen, setPathLen] = useState(0)

  const { scrollYProgress } = useScroll()
  const rawDraw  = useTransform(scrollYProgress, [0, 0.92], [0, 1])
  const drawPct  = useSpring(rawDraw, { stiffness: 60, damping: 20 })

  // Measure path length after mount
  useEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength())
    }
  }, [])

  const strokeDashoffset = useTransform(drawPct, v => pathLen - v * pathLen)

  return (
    <div ref={ref} className="mic-cord-wrap" aria-hidden="true">
      <svg
        viewBox="0 0 200 3200"
        preserveAspectRatio="xMidYMid meet"
        className="mic-cord-svg"
        fill="none"
      >
        {/* Glow shadow behind cord */}
        <motion.path
          d={CORD_PATH}
          stroke="#C4222E"
          strokeWidth="6"
          strokeLinecap="round"
          opacity={0.08}
          style={{ filter: 'blur(4px)' }}
          strokeDasharray={pathLen}
          strokeDashoffset={strokeDashoffset}
        />

        {/* Main cord — dark cable */}
        <motion.path
          ref={pathRef}
          d={CORD_PATH}
          stroke="#1c1c1c"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={pathLen || 9999}
          strokeDashoffset={strokeDashoffset}
        />

        {/* Highlight line on cord */}
        <motion.path
          d={CORD_PATH}
          stroke="rgba(245,240,235,0.07)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={pathLen || 9999}
          strokeDashoffset={strokeDashoffset}
        />

        {/* Red accent dots at each curve peak */}
        {[300,560,820,1080,1340,1600,1860,2120,2380,2640,2900].map((y, i) => (
          <motion.circle
            key={y}
            cx={i % 2 === 0 ? 100 : 100}
            cy={y}
            r="3"
            fill="#C4222E"
            opacity={0.6}
            style={{ opacity: useTransform(drawPct, [Math.max(0,(y/3200)-0.05), y/3200], [0, 0.6]) }}
          />
        ))}

        <MicPlug />
        <CordEnd />
      </svg>
    </div>
  )
}
