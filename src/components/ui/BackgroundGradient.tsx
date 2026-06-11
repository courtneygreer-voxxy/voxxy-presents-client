import React from 'react'

/**
 * Shared background gradient component for consistent dark purple theme
 * Replaces the old polka dot pattern with a clean, readable gradient
 */
export function BackgroundGradient({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`min-h-screen voxxy-gradient-page-alt relative overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

/**
 * Just the background div without children wrapper
 * Use this when you need the gradient as a background layer
 */
export function BackgroundGradientLayer({
  className = '',
  opacity = 0.5,
}: {
  className?: string
  opacity?: number
}) {
  return (
    <div className={`absolute inset-0 voxxy-gradient-page-alt ${className}`} style={{ opacity }} />
  )
}
