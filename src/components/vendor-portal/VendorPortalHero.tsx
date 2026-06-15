import { Building2, Calendar, Clock } from 'lucide-react'
import type { EventDetails } from '@/types/eventPortal'

export interface VendorPortalHeroProps {
  event: EventDetails
  formatDate: (dateString: string | null) => string
  formatTime: (timeString: string | null) => string
  isProducerPreview: boolean
  onSignOut?: () => void
}

export function VendorPortalHero({
  event,
  formatDate,
  formatTime,
  isProducerPreview,
  onSignOut,
}: VendorPortalHeroProps) {
  return (
    <div className="relative w-full px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl">
        {/* Producer preview / sign-out bar */}
        {(isProducerPreview || onSignOut) && (
          <div className="mb-4 flex items-center justify-between gap-3">
            {isProducerPreview && (
              <div role="status" className="glass-card rounded-xl px-3 py-2.5 text-left">
                <p className="text-xs font-semibold text-foreground">Applicant preview</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  Same page applicants see after they sign in.
                </p>
              </div>
            )}
            {onSignOut && !isProducerPreview && (
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="voxxy-btn-public-secondary rounded-lg px-3 py-1.5 text-xs font-medium md:text-sm"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Title card */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:text-xs">
            Applicant portal
          </p>
          {event.organization && (
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Building2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{event.organization.name}</span>
            </p>
          )}
          <h1 className="mb-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {event.title}
          </h1>
          {event.dates?.event_date && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/70 md:text-base">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" aria-hidden />
                {formatDate(event.dates.event_date)}
              </span>
              {(event.dates.start_time || event.dates.end_time) && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" aria-hidden />
                  {event.dates.start_time && formatTime(event.dates.start_time)}
                  {event.dates.start_time && event.dates.end_time && ' – '}
                  {event.dates.end_time && formatTime(event.dates.end_time)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
