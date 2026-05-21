'use client'

import { IS_LIVE, LIVE_ID, LIVE_TITLE } from '../lib/liveConfig'

export default function LiveSignal() {
  if (!IS_LIVE) return null

  // Link directly to the YouTube live stream so fans land right there
  const youtubeUrl = LIVE_ID
    ? `https://www.youtube.com/watch?v=${LIVE_ID}`
    : 'https://www.youtube.com/@itsalgee'

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="live-signal"
      aria-label="Algee is live on YouTube - watch now"
    >
      <span className="live-signal-dot" aria-hidden="true" />
      <span className="live-signal-text">
        <span className="live-signal-badge">LIVE</span>
        {LIVE_TITLE}
      </span>
      <span className="live-signal-yt" aria-hidden="true">
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <path d="M13.7 1.56A1.76 1.76 0 0 0 12.46.3C11.37 0 7 0 7 0S2.63 0 1.54.3A1.76 1.76 0 0 0 .3 1.56C0 2.66 0 5 0 5s0 2.34.3 3.44A1.76 1.76 0 0 0 1.54 9.7C2.63 10 7 10 7 10s4.37 0 5.46-.3a1.76 1.76 0 0 0 1.24-1.26C14 7.34 14 5 14 5s0-2.34-.3-3.44Z" fill="#FF0000"/>
          <path d="M5.6 7.14 9.24 5 5.6 2.86v4.28Z" fill="#fff"/>
        </svg>
      </span>
      <span className="live-signal-cta">Watch on YouTube →</span>
    </a>
  )
}
