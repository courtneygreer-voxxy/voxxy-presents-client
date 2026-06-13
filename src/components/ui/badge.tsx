import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'border-border text-foreground',

        /* Tinted status / filter pills — single source for light + dark contrast */
        tintPurple: 'border-primary/30 bg-primary/20 text-violet-950 dark:text-primary',
        tintPurpleSoft: 'border-primary/30 bg-primary/10 text-violet-950 dark:text-primary',
        tintPurpleFaint: 'border-primary/20 bg-primary/15 text-violet-950 dark:text-primary',

        tintFuchsiaFaint:
          'border-voxxy-pink/20 bg-voxxy-pink/15 text-voxxy-pink-deep dark:text-voxxy-pink-light',

        tintBlue: 'border-blue-500/30 bg-blue-500/20 text-blue-950 dark:text-blue-400',
        tintBlueSoft: 'border-blue-500/30 bg-blue-500/10 text-blue-950 dark:text-blue-400',

        tintGreen: 'border-green-500/30 bg-green-500/20 text-emerald-900 dark:text-green-400',
        tintGreenSoft: 'border-green-500/30 bg-green-500/10 text-emerald-900 dark:text-green-400',
        tintGreenDeep: 'border-green-500/30 bg-green-600/20 text-emerald-900 dark:text-green-300',

        tintYellow: 'border-yellow-500/30 bg-yellow-500/20 text-yellow-950 dark:text-yellow-400',
        tintYellowSoft:
          'border-yellow-500/30 bg-yellow-500/10 text-yellow-950 dark:text-yellow-400',

        tintRed: 'border-red-500/30 bg-red-500/20 text-red-950 dark:text-red-400',
        tintRedSoft: 'border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-400',

        tintOrange: 'border-orange-500/30 bg-orange-500/20 text-orange-950 dark:text-orange-400',
        tintOrangeSoft:
          'border-orange-500/30 bg-orange-500/10 text-orange-950 dark:text-orange-400',

        tintSlate: 'border-slate-500/30 bg-slate-500/20 text-slate-800 dark:text-slate-400',

        tintPink: 'border-pink-500/30 bg-pink-500/20 text-rose-950 dark:text-pink-300',

        tintCyan: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-950 dark:text-cyan-400',

        tintAmber: 'border-amber-500/30 bg-amber-500/20 text-amber-950 dark:text-amber-300',

        tintIndigo: 'border-indigo-500/30 bg-indigo-500/20 text-indigo-950 dark:text-indigo-300',

        tintMuted: 'border-border/50 bg-muted/20 text-muted-foreground',
        tintMutedSoft: 'border-border/30 bg-muted/10 text-muted-foreground',

        tintNeutral: 'border-border bg-background/10 text-foreground/70',
        tintNeutralFaint: 'border-border bg-background/10 text-foreground/60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<'span'>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
