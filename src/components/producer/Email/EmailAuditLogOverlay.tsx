/**
 * EmailAuditLogOverlay - Full-screen email audit log viewer
 *
 * Displays a filterable, sortable table of all email deliveries for an event.
 * Opens from the Mail tab "View Audit Log" button or deep-link from email counts.
 */

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, FileSearch, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AuditEntry, AuditFilters, ScheduledEmail, EmailDelivery, EmailCategory } from '@/types/email';
import { scheduledEmailsApi, emailDeliveriesApi } from '@/services/api';
import { EmailAuditTable, type SortColumn } from './EmailAuditTable';
import { EmailAuditFilters } from './EmailAuditFilters';
import { ContactSupportDialog } from './ContactSupportDialog';
import { useAuth } from '@/hooks/useAuth';

/** Infer lifecycle category from email name/trigger (matches Mail tab grouping) */
function inferCategory(email: ScheduledEmail): EmailCategory {
  const name = email.name.toLowerCase();
  const trigger = email.trigger_type;

  if (name.includes('payment') || trigger.includes('payment')) return 'payment';
  if (name.includes('application') || name.includes('approval') || name.includes('rejected') || name.includes('waitlist') || name.includes('accepted')) return 'application';
  if (trigger === 'days_before_event' || name.includes('countdown') || name.includes('days before')) return 'pre_event';
  if (trigger === 'on_event_date' || name.includes('day of')) return 'event_day';
  if (trigger === 'days_after_event') return 'post_event';
  if (name.includes('announcement') || name.includes('immediate') || name.includes('invitation') || name.includes('art call')) return 'pre_application';
  return 'pre_application';
}

interface EmailAuditLogOverlayProps {
  event: any; // From eventsApi.getById()
  initialFilters?: AuditFilters | null;
  onClose: () => void;
}

