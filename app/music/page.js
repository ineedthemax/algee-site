import Image from 'next/image'
import Link from 'next/link'
import { ALBUM, TRACKS } from '../data/music'
import MusicPhotoStrip from '../components/MusicPhotoStrip'

export const metadata = {
  title: 'Music | Algee Smith',
  description: 'Love Lost and everything coming next. Direct from the artist.',
}

export default function MusicPage() {
  return (
    <div className="track-page">

      {/* ─── Page Hero ─── */}
      <div className="page-hero">
        <div className="page-hero-label">Discography</div>
        <h1>
          Love <span className="italic">Lost</span>
        </h1>
        <p className="page-hero-sub">{ALBUM.description}</p>
      </div>

      {/* ─── Album Card ─── */}
      <div className="album-section">
        <div className="album-card reveal">

          {/* Cover */}
          <div className="album-cover-wrap">
            <Image
              src={ALBUM.cover}
              alt={`${ALBUM.title} album cover`}
              width={340}
              height={340}
              priority
            />
          </div>

          {/* Info */}
          <div className="album-info">
            <div className="album-tag">Album</div>
            <div className="album-title">{ALBUM.title}</div>
            <div className="album-artist">{ALBUM.artist}</div>

            <div className="album-meta">
              <span className="album-meta-item">{ALBUM.year}</span>
              <span className="album-meta-item">{ALBUM.trackCount} Tracks</span>
              <span className="album-meta-item">R&amp;B / Soul</span>
            </div>

            <p className="album-desc">{ALBUM.description}</p>

            <a
              href={TRACKS[0].streaming[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="stream-now-btn"
            >
              <span>Stream Now</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─── Photo Strip ─── */}
      <MusicPhotoStrip />

      {/* ─── Track Listing ─── */}
      <div className="tracklist-section">
        <div className="tracklist-header">
          <span className="tracklist-header-label">#</span>
          <span className="tracklist-header-label">Title</span>
          <span className="tracklist-header-label">Lyrics</span>
        </div>

        <div className="reveal-stagger">
          {TRACKS.map((track) => (
            <Link
              key={track.slug}
              href={`/music/${track.slug}`}
              className="track-row"
            >
              {/* Number / play icon */}
              <div className="track-num-wrap">
                <span className="track-num">
                  {String(track.number).padStart(2, '0')}
                </span>
                <span className="track-play">▶</span>
              </div>

              {/* Info */}
              <div className="track-info">
                <div className="track-name">{track.title}</div>
                <div className="track-sub">
                  {track.album} · {track.year}
                </div>
              </div>

              {/* Badge */}
              <div>
                {track.isInterlude ? (
                  <span className="track-badge">Interlude</span>
                ) : (
                  <span className="track-badge">Lyrics →</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
