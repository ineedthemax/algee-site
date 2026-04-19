'use client'
import React, { useRef, useState, useEffect } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'

export function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const rotate    = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scale     = useTransform(scrollYProgress, [0, 1], isMobile ? [0.7, 0.9] : [1.05, 1])
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div className="cscroll-outer" ref={containerRef}>
      <div className="cscroll-inner">
        <motion.div style={{ translateY: translate }} className="cscroll-header">
          {titleComponent}
        </motion.div>
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow:
              '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a',
          }}
          className="cscroll-card"
        >
          <div className="cscroll-card-body">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
