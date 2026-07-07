'use client'

export default function StreamingLinks({ platforms }) {
  const trackStream = () =>
    fetch('/api/points/stream-music', { method: 'POST' }).catch(() => {})

  return (
    <div className="streaming-grid">
      {platforms.map((platform) => (
        <a
          key={platform.id}
          href={platform.href}
          target="_blank"
          rel="noopener noreferrer"
          className="streaming-btn"
          onClick={trackStream}
        >
          {platform.label}
        </a>
      ))}
    </div>
  )
}
