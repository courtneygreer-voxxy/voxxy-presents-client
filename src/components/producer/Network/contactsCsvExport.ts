import type { VendorContact } from '@/services/api'
import { resolveEventLocation } from '@/utils/eventLocation'
import { csvEscape, formatIsoForCsv } from './unifiedDataExport'

export interface ExportColumn {
  key: string
  label: string
  getValue: (c: VendorContact) => string
  defaultOn: boolean
}

export const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'first_name', label: 'First Name', getValue: (c) => c.first_name || '', defaultOn: true },
  { key: 'last_name', label: 'Last Name', getValue: (c) => c.last_name || '', defaultOn: true },
  {
    key: 'affiliation',
    label: 'Affiliation',
    getValue: (c) => c.affiliation || '',
    defaultOn: true,
  },
  { key: 'email', label: 'Email', getValue: (c) => c.email || '', defaultOn: true },
  { key: 'phone', label: 'Phone', getValue: (c) => c.phone || '', defaultOn: true },
  { key: 'location', label: 'Location', getValue: (c) => c.location || '', defaultOn: true },
  {
    key: 'category',
    label: 'Category',
    getValue: (c) => (c.categories || []).join(', '),
    defaultOn: true,
  },
  {
    key: 'instagram',
    label: 'Instagram',
    getValue: (c) => c.instagram_handle || '',
    defaultOn: false,
  },
  { key: 'tiktok', label: 'TikTok', getValue: (c) => c.tiktok_handle || '', defaultOn: false },
  { key: 'website', label: 'Website', getValue: (c) => c.website || '', defaultOn: false },
  { key: 'tags', label: 'Tags', getValue: (c) => (c.tags || []).join(', '), defaultOn: false },
  {
    key: 'contact_type',
    label: 'Contact Type',
    getValue: (c) => c.contact_type || '',
    defaultOn: false,
  },
  { key: 'status', label: 'Status', getValue: (c) => c.status || '', defaultOn: false },
  {
    key: 'events_participated',
    label: 'Events Participated',
    getValue: (c) => String(c.events_participated ?? 0),
    defaultOn: false,
  },
  {
    key: 'last_contacted',
    label: 'Last Contacted',
    getValue: (c) => formatIsoForCsv(c.last_contacted_at ?? null),
    defaultOn: false,
  },
  {
    key: 'unsubscribed',
    label: 'Unsubscribed',
    getValue: (c) => (c.unsubscribe_status?.is_unsubscribed ? 'Yes' : 'No'),
    defaultOn: false,
  },
  {
    key: 'updated_at',
    label: 'Updated At',
    getValue: (c) => formatIsoForCsv(c.updated_at),
    defaultOn: false,
  },
  {
    key: 'created_at',
    label: 'Created At',
    getValue: (c) => formatIsoForCsv(c.created_at),
    defaultOn: false,
  },
  {
    key: 'events',
    label: 'Events',
    getValue: (c) => (c.event_history || []).map((e) => e.event_name).join(', '),
    defaultOn: false,
  },
]

export function getDefaultColumnKeys(): Set<string> {
  return new Set(EXPORT_COLUMNS.filter((c) => c.defaultOn).map((c) => c.key))
}

export function contactsToCsv(contacts: VendorContact[], selectedColumns?: Set<string>): string {
  const cols = selectedColumns
    ? EXPORT_COLUMNS.filter((c) => selectedColumns.has(c.key))
    : EXPORT_COLUMNS

  const headers = cols.map((c) => c.label)
  const rows = contacts.map((contact) => cols.map((col) => csvEscape(col.getValue(contact))))

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

/* ---------- Event export ---------- */

export interface EventExportColumn {
  key: string
  label: string
  getValue: (ev: Record<string, unknown>) => string
}

function evStr(ev: Record<string, unknown>, key: string): string {
  const v = ev[key]
  return v != null && v !== '' ? String(v) : ''
}

function evNested(ev: Record<string, unknown>, parent: string, child: string): string {
  const obj = ev[parent] as Record<string, unknown> | undefined
  if (!obj) return ''
  const v = obj[child]
  return v != null && v !== '' ? String(v) : ''
}

export const EXPORT_EVENT_COLUMNS: EventExportColumn[] = [
  { key: 'title', label: 'Event Name', getValue: (ev) => evStr(ev, 'title') },
  {
    key: 'event_date',
    label: 'Date',
    getValue: (ev) => formatIsoForCsv(evStr(ev, 'event_date') || null),
  },
  {
    key: 'event_end_date',
    label: 'End Date',
    getValue: (ev) => formatIsoForCsv(evStr(ev, 'event_end_date') || null),
  },
  { key: 'start_time', label: 'Start Time', getValue: (ev) => evStr(ev, 'start_time') },
  { key: 'end_time', label: 'End Time', getValue: (ev) => evStr(ev, 'end_time') },
  { key: 'venue', label: 'Venue', getValue: (ev) => evStr(ev, 'venue') },
  { key: 'location', label: 'Location', getValue: (ev) => resolveEventLocation(ev) },
  { key: 'status', label: 'Status', getValue: (ev) => evNested(ev, 'status', 'status') },
  {
    key: 'published',
    label: 'Published',
    getValue: (ev) => (evNested(ev, 'status', 'published') ? 'Yes' : 'No'),
  },
  {
    key: 'is_live',
    label: 'Live',
    getValue: (ev) => (evNested(ev, 'status', 'is_live') ? 'Yes' : 'No'),
  },
  {
    key: 'ticket_url',
    label: 'Ticket URL',
    getValue: (ev) => evStr(ev, 'ticket_url') || evStr(ev, 'ticket_link'),
  },
  { key: 'capacity', label: 'Capacity', getValue: (ev) => evNested(ev, 'capacity', 'total') },
  {
    key: 'registered',
    label: 'Registered',
    getValue: (ev) => evNested(ev, 'capacity', 'registered'),
  },
  {
    key: 'spots_remaining',
    label: 'Spots Remaining',
    getValue: (ev) => evNested(ev, 'capacity', 'remaining'),
  },
  {
    key: 'application_deadline',
    label: 'Application Deadline',
    getValue: (ev) => formatIsoForCsv(evStr(ev, 'application_deadline') || null),
  },
  {
    key: 'payment_deadline',
    label: 'Payment Deadline',
    getValue: (ev) => formatIsoForCsv(evStr(ev, 'payment_deadline') || null),
  },
  {
    key: 'ticket_price',
    label: 'Ticket Price',
    getValue: (ev) => evNested(ev, 'pricing', 'ticket_price'),
  },
  {
    key: 'age_restriction',
    label: 'Age Restriction',
    getValue: (ev) => evStr(ev, 'age_restriction'),
  },
  {
    key: 'created_at',
    label: 'Created At',
    getValue: (ev) => formatIsoForCsv(evStr(ev, 'created_at') || null),
  },
  {
    key: 'updated_at',
    label: 'Updated At',
    getValue: (ev) => formatIsoForCsv(evStr(ev, 'updated_at') || null),
  },
]

export function eventsToCsv(
  events: Record<string, unknown>[],
  selectedColumns?: Set<string>,
): string {
  const cols = selectedColumns
    ? EXPORT_EVENT_COLUMNS.filter((c) => selectedColumns.has(c.key))
    : EXPORT_EVENT_COLUMNS

  const headers = cols.map((c) => c.label)
  const rows = events.map((ev) => cols.map((col) => csvEscape(col.getValue(ev))))

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export function getDefaultEventColumnKeys(): Set<string> {
  return new Set(EXPORT_EVENT_COLUMNS.map((c) => c.key))
}

export function triggerCsvDownload(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
