'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'

// ── Math helpers ──────────────────────────────────────────────
const SPHERE_MATH = {
  degreesToRadians: (d) => d * (Math.PI / 180),
  normalizeAngle: (a) => {
    while (a > 180) a -= 360
    while (a < -180) a += 360
    return a
  },
}

// ── Main component ────────────────────────────────────────────
export default function SphereImageGrid({
  images           = [],
  containerSize    = 500,
  sphereRadius     = 200,
  dragSensitivity  = 0.5,
  momentumDecay    = 0.95,
  maxRotationSpeed = 5,
  baseImageScale   = 0.11,
  perspective      = 1000,
  autoRotate       = true,
  autoRotateSpeed  = 0.25,
  className        = '',
}) {
  const [isMounted,      setIsMounted]      = useState(false)
  const [rotation,       setRotation]       = useState({ x: 15, y: 15, z: 0 })
  const [velocity,       setVelocity]       = useState({ x: 0, y: 0 })
  const [isDragging,     setIsDragging]     = useState(false)
  const [selectedImage,  setSelectedImage]  = useState(null)
  const [imagePositions, setImagePositions] = useState([])
  const [hoveredIndex,   setHoveredIndex]   = useState(null)

  const containerRef  = useRef(null)
  const lastMousePos  = useRef({ x: 0, y: 0 })
  const animFrameRef  = useRef(null)
  const velocityRef   = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)

  const actualRadius  = sphereRadius || containerSize * 0.5
  const baseImageSize = containerSize * baseImageScale

  // ── Generate sphere positions (Fibonacci distribution) ──────
  const generateSpherePositions = useCallback(() => {
    const count       = images.length
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    const angleInc    = 2 * Math.PI / goldenRatio

    return Array.from({ length: count }, (_, i) => {
      const t          = i / count
      const inclination = Math.acos(1 - 2 * t)
      const azimuth    = angleInc * i

      let phi   = inclination * (180 / Math.PI)
      let theta = (azimuth   * (180 / Math.PI)) % 360

      const poleBonus = Math.pow(Math.abs(phi - 90) / 90, 0.6) * 35
      phi = phi < 90
        ? Math.max(5,   phi - poleBonus)
        : Math.min(175, phi + poleBonus)

      phi   = 15 + (phi / 180) * 150
      theta = (theta + (Math.random() - 0.5) * 20) % 360
      phi   = Math.max(0, Math.min(180, phi + (Math.random() - 0.5) * 10))

      return { theta, phi, radius: actualRadius }
    })
  }, [images.length, actualRadius])

  // ── Project sphere positions to screen ──────────────────────
  const calculateWorldPositions = useCallback(() => {
    return imagePositions.map((pos, index) => {
      const thetaRad = SPHERE_MATH.degreesToRadians(pos.theta)
      const phiRad   = SPHERE_MATH.degreesToRadians(pos.phi)
      const rotXRad  = SPHERE_MATH.degreesToRadians(rotation.x)
      const rotYRad  = SPHERE_MATH.degreesToRadians(rotation.y)

      let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad)
      let y = pos.radius * Math.cos(phiRad)
      let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad)

      // Y-axis rotation
      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad)
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad)
      x = x1; z = z1

      // X-axis rotation
      const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad)
      const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad)
      y = y2; z = z2

      const fadeZoneStart = -10
      const fadeZoneEnd   = -40
      const isVisible     = z > fadeZoneEnd
      const fadeOpacity   = z <= fadeZoneStart
        ? Math.max(0, (z - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd))
        : 1

      const distFromCenter = Math.sqrt(x * x + y * y)
      const distRatio      = Math.min(distFromCenter / actualRadius, 1)
      const isPole         = pos.phi < 30 || pos.phi > 150
      const centerScale    = Math.max(0.3, 1 - distRatio * (isPole ? 0.4 : 0.7))
      const depthScale     = (z + actualRadius) / (2 * actualRadius)
      const scale          = centerScale * Math.max(0.5, 0.8 + depthScale * 0.3)

      return { x, y, z, scale, zIndex: Math.round(1000 + z), isVisible, fadeOpacity, originalIndex: index }
    })
  }, [imagePositions, rotation, actualRadius])

  const clamp = useCallback((v) =>
    Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, v)),
  [maxRotationSpeed])

  // ── Animation loop ───────────────────────────────────────────
  const updateMomentum = useCallback(() => {
    if (isDraggingRef.current) return

    velocityRef.current = {
      x: velocityRef.current.x * momentumDecay,
      y: velocityRef.current.y * momentumDecay,
    }

    setVelocity({ ...velocityRef.current })

    setRotation((prev) => ({
      x: SPHERE_MATH.normalizeAngle(prev.x + clamp(velocityRef.current.x)),
      y: SPHERE_MATH.normalizeAngle(prev.y + (autoRotate ? autoRotateSpeed : 0) + clamp(velocityRef.current.y)),
      z: prev.z,
    }))
  }, [momentumDecay, clamp, autoRotate, autoRotateSpeed])

  // ── Mouse handlers ───────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    velocityRef.current = { x: 0, y: 0 }
    setVelocity({ x: 0, y: 0 })
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - lastMousePos.current.x
    const dy = e.clientY - lastMousePos.current.y
    const delta = { x: -dy * dragSensitivity, y: dx * dragSensitivity }

    velocityRef.current = { x: clamp(delta.x), y: clamp(delta.y) }
    setVelocity({ ...velocityRef.current })

    setRotation((prev) => ({
      x: SPHERE_MATH.normalizeAngle(prev.x + clamp(delta.x)),
      y: SPHERE_MATH.normalizeAngle(prev.y + clamp(delta.y)),
      z: prev.z,
    }))

    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }, [dragSensitivity, clamp])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    setIsDragging(false)
  }, [])

  // ── Touch handlers ───────────────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    isDraggingRef.current = true
    setIsDragging(true)
    velocityRef.current = { x: 0, y: 0 }
    lastMousePos.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current) return
    e.preventDefault()
    const touch = e.touches[0]
    const dx    = touch.clientX - lastMousePos.current.x
    const dy    = touch.clientY - lastMousePos.current.y
    const delta = { x: -dy * dragSensitivity, y: dx * dragSensitivity }

    velocityRef.current = { x: clamp(delta.x), y: clamp(delta.y) }
    setRotation((prev) => ({
      x: SPHERE_MATH.normalizeAngle(prev.x + clamp(delta.x)),
      y: SPHERE_MATH.normalizeAngle(prev.y + clamp(delta.y)),
      z: prev.z,
    }))
    lastMousePos.current = { x: touch.clientX, y: touch.clientY }
  }, [dragSensitivity, clamp])

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false
    setIsDragging(false)
  }, [])

  // ── Effects ──────────────────────────────────────────────────
  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    setImagePositions(generateSpherePositions())
  }, [generateSpherePositions])

  useEffect(() => {
    if (!isMounted) return
    const loop = () => {
      updateMomentum()
      animFrameRef.current = requestAnimationFrame(loop)
    }
    animFrameRef.current = requestAnimationFrame(loop)
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [isMounted, updateMomentum])

  useEffect(() => {
    if (!isMounted) return
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup',   handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend',  handleTouchEnd)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup',   handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend',  handleTouchEnd)
    }
  }, [isMounted, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // ── Render ───────────────────────────────────────────────────
  const worldPositions = calculateWorldPositions()

  if (!isMounted) return (
    <div style={{ width: containerSize, height: containerSize }}
         className="flex items-center justify-center">
      <div style={{ color: 'var(--dim)', fontFamily: 'var(--font-label)', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase' }}>
        Loading
      </div>
    </div>
  )

  if (!images.length) return null

  return (
    <>
      <div
        ref={containerRef}
        className={`relative select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
        style={{ width: containerSize, height: containerSize, perspective: `${perspective}px` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="relative w-full h-full" style={{ zIndex: 10 }}>
          {images.map((image, index) => {
            const pos = worldPositions[index]
            if (!pos?.isVisible) return null

            const size      = baseImageSize * pos.scale
            const isHovered = hoveredIndex === index
            const hoverScale = isHovered ? Math.min(1.3, 1.3 / pos.scale) : 1

            return (
              <div
                key={image.id}
                className="absolute"
                style={{
                  width:     size,
                  height:    size,
                  left:      containerSize / 2 + pos.x,
                  top:       containerSize / 2 + pos.y,
                  opacity:   pos.fadeOpacity,
                  transform: `translate(-50%, -50%) scale(${hoverScale})`,
                  zIndex:    pos.zIndex,
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedImage(image)}
              >
                <div
                  className="w-full h-full overflow-hidden"
                  style={{
                    borderRadius: '50%',
                    border: isHovered
                      ? '2px solid var(--red)'
                      : '2px solid rgba(245,240,235,0.15)',
                    boxShadow: isHovered
                      ? '0 0 16px rgba(196,34,46,0.5)'
                      : '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading={index < 6 ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Modal ── */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border-hover)',
              borderRadius: 12,
              maxWidth: 360,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-square">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 flex items-center justify-center"
              style={{
                width: 32, height: 32,
                background: 'rgba(5,5,5,0.7)',
                borderRadius: '50%',
                border: '1px solid var(--border-hover)',
                color: 'var(--white)',
              }}
            >
              <X size={14} />
            </button>
            {(selectedImage.title || selectedImage.description) && (
              <div style={{ padding: '20px 24px 24px' }}>
                {selectedImage.title && (
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 16,
                    color: 'var(--white)',
                    marginBottom: 6,
                  }}>
                    {selectedImage.title}
                  </div>
                )}
                {selectedImage.description && (
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    color: 'var(--muted)',
                    lineHeight: 1.6,
                  }}>
                    {selectedImage.description}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
