import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const GOOGLE_EMBED_KEY = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY as string | undefined;

function buildPlaceQuery(venue: string, location: string) {
  return [venue, location].map(s => s?.trim()).filter(Boolean).join(', ');
}

export function VendorPortalLocationMap({ venue, location }: { venue: string; location: string }) {
  const query = buildPlaceQuery(venue, location);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    const onToggle = () => {
      if (el.open) setEmbedLoaded(true);
    };
    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, []);

  if (!query) return null;

  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  const embedSrc = GOOGLE_EMBED_KEY?.trim()
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(GOOGLE_EMBED_KEY.trim())}&q=${encodeURIComponent(query)}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=15&output=embed`;

  return (
    <details
      ref={detailsRef}
      className="group mt-3 rounded-xl border border-white/10 bg-background/5 ring-1 ring-white/5"
    >
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.06]',
          '[&::-webkit-details-marker]:hidden'
        )}
      >
        <span>Show map</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-primary opacity-80 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-border px-3 pb-3 pt-3">
        {embedLoaded ? (
          <div className="overflow-hidden rounded-lg border border-border bg-muted/30 shadow-inner">
            <iframe
              title={`Map: ${query}`}
              src={embedSrc}
              className="aspect-[16/10] min-h-[200px] w-full border-0 sm:aspect-video sm:min-h-[240px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        ) : null}
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Open in Google Maps
          <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
        </a>
      </div>
    </details>
  );
}
