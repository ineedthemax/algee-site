'use client'

import Image from 'next/image'

const PHOTOS = [
  { src: '/images/music/music-1.webp', alt: 'Algee Smith in the studio'       },
  { src: '/images/music/music-2.webp', alt: 'Algee Smith performing live'     },
  { src: '/images/music/music-3.webp', alt: 'Algee Smith live with full band' },
  { src: '/images/music/music-4.webp', alt: 'Algee Smith on stage'            },
]

// Duplicate for seamless infinite loop
const STRIP = [...PHOTOS, ...PHOTOS, ...PHOTOS]

export default function MusicPhotoStrip() {
  return (
    <div className="music-strip-section">

      {/* Label */}
      <div className="music-strip-label">
        <span className="music-strip-label-line" />
        Live &amp; In The Studio
        <span className="music-strip-label-line" />
      </div>

      {/* Strip */}
      <div className="music-strip-outer">
        <div className="music-strip-track">
          {STRIP.map((photo, i) => (
            <div key={i} className="music-strip-item">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="380px"
                className="music-strip-img"
              />
              <div className="music-strip-overlay" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
