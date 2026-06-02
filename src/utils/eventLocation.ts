/**
 * Resolve the city/market string used for exports and "Show Locations".
 * Prefers event.location; falls back to venue when location was never saved.
 */
export function resolveEventLocation(event: Record<string, unknown>): string {
  const location = String(event.location ?? '').trim()
  if (location) return location

  const venue = String(event.venue ?? '').trim()
  if (venue) return venue

  return ''
}

export function buildEventLocationMap(
  events: Record<string, unknown>[]
): Map<number, string> {
  const map = new Map<number, string>()
  for (const ev of events) {
    const id = Number(ev.id)
    const loc = resolveEventLocation(ev)
    if (id && loc) map.set(id, loc)
  }
  return map
}
