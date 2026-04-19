'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SphereImageGrid from './SphereImageGrid'
import SphereActivity from './SphereActivity'

// Curated diverse fan avatars — mix of Black, White, Hispanic, Asian · male & female
// Source: randomuser.me portrait library
// Swap for real Supabase fan photos when auth is live
const FAN_IMAGES = [
  // Black women
  { id: 'bw1',  src: 'https://randomuser.me/api/portraits/women/75.jpg',  alt: 'Fan', title: 'Jasmine T.',   description: 'Atlanta, GA' },
  { id: 'bw2',  src: 'https://randomuser.me/api/portraits/women/91.jpg',  alt: 'Fan', title: 'Naomi R.',     description: 'Chicago, IL' },
  { id: 'bw3',  src: 'https://randomuser.me/api/portraits/women/94.jpg',  alt: 'Fan', title: 'Aaliyah M.',   description: 'Houston, TX' },
  { id: 'bw4',  src: 'https://randomuser.me/api/portraits/women/83.jpg',  alt: 'Fan', title: 'Keisha L.',    description: 'Detroit, MI' },
  { id: 'bw5',  src: 'https://randomuser.me/api/portraits/women/79.jpg',  alt: 'Fan', title: 'Destiny W.',   description: 'New York, NY' },
  { id: 'bw6',  src: 'https://randomuser.me/api/portraits/women/88.jpg',  alt: 'Fan', title: 'Tiana B.',     description: 'Memphis, TN' },

  // Black men
  { id: 'bm1',  src: 'https://randomuser.me/api/portraits/men/75.jpg',    alt: 'Fan', title: 'Marcus J.',    description: 'Los Angeles, CA' },
  { id: 'bm2',  src: 'https://randomuser.me/api/portraits/men/91.jpg',    alt: 'Fan', title: 'DeAndre K.',   description: 'Miami, FL' },
  { id: 'bm3',  src: 'https://randomuser.me/api/portraits/men/83.jpg',    alt: 'Fan', title: 'Isaiah P.',    description: 'St. Louis, MO' },
  { id: 'bm4',  src: 'https://randomuser.me/api/portraits/men/94.jpg',    alt: 'Fan', title: 'Jordan C.',    description: 'Philadelphia, PA' },
  { id: 'bm5',  src: 'https://randomuser.me/api/portraits/men/79.jpg',    alt: 'Fan', title: 'Malik S.',     description: 'Baltimore, MD' },
  { id: 'bm6',  src: 'https://randomuser.me/api/portraits/men/88.jpg',    alt: 'Fan', title: 'Tre W.',       description: 'Oakland, CA' },

  // Hispanic / Latina women
  { id: 'hw1',  src: 'https://randomuser.me/api/portraits/women/32.jpg',  alt: 'Fan', title: 'Sofia R.',     description: 'Miami, FL' },
  { id: 'hw2',  src: 'https://randomuser.me/api/portraits/women/36.jpg',  alt: 'Fan', title: 'Valentina G.', description: 'San Antonio, TX' },
  { id: 'hw3',  src: 'https://randomuser.me/api/portraits/women/42.jpg',  alt: 'Fan', title: 'Camila V.',    description: 'Los Angeles, CA' },
  { id: 'hw4',  src: 'https://randomuser.me/api/portraits/women/55.jpg',  alt: 'Fan', title: 'Lucia M.',     description: 'El Paso, TX' },

  // Hispanic / Latino men
  { id: 'hm1',  src: 'https://randomuser.me/api/portraits/men/32.jpg',    alt: 'Fan', title: 'Carlos M.',    description: 'Dallas, TX' },
  { id: 'hm2',  src: 'https://randomuser.me/api/portraits/men/36.jpg',    alt: 'Fan', title: 'Miguel A.',    description: 'Phoenix, AZ' },
  { id: 'hm3',  src: 'https://randomuser.me/api/portraits/men/42.jpg',    alt: 'Fan', title: 'Diego R.',     description: 'San Diego, CA' },
  { id: 'hm4',  src: 'https://randomuser.me/api/portraits/men/55.jpg',    alt: 'Fan', title: 'Andres F.',    description: 'New York, NY' },

  // White women
  { id: 'ww1',  src: 'https://randomuser.me/api/portraits/women/12.jpg',  alt: 'Fan', title: 'Emma H.',      description: 'Nashville, TN' },
  { id: 'ww2',  src: 'https://randomuser.me/api/portraits/women/18.jpg',  alt: 'Fan', title: 'Olivia S.',    description: 'Seattle, WA' },
  { id: 'ww3',  src: 'https://randomuser.me/api/portraits/women/23.jpg',  alt: 'Fan', title: 'Ava N.',       description: 'Denver, CO' },
  { id: 'ww4',  src: 'https://randomuser.me/api/portraits/women/28.jpg',  alt: 'Fan', title: 'Lily T.',      description: 'Austin, TX' },
  { id: 'ww5',  src: 'https://randomuser.me/api/portraits/women/6.jpg',   alt: 'Fan', title: 'Grace F.',     description: 'Boston, MA' },

  // White men
  { id: 'wm1',  src: 'https://randomuser.me/api/portraits/men/12.jpg',    alt: 'Fan', title: 'Tyler B.',     description: 'Chicago, IL' },
  { id: 'wm2',  src: 'https://randomuser.me/api/portraits/men/18.jpg',    alt: 'Fan', title: 'Ryan D.',      description: 'Portland, OR' },
  { id: 'wm3',  src: 'https://randomuser.me/api/portraits/men/23.jpg',    alt: 'Fan', title: 'Jake M.',      description: 'Minneapolis, MN' },
  { id: 'wm4',  src: 'https://randomuser.me/api/portraits/men/6.jpg',     alt: 'Fan', title: 'Noah K.',      description: 'Charlotte, NC' },

  // Asian women
  { id: 'aw1',  src: 'https://randomuser.me/api/portraits/women/15.jpg',  alt: 'Fan', title: 'Mia L.',       description: 'San Francisco, CA' },
  { id: 'aw2',  src: 'https://randomuser.me/api/portraits/women/19.jpg',  alt: 'Fan', title: 'Yuna K.',      description: 'Los Angeles, CA' },
  { id: 'aw3',  src: 'https://randomuser.me/api/portraits/women/47.jpg',  alt: 'Fan', title: 'Priya S.',     description: 'Houston, TX' },
  { id: 'aw4',  src: 'https://randomuser.me/api/portraits/women/63.jpg',  alt: 'Fan', title: 'Aisha N.',     description: 'New York, NY' },

  // Asian men
  { id: 'am1',  src: 'https://randomuser.me/api/portraits/men/15.jpg',    alt: 'Fan', title: 'Kevin C.',     description: 'Seattle, WA' },
  { id: 'am2',  src: 'https://randomuser.me/api/portraits/men/19.jpg',    alt: 'Fan', title: 'James L.',     description: 'San Jose, CA' },
  { id: 'am3',  src: 'https://randomuser.me/api/portraits/men/47.jpg',    alt: 'Fan', title: 'Raj P.',       description: 'Atlanta, GA' },

  // International
  { id: 'in1',  src: 'https://randomuser.me/api/portraits/women/68.jpg',  alt: 'Fan', title: 'Amara D.',     description: 'London, UK' },
  { id: 'in2',  src: 'https://randomuser.me/api/portraits/men/68.jpg',    alt: 'Fan', title: 'Omar A.',      description: 'Toronto, Canada' },
  { id: 'in3',  src: 'https://randomuser.me/api/portraits/women/71.jpg',  alt: 'Fan', title: 'Fatima B.',    description: 'Paris, France' },
  { id: 'in4',  src: 'https://randomuser.me/api/portraits/men/71.jpg',    alt: 'Fan', title: 'Kwame O.',     description: 'Lagos, Nigeria' },
  { id: 'in5',  src: 'https://randomuser.me/api/portraits/women/60.jpg',  alt: 'Fan', title: 'Chloe V.',     description: 'Brussels, Belgium' },
  { id: 'in6',  src: 'https://randomuser.me/api/portraits/men/60.jpg',    alt: 'Fan', title: 'Andre S.',     description: 'São Paulo, Brazil' },
  { id: 'in7',  src: 'https://randomuser.me/api/portraits/women/85.jpg',  alt: 'Fan', title: 'Zara H.',      description: 'Dubai, UAE' },
  { id: 'in8',  src: 'https://randomuser.me/api/portraits/men/85.jpg',    alt: 'Fan', title: 'Luca B.',      description: 'Milan, Italy' },
]

