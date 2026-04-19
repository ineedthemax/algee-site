'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { PhotoGallery } from '../components/PhotoGallery'

const PHOTOS = [
  { src: '/images/fashion/MarkPeaced-1446.jpg',                    span: 'tall'  },
  { src: '/images/fashion/282779-03-011.jpg',                      span: 'wide'  },
  { src: '/images/fashion/algee-4-watermarked-1759246510955.png',  span: 'tall'  },
  { src: '/images/fashion/IMG_6573.jpg',                           span: 'small' },
  { src: '/images/fashion/282779-17-012.jpg',                      span: 'small' },
  { src: '/images/fashion/algee-6-watermarked-1759246609282.png',  span: 'wide'  },
  { src: '/images/fashion/algee-7-watermarked-1759246521646.png',  span: 'tall'  },
  { src: '/images/fashion/282779-18-004.jpg',                      span: 'small' },
  { src: '/images/fashion/algee-8-watermarked-1759246626945.png',  span: 'wide'  },
  { src: '/images/fashion/algee-9-watermarked-1759246529326.png',  span: 'tall'  },
  { src: '/images/fashion/282779-21-001.jpg',                      span: 'wide'  },
  { src: '/images/fashion/algee-12-watermarked-1759246547207.png', span: 'small' },
  { src: '/images/fashion/IMG_6583.jpg',                           span: 'tall'  },
  { src: '/images/fashion/algee-15-watermarked-1759246578195.png', span: 'wide'  },
  { src: '/images/fashion/algee-16-watermarked-1759246586448.png', span: 'tall'  },
]

const TICKER_TEXT = ['Style', 'Identity', 'Expression', 'Vision', 'Culture', 'Art', 'Movement']

export default function FashionPage() {
  const [lightbox, setLightbox] = useState(null) // index of open photo
  const [loaded, setLoaded]     = useState({})
  const observerRef             = useRef(null)

  // Scroll reveal
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.08 }
    )

    document.querySelectorAll('.fashion-item').forEach((el) => {
      observerRef.current.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  // Close lightbox on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight' && lightbox !== null) setLightbox((i) => (i + 1) % PHOTOS.length)
      if (e.key === 'ArrowLeft'  && lightbox !== null) setLightbox((i) => (i - 1 + PHOTOS.length) % PHOTOS.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  // Lock scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  return (
    <div className="fashion-page">

      {/* Animated Photo Gallery Hero */}
      <PhotoGallery animationDelay={0.3} />

      {/* Ticker */}
      <div className="fashion-ticker" aria-hidden="true">
        <div className="fashion-ticker-track">
          {[...TICKER_TEXT, ...TICKER_TEXT, ...TICKER_TEXT].map((word, i) => (
            <span key={i} className="fashion-ticker-item">
              {word} <span className="fashion-ticker-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Masonry Gallery */}
      <div className="fashion-grid">
        {PHOTOS.map((photo, i) => (
          <div
            key={i}
            className={`fashion-item fashion-item--${photo.span}`}
            onClick={() => setLightbox(i)}
            style={{ '--delay': `${(i % 5) * 80}ms` }}
          >
            <div className="fashion-item-inner">
              <Image
                src={photo.src}
                alt={`Algee Smith fashion ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`fashion-img${loaded[i] ? ' loaded' : ''}`}
                onLoad={() => setLoaded((prev) => ({ ...prev, [i]: true }))}
              />
              <div className="fashion-item-overlay">
                <span className="fashion-item-expand">View</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fashion-lightbox" onClick={() => setLightbox(null)}>
          <button className="fashion-lb-close" onClick={() => setLightbox(null)} aria-label="Close">✕</button>

          <button
            className="fashion-lb-prev"
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i - 1 + PHOTOS.length) % PHOTOS.length) }}
            aria-label="Previous"
          >
            ←
          </button>

          <div className="fashion-lb-img-wrap" onClick={(e) => e.stopPropagation()}>
            <Image
              src={PHOTOS[lightbox].src}
              alt={`Algee Smith fashion ${lightbox + 1}`}
              fill
              sizes="100vw"
              className="fashion-lb-img"
              priority
            />
          </div>

          <button
            className="fashion-lb-next"
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i + 1) % PHOTOS.length) }}
            aria-label="Next"
          >
            →
          </button>

          <div className="fashion-lb-counter">
            {lightbox + 1} / {PHOTOS.length}
          </div>
        </div>
      )}

      {/* Background text */}
      <div className="fashion-bg-text" aria-hidden="true">STYLE</div>

    </div>
  )
}
