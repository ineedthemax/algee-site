import ScrollExpandMedia from '../components/ScrollExpandMedia'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title:       'Videos | Algee Smith',
  description: 'Official music videos and visual content from Algee Smith.',
}

// ── Video catalogue ─────────────────────────────────────────
// Replace placeholder IDs with real YouTube video IDs as they go live
const VIDEOS = [
  {
    id:        'v1',
    videoId:   'TjOHVPo5iwM',
    title:     'Love Lost',
    label:     'Official Video',
    year:      '2025',
    live:      true,
  },
  {
    id:        'v2',
    videoId:   'KSwsT4WS-Uo',
    title:     'One Music Fest 2025',
    label:     'Live Performance',
    year:      '2025',
    live:      true,
  },
  {
    id:        'v3',
    videoId:   'uj49zYTGMRE',
    title:     'The Departed',
    label:     'Live in the Booth',
    year:      '2025',
    live:      true,
  },
  {
    id:        'v4',
    videoId:   'v3PAewddV4M',
    videoUrl:  'https://www.youtube.com/watch?v=v3PAewddV4M&t=450s',
    title:     'One Music Fest 2025',
    label:     'Full Set',
    year:      '2025',
    live:      true,
  },
]

function VideoCard({ video }) {
  const thumb = video.videoId
    ? `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`
    : null

  const content = (
    <div className="vid-card">
      <div className="vid-card-thumb">
        {thumb ? (
          <Image
            src={thumb}
            alt={video.title}
            fill
            sizes="(max-width: 900px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="vid-card-placeholder">
            <span className="vid-card-placeholder-icon">▶</span>
          </div>
        )}

        {/* Overlay */}
        <div className="vid-card-overlay">
          {video.live
            ? <span className="vid-play-icon">▶</span>
            : <span className="vid-soon-badge">Coming Soon</span>
          }
        </div>
      </div>

      <div className="vid-card-info">
        <div className="vid-card-meta">
          <span className="film-tag">{video.label}</span>
          <span className="film-year">{video.year}</span>
        </div>
        <div className="vid-card-title">{video.title}</div>
      </div>
    </div>
  )

  if (video.live && video.videoId) {
    const href = video.videoUrl ?? `https://www.youtube.com/watch?v=${video.videoId}`
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        {content}
      </a>
    )
  }

  return <div style={{ opacity: video.live ? 1 : 0.5 }}>{content}</div>
}

export default function VideosPage() {
  const [featured, ...rest] = VIDEOS

  return (
    <div style={{ background: 'var(--deep)', minHeight: '100vh' }}>

      {/* ── Scroll expand hero video ── */}
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="https://www.youtube.com/watch?v=TjOHVPo5iwM"
        bgImageSrc="/images/hero/algee-hero.jpg"
        title="Algee Smith"
        date="Out Now · 2025"
        scrollToExpand="Scroll to watch"
        textBlend={false}
      >
        <div className="video-reveal-content">
          <div className="video-reveal-header">
            <div className="video-reveal-label">Latest Visual</div>
            <h3 className="video-reveal-title">Love Lost</h3>
            <p className="video-reveal-sub">
              The official visual for Love Lost. Available on all platforms.
            </p>
          </div>
          <div className="video-reveal-actions">
            <a
              href="https://www.youtube.com/watch?v=TjOHVPo5iwM"
              target="_blank"
              rel="noopener noreferrer"
              className="video-reveal-btn primary"
            >
              Watch on YouTube →
            </a>
            <Link href="/music" className="video-reveal-btn ghost">
              Stream the Album →
            </Link>
          </div>
        </div>
      </ScrollExpandMedia>

      {/* ── More videos grid ── */}
      <section className="vid-grid-section">
        <div className="vid-grid-header">
          <span className="vid-grid-label">More Videos</span>
          <div className="vid-grid-line" />
          <a
            href="https://www.youtube.com/@itsalgee"
            target="_blank"
            rel="noopener noreferrer"
            className="vid-channel-link"
          >
            YouTube Channel →
          </a>
        </div>

        <div className="vid-grid">
          {rest.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

    </div>
  )
}
