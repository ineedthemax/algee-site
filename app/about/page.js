import Image from 'next/image'
import Link from 'next/link'
import CareerTimeline from '../components/CareerTimeline'
import SchemaMarkup from '../components/SchemaMarkup'

export const metadata = {
  title:       'About Algee Smith - Actor, Recording Artist, Entrepreneur & Philanthropist',
  description: 'Algee Smith is an actor, recording artist, entrepreneur, and philanthropist from Saginaw, Michigan. Known for The Hate U Give, Euphoria, and his debut album Love Lost.',
  openGraph: {
    title: 'About Algee Smith',
    description: 'Actor, recording artist, entrepreneur, and philanthropist from Saginaw, Michigan.',
    images: ['/images/hero/algee-hero.jpg'],
  },
}

const bioSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Algee Smith',
  description: 'Algee Smith is an actor, recording artist, entrepreneur, and philanthropist from Saginaw, Michigan. He is known for his roles in The Hate U Give, Euphoria on HBO, Detroit, Judas and the Black Messiah, and his debut studio album Love Lost.',
  url: 'https://algeesmith.com/about',
  image: 'https://algeesmith.com/images/hero/algee-hero.jpg',
  birthPlace: { '@type': 'Place', name: 'Saginaw, Michigan, USA' },
  nationality: 'American',
  genre: ['R&B', 'Soul'],
  jobTitle: ['Actor', 'Recording Artist', 'Entrepreneur', 'Philanthropist'],
  sameAs: [
    'https://www.instagram.com/algeesmith/',
    'https://open.spotify.com/artist/10gHoEHUPNcTFsyVR2YyeA',
    'https://music.apple.com/us/artist/algee-smith/582360998',
    'https://en.wikipedia.org/wiki/Algee_Smith',
  ],
  performerIn: [
    { '@type': 'Movie',     name: 'The Hate U Give',          datePublished: '2018' },
    { '@type': 'Movie',     name: 'Detroit',                   datePublished: '2017' },
    { '@type': 'Movie',     name: 'Judas and the Black Messiah', datePublished: '2021' },
    { '@type': 'TVSeries',  name: 'Euphoria',                  datePublished: '2019' },
    { '@type': 'TVSeries',  name: 'The New Edition Story',     datePublished: '2017' },
  ],
}

const STATS = [
  { value: '7+',   label: 'Years Active'    },
  { value: '10+',  label: 'Screen Credits'  },
  { value: '2',    label: 'Albums'          },
  { value: '∞',    label: 'Stories to Tell' },
]

const LINKS = [
  { label: 'Stream Music →', href: '/music' },
  { label: 'Film Credits →', href: '/film'  },
]

export default function AboutPage() {
  return (
    <div className="about-page">
      <SchemaMarkup schema={bioSchema} />

      {/* ─── Page Hero ─── */}
      <div className="page-hero">
        <div className="page-hero-label">About</div>
        <h1>
          Two <span className="italic">Stages.</span>
        </h1>
        <p className="page-hero-sub">
          Actor. Singer. Songwriter. Saginaw raised. World built.
        </p>
      </div>

      {/* ─── Bio Section ─── */}
      <div className="about-section">

        <div className="about-layout reveal">
          {/* Photo */}
          <div className="about-photo-wrap">
            <Image
              src="/images/algee-1.webp"
              alt="Algee Smith"
              width={520}
              height={680}
              priority
            />
            <div className="about-photo-caption">Algee Smith</div>
          </div>

          {/* Text */}
          <div className="about-text">
            <div className="about-eyebrow">The Story</div>

            <div className="about-bio">
              <p>
                Algee Smith is an actor and recording artist from Saginaw, Michigan.
                Known for commanding the stage and the screen with equal intensity,
                he moves between music and film with the same soulful precision.
              </p>
              <p>
                His breakout role as Ralph Tresvant in BET&apos;s
                <em> The New Edition Story</em> introduced him to the world.
                From there: <em>The Hate U Give</em>, HBO&apos;s <em>Euphoria</em>,
                and a string of credits that mark him as one of the most versatile
                talents of his generation.
              </p>
              <p>
                His debut album <em>Love Lost</em> is a direct expression of
                everything he&apos;s carried: grief, joy, love, and the relentless
                drive to create. No middleman. Direct to the fans who built him.
              </p>
            </div>

            {/* Stats */}
            <div className="about-stats">
              {STATS.map(({ value, label }) => (
                <div key={label} className="about-stat">
                  <div className="about-stat-value">{value}</div>
                  <div className="about-stat-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="about-links">
              {LINKS.map(({ label, href }) => (
                <Link key={href} href={href} className="about-link">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ─── Quote ─── */}
      <div className="about-quote-section">
        <div className="about-quote reveal">
          <div className="about-quote-mark">"</div>
          <blockquote className="about-quote-text">
            Two stages. One soul.
          </blockquote>
          <div className="about-quote-attr">Algee Smith</div>
        </div>
      </div>

      {/* ─── OTW Pre-Save ─── */}
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

      {/* ─── Career Timeline ─── */}
      <CareerTimeline />

    </div>
  )
}