const STATS = [
  { value: '40+',  label: 'Countries'  },
  { value: '200+', label: 'Cities'     },
  { value: '10K+', label: 'Members'    },
  { value: '1',    label: 'Community'  },
]

export default function FanWorldSection() {
  const [sphereSize, setSphereSize] = useState(560)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 420)      setSphereSize(280)
      else if (w < 600) setSphereSize(360)
      else if (w < 800) setSphereSize(460)
      else              setSphereSize(560)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const sphereRadius   = Math.round(sphereSize * 0.393)
  const baseImageScale = sphereSize < 350 ? 0.12 : 0.105

  return (
    <section className="fan-world-section">

      {/* ── Header ── */}
      <div className="fan-world-header reveal">
        <div className="fan-world-label">The Community</div>
        <h2 className="fan-world-headline">
          One World.<br />
          <span className="italic">Everywhere.</span>
        </h2>
        <p className="fan-world-sub">
          Algee&apos;s fans span every continent, every city, every story.
          Direct from the artist. No algorithm in between.
        </p>
      </div>

      {/* ── Sphere centered ── */}
      <div className="fan-world-sphere reveal">
        <div className="sphere-activity-container">
          <SphereActivity />
          <SphereImageGrid
            images={FAN_IMAGES}
            containerSize={sphereSize}
            sphereRadius={sphereRadius}
            autoRotate
            autoRotateSpeed={0.18}
            dragSensitivity={0.5}
            baseImageScale={baseImageScale}
          />
        </div>
        <div className="fan-world-sphere-hint">Drag to explore</div>
      </div>

      {/* ── Stats ── */}
      <div className="fan-world-stats reveal">
        {STATS.map(({ value, label }) => (
          <div key={label} className="fan-world-stat">
            <div className="fan-world-stat-value">{value}</div>
            <div className="fan-world-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="fan-world-cta reveal">
        <p className="fan-world-cta-text">Your city&apos;s on the map. Are you?</p>
        <Link href="/account" className="fan-world-cta-btn">
          Join the World →
        </Link>
      </div>

    </section>
  )
}
