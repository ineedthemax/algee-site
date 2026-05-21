'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function ScrollExpandMedia({
  mediaType     = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}) {
  const [scrollProgress,      setScrollProgress]      = useState(0)
  const [showContent,         setShowContent]         = useState(false)
  const [mediaFullyExpanded,  setMediaFullyExpanded]  = useState(false)
  const [touchStartY,         setTouchStartY]         = useState(0)
  const [isMobile,            setIsMobile]            = useState(false)

  const sectionRef = useRef(null)

  // Reset on mediaType change
  useEffect(() => {
    setScrollProgress(0)
    setShowContent(false)
    setMediaFullyExpanded(false)
  }, [mediaType])

  // Scroll / wheel / touch hijack
  useEffect(() => {
    const handleWheel = (e) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        e.preventDefault()
      } else if (!mediaFullyExpanded) {
        e.preventDefault()
        const newProgress = Math.min(Math.max(scrollProgress + e.deltaY * 0.0009, 0), 1)
        setScrollProgress(newProgress)
        if (newProgress >= 1)    { setMediaFullyExpanded(true); setShowContent(true) }
        else if (newProgress < 0.75) { setShowContent(false) }
      }
    }

    const handleTouchStart = (e) => {
      setTouchStartY(e.touches[0].clientY)
    }

    const handleTouchMove = (e) => {
      if (!touchStartY) return
      const deltaY = touchStartY - e.touches[0].clientY

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        e.preventDefault()
      } else if (!mediaFullyExpanded) {
        e.preventDefault()
        const factor = deltaY < 0 ? 0.008 : 0.005
        const newProgress = Math.min(Math.max(scrollProgress + deltaY * factor, 0), 1)
        setScrollProgress(newProgress)
        if (newProgress >= 1)    { setMediaFullyExpanded(true); setShowContent(true) }
        else if (newProgress < 0.75) { setShowContent(false) }
        setTouchStartY(e.touches[0].clientY)
      }
    }

    const handleTouchEnd = () => setTouchStartY(0)

    const handleScroll = () => {
      if (!mediaFullyExpanded) window.scrollTo(0, 0)
    }

    window.addEventListener('wheel',      handleWheel,      { passive: false })
    window.addEventListener('scroll',     handleScroll)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove',  handleTouchMove,  { passive: false })
    window.addEventListener('touchend',   handleTouchEnd)

    return () => {
      window.removeEventListener('wheel',      handleWheel)
      window.removeEventListener('scroll',     handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove',  handleTouchMove)
      window.removeEventListener('touchend',   handleTouchEnd)
    }
  }, [scrollProgress, mediaFullyExpanded, touchStartY])

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Derived sizes
  const mediaWidth  = 300 + scrollProgress * (isMobile ? 650  : 1250)
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200  : 400)
  const textShift   = scrollProgress       * (isMobile ? 180  : 150)

  const firstWord   = title ? title.split(' ')[0]            : ''
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : ''

  // Build YouTube embed src
  const getEmbedSrc = () => {
    const base = mediaSrc.includes('embed')
      ? mediaSrc
      : mediaSrc.replace('watch?v=', 'embed/')
    const videoId = mediaSrc.includes('v=')
      ? mediaSrc.split('v=')[1]?.split('&')[0]
      : mediaSrc.split('/').pop()
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=${videoId}`
  }

  return (
    <div ref={sectionRef} style={{ overflowX: 'hidden' }}>
      <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh' }}>
        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100dvh' }}>

          {/* Background image */}
          <motion.div
            style={{ position: 'absolute', inset: 0, zIndex: 0, height: '100%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <Image
              src={bgImageSrc}
              alt="Background"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,5,0.55)' }} />
          </motion.div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '100dvh', position: 'relative' }}>

              {/* Expanding media */}
              <div
                style={{
                  position: 'absolute',
                  zIndex: 0,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0 0 80px rgba(0,0,0,0.5)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                {mediaType === 'video' && mediaSrc.includes('youtu') ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={getEmbedSrc()}
                      style={{ borderRadius: 12, display: 'block' }}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <motion.div
                      style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,5,0.35)', borderRadius: 12 }}
                      animate={{ opacity: 0.6 - scrollProgress * 0.6 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                ) : mediaType === 'video' ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <video
                      src={mediaSrc}
                      poster={posterSrc}
                      autoPlay muted loop playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                    />
                    <motion.div
                      style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,5,0.35)', borderRadius: 12 }}
                      animate={{ opacity: 0.6 - scrollProgress * 0.6 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image src={mediaSrc} alt={title || 'Media'} fill style={{ objectFit: 'cover', borderRadius: 12 }} />
                    <motion.div
                      style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,5,0.5)', borderRadius: 12 }}
                      animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                {/* Date + scroll hint below video */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 10, marginTop: 16 }}>
                  {date && (
                    <p style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: 11,
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      color: 'var(--orange)',
                      transform: `translateX(-${textShift}vw)`,
                    }}>
                      {date}
                    </p>
                  )}
                  {scrollToExpand && (
                    <p style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: 10,
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      color: 'var(--muted)',
                      transform: `translateX(${textShift}vw)`,
                      marginTop: 8,
                    }}>
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>

              {/* Title - splits and slides apart as video expands */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 16,
                width: '100%',
                position: 'relative',
                zIndex: 10,
                flexDirection: 'column',
                mixBlendMode: textBlend ? 'difference' : 'normal',
              }}>
                <motion.h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 'clamp(48px, 9vw, 120px)',
                  letterSpacing: '-4px',
                  textTransform: 'uppercase',
                  color: 'var(--white)',
                  lineHeight: 0.9,
                  transform: `translateX(-${textShift}vw)`,
                }}>
                  {firstWord}
                </motion.h2>
                <motion.h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  fontSize: 'clamp(40px, 7vw, 100px)',
                  letterSpacing: '-3px',
                  color: 'var(--orange)',
                  lineHeight: 0.9,
                  transform: `translateX(${textShift}vw)`,
                }}>
                  {restOfTitle}
                </motion.h2>
              </div>

            </div>

            {/* Content revealed after full expansion */}
            <motion.section
              style={{ width: '100%', padding: '60px 52px', maxWidth: 1400, margin: '0 auto' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  )
}
