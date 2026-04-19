'use client'

import { forwardRef, useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, useMotionValue } from 'framer-motion'

function getRandomNumberInRange(min, max) {
  return Math.random() * (max - min) + min
}

const MotionImage = motion(
  forwardRef(function MotionImage(props, ref) {
    return <Image ref={ref} {...props} />
  })
)

export function Photo({ src, alt, className, direction, width, height, ...props }) {
  const [rotation, setRotation] = useState(0)
  const x = useMotionValue(200)
  const y = useMotionValue(200)

  useEffect(() => {
    const randomRotation =
      getRandomNumberInRange(1, 4) * (direction === 'left' ? -1 : 1)
    setRotation(randomRotation)
  }, [direction])

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left)
    y.set(event.clientY - rect.top)
  }

  const resetMouse = () => {
    x.set(200)
    y.set(200)
  }

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      whileTap={{ scale: 1.2, zIndex: 9999 }}
      whileHover={{
        scale: 1.1,
        rotateZ: 2 * (direction === 'left' ? -1 : 1),
        zIndex: 9999,
      }}
      whileDrag={{ scale: 1.1, zIndex: 9999 }}
      initial={{ rotate: 0 }}
      animate={{ rotate: rotation }}
      style={{
        width,
        height,
        perspective: 400,
        zIndex: 1,
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'none',
      }}
      className={`relative mx-auto shrink-0 cursor-grab active:cursor-grabbing ${className || ''}`}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      draggable={false}
      tabIndex={0}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-lg">
        <MotionImage
          className="rounded-2xl object-cover"
          fill
          src={src}
          alt={alt}
          draggable={false}
          {...props}
        />
      </div>
    </motion.div>
  )
}

export function PhotoGallery({ animationDelay = 0.5 }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded,  setIsLoaded]  = useState(false)

  useEffect(() => {
    const visibilityTimer = setTimeout(() => setIsVisible(true), animationDelay * 1000)
    const animationTimer  = setTimeout(() => setIsLoaded(true),  (animationDelay + 0.4) * 1000)
    return () => { clearTimeout(visibilityTimer); clearTimeout(animationTimer) }
  }, [animationDelay])

  const containerVariants = {
    hidden:  { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  }

  const photoVariants = {
    hidden:  () => ({ x: 0, y: 0, rotate: 0, scale: 1 }),
    visible: (custom) => ({
      x: custom.x,
      y: custom.y,
      rotate: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 70,
        damping: 12,
        mass: 1,
        delay: custom.order * 0.15,
      },
    }),
  }

  const photos = [
    { id: 1, order: 0, x: '-320px', y: '15px',  zIndex: 50, direction: 'left',  src: '/images/fashion/MarkPeaced-1446.jpg' },
    { id: 2, order: 1, x: '-160px', y: '32px',  zIndex: 40, direction: 'left',  src: '/images/fashion/algee-4-watermarked-1759246510955.png' },
    { id: 3, order: 2, x: '0px',    y: '8px',   zIndex: 30, direction: 'right', src: '/images/fashion/algee-9-watermarked-1759246529326.png' },
    { id: 4, order: 3, x: '160px',  y: '22px',  zIndex: 20, direction: 'right', src: '/images/fashion/algee-15-watermarked-1759246578195.png' },
    { id: 5, order: 4, x: '320px',  y: '44px',  zIndex: 10, direction: 'left',  src: '/images/fashion/algee-16-watermarked-1759246586448.png' },
  ]

  return (
    <div className="photo-gallery-wrap">
      <div className="photo-gallery-label">A Journey Through Visual Stories</div>
      <h3 className="photo-gallery-title">
        The <span className="photo-gallery-accent">Look</span>
      </h3>

      <div className="photo-gallery-stage">
        <motion.div
          className="photo-gallery-motion"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.div
            className="photo-gallery-row"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
          >
            <div className="photo-gallery-center">
              {[...photos].reverse().map((photo) => (
                <motion.div
                  key={photo.id}
                  className="photo-gallery-item"
                  style={{ zIndex: photo.zIndex }}
                  variants={photoVariants}
                  custom={{ x: photo.x, y: photo.y, order: photo.order }}
                >
                  <Photo
                    width={220}
                    height={280}
                    src={photo.src}
                    alt={`Algee Smith fashion ${photo.id}`}
                    direction={photo.direction}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="photo-gallery-cta-wrap">
        <button className="photo-gallery-cta">Scroll to Explore ↓</button>
      </div>
    </div>
  )
}
