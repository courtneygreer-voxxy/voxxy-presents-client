import type { VendorContact } from '@/services/api';
import { isDatePast } from '@/utils/dateHelpers';

export type ExportEntityKind = 'event' | 'contact' | 'vendor_submission';

/** Stable key for selection, CSV, and localStorage export tracking */
export function makeExportKey(entityKind: ExportEntityKind, recordId: string | number): string {
  return `${entityKind}:${recordId}`;
}

export interface DataExportRecord {
  exportKey: string;
  entityKind: ExportEntityKind;
  entityLabel: string;
  recordId: string;
  displayName: string;
  secondaryId: string;
  created_at: string | null;
  approved_at: string | null;
  unsubscribed_at: string | null;
  updated_at: string | null;
  current_status: string;
}

export interface SubmissionExportInput {
  submission: Record<string, unknown>;
  eventSlug: string;
  eventTitle: string;
  vendorApplicationName?: string;
}

function str(val: unknown): string | null {
  return typeof val === 'string' && val.trim() ? val : null;
}

/**
 * Matches producer EventsList badge logic: Cancelled / Completed first, then Past by date,
 * then Live when `status.is_live`, otherwise Draft (not the `published` flag alone).
 */
function eventSimpleStatus(ev: Record<string, unknown>): string {
  const statusObj = ev.status as Record<string, unknown> | undefined;
  const lifecycle =
    typeof statusObj?.status === 'string' ? statusObj.status.toLowerCase().trim() : '';

  if (lifecycle === 'cancelled') return 'Cancelled';
  if (lifecycle === 'completed') return 'Completed';

  const dates = ev.dates as Record<string, unknown> | undefined;
  const eventDate =
    str(typeof dates?.start === 'string' ? dates.start : undefined) ?? str(ev.event_date);
  if (eventDate && isDatePast(eventDate)) return 'Past';

  const isLive =
    typeof statusObj?.is_live === 'boolean'
      ? statusObj.is_live
      : typeof (ev as { is_live?: boolean }).is_live === 'boolean'
        ? (ev as { is_live?: boolean }).is_live
        : false;

  if (isLive) return 'Live';
  return 'Draft';
}

/** One row per event */
export function buildRecordsFromEvents(events: unknown[]): DataExportRecord[] {
  const out: DataExportRecord[] = [];
  for (const raw of events) {
    const ev = raw as Record<string, unknown>;
    if (ev.id == null && !ev.slug) continue;
    const recordId = ev.id != null && ev.id !== '' ? String(ev.id) : String(ev.slug);
    const title = String(ev.title ?? ev.name ?? 'Untitled event');
    const slug = String(ev.slug ?? '');
    const secondary = slug ? slug : `id:${recordId}`;

    const created = str(ev.created_at);
    const updated = str(ev.updated_at);
    const approved =
      str(ev.approved_at) ?? str(ev.published_at) ?? str((ev as { go_live_at?: string }).go_live_at);

    out.push({
      exportKey: makeExportKey('event', recordId),
      entityKind: 'event',
      entityLabel: 'Event',
      recordId,
      displayName: title,
      secondaryId: secondary,
      created_at: created,
      approved_at: approved,
      unsubscribed_at: null,
      updated_at: updated,
      current_status: eventSimpleStatus(ev),
    });
  }
  return out;
}

/** CRM contact_type values include lead, vendor, partner, client, other (plus optional custom strings). */
function contactTypeLabel(c: VendorContact): string {
  const raw = String(c.contact_type || 'other').trim();
  return raw ? humanizeSnake(raw) : 'Other';
}

export function buildRecordsFromContacts(contacts: VendorContact[]): DataExportRecord[] {
  return contacts.map(c => {
    const title = c.contact_name || c.business_name || c.email || `Contact #${c.id}`;
    const unsubscribed = !!c.unsubscribe_status?.is_unsubscribed;
    const typeOnly = contactTypeLabel(c);
    const statusStr = unsubscribed ? `${typeOnly} · Unsubscribed` : typeOnly;

    return {
      exportKey: makeExportKey('contact', c.id),
      entityKind: 'contact',
      entityLabel: 'Contact',
      recordId: String(c.id),
      displayName: title,
      secondaryId: c.email,
      created_at: str(c.created_at) ?? null,
      approved_at: null,
      unsubscribed_at: null,
      updated_at: str(c.updated_at) ?? null,
      current_status: statusStr,
    };
  });
}

function approvedLike(status: unknown): boolean {
  const s = String(status ?? '').toLowerCase();
  return s === 'approved' || s === 'confirmed';
}

function humanizeSnake(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, ch => ch.toUpperCase())
    .trim();
}

/**
 * Single short label: Pending when application/payment both pending;
 * Pending money when approved but payment still owed; otherwise compact lifecycle words.
 */
function submissionSimpleStatus(s: Record<string, unknown>): string {
  const reg = String(s.status ?? '').toLowerCase().trim();
  const pay = String(s.payment_status ?? '').toLowerCase().trim();

  if (reg === 'rejected') return 'Rejected';
  if (reg === 'cancelled') return 'Cancelled';
  if (reg === 'waitlist') return 'Waitlist';

  const moneyOutstanding = pay === 'pending' || pay === 'overdue';
  const moneyClear = pay === 'paid' || pay === 'confirmed';
  const regApproved = reg === 'approved' || reg === 'confirmed';

  if (regApproved && moneyOutstanding) return 'Pending money';

  if (reg === 'pending') return 'Pending';

  if (regApproved) {
    if (!pay || pay === 'n/a') return 'Approved';
    if (moneyClear) return 'Confirmed';
    return 'Approved';
  }

  return humanizeSnake(reg || pay || 'Pending');
}

