'use client'

import { motion } from 'framer-motion'

// Film-cut page transition: every route change fades up from black
// like a scene cut. template.js re-mounts on navigation (layout.js does not).
export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
