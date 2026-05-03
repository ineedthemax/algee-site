'use client'

import { motion } from 'framer-motion'

// ── SVG Shapes ──────────────────────────────────────────────────────

function Clapperboard({ size = 48, opacity = 0.18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Board body */}
      <rect x="4" y="16" width="40" height="28" rx="3" fill="#1a1a1a" stroke="#C4222E" strokeWidth="1.5" opacity={opacity * 5}/>
      {/* Top stripe bar */}
      <rect x="4" y="8" width="40" height="10" rx="2" fill="#C4222E" opacity={opacity * 5}/>
      {/* Diagonal stripes on top bar */}
      {[0,1,2,3,4,5].map(i => (
        <line key={i} x1={8 + i * 7} y1="8" x2={4 + i * 7} y2="18"
          stroke="#1a1a1a" strokeWidth="2.5" opacity={opacity * 5}/>
      ))}
      {/* Hinge line */}
      <line x1="4" y1="16" x2="44" y2="16" stroke="#C4222E" strokeWidth="1" opacity={opacity * 4}/>
      {/* Text lines on board */}
      <rect x="10" y="24" width="20" height="2" rx="1" fill="#333" opacity={opacity * 4}/>
      <rect x="10" y="30" width="14" height="2" rx="1" fill="#333" opacity={opacity * 3}/>
    </svg>
  )
}

function FilmStrip({ size = 52, opacity = 0.18 }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 52 80" fill="none">
      {/* Film body */}
      <rect x="4" y="4" width="44" height="72" rx="3" fill="#111" stroke="#C4222E" strokeWidth="1.5" opacity={opacity * 5}/>
      {/* Sprocket holes - left */}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x="6" y={10 + i * 11} width="6" height="7" rx="1" fill="#0a0a0a" stroke="#C4222E" strokeWidth="0.8" opacity={opacity * 4}/>
      ))}
      {/* Sprocket holes - right */}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x="40" y={10 + i * 11} width="6" height="7" rx="1" fill="#0a0a0a" stroke="#C4222E" strokeWidth="0.8" opacity={opacity * 4}/>
      ))}
      {/* Frame windows */}
      {[0,1,2].map(i => (
        <rect key={i} x="16" y={8 + i * 22} width="20" height="16" rx="2" fill="#1a1a1a" stroke="rgba(245,240,235,0.1)" strokeWidth="1" opacity={opacity * 4}/>
      ))}
    </svg>
  )
}

function Spotlight({ size = 60, opacity = 0.15 }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 60 78" fill="none">
      {/* Spotlight body */}
      <ellipse cx="30" cy="14" rx="16" ry="10" fill="#1a1a1a" stroke="#C4222E" strokeWidth="1.5" opacity={opacity * 5}/>
      <rect x="22" y="4" width="16" height="12" rx="2" fill="#111" stroke="#C4222E" strokeWidth="1" opacity={opacity * 5}/>
      {/* Lens */}
      <circle cx="30" cy="16" r="8" fill="#C4222E" opacity={opacity * 3}/>
      <circle cx="30" cy="16" r="5" fill="#C4222E" opacity={opacity * 4}/>
      {/* Light cone */}
      <path d="M 18 22 L 2 76 L 58 76 L 42 22 Z" fill="url(#spotGrad)" opacity={opacity * 4}/>
      <defs>
        <linearGradient id="spotGrad" x1="30" y1="22" x2="30" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4222E" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#C4222E" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function DirectorStar({ size = 44, opacity = 0.18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <polygon
        points="22,2 26.9,15.5 41.6,15.5 29.9,24 34.8,37.5 22,29 9.2,37.5 14.1,24 2.4,15.5 17.1,15.5"
        fill="#C4222E"
        opacity={opacity * 5}
        stroke="rgba(245,240,235,0.1)"
        strokeWidth="1"
      />
      <polygon
        points="22,8 25.4,18.2 36.1,18.2 27.5,24.5 30.9,34.6 22,28.3 13.1,34.6 16.5,24.5 7.9,18.2 18.6,18.2"
        fill="#0a0a0a"
        opacity={opacity * 4}
      />
    </svg>
  )
}

function ScriptPage({ size = 44, opacity = 0.16 }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 44 58" fill="none">
      <rect x="4" y="4" width="36" height="50" rx="3" fill="#111" stroke="#C4222E" strokeWidth="1.5" opacity={opacity * 5}/>
      {/* Hole punches */}
      {[16, 29, 42].map(y => (
        <circle key={y} cx="10" cy={y} r="2.5" fill="#0a0a0a" stroke="#C4222E" strokeWidth="0.8" opacity={opacity * 4}/>
      ))}
      {/* Text lines */}
      {[12, 18, 24, 30, 36, 42].map(y => (
        <rect key={y} x="16" y={y} width={y % 12 === 0 ? 20 : 14} height="2" rx="1" fill="#333" opacity={opacity * 4}/>
      ))}
    </svg>
  )
}

// ── Element definitions with positions ─────────────────────────────

const ELEMENTS = [
  {
    id: 'clap1',
    component: Clapperboard,
    props: { size: 52, opacity: 0.22 },
    style: { top: '8%',  left: '6%'  },
    float: { y: [-12, 8],  rotate: [-6, 4],   duration: 5.2 },
  },
  {
    id: 'film1',
    component: FilmStrip,
    props: { size: 44, opacity: 0.18 },
    style: { top: '18%', right: '5%' },
    float: { y: [8, -14], rotate: [4, -6],  duration: 6.8 },
  },
  {
    id: 'spot1',
    component: Spotlight,
    props: { size: 56, opacity: 0.16 },
    style: { top: '32%', left: '4%'  },
    float: { y: [-8, 12], rotate: [-3, 5],  duration: 7.4 },
  },
  {
    id: 'star1',
    component: DirectorStar,
    props: { size: 40, opacity: 0.22 },
    style: { top: '44%', right: '6%' },
    float: { y: [10, -10], rotate: [8, -8], duration: 4.9 },
  },
  {
    id: 'script1',
    component: ScriptPage,
    props: { size: 46, opacity: 0.18 },
    style: { top: '57%', left: '5%'  },
    float: { y: [-10, 10], rotate: [-4, 4], duration: 6.1 },
  },
  {
    id: 'clap2',
    component: Clapperboard,
    props: { size: 38, opacity: 0.14 },
    style: { top: '70%', right: '5%' },
    float: { y: [8, -12], rotate: [3, -7],  duration: 5.7 },
  },
  {
    id: 'film2',
    component: FilmStrip,
    props: { size: 36, opacity: 0.14 },
    style: { top: '82%', left: '4%'  },
    float: { y: [-6, 10], rotate: [-5, 3],  duration: 7.0 },
  },
  {
    id: 'star2',
    component: DirectorStar,
    props: { size: 32, opacity: 0.14 },
    style: { top: '92%', right: '6%' },
    float: { y: [6, -8],  rotate: [6, -4],  duration: 5.5 },
  },
]

export default function FloatingActingElements() {
  return (
    <div className="floating-elements" aria-hidden="true">
      {ELEMENTS.map(({ id, component: Comp, props, style, float }) => (
        <motion.div
          key={id}
          className="floating-el"
          style={style}
          animate={{
            y:      float.y,
            rotate: float.rotate,
          }}
          transition={{
            duration:  float.duration,
            repeat:    Infinity,
            repeatType:'reverse',
            ease:      'easeInOut',
          }}
        >
          <Comp {...props} />
        </motion.div>
      ))}
    </div>
  )
}
