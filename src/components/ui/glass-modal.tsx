import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlassModalProps {
  trigger: React.ReactNode
  title?: string
  icon?: React.ReactNode
  children: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
}

/**
 * Standardized glass morphism modal component
 *
 * Features:
 * - Glass morphism styling with enhanced backdrop blur
 * - Consistent white text on dark background
 * - Purple accent colors
 * - Responsive sizing options
 * - Smooth animations
 *
 * Usage:
 * <GlassModal
 *   trigger={<Button>Open Modal</Button>}
 *   title="Modal Title"
 *   icon={<Icon className="h-6 w-6" />}
 *   size="lg"
 * >
 *   <p>Modal content here</p>
 * </GlassModal>
 */
export function GlassModal({
  trigger,
  title,
  icon,
  children,
  isOpen,
  onOpenChange,
  size = 'md',
  className,
}: GlassModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          // Base glass morphism styles
          'voxxy-auth-card text-foreground',
          // Responsive sizing
          sizeClasses[size],
          // Scrolling for large content
          'max-h-[90vh] overflow-y-auto',
          // Custom classes
          className,
        )}
      >
        {title && (
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-center text-foreground flex items-center justify-center gap-2">
              {icon}
              {title}
            </DialogTitle>
          </DialogHeader>
        )}

        <div className={title ? 'mt-6' : ''}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Glass morphism card component for use inside modals
 */
export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card/80 p-4 backdrop-blur-sm dark:bg-background/5',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Glass morphism input styling classes
 */
export const glassInputClasses = 'voxxy-input-frost'

/**
 * Glass morphism button styling classes
 */
export const glassButtonClasses = {
  primary: 'voxxy-btn-solid',
  secondary: 'bg-background/10 border-border text-foreground hover:bg-background/20',
  outline:
    'bg-background/10 backdrop-blur-sm border border-border text-foreground hover:bg-background/15 hover:border-border',
}