/** One row per vendor registration / submission */
export function buildRecordsFromSubmissions(inputs: SubmissionExportInput[]): DataExportRecord[] {
  const out: DataExportRecord[] = [];
  for (const { submission: s, eventSlug, eventTitle, vendorApplicationName } of inputs) {
    const rid = s.id;
    if (rid === undefined || rid === null) continue;
    const recordId = String(rid);
    const business = String(s.business_name ?? s.name ?? 'Vendor');
    const email = String(s.email ?? '');
    const secondary = [email, eventSlug, vendorApplicationName].filter(Boolean).join(' · ');

    const created = str(s.created_at);
    const updated = str(s.updated_at);
    const reviewed = str(s.reviewed_at);
    const status = s.status;

    let approved_at: string | null = null;
    if (approvedLike(status) && reviewed) {
      approved_at = reviewed;
    } else if (approvedLike(status) && updated) {
      approved_at = updated;
    }

    const unsubscribed_at = str((s as { unsubscribed_at?: string }).unsubscribed_at);

    out.push({
      exportKey: makeExportKey('vendor_submission', recordId),
      entityKind: 'vendor_submission',
      entityLabel: 'Vendor',
      recordId,
      displayName: business,
      secondaryId: secondary || `reg:${recordId} · ${eventTitle}`,
      created_at: created,
      approved_at,
      unsubscribed_at,
      updated_at: updated,
      current_status: submissionSimpleStatus(s),
    });
  }
  return out;
}

export function mergeDataExportRecords(groups: DataExportRecord[][]): DataExportRecord[] {
  return groups.flat();
}

function csvEscape(val: string): string {
  const needsQuote = /[",\n\r]/.test(val);
  const doubled = val.replace(/"/g, '""');
  return needsQuote ? `"${doubled}"` : doubled;
}

export function formatTsCell(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

/** ISO timestamps formatted for spreadsheet readability (empty when unknown). */
export function formatIsoForCsv(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function dataExportRecordsToCsv(
  rows: DataExportRecord[],
  includedInExport: (key: string) => boolean
): string {
  const headers = [
    'Entity',
    'Record key',
    'Record ID',
    'Name',
    'Email, event & details',
    'Created at',
    'Approved at',
    'Unsubscribed at',
    'Updated at',
    'Status',
    'Included in export',
  ];
  const lines = [
    headers.map(h => csvEscape(h)).join(','),
    ...rows.map(r =>
      [
        csvEscape(r.entityLabel),
        csvEscape(r.exportKey),
        csvEscape(r.recordId),
        csvEscape(r.displayName),
        csvEscape(r.secondaryId),
        csvEscape(formatIsoForCsv(r.created_at)),
        csvEscape(formatIsoForCsv(r.approved_at)),
        csvEscape(formatIsoForCsv(r.unsubscribed_at)),
        csvEscape(formatIsoForCsv(r.updated_at)),
        csvEscape(r.current_status),
        csvEscape(includedInExport(r.exportKey) ? 'Yes' : 'No'),
      ].join(',')
    ),
  ];
  return lines.join('\n');
}

export type SortColumnId =
  | 'entityKind'
  | 'displayName'
  | 'secondaryId'
  | 'created_at'
  | 'approved_at'
  | 'unsubscribed_at'
  | 'updated_at'
  | 'current_status';

export function sortDataExportRecords(
  rows: DataExportRecord[],
  column: SortColumnId,
  dir: 'asc' | 'desc'
): DataExportRecord[] {
  const mult = dir === 'asc' ? 1 : -1;
  const tsCols = new Set<SortColumnId>([
    'created_at',
    'approved_at',
    'unsubscribed_at',
    'updated_at',
  ]);

  const cmpStr = (a: string | null, b: string | null) => {
    const ae = a ?? '';
    const be = b ?? '';
    if (!ae && !be) return 0;
    if (!ae) return 1;
    if (!be) return -1;
    return ae.localeCompare(be) * mult;
  };

  const cmpTs = (a: string | null, b: string | null) => {
    const ta = a ? Date.parse(a) : NaN;
    const tb = b ? Date.parse(b) : NaN;
    const aBad = Number.isNaN(ta);
    const bBad = Number.isNaN(tb);
    if (aBad && bBad) return 0;
    if (aBad) return 1;
    if (bBad) return -1;
    return (ta - tb) * mult;
  };

  const sorted = [...rows];
  sorted.sort((x, y) => {
    if (tsCols.has(column)) {
      return cmpTs(x[column] as string | null, y[column] as string | null);
    }
    if (column === 'entityKind') {
      return cmpStr(x.entityKind, y.entityKind);
    }
    if (column === 'displayName') {
      return cmpStr(x.displayName, y.displayName);
    }
    if (column === 'secondaryId') {
      return cmpStr(x.secondaryId, y.secondaryId);
    }
    if (column === 'current_status') {
      return cmpStr(x.current_status, y.current_status);
    }
    return 0;
  });
  return sorted;
}
