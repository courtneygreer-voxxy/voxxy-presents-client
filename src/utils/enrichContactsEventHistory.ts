import { eventsApi, type EventHistoryItem, type VendorContact } from '@/services/api'
import { resolveEventLocation } from '@/utils/eventLocation'

function eventSlug(ev: Record<string, unknown>): string | null {
  const slug = ev.slug ?? ev.namespaced_slug
  return slug != null && String(slug).trim() ? String(slug) : null
}

/**
 * Bulk list responses often omit event_history. For export, rebuild it from
 * command-center submissions (frontend-only, no schema changes).
 */
export async function enrichContactsWithEventHistory(
  contacts: VendorContact[],
  events: Record<string, unknown>[]
): Promise<VendorContact[]> {
  const needsEnrichment = contacts.some(
    c => (c.events_participated ?? 0) > 0 && !(c.event_history?.length)
  )
  if (!needsEnrichment || events.length === 0 || contacts.length === 0) {
    return contacts
  }

  const emailToHistory = new Map<string, EventHistoryItem[]>()
  const contactEmails = new Set(
    contacts.map(c => c.email?.trim().toLowerCase()).filter(Boolean) as string[]
  )

  await Promise.all(
    events.map(async ev => {
      const slug = eventSlug(ev)
      const eventId = Number(ev.id)
      if (!slug || !eventId) return

      try {
        const data = await eventsApi.getCommandCenterData(slug)
        const eventName = String(ev.title || data.event?.title || 'Event')
        const eventDate = String(ev.event_date || data.event?.event_date || '')

        for (const submission of data.submissions || []) {
          const email = String(submission.email || '').trim().toLowerCase()
          if (!email || !contactEmails.has(email)) continue

          const item: EventHistoryItem = {
            event_id: eventId,
            event_name: eventName,
            event_date: eventDate,
            category: String(submission.vendor_category || submission.category || ''),
            status: String(submission.status || ''),
            applied_at: String(submission.created_at || ''),
            application_id: Number(submission.vendor_application_id || submission.vendor_application?.id || 0),
          }

          const list = emailToHistory.get(email) || []
          if (!list.some(h => h.event_id === eventId)) {
            list.push(item)
            emailToHistory.set(email, list)
          }
        }
      } catch (err) {
        console.warn(`[export] Could not load submissions for event ${slug}:`, err)
      }
    })
  )

  if (emailToHistory.size === 0) return contacts

  return contacts.map(c => {
    const email = c.email?.trim().toLowerCase()
    const built = email ? emailToHistory.get(email) : undefined
    if (!built?.length) return c
    return { ...c, event_history: built }
  })
}

export function getShowLocationsForContact(
  contact: VendorContact,
  eventLocationMap: Map<number, string>,
  events: Record<string, unknown>[]
): string {
  const locs = new Set<string>()

  for (const eh of contact.event_history || []) {
    const id = Number(eh.event_id)
    const fromMap = eventLocationMap.get(id)
    if (fromMap) {
      locs.add(fromMap)
      continue
    }
    const ev = events.find(e => Number(e.id) === id)
    if (ev) {
      const loc = resolveEventLocation(ev)
      if (loc) locs.add(loc)
    }
  }

  return [...locs].join(', ')
}
