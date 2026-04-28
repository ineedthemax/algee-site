import HeroSection from './components/HeroSection'
import FanWorldSection from './components/FanWorldSection'
import DynamicTextSlider from './components/DynamicTextSlider'
import SchemaMarkup from './components/SchemaMarkup'

export const metadata = {
  title: 'Algee Smith | Actor, Recording Artist, Entrepreneur & Philanthropist',
  description: 'Algee Smith is an actor, recording artist, entrepreneur, and philanthropist from Saginaw, Michigan — known for The Hate U Give, Euphoria, and his debut album Love Lost.',
  openGraph: {
    title: 'Algee Smith | Actor, Recording Artist, Entrepreneur & Philanthropist',
    description: 'Algee Smith is an actor, recording artist, entrepreneur, and philanthropist from Saginaw, Michigan — known for The Hate U Give, Euphoria, and his debut album Love Lost.',
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

// Marquee items — duplicated for seamless infinite loop
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

      <HeroSection />

      {/* ─── Marquee ─── */}
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

      {/* ─── Dynamic Text Slider ─── */}
      <DynamicTextSlider />

      {/* ─── Fan World ─── */}
      <FanWorldSection />
    </>
  )
}
