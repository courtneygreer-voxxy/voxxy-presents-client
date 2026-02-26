/**
 * EmailAuditLogOverlay - Full-screen email audit log viewer
 *
 * Displays a filterable, sortable table of all email deliveries for an event.
 * Opens from the Mail tab "View Audit Log" button or deep-link from email counts.
 */

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, FileSearch, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AuditEntry, AuditFilters, ScheduledEmail, EmailDelivery } from '@/types/email';
import { scheduledEmailsApi, emailDeliveriesApi, eventInvitationsApi } from '@/services/api';
import { EmailAuditTable } from './EmailAuditTable';
import { EmailAuditFilters } from './EmailAuditFilters';

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

  // Sorting state
  type SortColumn = 'sent_at' | 'recipient_name' | 'recipient_email' | 'email_name' | 'category' | 'status';
  type SortDirection = 'asc' | 'desc';
  const [sortColumn, setSortColumn] = useState<SortColumn | null>('sent_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

        // 1. Fetch all scheduled emails
        const scheduledEmails = await scheduledEmailsApi.getByEvent(event.slug);
        console.log('✅ [Audit Log] Fetched', scheduledEmails.length, 'scheduled emails');

        // 2. Fetch invitations for the virtual invitation email
        const invitationsData = await eventInvitationsApi.getByEvent(event.slug).catch(() => ({
          invitations: [],
          meta: { total_count: 0, sent_count: 0 }
        }));
        console.log('📨 [Audit Log] Fetched', invitationsData.meta.sent_count, 'sent invitations');

        // 3. Build audit entries array
        const entries: AuditEntry[] = [];

        // 3a. Process invitation emails (virtual email)
        const sentInvitations = invitationsData.invitations.filter((inv: any) => inv.sent_at);
        for (const invitation of sentInvitations) {
          entries.push({
            id: `invitation-${invitation.id}`,
            sent_at: invitation.sent_at || null,
            recipient_name: invitation.vendor_contact?.name || null,
            recipient_email: invitation.vendor_contact?.email || 'unknown@example.com',
            email_name: 'Event Announcement (Invitation)',
            email_subject: 'Submissions Open for ' + event.title,
            trigger_type: 'on_application_open',
            category: (invitation.vendor_contact as any)?.vendor_category || 'Unknown',
            status: (invitation as any).delivery_status || 'delivered',
            bounce_reason: null,
            drop_reason: null,
            unsubscribed_at: null,
            scheduled_email_id: -1, // Virtual email
            registration_id: invitation.id,
          });
        }

        // 3b. Process scheduled emails
        for (const email of scheduledEmails) {
          // Skip if email hasn't been sent yet
          if (email.status !== 'sent' || !email.sent_at) {
            continue;
          }

          // Fetch deliveries for this email
          try {
            const deliveries = await emailDeliveriesApi.getByScheduledEmail(email.id);
            console.log(`📬 [Audit Log] Fetched ${deliveries.length} deliveries for email: ${email.name}`);

            // Transform each delivery into an audit entry
            for (const delivery of deliveries) {
              entries.push({
                id: `${email.id}-${delivery.registration_id}`,
                sent_at: delivery.sent_at,
                recipient_name: null, // TODO: Fetch from registration when backend supports it
                recipient_email: delivery.recipient_email,
                email_name: email.name,
                email_subject: email.subject_template,
                trigger_type: email.trigger_type,
                category: 'Unknown', // TODO: Fetch from registration.vendor_category when backend supports it
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

  // Client-side filtering and sorting
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...auditEntries];

    // Apply filters
    if (filters.email_name) {
      result = result.filter(entry => entry.email_name === filters.email_name);
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
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Mail
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h1 className="text-lg font-semibold">Email Audit Log</h1>
                  <p className="text-sm text-muted-foreground">
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
      <div className="flex-1 overflow-auto px-6 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-red-500/20 rounded-lg bg-red-500/10">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Filter Bar */}
        {!isLoading && !error && auditEntries.length > 0 && (
          <div className="mb-6">
            <EmailAuditFilters
              filters={filters}
              onFiltersChange={setFilters}
              entries={auditEntries}
            />
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
            onActionClick={(entry) => {
              console.log('Action clicked for entry:', entry);
              // TODO: Open action menu
            }}
          />
        )}

        {/* Pagination */}
        {!isLoading && !error && filteredAndSortedEntries.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-white/60">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedEntries.length)} of{' '}
              {filteredAndSortedEntries.length} emails
              {filters.search || filters.email_name || filters.category || filters.status
                ? ` (filtered from ${auditEntries.length} total)`
                : ''}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-white/60 px-3">
                Page {currentPage} of {totalPages}
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
    </div>
  );
}
