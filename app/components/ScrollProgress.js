'use client'

import { useScroll, useSpring, motion } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      style={{
        scaleX,
        position:        'fixed',
        top:             0,
        left:            0,
        right:           0,
        height:          2,
        background:      '#C4222E',
        transformOrigin: 'left',
        zIndex:          9999,
        pointerEvents:   'none',
      }}
    />
  )
}
