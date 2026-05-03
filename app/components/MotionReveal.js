'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const VARIANTS = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0  },
}

const STAGGER_CONTAINER = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

/**
 * Wraps children with a scroll-triggered Framer Motion reveal.
 *
 * Props:
 *   delay    — initial delay in seconds (default 0)
 *   y        — vertical offset to animate from (default 40)
 *   stagger  — if true, stagger direct children using variants
 *   once     — only animate once (default true)
 *   className
 */
export default function MotionReveal({
  children,
  delay    = 0,
  y        = 40,
  stagger  = false,
  once     = true,
  className,
  as       = 'div',
}) {
  const ref     = useRef(null)
  const inView  = useInView(ref, { once, margin: '0px 0px -60px 0px' })
  const Tag     = motion[as] ?? motion.div

  if (stagger) {
    return (
      <Tag
        ref={ref}
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className={className}
      >
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref}
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0 } }}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </Tag>
  )
}

/** Individual stagger child — use inside a <MotionReveal stagger> parent */
export function MotionChild({ children, className, y = 32 }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
