import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Voxxy-branded canvas for the vendor portal (always dark). */
export function VendorPortalPageCanvas({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('min-h-screen voxxy-gradient-page-cool text-foreground antialiased', className)}
    >
      {children}
    </div>
  )
}