export function EmailAuditLogOverlay({
  event,
  initialFilters,
  onClose,
}: EmailAuditLogOverlayProps) {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditFilters>(initialFilters || {});
  const [currentPage, setCurrentPage] = useState(1);

  // Contact Support dialog state
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  // Get user info for support form
  const { userProfile } = useAuth();

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn | null>('sent_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 100;

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Fetch and transform data
  useEffect(() => {
    const fetchAuditData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('📧 [Audit Log] Fetching scheduled emails for event:', event.slug);

        // 1. Fetch all scheduled emails (including Position 1 - Initial Invitation)
        const scheduledEmails = await scheduledEmailsApi.getByEvent(event.slug);
        console.log('✅ [Audit Log] Fetched', scheduledEmails.length, 'scheduled emails');
        // Debug: log email_template_item data to diagnose category values
        for (const email of scheduledEmails) {
          console.log(`🔍 [Audit Log] Email "${email.name}" → template_item:`, email.email_template_item, '→ category:', email.email_template_item?.category);
        }

        // 2. Build audit entries array
        const entries: AuditEntry[] = [];

        // Process scheduled emails (including Position 1 - Initial Invitation)
        // Position 1 invitation deliveries are now linked via scheduled_email_id,
        // so they'll be fetched via the API like all other scheduled emails
        for (const email of scheduledEmails) {
          // Handle sent emails - fetch actual delivery records
          if (email.status === 'sent' && email.sent_at) {
            try {
              const deliveries = await emailDeliveriesApi.getByScheduledEmail(event.slug, email.id);
              console.log(`📬 [Audit Log] Fetched ${deliveries.length} deliveries for email: ${email.name}`);

              // Transform each delivery into an audit entry
              for (const delivery of deliveries) {
                entries.push({
                  id: `${email.id}-${delivery.registration_id || delivery.event_invitation_id}`,
                  sent_at: delivery.sent_at,
                  recipient_name: delivery.recipient_name || null,
                  recipient_email: delivery.recipient_email,
                  email_name: email.name,
                  email_subject: email.subject_template,
                  trigger_type: email.trigger_type,
                  category: inferCategory(email),
                  status: delivery.status,
                  bounce_reason: delivery.bounce_reason,
                  drop_reason: delivery.drop_reason,
                  unsubscribed_at: delivery.unsubscribed_at,
                  scheduled_email_id: email.id,
                  registration_id: delivery.registration_id,
                });
              }
            } catch (err: any) {
              console.error(`❌ [Audit Log] Failed to fetch deliveries for email ${email.id}:`, err);
              // Continue with other emails
            }
          }
          // Handle scheduled/paused emails - show who WILL receive the email
          else if (email.status === 'scheduled' || email.status === 'paused') {
            try {
              const recipientsData = await scheduledEmailsApi.getRecipients(event.slug, email.id);
              console.log(`📅 [Audit Log] Fetched ${recipientsData.count} recipients for scheduled email: ${email.name}`);

              // Transform each recipient into an audit entry with 'scheduled' status
              for (const recipient of recipientsData.recipients) {
                entries.push({
                  id: `scheduled-${email.id}-${recipient.email}`,
                  sent_at: null, // Not sent yet
                  scheduled_for: email.scheduled_for, // When it will be sent
                  recipient_name: recipient.name,
                  recipient_email: recipient.email,
                  email_name: email.name,
                  email_subject: email.subject_template,
                  trigger_type: email.trigger_type,
                  category: inferCategory(email),
                  status: 'scheduled',
                  bounce_reason: null,
                  drop_reason: null,
                  unsubscribed_at: null,
                  scheduled_email_id: email.id,
                  registration_id: -1, // No registration_id for future recipients
                });
              }
            } catch (err: any) {
              console.error(`❌ [Audit Log] Failed to fetch recipients for scheduled email ${email.id}:`, err);
              // Continue with other emails
            }
          }
        }

        console.log('✅ [Audit Log] Built', entries.length, 'audit entries');
        setAuditEntries(entries);
      } catch (err: any) {
        console.error('❌ [Audit Log] Failed to fetch audit data:', err);
        setError(err.message || 'Failed to load email audit log');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditData();
  }, [event.slug, event.title]);

  // Handle contact support
  const handleContactSupport = (entry: AuditEntry) => {
    setSelectedEntry(entry);
    setShowContactSupport(true);
  };

  // Client-side filtering and sorting
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...auditEntries];

    // Apply filters
    if (filters.email_name) {
      console.log('🔍 [Audit Log] Filtering by email_name:', filters.email_name);
      console.log('📊 [Audit Log] Available email names:', [...new Set(auditEntries.map(e => e.email_name))]);
      result = result.filter(entry => entry.email_name === filters.email_name);
      console.log('✅ [Audit Log] Filtered results:', result.length, 'entries');
    }

    if (filters.category) {
      result = result.filter(entry => entry.category === filters.category);
    }

    if (filters.status) {
      if (filters.status === 'undelivered') {
        // Undelivered = bounced + dropped
        result = result.filter(entry => entry.status === 'bounced' || entry.status === 'dropped');
      } else {
        result = result.filter(entry => entry.status === filters.status);
      }
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(entry =>
        (entry.recipient_name?.toLowerCase().includes(query)) ||
        entry.recipient_email.toLowerCase().includes(query)
      );
    }

    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(entry => {
        const entryDate = entry.sent_at ? new Date(entry.sent_at) : null;
        return entryDate && entryDate >= fromDate;
      });
    }

    if (filters.date_to) {
      const toDate = new Date(filters.date_to);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(entry => {
        const entryDate = entry.sent_at ? new Date(entry.sent_at) : null;
        return entryDate && entryDate <= toDate;
      });
    }

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        let valA: any = '';
        let valB: any = '';

        switch (sortColumn) {
          case 'sent_at':
            valA = a.sent_at ? new Date(a.sent_at).getTime() : 0;
            valB = b.sent_at ? new Date(b.sent_at).getTime() : 0;
            break;
          case 'recipient_name':
            valA = (a.recipient_name || '').toLowerCase();
            valB = (b.recipient_name || '').toLowerCase();
            break;
          case 'recipient_email':
            valA = a.recipient_email.toLowerCase();
            valB = b.recipient_email.toLowerCase();
            break;
          case 'email_name':
            valA = a.email_name.toLowerCase();
            valB = b.email_name.toLowerCase();
            break;
          case 'category':
            valA = a.category.toLowerCase();
            valB = b.category.toLowerCase();
            break;
          case 'status':
            valA = a.status.toLowerCase();
            valB = b.status.toLowerCase();
            break;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [auditEntries, filters, sortColumn, sortDirection]);

  // Paginate results
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEntries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedEntries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedEntries.length / itemsPerPage);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10 shadow-lg">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Mail
              </Button>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-purple-400" />
                <div>
                  <h1 className="text-base font-semibold">Email Audit Log</h1>
                  <p className="text-xs text-muted-foreground">
                    {event.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Export button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement CSV export
                console.log('Export to CSV');
              }}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-red-500/20 rounded-lg bg-red-500/10">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Filter Bar */}
        {!isLoading && !error && auditEntries.length > 0 && (
          <div className="mb-4">
            <EmailAuditFilters
              filters={filters}
              onFiltersChange={setFilters}
              entries={auditEntries}
            />
          </div>
        )}

        {/* Total Count */}
        {!isLoading && !error && auditEntries.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-white/60">
              <span className="font-semibold text-white">{filteredAndSortedEntries.length}</span>
              {' '}email{filteredAndSortedEntries.length !== 1 ? 's' : ''}
              {(filters.search || filters.email_name || filters.category || filters.status || filters.date_from || filters.date_to)
                ? ' matched'
                : ' in total'}
            </p>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="border rounded-lg p-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-400 animate-spin" />
            <p className="text-white/60">Loading email audit log...</p>
          </div>
        ) : error ? (
          <div className="border rounded-lg p-12 text-center">
            <FileSearch className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <h3 className="text-lg font-semibold text-white mb-2">Failed to load</h3>
            <p className="text-sm text-white/60 mb-4">
              Unable to load email audit log. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        ) : auditEntries.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <FileSearch className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <h3 className="text-lg font-semibold text-white mb-2">No emails found</h3>
            <p className="text-sm text-white/60">
              {initialFilters
                ? 'No emails match your filters. Try adjusting your search criteria.'
                : 'No emails have been sent for this event yet.'}
            </p>
          </div>
        ) : filteredAndSortedEntries.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <FileSearch className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <h3 className="text-lg font-semibold text-white mb-2">No results</h3>
            <p className="text-sm text-white/60">
              No emails match your current filters. Try adjusting your search.
            </p>
          </div>
        ) : (
          <EmailAuditTable
            entries={paginatedEntries}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onContactSupport={handleContactSupport}
          />
        )}

        {/* Pagination */}
        {!isLoading && !error && filteredAndSortedEntries.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-lg border border-white/10">
            <p className="text-xs text-white/70">
              Showing <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
              <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, filteredAndSortedEntries.length)}</span> of{' '}
              <span className="font-semibold text-white">{filteredAndSortedEntries.length}</span> emails
              {filters.search || filters.email_name || filters.category || filters.status || filters.date_from || filters.date_to
                ? ` (filtered from ${auditEntries.length} total)`
                : ''}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-white/70 px-3 py-1 bg-white/5 rounded border border-white/10">
                Page <span className="font-semibold text-white">{currentPage}</span> of <span className="font-semibold text-white">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Support Dialog */}
      <ContactSupportDialog
        isOpen={showContactSupport}
        onClose={() => {
          setShowContactSupport(false);
          setSelectedEntry(null);
        }}
        entry={selectedEntry}
        eventTitle={event.title}
        userEmail={userProfile?.email}
        userName={userProfile?.name}
      />
    </div>
  );
}
