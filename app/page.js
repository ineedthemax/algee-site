import HeroSection from './components/HeroSection'
import FanWorldSection from './components/FanWorldSection'
import { CountdownHero } from './components/CountdownTimer'
import Image from 'next/image'

import AlbumSpotlight from './components/AlbumSpotlight'
import QuoteSection from './components/QuoteSection'
import PressStrip from './components/PressStrip'
import OriginSection from './components/OriginSection'
import PhotoMoments from './components/PhotoMoments'

import SchemaMarkup from './components/SchemaMarkup'

export const metadata = {
  title: 'Algee Smith | Actor, Recording Artist, Entrepreneur & Philanthropist',
  description: 'Algee Smith is an actor, recording artist, entrepreneur, and philanthropist from Saginaw, Michigan - known for The Hate U Give, Euphoria, and his debut album Love Lost.',
  openGraph: {
    title: 'Algee Smith | Actor, Recording Artist, Entrepreneur & Philanthropist',
    description: 'Algee Smith is an actor, recording artist, entrepreneur, and philanthropist from Saginaw, Michigan - known for The Hate U Give, Euphoria, and his debut album Love Lost.',
    images: ['/images/hero/algee-hero.jpg'],
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Algee Smith | Actor, Recording Artist, Entrepreneur & Philanthropist',
    description: 'Algee Smith is an actor, recording artist, entrepreneur, and philanthropist from Saginaw, Michigan.',
    images: ['/images/hero/algee-hero.jpg'],
  },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': ['Person', 'MusicGroup'],
  name: 'Algee Smith',
  description: 'Algee Smith is an actor, recording artist, entrepreneur, and philanthropist from Saginaw, Michigan.',
  url: 'https://algeesmith.com',
  image: 'https://algeesmith.com/images/hero/algee-hero.jpg',
  birthPlace: { '@type': 'Place', name: 'Saginaw, Michigan, USA' },
  nationality: 'American',
  genre: ['R&B', 'Soul'],
  sameAs: [
    'https://www.instagram.com/algeesmith/',
    'https://open.spotify.com/artist/10gHoEHUPNcTFsyVR2YyeA',
    'https://music.apple.com/us/artist/algee-smith/582360998',
    'https://www.youtube.com/@itsalgee',
    'https://en.wikipedia.org/wiki/Algee_Smith',
  ],
  knowsAbout: ['Acting', 'R&B Music', 'Songwriting', 'Entrepreneurship', 'Philanthropy'],
  hasOccupation: [
    { '@type': 'Occupation', name: 'Actor' },
    { '@type': 'Occupation', name: 'Recording Artist' },
    { '@type': 'Occupation', name: 'Songwriter' },
    { '@type': 'Occupation', name: 'Entrepreneur' },
    { '@type': 'Occupation', name: 'Philanthropist' },
  ],
}

// Marquee items - duplicated for seamless infinite loop
const MARQUEE_ITEMS = [
  { text: 'Music',      italic: false, star: true  },
  { text: 'Film',       italic: true,  star: false },
  { text: 'Merch',      italic: false, star: true  },
  { text: 'Community',  italic: true,  star: false },
  { text: 'Two Stages', italic: false, star: true  },
  { text: 'One Soul',   italic: true,  star: false },
]

const allItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

export default function Home() {
  return (
    <>
      <SchemaMarkup schema={personSchema} />

      {/* ══ HERO ZONE ══ */}
      <HeroSection />
      <PressStrip />
      {/* ── OTW Pre-Save ── */}
      <div className="otw-presave-strip">
        <div className="otw-presave-inner">
          <Image
            src="/images/otw-cover.jpg"
            alt="OTW — New Single"
            width={120}
            height={120}
            className="otw-presave-cover"
          />
          <div className="otw-presave-text">
            <div className="otw-presave-label">New Single</div>
            <div className="otw-presave-title">OTW</div>
            <div className="otw-presave-date">Dropping July 7</div>
          </div>
          <a
            href="https://lnk.to/otwsong"
            target="_blank"
            rel="noopener noreferrer"
            className="otw-presave-btn"
          >
            Pre-Save Now
          </a>
        </div>
      </div>

      <CountdownHero />

      {/* ══ STORY ZONE ══ */}
      <div className="page-zone">
        {/* Marquee divider */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {allItems.map((item, i) => (
              <span
                key={i}
                className={`marquee-item${item.italic ? ' italic' : ''}`}
              >
                {item.text}
                {item.star && (
                  <span className="marquee-star">✦</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <QuoteSection />
        <OriginSection />
      </div>

      {/* ══ MUSIC ZONE ══ */}
      <div className="page-zone">
        <AlbumSpotlight />
        <PhotoMoments />
      </div>

      {/* ══ COMMUNITY ZONE ══ */}
      <div className="page-zone">
        <FanWorldSection />
      </div>
    </>
  )
}
