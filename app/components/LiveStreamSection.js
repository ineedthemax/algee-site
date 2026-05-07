'use client'

import Image from 'next/image'
import { IS_LIVE, LIVE_ID, LIVE_TITLE } from '../lib/liveConfig'

export default function LiveStreamSection() {
  return (
    <section className="ls-section">

      {/* ── Header ── */}
      <div className="ls-header">
        <div className="ls-status">
          <span className={`ls-dot ${IS_LIVE ? 'ls-dot-live' : 'ls-dot-off'}`} />
          <span className="ls-status-text">{IS_LIVE ? 'LIVE NOW' : 'OFF AIR'}</span>
        </div>
        <div className="ls-eyebrow">Live Stream</div>
        <p className="ls-sub">
          {IS_LIVE
            ? `Algee is live right now — ${LIVE_TITLE}`
            : 'This is where Algee streams. Check back soon.'}
        </p>
      </div>

      {/* ── TV Stage ── */}
      <div className="ls-stage">

        {/* Outer frame / bezel */}
        <div className="ls-tv">

          {/* Screen */}
          <div className="ls-screen">
            {IS_LIVE && LIVE_ID ? (
              /* Live embed */
              <iframe
                className="ls-embed"
                src={`https://www.youtube.com/embed/${LIVE_ID}?autoplay=1&rel=0&modestbranding=1`}
                title={LIVE_TITLE}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              /* Offline state */
              <div className="ls-offline">
                {/* Background still */}
                <Image
                  src="/images/hero/algee-hero.webp"
                  alt="Algee Smith"
                  fill
                  sizes="(max-width: 900px) 100vw, 900px"
                  style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
                  priority
                />

                {/* Dark overlay */}
                <div className="ls-offline-overlay" />

                {/* Scanlines */}
                <div className="ls-scanlines" aria-hidden="true" />

                {/* Coming soon content */}
                <div className="ls-offline-content">
                  <div className="ls-coming-tag">
                    <span className="ls-coming-dot" />
                    Next Live
                  </div>
                  <div className="ls-coming-headline">Coming Soon</div>
                  <div className="ls-coming-sub">
                    Tune in. Algee&apos;s going live.
                  </div>
                  <div className="ls-coming-divider" />
                  <div className="ls-coming-hint">Subscribe below to get notified</div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom bezel bar */}
          <div className="ls-bezel-bar">
            <div className="ls-bezel-brand">
              <span className="ls-bezel-dot" />
              ALGEE SMITH
            </div>
            <div className="ls-bezel-controls">
              <span className="ls-knob" />
              <span className="ls-knob" />
              <span className="ls-knob ls-knob-power" />
            </div>
          </div>
        </div>

        {/* Monitor stand */}
        <div className="ls-stand">
          <div className="ls-stand-neck" />
          <div className="ls-stand-foot" />
        </div>

      </div>

      {/* ── CTA ── */}
      <div className="ls-cta">
        {IS_LIVE ? (
          <a
            href={`https://www.youtube.com/watch?v=${LIVE_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ls-cta-btn ls-cta-live"
          >
            ● Watch Live on YouTube →
          </a>
        ) : (
          <>
            <p className="ls-cta-text">Get notified when Algee goes live.</p>
            <div className="ls-cta-actions">
              <a
                href="https://www.youtube.com/@itsalgee?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="ls-cta-btn"
              >
                Subscribe on YouTube →
              </a>
              <a
                href="https://www.instagram.com/algeesmith/"
                target="_blank"
                rel="noopener noreferrer"
                className="ls-cta-ghost"
              >
                Follow on Instagram
              </a>
            </div>
          </>
        )}
      </div>

    </section>
  )
}
