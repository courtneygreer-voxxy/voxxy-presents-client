import { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Download, Loader2, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  eventsApi,
  vendorApplicationsApi,
  vendorContactsApi,
  type VendorContact,
} from '@/services/api';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  buildRecordsFromContacts,
  buildRecordsFromEvents,
  buildRecordsFromSubmissions,
  dataExportRecordsToCsv,
  formatTsCell,
  mergeDataExportRecords,
  sortDataExportRecords,
  type DataExportRecord,
  type ExportEntityKind,
  type SortColumnId,
  type SubmissionExportInput,
} from './unifiedDataExport';
import {
  addExportedKeys,
  loadExportedKeys,
  toggleExportedKey,
} from './dataExportTracking';

const MAX_EVENTS_FOR_VENDOR_FETCH = 15;

export type EntityTypeFilter = 'all' | ExportEntityKind;

interface UnifiedDataExportModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: number;
  organizationSlug: string;
}

function sortEventsNewestFirst(events: Record<string, unknown>[]): Record<string, unknown>[] {
  return [...events].sort((a, b) => {
    const ta = Date.parse(String(a.updated_at ?? a.event_date ?? a.created_at ?? 0));
    const tb = Date.parse(String(b.updated_at ?? b.event_date ?? b.created_at ?? 0));
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });
}

