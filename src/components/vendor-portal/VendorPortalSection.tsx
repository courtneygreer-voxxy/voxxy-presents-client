import { useId, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const shellClass = 'glass-card rounded-2xl'

export function VendorPortalSection({
  title,
  description,
  icon: Icon,
  children,
  className,
  headerClassName,
  contentClassName,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}) {
  const headingId = useId()

  return (
    <section className={cn(shellClass, 'p-5 md:p-8', className)} aria-labelledby={headingId}>
      <header className={cn('mb-5 md:mb-6', headerClassName)}>
        <div className="flex items-start gap-3 md:gap-4">
          {Icon && (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.18] ring-1 ring-primary/15"
              aria-hidden
            >
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2
              id={headingId}
              className="text-lg font-semibold tracking-tight text-foreground md:text-xl"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </header>
      <div className={contentClassName}>{children}</div>
    </section>
  )
}
