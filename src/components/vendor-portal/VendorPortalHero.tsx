import { useEffect, useId, useState } from 'react';
import { Building2, Calendar, Clock, ImagePlus, X } from 'lucide-react';
import type { EventDetails } from '@/types/eventPortal';

/** Fallback hero when no poster and no local upload (prototype polish). */
const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1920&q=80';

export interface VendorPortalHeroProps {
  event: EventDetails;
  formatDate: (dateString: string | null) => string;
  formatTime: (timeString: string | null) => string;
  /** Object URL from a local file pick; takes precedence over poster_url */
  bannerPreviewUrl: string | null;
  onPickBannerFile: (file: File) => void;
  onClearBannerPreview: () => void;
  /** Show local-only upload UI (e.g. producer preview or ?design=1) */
  showBannerUploader: boolean;
  isProducerPreview: boolean;
  onSignOut?: () => void;
}

export function VendorPortalHero({
  event,
  formatDate,
  formatTime,
  bannerPreviewUrl,
  onPickBannerFile,
  onClearBannerPreview,
  showBannerUploader,
  isProducerPreview,
  onSignOut,
}: VendorPortalHeroProps) {
  const fileInputId = useId();
  const [imgBroken, setImgBroken] = useState(false);

  const src = bannerPreviewUrl || event.poster_url?.trim() || DEFAULT_HERO_IMAGE;

  useEffect(() => {
    setImgBroken(false);
  }, [src]);

  return (
    <div className="relative w-full px-0 pb-1 pt-4 sm:px-4 sm:pb-2 sm:pt-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-none border border-purple-400/25 shadow-xl shadow-purple-950/20 ring-1 ring-purple-500/15 sm:rounded-3xl dark:border-purple-400/30 dark:shadow-black/40 dark:ring-purple-400/20">
        <div className="relative min-h-[240px] md:min-h-[300px] lg:min-h-[340px]">
          {/* Fallback wash when image fails or behind photo */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-violet-200 via-purple-100 to-white dark:from-purple-950 dark:via-violet-900 dark:to-slate-950"
            aria-hidden
          />
          {!imgBroken && (
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-100 dark:opacity-90"
              onError={() => setImgBroken(true)}
            />
          )}
          {/* Light: bottom-heavy scrim so the photo stays vivid on top; dark: full cinematic overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/20 to-transparent dark:from-black/90 dark:via-black/50 dark:to-black/25"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.18),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.25),transparent_50%)]"
            aria-hidden
          />

          {/* Top bar: upload + preview pills (same glass treatment), sign out */}
          <div className="relative z-10 flex flex-col gap-3 p-4 pb-0 md:p-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
              {showBannerUploader && (
                <div className="flex w-full max-w-xl flex-col gap-2 rounded-xl border border-purple-200/80 bg-white/92 px-3 py-2.5 text-left text-purple-950 shadow-md shadow-purple-900/10 backdrop-blur-md dark:border-white/20 dark:bg-black/45 dark:text-white dark:shadow-black/40 md:flex-row md:items-center md:gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-purple-900 dark:text-white/90">
                    <ImagePlus className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-300" aria-hidden />
                    <span>Banner preview (not saved)</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor={fileInputId}
                      className="cursor-pointer rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700 dark:bg-white/15 dark:text-white dark:ring-1 dark:ring-white/25 dark:hover:bg-white/25"
                    >
                      Upload image
                    </label>
                    <input
                      id={fileInputId}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) onPickBannerFile(f);
                        e.target.value = '';
                      }}
                    />
                    {bannerPreviewUrl && (
                      <button
                        type="button"
                        onClick={onClearBannerPreview}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-purple-900 transition hover:bg-purple-50 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                        Reset to poster
                      </button>
                    )}
                  </div>
                </div>
              )}
              {isProducerPreview && (
                <div
                  role="status"
                  className="w-full max-w-xl rounded-xl border border-purple-200/80 bg-white/92 px-3 py-2.5 text-left text-purple-950 shadow-md shadow-purple-900/10 backdrop-blur-md dark:border-white/20 dark:bg-black/45 dark:text-white dark:shadow-black/40"
                >
                  <p className="text-xs font-semibold text-purple-900 dark:text-white">Vendor preview</p>
                  <p className="mt-1 text-[11px] leading-snug text-purple-900/85 dark:text-white/80">
                    Same page vendors see after they sign in.
                  </p>
                  {showBannerUploader ? (
                    <p className="mt-1.5 text-[11px] leading-snug text-purple-800/75 dark:text-white/65">
                      Banner controls above are for testing only—not shown to vendors.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] leading-snug text-purple-800/75 dark:text-white/65">
                      Optional: add{' '}
                      <kbd className="rounded border border-purple-300/70 bg-white/90 px-1 py-0.5 font-mono text-[10px] font-normal text-purple-950 dark:border-white/25 dark:bg-black/40 dark:text-white">
                        ?design=1
                      </kbd>{' '}
                      to try the banner upload prototype.
                    </p>
                  )}
                </div>
              )}
            </div>

            {onSignOut && !isProducerPreview && (
              <button
                type="button"
                onClick={onSignOut}
                className="shrink-0 self-end rounded-lg border border-purple-200/90 bg-white/92 px-3 py-1.5 text-xs font-medium text-purple-950 shadow-sm backdrop-blur-md transition hover:bg-purple-50 sm:self-start md:text-sm dark:border-white/25 dark:bg-black/35 dark:text-white dark:hover:bg-black/50"
              >
                Sign out
              </button>
            )}
          </div>

          {/* Title block — white type reads on bottom scrim in both modes */}
          <div className="relative z-10 flex flex-col justify-end px-4 pb-6 pt-16 md:px-8 md:pb-8 md:pt-20">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75 md:text-xs">
              Vendor portal
            </p>
            {event.organization && (
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] dark:text-white/85 dark:drop-shadow-none">
                <Building2 className="h-4 w-4 shrink-0 text-purple-200 dark:text-purple-300" aria-hidden />
                <span>{event.organization.name}</span>
              </p>
            )}
            <h1 className="mb-3 max-w-3xl text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] md:text-4xl md:drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] lg:text-5xl dark:drop-shadow-sm">
              {event.title}
            </h1>
            {event.dates?.event_date && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] md:text-base dark:text-white/85 dark:drop-shadow-none">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-purple-200 dark:text-purple-300" aria-hidden />
                  {formatDate(event.dates.event_date)}
                </span>
                {(event.dates.start_time || event.dates.end_time) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-purple-200 dark:text-purple-300" aria-hidden />
                    {event.dates.start_time && formatTime(event.dates.start_time)}
                    {event.dates.start_time && event.dates.end_time && ' – '}
                    {event.dates.end_time && formatTime(event.dates.end_time)}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
