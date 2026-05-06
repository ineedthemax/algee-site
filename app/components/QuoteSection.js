'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

export default function QuoteSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section className="quote-section" ref={ref}>

      {/* Parallax bg text */}
      <motion.div className="quote-bg-word" style={{ y: bgY }} aria-hidden="true">
        SOUL
      </motion.div>

      <div className="quote-inner">
        <motion.div
          className="quote-mark"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          aria-hidden="true"
        >
          "
        </motion.div>

        <motion.blockquote
          className="quote-text"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
        >
          I&apos;m not trying to be the greatest actor or the greatest singer.
          I&apos;m trying to be the most&nbsp;
          <em>honest</em> version of myself and let that be enough.
        </motion.blockquote>

        <motion.div
          className="quote-attr"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Algee Smith
        </motion.div>
      </div>

    </section>
  )
}
