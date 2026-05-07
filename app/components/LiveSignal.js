'use client'

import Link from 'next/link'
import { IS_LIVE, LIVE_TITLE } from '../lib/liveConfig'

export default function LiveSignal() {
  if (!IS_LIVE) return null

  return (
    <Link href="/videos" className="live-signal" aria-label="Algee is live — watch now">
      <span className="live-signal-dot" aria-hidden="true" />
      <span className="live-signal-text">
        <span className="live-signal-badge">LIVE</span>
        {LIVE_TITLE}
      </span>
      <span className="live-signal-cta">Watch Now →</span>
    </Link>
  )
}
