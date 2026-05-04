import Image from 'next/image'
import Link from 'next/link'
import { ALBUM, TRACKS, STREAMING } from '../data/music'
import MusicPhotoStrip from '../components/MusicPhotoStrip'
import SchemaMarkup from '../components/SchemaMarkup'

export const metadata = {
  title: 'Music — Algee Smith | Love Lost (Debut Album)',
  description: 'Stream Love Lost, the debut album from Algee Smith. Available on Spotify, Apple Music, Tidal, Amazon Music, and YouTube Music.',
  openGraph: {
    title: 'Algee Smith — Love Lost (Debut Album)',
    description: 'Stream Love Lost — available everywhere now.',
    images: ['/images/music/love-lost-cover.webp'],
  },
}

const albumSchema = {
  '@context': 'https://schema.org',
  '@type': 'MusicAlbum',
  name: 'Love Lost',
  byArtist: {
    '@type': 'MusicGroup',
    name: 'Algee Smith',
    url: 'https://algeesmith.com',
  },
  datePublished: '2025',
  genre: ['R&B', 'Soul'],
  url: 'https://algeesmith.com/music',
  image: 'https://algeesmith.com/images/music/love-lost-cover.webp',
  offers: [
    { '@type': 'Offer', name: 'Spotify',     url: 'https://open.spotify.com/artist/10gHoEHUPNcTFsyVR2YyeA' },
    { '@type': 'Offer', name: 'Apple Music', url: 'https://music.apple.com/us/album/love-lost/1826959437' },
    { '@type': 'Offer', name: 'Tidal',       url: 'https://tidal.com/browse/track/448345017' },
  ],
}

// First lyric line per track for hover preview
function getPreview(track) {
  const first = track.lyrics?.[0]?.lines?.[0]
  return first ?? null
}

export default function MusicPage() {
  return (
    <div className="music-page">
      <SchemaMarkup schema={albumSchema} />

      {/* ─── Cinematic Hero ─── */}
      <div className="music-hero">

        {/* Blurred bg */}
        <div className="music-hero-bg" aria-hidden="true">
          <Image
            src="/images/music/love-lost-cover.webp"
            alt=""
            fill
            sizes="100vw"
            className="music-hero-bg-img"
            priority
          />
          <div className="music-hero-bg-overlay" />
        </div>

        <div className="music-hero-inner">

          {/* Album cover */}
          <div className="music-hero-cover">
            <Image
              src="/images/music/love-lost-cover.webp"
              alt="Love Lost — Algee Smith"
              fill
              sizes="(max-width: 900px) 60vw, 340px"
              className="music-hero-cover-img"
              priority
            />
          </div>

          {/* Info */}
          <div className="music-hero-info">
            <div className="music-hero-eyebrow">Debut Album · 2025 · R&amp;B / Soul</div>
            <h1 className="music-hero-title">
              Love <em>Lost</em>
            </h1>
            <p className="music-hero-artist">Algee Smith</p>
            <p className="music-hero-about">
              Eight tracks about love, loss, and everything in between.
              Written from real life — raw, unfiltered, and direct from the artist.
              <em> No features. Just Algee.</em>
            </p>

            {/* All streaming platforms */}
            <div className="music-platforms">
              {STREAMING.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="music-platform-btn"
                  aria-label={`Stream on ${s.label}`}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Spotify Embed ─── */}
      <div className="music-embed-section">
        <div className="music-embed-label">Listen Now</div>
        <div className="music-embed-wrap">
          <iframe
            src="https://open.spotify.com/embed/artist/10gHoEHUPNcTFsyVR2YyeA?utm_source=generator&theme=0"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="music-embed"
          />
        </div>
      </div>

      {/* ─── Photo Strip ─── */}
      <MusicPhotoStrip />

      {/* ─── Track Listing ─── */}
      <div className="music-tracklist-section">

        <div className="music-tracklist-header">
          <div className="music-tracklist-title">Tracklist</div>
          <div className="music-tracklist-meta">{TRACKS.length} Tracks · Love Lost · 2025</div>
        </div>

        <div className="music-tracklist">
          {TRACKS.map((track, i) => {
            const preview = getPreview(track)
            const isFeatured = i === 0

            return (
              <Link
                key={track.slug}
                href={`/music/${track.slug}`}
                className={`music-track-row${isFeatured ? ' music-track-featured' : ''}${track.isInterlude ? ' music-track-interlude' : ''}`}
              >
                {/* Number */}
                <div className="music-track-num-wrap">
                  <span className="music-track-num">
                    {String(track.number).padStart(2, '0')}
                  </span>
                  <span className="music-track-play" aria-hidden="true">▶</span>
                </div>

                {/* Info */}
                <div className="music-track-info">
                  <div className="music-track-name">{track.title}</div>
                  {preview && (
                    <div className="music-track-preview">"{preview}"</div>
                  )}
                </div>

                {/* Right side */}
                <div className="music-track-right">
                  {isFeatured && (
                    <span className="music-track-badge music-track-badge-opener">Opener</span>
                  )}
                  {track.isInterlude && (
                    <span className="music-track-badge music-track-badge-interlude">Interlude</span>
                  )}
                  <span className="music-track-lyrics-link">Lyrics →</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
