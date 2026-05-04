'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PHOTOS = [
  { src: '/images/algee-tw.webp',          alt: 'Algee Smith',            aspect: 'tall'  },
  { src: '/images/music/music-1.webp',      alt: 'In the studio',          aspect: 'wide'  },
  { src: '/images/algee-1.webp',            alt: 'Algee Smith',            aspect: 'tall'  },
  { src: '/images/music/music-2.webp',      alt: 'Live performance',       aspect: 'wide'  },
  { src: '/images/music/Music-Studio 1.webp', alt: 'Studio session',       aspect: 'tall'  },
  { src: '/images/music/music-3.webp',      alt: 'Behind the scenes',      aspect: 'wide'  },
  { src: '/images/algee-2.webp',            alt: 'Algee Smith',            aspect: 'tall'  },
  { src: '/images/music/music-4.webp',      alt: 'On stage',               aspect: 'wide'  },
]

export default function PhotoMoments() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })

  return (
    <section className="moments-section" ref={ref}>

      <motion.div
        className="moments-header"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="moments-eyebrow">The World</div>
        <h2 className="moments-headline">
          Moments. <em>Unfiltered.</em>
        </h2>
      </motion.div>

      {/* Horizontal scroll strip */}
      <div className="moments-strip-wrap">
        <div className="moments-strip">
          {PHOTOS.map((photo, i) => (
            <motion.div
              key={i}
              className={`moments-photo moments-photo-${photo.aspect}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.07 }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="300px"
                className="moments-photo-img"
              />
              <div className="moments-photo-overlay" />
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  )
}
