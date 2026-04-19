import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TRACKS, getTrackBySlug, getAdjacentTracks } from '../../data/music'

// ─── Static params for all track slugs ────────────────────────
export function generateStaticParams() {
  return TRACKS.map((t) => ({ slug: t.slug }))
}

// ─── Metadata ─────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params
  const track = getTrackBySlug(slug)
  if (!track) return {}
  return {
    title: `${track.title} | Algee Smith`,
    description: `Lyrics and streaming links for ${track.title} from ${track.album}.`,
  }
}

// ─── Section label display map ────────────────────────────────
const LABEL_MAP = {
  intro:       'Intro',
  verse:       null,   // uses track.label directly (Verse 1, Verse 2, etc.)
  'pre-chorus':'Pre-Chorus',
  chorus:      'Chorus',
  bridge:      'Bridge',
  hook:        'Hook',
  outro:       'Outro',
}

export default async function TrackPage({ params }) {
  const { slug } = await params
  const track = getTrackBySlug(slug)
  if (!track) notFound()

  const { prev, next } = getAdjacentTracks(slug)

  return (
    <div className="track-page">
      <div className="track-page-inner">

        {/* ─── Back ─── */}
        <Link href="/music" className="track-back">
          ← Music
        </Link>

        <div className="track-layout">

          {/* ══════════ LEFT PANEL ══════════ */}
          <aside className="track-left">

            {/* Cover art */}
            <div className="track-cover">
              <Image
                src={track.cover}
                alt={`${track.title} cover`}
                width={360}
                height={360}
                priority
              />
            </div>

            {/* Title block */}
            <div className="track-title-block">
              <div className="track-number-label">
                Track {String(track.number).padStart(2, '0')} · {track.album}
                {track.isInterlude && ' · Interlude'}
              </div>
              <div className="track-title">{track.title}</div>
              <div className="track-artist">{track.artist ?? 'Algee Smith'}</div>
            </div>

            {/* Streaming */}
            <div className="streaming-label">Stream on</div>
            <div className="streaming-grid">
              {track.streaming.map((platform) => (
                <a
                  key={platform.id}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="streaming-btn"
                >
                  {platform.label}
                </a>
              ))}
            </div>

            {/* Track navigation */}
            {(prev || next) && (
              <nav className="track-nav">
                {prev && (
                  <Link href={`/music/${prev.slug}`} className="track-nav-link">
                    <span style={{ fontSize: 18 }}>←</span>
                    <div>
                      <div className="track-nav-dir">Previous</div>
                      <div className="track-nav-name">{prev.title}</div>
                    </div>
                  </Link>
                )}
                {next && (
                  <Link href={`/music/${next.slug}`} className="track-nav-link">
                    <div style={{ flex: 1 }}>
                      <div className="track-nav-dir">Next</div>
                      <div className="track-nav-name">{next.title}</div>
                    </div>
                    <span style={{ fontSize: 18 }}>→</span>
                  </Link>
                )}
              </nav>
            )}
          </aside>

          {/* ══════════ RIGHT PANEL — LYRICS ══════════ */}
          <main className="track-right">

            {/* From Algee — artist note */}
            {track.story && (
              <div className="track-story">
                <div className="track-story-header">
                  <span className="track-story-icon">✦</span>
                  <span className="track-story-label">The reason I made this song</span>
                </div>
                <blockquote className="track-story-text">
                  {track.story}
                </blockquote>
                <div className="track-story-sig">— Algee</div>
              </div>
            )}

            <div className="lyrics-header">
              <span className="lyrics-title-label">Lyrics</span>
              <div className="lyrics-header-line" />
            </div>

            <div className="lyrics-body">
              {track.lyrics.map((section, i) => (
                <div key={i} className="lyrics-section">
                  {/* Section label */}
                  <div className="lyrics-section-label">
                    {section.label ?? LABEL_MAP[section.type] ?? section.type}
                  </div>

                  {/* Lines */}
                  <div className="lyrics-lines">
                    {section.lines.map((line, j) => (
                      <div
                        key={j}
                        className={`lyrics-line${line === '' ? ' empty' : ''}`}
                      >
                        {line || '\u00A0'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>

        </div>
      </div>
    </div>
  )
}
