import { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Download, Loader2, ArrowUpDown, ArrowUp, ArrowDown, CalendarDays, Users } from 'lucide-react';
import {
  eventsApi,
  vendorContactsApi,
  type VendorContact,
} from '@/services/api';
import { Checkbox } from '@/components/ui/checkbox';
import { formatTsCell, csvEscape } from '@/components/producer/Network/unifiedDataExport';
import {
  EXPORT_EVENT_COLUMNS,
  EXPORT_COLUMNS,
  eventsToCsv,
  contactsToCsv,
  triggerCsvDownload,
} from '@/components/producer/Network/contactsCsvExport';
import { buildEventLocationMap } from '@/utils/eventLocation';
import {
  enrichContactsWithEventHistory,
  getShowLocationsForContact,
} from '@/utils/enrichContactsEventHistory';

type TabId = 'events' | 'contacts';

interface FullDataExportModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: number;
  organizationSlug: string;
}

export default function FullDataExportModal({
  open,
  onClose,
  organizationId,
  organizationSlug,
}: FullDataExportModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('events');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<Record<string, unknown>[]>([]);
  const [contacts, setContacts] = useState<VendorContact[]>([]);

  const [selectedEventKeys, setSelectedEventKeys] = useState<Set<string>>(() => new Set());
  const [selectedContactKeys, setSelectedContactKeys] = useState<Set<string>>(() => new Set());

  // Events sorting
  const [eventSortCol, setEventSortCol] = useState<string>('event_date');
  const [eventSortDir, setEventSortDir] = useState<'asc' | 'desc'>('desc');

  // Contacts sorting
  const [contactSortCol, setContactSortCol] = useState<string>('updated_at');
  const [contactSortDir, setContactSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (open) {
      setSelectedEventKeys(new Set());
      setSelectedContactKeys(new Set());
    }
  }, [open]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEvents([]);
    setContacts([]);

    try {
      const [eventsResult, contactsResult] = await Promise.allSettled([
        eventsApi.getByOrganization(organizationSlug),
        vendorContactsApi.getAll(organizationId, { page: 1, per_page: 500 }),
      ]);

      if (eventsResult.status === 'fulfilled') {
        setEvents(Array.isArray(eventsResult.value) ? (eventsResult.value as Record<string, unknown>[]) : []);
      }

      let eventList: Record<string, unknown>[] =
        eventsResult.status === 'fulfilled' && Array.isArray(eventsResult.value)
          ? (eventsResult.value as Record<string, unknown>[])
          : [];

      if (contactsResult.status === 'fulfilled') {
        const res = contactsResult.value;
        let contactList = res.vendor_contacts ?? [];
        const totalPages = res.meta?.total_pages ?? 1;
        if (totalPages > 1) {
          for (let p = 2; p <= totalPages; p++) {
            const pageRes = await vendorContactsApi.getAll(organizationId, { page: p, per_page: 500 });
            contactList = [...contactList, ...(pageRes.vendor_contacts ?? [])];
          }
        }
        if (eventList.length > 0) {
          contactList = await enrichContactsWithEventHistory(contactList, eventList);
        }
        setContacts(contactList);
      }

      if (eventsResult.status === 'rejected') {
        setError(`Events failed: ${eventsResult.reason instanceof Error ? eventsResult.reason.message : String(eventsResult.reason)}`);
      } else if (contactsResult.status === 'rejected') {
        setError(`Contacts failed: ${contactsResult.reason instanceof Error ? contactsResult.reason.message : String(contactsResult.reason)}`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [organizationId, organizationSlug]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* ---------- Events sorting ---------- */
  const sortedEvents = useMemo(() => {
    const mult = eventSortDir === 'asc' ? 1 : -1;
    const tsCols = new Set(['event_date', 'event_end_date', 'application_deadline', 'payment_deadline', 'created_at', 'updated_at']);
    return [...events].sort((a, b) => {
      const colDef = EXPORT_EVENT_COLUMNS.find(c => c.key === eventSortCol);
      if (!colDef) return 0;
      const va = colDef.getValue(a);
      const vb = colDef.getValue(b);
      if (tsCols.has(eventSortCol)) {
        const ta = va ? Date.parse(va) : NaN;
        const tb = vb ? Date.parse(vb) : NaN;
        if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
        if (Number.isNaN(ta)) return 1;
        if (Number.isNaN(tb)) return -1;
        return (ta - tb) * mult;
      }
      if (!va && !vb) return 0;
      if (!va) return 1;
      if (!vb) return -1;
      return va.localeCompare(vb) * mult;
    });
  }, [events, eventSortCol, eventSortDir]);

  /* ---------- Contacts sorting ---------- */
  const sortedContacts = useMemo(() => {
    const mult = contactSortDir === 'asc' ? 1 : -1;
    const tsCols = new Set(['updated_at', 'created_at', 'last_contacted']);
    return [...contacts].sort((a, b) => {
      const colDef = EXPORT_COLUMNS.find(c => c.key === contactSortCol);
      if (!colDef) return 0;
      const va = colDef.getValue(a);
      const vb = colDef.getValue(b);
      if (tsCols.has(contactSortCol)) {
        const ta = va ? Date.parse(va) : NaN;
        const tb = vb ? Date.parse(vb) : NaN;
        if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
        if (Number.isNaN(ta)) return 1;
        if (Number.isNaN(tb)) return -1;
        return (ta - tb) * mult;
      }
      if (!va && !vb) return 0;
      if (!va) return 1;
      if (!vb) return -1;
      return va.localeCompare(vb) * mult;
    });
  }, [contacts, contactSortCol, contactSortDir]);

  /* ---------- Event key helpers ---------- */
  const eventKey = (ev: Record<string, unknown>) => `ev-${ev.id ?? ev.slug}`;
  const eventVisibleKeys = useMemo(() => sortedEvents.map(eventKey), [sortedEvents]);
  const evSelectedInView = useMemo(() => eventVisibleKeys.filter(k => selectedEventKeys.has(k)), [eventVisibleKeys, selectedEventKeys]);
  const allEventsSelected = eventVisibleKeys.length > 0 && evSelectedInView.length === eventVisibleKeys.length;
  const someEventsSelected = evSelectedInView.length > 0 && !allEventsSelected;

  /* ---------- Contact key helpers ---------- */
  const contactKey = (c: VendorContact) => `ct-${c.id}`;
  const contactVisibleKeys = useMemo(() => sortedContacts.map(contactKey), [sortedContacts]);
  const ctSelectedInView = useMemo(() => contactVisibleKeys.filter(k => selectedContactKeys.has(k)), [contactVisibleKeys, selectedContactKeys]);
  const allContactsSelected = contactVisibleKeys.length > 0 && ctSelectedInView.length === contactVisibleKeys.length;
  const someContactsSelected = ctSelectedInView.length > 0 && !allContactsSelected;

  /* ---------- Selection toggles ---------- */
  const toggleEventSelect = (key: string) => {
    setSelectedEventKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const toggleAllEvents = () => {
    setSelectedEventKeys(prev => {
      const next = new Set(prev);
      if (allEventsSelected) eventVisibleKeys.forEach(k => next.delete(k));
      else eventVisibleKeys.forEach(k => next.add(k));
      return next;
    });
  };
  const toggleContactSelect = (key: string) => {
    setSelectedContactKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const toggleAllContacts = () => {
    setSelectedContactKeys(prev => {
      const next = new Set(prev);
      if (allContactsSelected) contactVisibleKeys.forEach(k => next.delete(k));
      else contactVisibleKeys.forEach(k => next.add(k));
      return next;
    });
  };

  /* ---------- Sort toggles ---------- */
  const toggleEventSort = (col: string) => {
    if (eventSortCol === col) setEventSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setEventSortCol(col); setEventSortDir(col === 'title' || col === 'venue' ? 'asc' : 'desc'); }
  };
  const toggleContactSort = (col: string) => {
    if (contactSortCol === col) setContactSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setContactSortCol(col); setContactSortDir(col === 'name' || col === 'email' ? 'asc' : 'desc'); }
  };

  /* ---------- Export handlers ---------- */
  const handleExportEvents = (selected: boolean) => {
    const rows = selected
      ? sortedEvents.filter(ev => selectedEventKeys.has(eventKey(ev)))
      : sortedEvents;
    if (rows.length === 0) return;
    const csv = eventsToCsv(rows);
    const date = new Date().toISOString().slice(0, 10);
    triggerCsvDownload(csv, `events-export-${organizationSlug}-${date}.csv`);
  };

  const handleExportContacts = (selected: boolean) => {
    const rows = selected
      ? sortedContacts.filter(c => selectedContactKeys.has(contactKey(c)))
      : sortedContacts;
    if (rows.length === 0) return;
    // Build CSV with the derived "Show Locations" column appended
    const baseCsv = contactsToCsv(rows);
    const lines = baseCsv.split('\n');
    const headerLine = lines[0] + ',' + csvEscape('Show Locations');
    const dataLines = rows.map((c, i) => lines[i + 1] + ',' + csvEscape(getShowLocations(c)));
    const csv = [headerLine, ...dataLines].join('\n');
    const date = new Date().toISOString().slice(0, 10);
    triggerCsvDownload(csv, `contacts-export-${organizationSlug}-${date}.csv`);
  };

  const eventLocationMap = useMemo(() => buildEventLocationMap(events), [events]);

  const getShowLocations = (c: VendorContact): string =>
    getShowLocationsForContact(c, eventLocationMap, events);

  /* ---------- Columns to display in table (subset for readability) ---------- */
  const eventTableCols = ['title', 'event_date', 'start_time', 'end_time', 'venue', 'location', 'status', 'ticket_url', 'capacity', 'registered', 'application_deadline', 'created_at', 'updated_at'];
  const contactTableCols = ['name', 'email', 'phone', 'location', 'show_locations', 'category', 'events', 'unsubscribed', 'updated_at', 'created_at'];

  // Inject the derived "Show Locations" column into the contact columns for display
  const showLocationsCol = { key: 'show_locations', label: 'Show Locations', getValue: getShowLocations, defaultOn: false };
  const displayEventCols = EXPORT_EVENT_COLUMNS.filter(c => eventTableCols.includes(c.key));
  const displayContactCols = EXPORT_COLUMNS
    .filter(c => contactTableCols.includes(c.key))
    .flatMap(c => c.key === 'location' ? [c, showLocationsCol] : [c]);

  /* ---------- Shared classes ---------- */
  const thClass = 'px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap cursor-pointer select-none text-foreground/80 hover:text-foreground transition-colors';
  const tdClass = 'px-2 py-1.5 align-middle text-foreground/90 dark:text-foreground/80 text-[11px]';

  const SortIcon = ({ col, activeCol, activeDir }: { col: string; activeCol: string; activeDir: 'asc' | 'desc' }) => {
    const active = activeCol === col;
    const iconClass = active
      ? 'inline w-3 h-3 text-purple-600 dark:text-purple-400'
      : 'inline w-3 h-3 text-foreground/40 dark:text-foreground/35';
    if (!active) return <ArrowUpDown className={iconClass} />;
    return activeDir === 'asc' ? <ArrowUp className={iconClass} /> : <ArrowDown className={iconClass} />;
  };

  if (!open) return null;

  return (
    <div
      className="voxxy-overlay-scrim fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="full-data-export-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="voxxy-modal-surface flex max-h-[92vh] w-full max-w-[min(80rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-xl">
        {/* Header */}
        <div className="voxxy-gradient-modal-header flex flex-shrink-0 items-start justify-between gap-4 rounded-t-xl border-b border-primary/20 px-4 py-3 md:px-5 md:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
              <Download className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 id="full-data-export-title" className="truncate text-base font-semibold text-foreground md:text-lg">
                Data Export
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground md:text-xs">
                Review and export your events and contacts as CSV.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex-shrink-0 text-foreground/60 transition-colors hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-shrink-0 border-b border-border bg-muted/20">
          {([
            { id: 'events' as const, label: 'Events', count: events.length, Icon: CalendarDays },
            { id: 'contacts' as const, label: 'Contacts', count: contacts.length, Icon: Users },
          ]).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-foreground/60 hover:text-foreground/80 hover:border-foreground/20'
              }`}
            >
              <tab.Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs text-foreground/50">({loading ? '…' : tab.count})</span>
            </button>
          ))}
        </div>

        {/* Export buttons bar */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2 px-4 py-2.5 md:px-5 border-b border-border bg-muted/10">
          {activeTab === 'events' ? (
            <>
              <button
                type="button"
                onClick={() => handleExportEvents(true)}
                disabled={loading || evSelectedInView.length === 0}
                className="flex items-center gap-1.5 rounded-lg border border-purple-500/25 bg-background/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-purple-500/[0.08] disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
              >
                <Download className="w-3.5 h-3.5" />
                Export selected ({evSelectedInView.length})
              </button>
              <button
                type="button"
                onClick={() => handleExportEvents(false)}
                disabled={loading || sortedEvents.length === 0}
                className="voxxy-btn-cta flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium shadow-sm disabled:pointer-events-none disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Export all ({sortedEvents.length})
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleExportContacts(true)}
                disabled={loading || ctSelectedInView.length === 0}
                className="flex items-center gap-1.5 rounded-lg border border-purple-500/25 bg-background/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-purple-500/[0.08] disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
              >
                <Download className="w-3.5 h-3.5" />
                Export selected ({ctSelectedInView.length})
              </button>
              <button
                type="button"
                onClick={() => handleExportContacts(false)}
                disabled={loading || sortedContacts.length === 0}
                className="voxxy-btn-cta flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium shadow-sm disabled:pointer-events-none disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Export all ({sortedContacts.length})
              </button>
            </>
          )}
        </div>

        {/* Table area */}
        <div className="min-h-0 flex-1 overflow-auto px-2 pb-4 md:px-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
              <p className="text-sm text-foreground">Loading export data…</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-200 my-4">{error}</div>
          )}

          {/* Events tab */}
          {!loading && !error && activeTab === 'events' && (
            sortedEvents.length === 0 ? (
              <p className="text-center text-sm text-foreground/60 py-12">No events found.</p>
            ) : (
              <div className="voxxy-table-shell mt-2">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-xs">
                    <thead className="voxxy-table-header">
                      <tr className="voxxy-table-header-row">
                        <th className={`${thClass} w-10`}>
                          <Checkbox
                            checked={allEventsSelected ? true : someEventsSelected ? 'indeterminate' : false}
                            onCheckedChange={() => toggleAllEvents()}
                            aria-label="Select all events"
                            className="translate-y-0.5"
                          />
                        </th>
                        {displayEventCols.map(col => (
                          <th key={col.key} className={thClass} onClick={() => toggleEventSort(col.key)}>
                            {col.label} <SortIcon col={col.key} activeCol={eventSortCol} activeDir={eventSortDir} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/[0.12] dark:divide-white/[0.06]">
                      {sortedEvents.map(ev => {
                        const key = eventKey(ev);
                        return (
                          <tr key={key} className="voxxy-table-row voxxy-table-row-hover">
                            <td className={tdClass}>
                              <Checkbox checked={selectedEventKeys.has(key)} onCheckedChange={() => toggleEventSelect(key)} />
                            </td>
                            {displayEventCols.map(col => (
                              <td
                                key={col.key}
                                className={`${tdClass} max-w-[200px] truncate ${col.key === 'title' ? 'font-medium' : ''}`}
                                title={col.getValue(ev)}
                              >
                                {col.key === 'created_at' || col.key === 'updated_at'
                                  ? formatTsCell(col.getValue(ev) || null)
                                  : col.getValue(ev) || '—'}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* Contacts tab */}
          {!loading && !error && activeTab === 'contacts' && (
            sortedContacts.length === 0 ? (
              <p className="text-center text-sm text-foreground/60 py-12">No contacts found.</p>
            ) : (
              <div className="voxxy-table-shell mt-2">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-xs">
                    <thead className="voxxy-table-header">
                      <tr className="voxxy-table-header-row">
                        <th className={`${thClass} w-10`}>
                          <Checkbox
                            checked={allContactsSelected ? true : someContactsSelected ? 'indeterminate' : false}
                            onCheckedChange={() => toggleAllContacts()}
                            aria-label="Select all contacts"
                            className="translate-y-0.5"
                          />
                        </th>
                        {displayContactCols.map(col => (
                          <th key={col.key} className={thClass} onClick={() => toggleContactSort(col.key)}>
                            {col.label} <SortIcon col={col.key} activeCol={contactSortCol} activeDir={contactSortDir} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/[0.12] dark:divide-white/[0.06]">
                      {sortedContacts.map(c => {
                        const key = contactKey(c);
                        return (
                          <tr key={key} className="voxxy-table-row voxxy-table-row-hover">
                            <td className={tdClass}>
                              <Checkbox checked={selectedContactKeys.has(key)} onCheckedChange={() => toggleContactSelect(key)} />
                            </td>
                            {displayContactCols.map(col => (
                              <td
                                key={col.key}
                                className={`${tdClass} max-w-[200px] truncate ${col.key === 'name' ? 'font-medium' : ''}`}
                                title={col.getValue(c)}
                              >
                                {col.key === 'created_at' || col.key === 'updated_at'
                                  ? formatTsCell(col.getValue(c) || null)
                                  : col.getValue(c) || '—'}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
