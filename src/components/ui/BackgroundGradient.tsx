import React from 'react'

/**
 * Shared background gradient component for consistent dark purple theme
 * Replaces the old polka dot pattern with a clean, readable gradient
 */
export function BackgroundGradient({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

/**
 * Just the background div without children wrapper
 * Use this when you need the gradient as a background layer
 */
export function BackgroundGradientLayer({ className = '', opacity = 0.5 }: { className?: string; opacity?: number }) {
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] ${className}`}
      style={{ opacity }}
    />
  )
}
