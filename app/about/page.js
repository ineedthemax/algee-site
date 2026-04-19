import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title:       'About — Algee Smith',
  description: 'Actor, singer, songwriter. Two stages, one soul.',
}

const STATS = [
  { value: '7+',   label: 'Years Active'    },
  { value: '10+',  label: 'Screen Credits'  },
  { value: '1',    label: 'Album'           },
  { value: '∞',    label: 'Stories to Tell' },
]

const LINKS = [
  { label: 'Stream Music →', href: '/music' },
  { label: 'Film Credits →', href: '/film'  },
]

export default function AboutPage() {
  return (
    <div className="about-page">

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
              src="/images/algee-1.jpg"
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

    </div>
  )
}
