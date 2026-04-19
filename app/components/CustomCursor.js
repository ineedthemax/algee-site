'use client'

import { useEffect } from 'react'

export default function CustomCursor() {
  useEffect(() => {
    const dot      = document.getElementById('cursor-dot')
    const ring     = document.getElementById('cursor-ring')
    const spotlight = document.getElementById('spotlight')

    if (!dot || !ring) return

    let mouseX = 0, mouseY = 0
    let ringX  = 0, ringY  = 0
    let rafId

    // Move dot instantly; ring follows with lerp
    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY

      dot.style.left = mouseX + 'px'
      dot.style.top  = mouseY + 'px'

      if (spotlight) {
        spotlight.style.setProperty('--mx', mouseX + 'px')
        spotlight.style.setProperty('--my', mouseY + 'px')
      }
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.14
      ringY += (mouseY - ringY) * 0.14
      ring.style.left = ringX + 'px'
      ring.style.top  = ringY + 'px'
      rafId = requestAnimationFrame(animateRing)
    }

    const onEnter = () => { dot.classList.add('hover'); ring.classList.add('hover') }
    const onLeave = () => { dot.classList.remove('hover'); ring.classList.remove('hover') }

    document.addEventListener('mousemove', onMouseMove)

    // Attach hover state to all interactive elements (also re-queries on DOM changes)
    const attachHover = () => {
      document.querySelectorAll('a, button').forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    attachHover()
    rafId = requestAnimationFrame(animateRing)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div id="cursor-dot"  className="cursor-dot"  aria-hidden="true">🦂</div>
      <div id="cursor-ring" className="cursor-ring" aria-hidden="true" />
      <div id="spotlight"   className="spotlight"   aria-hidden="true" />
    </>
  )
}