async function fetchSubmissionsForEvent(
  eventSlug: string,
  eventTitle: string
): Promise<{ inputs: SubmissionExportInput[]; errors: string[] }> {
  const inputs: SubmissionExportInput[] = [];
  const errors: string[] = [];

  let applications: unknown[] = [];
  try {
    applications = await vendorApplicationsApi.getByEvent(eventSlug);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load vendor applications';
    errors.push(`${eventSlug}: ${msg}`);
    return { inputs, errors };
  }

  for (const app of applications) {
    const a = app as { id: number; name?: string };
    try {
      const submissions = await vendorApplicationsApi.getSubmissions(a.id);
      for (const sub of submissions) {
        inputs.push({
          submission: sub as Record<string, unknown>,
          eventSlug,
          eventTitle,
          vendorApplicationName: a.name,
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submissions error';
      errors.push(`${eventSlug} app ${a.id}: ${msg}`);
    }
  }

  return { inputs, errors };
}

function hasUnsubscribeSignal(r: DataExportRecord): boolean {
  if (r.unsubscribed_at) return true;
  return /unsubscribe/i.test(r.current_status);
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UnifiedDataExportModal({
  open,
  onClose,
  organizationId,
  organizationSlug,
}: UnifiedDataExportModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<DataExportRecord[]>([]);
  const [exportedSnapshot, setExportedSnapshot] = useState<Set<string>>(() => new Set());
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());

  const [entityFilter, setEntityFilter] = useState<EntityTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<string>('__all__');
  const [exportStateFilter, setExportStateFilter] = useState<'all' | 'exported' | 'not_exported'>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'unsubscribed' | 'not_unsubscribed'>('all');

  const [sortColumn, setSortColumn] = useState<SortColumnId>('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [meta, setMeta] = useState({
    eventCount: 0,
    eventsCapped: false,
    contactsLoaded: 0,
    contactPageTotal: 0,
    contactsFirstPageOnly: false,
    vendorFetchErrors: [] as string[],
  });

  const refreshExported = useCallback(() => {
    setExportedSnapshot(new Set(loadExportedKeys(organizationId)));
  }, [organizationId]);

  useEffect(() => {
    if (open) {
      refreshExported();
      setSelectedKeys(new Set());
    }
  }, [open, refreshExported]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRecords([]);
    setMeta({
      eventCount: 0,
      eventsCapped: false,
      contactsLoaded: 0,
      contactPageTotal: 0,
      contactsFirstPageOnly: false,
      vendorFetchErrors: [],
    });

    try {
      const [eventsResult, contactsResult] = await Promise.allSettled([
        eventsApi.getByOrganization(organizationSlug),
        vendorContactsApi.getAll(organizationId, { page: 1, per_page: 500 }),
      ]);

      let rawEvents: Record<string, unknown>[] = [];
      const eventRecs: DataExportRecord[] = [];
      if (eventsResult.status === 'fulfilled') {
        const list = Array.isArray(eventsResult.value) ? eventsResult.value : [];
        rawEvents = list as Record<string, unknown>[];
        eventRecs.push(...buildRecordsFromEvents(list));
      }

      let contactList: VendorContact[] = [];
      let contactsFirstPageOnly = false;
      let contactPageTotal = 0;
      let contactsLoaded = 0;
      if (contactsResult.status === 'fulfilled') {
        const res = contactsResult.value;
        contactList = res.vendor_contacts ?? [];
        contactsLoaded = contactList.length;
        contactPageTotal = res.meta?.total_count ?? contactList.length;
        const totalPages = res.meta?.total_pages ?? 1;
        contactsFirstPageOnly = totalPages > 1;
      }

      const contactRecs = buildRecordsFromContacts(contactList);

      const sorted = sortEventsNewestFirst(rawEvents);
      const capped = sorted.slice(0, MAX_EVENTS_FOR_VENDOR_FETCH);
      const eventsCapped = sorted.length > MAX_EVENTS_FOR_VENDOR_FETCH;

      const submissionInputs: SubmissionExportInput[] = [];
      const vendorFetchErrors: string[] = [];

      if (eventsResult.status === 'fulfilled') {
        const submissionResults = await Promise.allSettled(
          capped.map(ev => {
            const slug = String(ev.slug ?? '');
            const title = String(ev.title ?? 'Event');
            if (!slug) return Promise.resolve({ inputs: [] as SubmissionExportInput[], errors: [] as string[] });
            return fetchSubmissionsForEvent(slug, title);
          })
        );

        for (const r of submissionResults) {
          if (r.status === 'fulfilled') {
            submissionInputs.push(...r.value.inputs);
            vendorFetchErrors.push(...r.value.errors);
          }
        }
      }

      const vendorRecs = buildRecordsFromSubmissions(submissionInputs);
      const merged = mergeDataExportRecords([eventRecs, contactRecs, vendorRecs]);
      setRecords(merged);
      setMeta({
        eventCount: rawEvents.length,
        eventsCapped,
        contactsLoaded,
        contactPageTotal,
        contactsFirstPageOnly,
        vendorFetchErrors,
      });

      if (eventsResult.status === 'rejected') {
        const r = eventsResult.reason;
        setError(`Events could not be loaded: ${r instanceof Error ? r.message : String(r)}`);
      } else if (contactsResult.status === 'rejected') {
        const r = contactsResult.reason;
        setError(`Contacts could not be loaded: ${r instanceof Error ? r.message : String(r)}`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load export data');
    } finally {
      setLoading(false);
    }
  }, [organizationId, organizationSlug]);

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const distinctStatuses = useMemo(() => {
    const u = new Set(records.map(r => r.current_status));
    return [...u].sort((a, b) => a.localeCompare(b));
  }, [records]);

  const filteredRecords = useMemo(() => {
    let list = records;
    if (entityFilter !== 'all') {
      list = list.filter(r => r.entityKind === entityFilter);
    }
    if (statusFilter !== '__all__') {
      list = list.filter(r => r.current_status === statusFilter);
    }
    if (exportStateFilter === 'exported') {
      list = list.filter(r => exportedSnapshot.has(r.exportKey));
    } else if (exportStateFilter === 'not_exported') {
      list = list.filter(r => !exportedSnapshot.has(r.exportKey));
    }
    if (subscriptionFilter === 'unsubscribed') {
      list = list.filter(hasUnsubscribeSignal);
    } else if (subscriptionFilter === 'not_unsubscribed') {
      list = list.filter(r => !hasUnsubscribeSignal(r));
    }
    return list;
  }, [records, entityFilter, statusFilter, exportStateFilter, subscriptionFilter, exportedSnapshot]);

  const sortedFiltered = useMemo(
    () => sortDataExportRecords(filteredRecords, sortColumn, sortDir),
    [filteredRecords, sortColumn, sortDir]
  );

  const visibleKeys = useMemo(() => sortedFiltered.map(r => r.exportKey), [sortedFiltered]);
  const selectedInView = useMemo(
    () => visibleKeys.filter(k => selectedKeys.has(k)),
    [visibleKeys, selectedKeys]
  );
  const allVisibleSelected =
    visibleKeys.length > 0 && selectedInView.length === visibleKeys.length;
  const someVisibleSelected = selectedInView.length > 0 && !allVisibleSelected;

  const toggleSort = (col: SortColumnId) => {
    if (sortColumn === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDir(col === 'displayName' || col === 'secondaryId' || col === 'current_status' ? 'asc' : 'desc');
    }
  };

  const toggleSelectAllVisible = () => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleKeys.forEach(k => next.delete(k));
      } else {
        visibleKeys.forEach(k => next.add(k));
      }
      return next;
    });
  };

  const toggleSelectRow = (key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const includedInExport = useCallback((key: string) => exportedSnapshot.has(key), [exportedSnapshot]);

  const exportCsv = (rows: DataExportRecord[], filename: string, markExported: boolean) => {
    const keys = rows.map(r => r.exportKey);
    const snapForCsv = new Set(exportedSnapshot);
    if (markExported) {
      keys.forEach(k => snapForCsv.add(k));
    }
    const csv = dataExportRecordsToCsv(rows, k => snapForCsv.has(k));
    triggerDownload(csv, filename);
    if (markExported && keys.length > 0) {
      addExportedKeys(organizationId, keys);
      refreshExported();
    }
  };

  const handleExportSelected = () => {
    const keysToExport = sortedFiltered.filter(r => selectedKeys.has(r.exportKey));
    if (keysToExport.length === 0) return;
    exportCsv(
      keysToExport,
      `voxxy-unified-data-export-selected-${organizationSlug}.csv`,
      true
    );
  };

  const handleExportFiltered = () => {
    if (sortedFiltered.length === 0) return;
    exportCsv(
      sortedFiltered,
      `voxxy-unified-data-export-filtered-${organizationSlug}.csv`,
      true
    );
  };

  const handleExportedCheckbox = (key: string, checked: boolean) => {
    toggleExportedKey(organizationId, key, checked);
    refreshExported();
  };

  const counts = useMemo(() => {
    const by = (k: ExportEntityKind) => records.filter(r => r.entityKind === k).length;
    return {
      all: records.length,
      event: by('event'),
      contact: by('contact'),
      vendor_submission: by('vendor_submission'),
    };
  }, [records]);

  const SortIcon = ({ col }: { col: SortColumnId }) => {
    const active = sortColumn === col;
    const iconClass = active
      ? 'inline w-3 h-3 text-purple-600 dark:text-purple-400'
      : 'inline w-3 h-3 text-foreground/40 dark:text-foreground/35';
    if (!active) return <ArrowUpDown className={iconClass} />;
    return sortDir === 'asc' ? <ArrowUp className={iconClass} /> : <ArrowDown className={iconClass} />;
  };

  const sectionDivider = 'border-b border-border';

  const thClass =
    'px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap cursor-pointer select-none text-foreground/80 hover:text-foreground transition-colors';

  const tdClass =
    'px-2 py-1.5 align-middle text-foreground/90 dark:text-foreground/80 text-[11px]';

  if (!open) return null;

  return (
    <div
      className="voxxy-overlay-scrim fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unified-data-export-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="voxxy-modal-surface flex max-h-[92vh] w-full max-w-[min(96rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-xl"
      >
        <div
          className="voxxy-gradient-modal-header flex flex-shrink-0 items-start justify-between gap-4 rounded-t-xl border-b border-primary/20 px-4 py-3 md:px-5 md:py-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
              <Download className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 id="unified-data-export-title" className="truncate text-base font-semibold text-foreground md:text-lg">
                Unified data export
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground md:text-xs">
                Events, contacts, and vendor registrations in one table — with timestamps and CSV export.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-foreground/60 transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`flex flex-shrink-0 flex-wrap items-center gap-2 px-4 py-2 text-xs md:px-5 ${sectionDivider} bg-muted/30`}
        >
          <span className="text-foreground/90 dark:text-foreground/70">
            <strong className="text-foreground">{meta.eventCount}</strong> events
            {meta.eventsCapped && (
              <span className="text-amber-600 dark:text-amber-400 ml-1">
                (vendor fetch: last {MAX_EVENTS_FOR_VENDOR_FETCH} by recency)
              </span>
            )}
            {' · '}
            <strong className="text-foreground">{meta.contactsLoaded}</strong> of{' '}
            <strong className="text-foreground">{meta.contactPageTotal || meta.contactsLoaded}</strong> contacts
            {meta.contactsFirstPageOnly && (
              <span className="text-amber-600 dark:text-amber-400 ml-1">(first page only)</span>
            )}
            {' · '}
            <strong className="text-foreground">{counts.vendor_submission}</strong> vendor registrations
          </span>
        </div>

        {meta.vendorFetchErrors.length > 0 && (
          <div className="mx-4 md:mx-5 mt-2 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-foreground dark:text-foreground/90">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              Some vendor data failed to load ({meta.vendorFetchErrors.length} issue
              {meta.vendorFetchErrors.length === 1 ? '' : 's'}).
            </span>
          </div>
        )}

        <div className={`flex flex-shrink-0 flex-col gap-3 px-4 py-3 md:px-5 ${sectionDivider} bg-muted/20`}>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: 'all' as const, label: 'All', count: counts.all },
                { key: 'event' as const, label: 'Events', count: counts.event },
                { key: 'contact' as const, label: 'Contacts', count: counts.contact },
                { key: 'vendor_submission' as const, label: 'Vendors', count: counts.vendor_submission },
              ] as const
            ).map(chip => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setEntityFilter(chip.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  entityFilter === chip.key
                    ? 'border-purple-500/45 bg-purple-500/25 text-violet-950 shadow-sm dark:border-purple-400/35 dark:bg-purple-500/20 dark:text-purple-100'
                    : 'border-purple-500/15 bg-background/40 text-foreground/90 hover:bg-purple-500/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:text-foreground/80 dark:hover:bg-white/[0.06]'
                }`}
              >
                {chip.label}
                <span className="ml-1 text-foreground/65 dark:text-foreground/50">({chip.count})</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[140px]">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-foreground/55 dark:text-foreground/45">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="voxxy-input-frost h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All statuses</SelectItem>
                  {distinctStatuses.map(s => (
                    <SelectItem key={s} value={s}>
                      {s.length > 80 ? `${s.slice(0, 80)}…` : s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px]">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-foreground/55 dark:text-foreground/45">
                Export state
              </label>
              <Select
                value={exportStateFilter}
                onValueChange={v => setExportStateFilter(v as 'all' | 'exported' | 'not_exported')}
              >
                <SelectTrigger className="voxxy-input-frost h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="exported">Exported</SelectItem>
                  <SelectItem value="not_exported">Not exported</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[160px]">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-foreground/55 dark:text-foreground/45">
                Subscription
              </label>
              <Select
                value={subscriptionFilter}
                onValueChange={v => setSubscriptionFilter(v as 'all' | 'unsubscribed' | 'not_unsubscribed')}
              >
                <SelectTrigger className="voxxy-input-frost h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribe signal</SelectItem>
                  <SelectItem value="not_unsubscribed">No unsubscribe signal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportSelected}
              disabled={loading || selectedInView.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/25 bg-background/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-purple-500/[0.08] disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
            >
              <Download className="w-3.5 h-3.5" />
              Export selected ({selectedInView.length})
            </button>
            <button
              type="button"
              onClick={handleExportFiltered}
              disabled={loading || sortedFiltered.length === 0}
              className="voxxy-btn-cta flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium shadow-sm disabled:pointer-events-none disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export all filtered ({sortedFiltered.length})
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-2 pb-4 md:px-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-foreground/90 dark:text-foreground/70">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
              <p className="text-sm text-foreground">Loading export data…</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-200 mb-4">
              {error}
            </div>
          )}

          {!loading && !error && sortedFiltered.length === 0 && (
            <p className="text-center text-sm text-foreground/85 dark:text-foreground/60 py-12">No rows match the current filters.</p>
          )}

          {!loading && !error && sortedFiltered.length > 0 && (
            <div className="voxxy-table-shell">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-xs">
                <thead className="voxxy-table-header">
                  <tr className="voxxy-table-header-row">
                    <th className={`${thClass} w-10`}>
                      <Checkbox
                        checked={
                          allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false
                        }
                        onCheckedChange={() => toggleSelectAllVisible()}
                        aria-label="Select all visible rows"
                        className="translate-y-0.5"
                      />
                    </th>
                    <th className={thClass} onClick={() => toggleSort('entityKind')}>
                      Entity <SortIcon col="entityKind" />
                    </th>
                    <th className={thClass} onClick={() => toggleSort('displayName')}>
                      Name <SortIcon col="displayName" />
                    </th>
                    <th className={thClass} onClick={() => toggleSort('secondaryId')}>
                      Slug / email / context <SortIcon col="secondaryId" />
                    </th>
                    <th className={thClass} onClick={() => toggleSort('created_at')}>
                      created_at <SortIcon col="created_at" />
                    </th>
                    <th className={thClass} onClick={() => toggleSort('approved_at')}>
                      approved_at <SortIcon col="approved_at" />
                    </th>
                    <th className={thClass} onClick={() => toggleSort('unsubscribed_at')}>
                      unsubscribed_at <SortIcon col="unsubscribed_at" />
                    </th>
                    <th className={thClass} onClick={() => toggleSort('updated_at')}>
                      updated_at <SortIcon col="updated_at" />
                    </th>
                    <th className={`${thClass} max-w-[200px]`} onClick={() => toggleSort('current_status')}>
                      Status <SortIcon col="current_status" />
                    </th>
                    <th className={`${thClass} w-28`}>Exported</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/[0.12] dark:divide-white/[0.06]">
                  {sortedFiltered.map(r => (
                    <ExportTableRow
                      key={r.exportKey}
                      r={r}
                      selected={selectedKeys.has(r.exportKey)}
                      exported={includedInExport(r.exportKey)}
                      onSelect={() => toggleSelectRow(r.exportKey)}
                      onExportedChange={checked => handleExportedCheckbox(r.exportKey, checked)}
                      tdClass={tdClass}
                    />
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExportTableRow({
  r,
  selected,
  exported,
  onSelect,
  onExportedChange,
  tdClass,
}: {
  r: DataExportRecord;
  selected: boolean;
  exported: boolean;
  onSelect: () => void;
  onExportedChange: (checked: boolean) => void;
  tdClass: string;
}) {
  return (
    <tr className="voxxy-table-row voxxy-table-row-hover">
      <td className={tdClass}>
        <Checkbox checked={selected} onCheckedChange={() => onSelect()} aria-label={`Select ${r.displayName}`} />
      </td>
      <td className={tdClass}>
        <span
          className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-inset ${
            r.entityKind === 'event'
              ? 'bg-blue-500/15 text-blue-900 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/15'
              : r.entityKind === 'contact'
                ? 'bg-emerald-500/15 text-emerald-900 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/15'
                : 'bg-orange-500/15 text-orange-900 ring-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/15'
          }`}
        >
          {r.entityLabel}
        </span>
      </td>
      <td className={`${tdClass} font-medium max-w-[140px] truncate`} title={r.displayName}>
        {r.displayName}
      </td>
      <td className={`${tdClass} max-w-[220px] truncate text-foreground/80`} title={r.secondaryId}>
        {r.secondaryId}
      </td>
      <td className={`${tdClass} whitespace-nowrap tabular-nums text-[11px]`}>{formatTsCell(r.created_at)}</td>
      <td className={`${tdClass} whitespace-nowrap tabular-nums text-[11px]`}>{formatTsCell(r.approved_at)}</td>
      <td className={`${tdClass} whitespace-nowrap tabular-nums text-[11px]`}>{formatTsCell(r.unsubscribed_at)}</td>
      <td className={`${tdClass} whitespace-nowrap tabular-nums text-[11px]`}>{formatTsCell(r.updated_at)}</td>
      <td className={`${tdClass} max-w-[200px] truncate text-[11px]`} title={r.current_status}>
        {r.current_status}
      </td>
      <td className={tdClass}>
        <Checkbox
          checked={exported}
          onCheckedChange={v => onExportedChange(v === true)}
          aria-label={exported ? 'Included in export' : 'Not marked exported'}
        />
      </td>
    </tr>
  );
}
