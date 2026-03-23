import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Loader2, Sparkles, Search, Filter, FileSearch, Mail, Plus } from 'lucide-react';
import { scheduledEmailsApi, eventsApi, categoriesApi, vendorApplicationsApi } from '@/services/api';
import type { ScheduledEmail, UpdateEmailRequest, ScheduledEmailStatus, AuditFilters, EmailCategory, CreateScheduledEmailRequest } from '@/types/email';
import type { Category } from '@/types/category';
import EmailTable from './EmailTable';
import SaveAsTemplateDialog from './SaveAsTemplateDialog';
import { EmailEditorPage } from './EmailEditorPage';
import { EmailAuditLogOverlay } from './EmailAuditLogOverlay';
import EmailSequenceEditorOverlay from './EmailSequenceEditorOverlay';
import { DebugPanel } from '../DebugPanel';

interface EmailAutomationTabProps {
  eventSlug: string;
  event?: any;
  isAdmin?: boolean;
}

type FilterType = 'all' | ScheduledEmailStatus;

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Emails' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'paused', label: 'Paused' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

type ViewState =
  | { view: 'table' }
  | { view: 'audit-log'; filters: AuditFilters | null }
  | { view: 'sequence-editor' }
  | { view: 'email-editor'; email: ScheduledEmail; returnTo: 'table' | 'sequence-editor' }
  | { view: 'email-editor'; email: null; returnTo: 'table' | 'sequence-editor' };

export default function EmailAutomationTab({ eventSlug, event, isAdmin }: EmailAutomationTabProps) {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any | null>(null);

  // Navigation state
  const [viewState, setViewState] = useState<ViewState>({ view: 'table' });

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');

  // Category filter state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all' | 'all_invitations' | 'all_vendors'>('all');

  // Sort state
  type SortColumn = 'name' | 'subject' | 'scheduled_for' | 'email_type' | 'category' | 'recipient_count' | 'undelivered_count' | 'unsubscribed_count' | 'status';
  type SortDirection = 'asc' | 'desc';
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };


  // Load scheduled emails
  useEffect(() => {
    loadEmails();
  }, [eventSlug]);

  // Load categories (only those used by this event's vendor applications)
  useEffect(() => {
    const loadCategories = async () => {
      // Try multiple ways to get organization ID
      const orgId = eventData?.organization?.id ||
                    eventData?.organization_id ||
                    event?.organization?.id ||
                    event?.organization_id;

      if (!orgId) {
        console.log('⚠️ No organization ID available yet, skipping category load');
        console.log('   eventData:', eventData ? 'exists' : 'null');
        console.log('   event prop:', event ? 'exists' : 'null');
        return;
      }

      try {
        console.log('📂 Loading categories for organization:', orgId);

        // Load all categories for the organization
        const categoriesResponse = await categoriesApi.getAll(orgId, true);
        const allCategories = categoriesResponse.categories || [];
        console.log('✅ Loaded all categories:', allCategories);

        // Load vendor applications for this event to see which categories are actually used
        const vendorApplications = await vendorApplicationsApi.getByEvent(eventSlug);
        console.log('✅ Loaded vendor applications:', vendorApplications);

        // Extract unique category_ids from vendor applications
        const usedCategoryIds = new Set(
          vendorApplications
            .map((app: any) => app.category_id)
            .filter((id: number | null) => id !== null)
        );
        console.log('📋 Categories used by this event:', Array.from(usedCategoryIds));

        // Filter categories to only show those used by this event
        const eventCategories = allCategories.filter((cat: Category) => usedCategoryIds.has(cat.id));
        console.log('✅ Filtered event-specific categories:', eventCategories);
        console.log('   Total categories available:', allCategories.length);
        console.log('   Categories used by event:', eventCategories.length);

        setCategories(eventCategories);
      } catch (error) {
        console.error('❌ Failed to load categories:', error);
      }
    };

    // Only load categories if we have event data
    if (eventData || event) {
      loadCategories();
    }
  }, [eventSlug, eventData, event]);

  // Auto-refresh delivery stats every 30 seconds (only on table view)
  useEffect(() => {
    if (!autoRefresh || viewState.view !== 'table') return;

    const interval = setInterval(() => {
      loadEmails(true); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, viewState.view, eventSlug]);

  const loadEmails = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      console.log('📧 Loading emails for event:', eventSlug);

      // Fetch event data (for preview calculations)
      const eventDataResponse = await eventsApi.getById(eventSlug);
      setEventData(eventDataResponse);
      console.log('📅 Fetched event data:', eventDataResponse.title);

      // Fetch scheduled emails
      const scheduledEmailsData = await scheduledEmailsApi.getByEvent(eventSlug);
      console.log('✅ Fetched', scheduledEmailsData.length, 'scheduled emails');
      console.log('   Position 1 (Initial Invitation) is now a real scheduled email from database');

      setEmails(scheduledEmailsData);
      setLastRefreshTime(new Date());
    } catch (err: any) {
      console.error('❌ Failed to load emails:', err);
      if (!silent) {
        setError(err.message || 'Failed to load scheduled emails');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handlePause = async (emailId: number) => {
    try {
      await scheduledEmailsApi.pause(eventSlug, emailId);
      await loadEmails(); // Reload to get updated data
      showSuccess('Email paused successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to pause email');
    }
  };

  const handleResume = async (emailId: number) => {
    try {
      await scheduledEmailsApi.resume(eventSlug, emailId);
      await loadEmails();
      showSuccess('Email resumed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to resume email');
    }
  };

  const handleSendNow = async (emailId: number) => {
    if (!confirm('Are you sure you want to send this email now? This cannot be undone.')) {
      return;
    }

    try {
      const result = await scheduledEmailsApi.sendNow(eventSlug, emailId);
      await loadEmails();
      showSuccess(`Email sent to ${result.sent_count} recipients`);
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    }
  };

  const handleRetryFailed = async (emailId: number) => {
    if (!confirm('Retry all failed deliveries? Only soft bounces (temporary failures like "mailbox full") will be retried. Hard bounces (invalid emails) will be skipped.')) {
      return;
    }

    try {
      const result = await scheduledEmailsApi.retryFailed(eventSlug, emailId);
      await loadEmails(); // Reload to get updated counts

      // Build success message
      let message = `Retried ${result.retried_count} failed ${result.retried_count === 1 ? 'delivery' : 'deliveries'}`;
      if (result.skipped_count > 0) {
        message += ` (${result.skipped_count} hard ${result.skipped_count === 1 ? 'bounce' : 'bounces'} skipped)`;
      }
      showSuccess(message);
    } catch (err: any) {
      setError(err.message || 'Failed to retry failed deliveries');
    }
  };

  const handleDelete = async (emailId: number) => {
    if (!confirm('Are you sure you want to delete this scheduled email? This cannot be undone.')) {
      return;
    }

    try {
      await scheduledEmailsApi.delete(eventSlug, emailId);
      await loadEmails();
      showSuccess('Email deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete email');
    }
  };

  const handleCreateEmail = async (data: CreateScheduledEmailRequest) => {
    try {
      const newEmail = await scheduledEmailsApi.create(eventSlug, data);
      await loadEmails();
      showSuccess('Email created successfully!');
      return newEmail;
    } catch (err: any) {
      setError(err.message || 'Failed to create email');
      throw err;
    }
  };

  const handleGenerateEmails = async () => {
    if (!confirm('Generate scheduled emails from the system template? This will create automated emails for your event.')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await scheduledEmailsApi.generate(eventSlug);
      await loadEmails();
      showSuccess(`Generated ${result.generated_count} scheduled emails for your event!`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate emails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsTemplate = (templateId: number) => {
    showSuccess('Template saved successfully! You can now reuse it for other events.');
  };

  const handleSaveEdit = async (emailId: number, data: UpdateEmailRequest) => {
    const updated = await scheduledEmailsApi.update(eventSlug, emailId, data);
    console.log('📧 Updated email received from server:', updated);
    console.log('   New scheduled_for:', updated.scheduled_for);

    // Force a fresh reload of emails to ensure UI updates
    setIsLoading(true);
    await loadEmails();
    setIsLoading(false);

    showSuccess('Email updated successfully');
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Filter and search emails
  const filteredEmails = useMemo(() => {
    let result = emails;

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(email => email.status === statusFilter);
    }

    // Filter by vendor category
    if (selectedCategoryId !== 'all') {
      result = result.filter(email => {
        // Helper function to infer email type using same logic as EmailRow.tsx
        const inferCategory = (): EmailCategory => {
          const name = email.name.toLowerCase();
          const trigger = email.trigger_type;

          // Check triggers first (more reliable than name patterns)
          if (trigger.includes('payment')) return 'payment_reminders';
          if (trigger === 'on_invitation_send' || trigger === 'on_application_submit' || trigger === 'on_approval' || trigger === 'on_rejection' || trigger === 'on_waitlist') return 'application_updates';
          if (trigger === 'days_before_event' || trigger === 'on_event_date' || trigger === 'days_after_event') return 'event_countdown';

          // Then check name patterns
          if (name.includes('payment')) return 'payment_reminders';
          if (name.includes('application') || name.includes('approval') || name.includes('rejected') || name.includes('waitlist')) return 'application_updates';
          if (name.includes('days before') || name.includes('day of')) return 'event_countdown';
          if (name.includes('announcement') || name.includes('immediate')) return 'event_announcements';

          return 'event_announcements';
        };

        const emailCategory = email.email_template_item?.category || inferCategory();

        // Filter by "All Invitations" - show only application emails without specific category
        if (selectedCategoryId === 'all_invitations') {
          return !email.category_id && emailCategory === 'application_updates';
        }

        // Filter by "All Vendors" - show only announcement emails without specific category
        if (selectedCategoryId === 'all_vendors') {
          return !email.category_id && emailCategory !== 'application_updates';
        }

        // Filter by specific vendor category
        if (typeof selectedCategoryId === 'number') {
          // Include emails that have a matching category_id
          if (email.category_id && email.category_id === selectedCategoryId) {
            return true;
          }
          // For emails without a category_id (All Invitations / All Vendors)
          if (!email.category_id) {
            // Exclude "All Invitations" (application_updates) when filtering by specific category
            // because once someone has a vendor category, they're approved and won't receive application emails
            if (emailCategory === 'application_updates') {
              return false;
            }

            // Include "All Vendors" emails (announcements, event updates, etc.)
            return true;
          }
        }

        return false;
      });
    }

    // Search by name or subject
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(email =>
        email.name.toLowerCase().includes(query) ||
        email.subject_template.toLowerCase().includes(query)
      );
    }

    // If a column sort is active, use that
    if (sortColumn) {
      return [...result].sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        switch (sortColumn) {
          case 'name':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'subject':
            valA = a.subject_template.toLowerCase();
            valB = b.subject_template.toLowerCase();
            break;
          case 'scheduled_for':
            valA = a.scheduled_for ? new Date(a.scheduled_for).getTime() : 0;
            valB = b.scheduled_for ? new Date(b.scheduled_for).getTime() : 0;
            break;
          case 'email_type': {
            const toCat: Record<string, string> = {
              on_application_open: 'event_announcements', on_invitation_send: 'event_announcements',
              on_application_submit: 'application_updates', on_approval: 'application_updates',
              on_rejection: 'application_updates', on_waitlist: 'application_updates',
              on_payment_received: 'payment_reminders', days_before_payment_deadline: 'payment_reminders',
              on_payment_deadline: 'payment_reminders',
              days_before_event: 'event_countdown', on_event_date: 'event_countdown',
              days_after_event: 'event_updates', on_event_update: 'event_updates',
              on_event_cancel: 'event_updates', on_category_change: 'event_updates',
              on_bulletin_post: 'event_announcements',
            };
            valA = (a.email_template_item?.category ?? toCat[a.trigger_type] ?? 'event_announcements').toLowerCase();
            valB = (b.email_template_item?.category ?? toCat[b.trigger_type] ?? 'event_announcements').toLowerCase();
            break;
          }
          case 'category':
            valA = (a.category?.name ?? 'All').toLowerCase();
            valB = (b.category?.name ?? 'All').toLowerCase();
            break;
          case 'recipient_count':
            valA = a.recipient_count ?? 0;
            valB = b.recipient_count ?? 0;
            break;
          case 'undelivered_count':
            valA = a.undelivered_count ?? 0;
            valB = b.undelivered_count ?? 0;
            break;
          case 'unsubscribed_count':
            valA = a.unsubscribed_count ?? 0;
            valB = b.unsubscribed_count ?? 0;
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

    // Default: sort by trigger-type group, then by scheduled_for within each group
    const TRIGGER_GROUP_ORDER: Record<string, number> = {
      on_invitation_send: 1,
      on_application_open: 1,
      on_application_submit: 2,
      on_approval: 3,
      on_rejection: 3,
      on_waitlist: 4,
      days_before_payment_deadline: 5,
      on_payment_deadline: 5,
      on_payment_received: 6,
      days_before_event: 7,
      on_event_date: 8,
      days_after_event: 9,
      on_event_update: 10,
      on_event_cancel: 10,
      on_category_change: 10,
      on_bulletin_post: 10,
    };

    return [...result].sort((a, b) => {
      const groupA = TRIGGER_GROUP_ORDER[a.trigger_type] ?? 99;
      const groupB = TRIGGER_GROUP_ORDER[b.trigger_type] ?? 99;

      if (groupA !== groupB) return groupA - groupB;

      const dateA = a.scheduled_for ? new Date(a.scheduled_for).getTime() : 0;
      const dateB = b.scheduled_for ? new Date(b.scheduled_for).getTime() : 0;
      return dateA - dateB;
    });
  }, [emails, searchQuery, statusFilter, selectedCategoryId, sortColumn, sortDirection]);

  // Calculate statistics
  const stats = {
    total: emails.length,
    scheduled: emails.filter(e => e.status === 'scheduled').length,
    paused: emails.filter(e => e.status === 'paused').length,
    sent: emails.filter(e => e.status === 'sent').length,
    failed: emails.filter(e => e.status === 'failed').length,
  };

  // Show full-screen audit log overlay
  if (viewState.view === 'audit-log' && eventData) {
    return (
      <EmailAuditLogOverlay
        event={eventData}
        initialFilters={viewState.filters}
        onClose={() => setViewState({ view: 'table' })}
      />
    );
  }

  // Show full-screen sequence editor overlay
  if (viewState.view === 'sequence-editor') {
    return (
      <EmailSequenceEditorOverlay
        emails={emails}
        eventSlug={eventSlug}
        eventData={eventData}
        onBack={() => setViewState({ view: 'table' })}
        onEditEmail={(email) => setViewState({ view: 'email-editor', email, returnTo: 'sequence-editor' })}
        onPause={handlePause}
        onResume={handleResume}
        onSendNow={handleSendNow}
        onDelete={handleDelete}
        onCreateEmail={() => setViewState({ view: 'email-editor', email: null, returnTo: 'sequence-editor' })}
        onSaveAsTemplate={() => setIsSaveDialogOpen(true)}
      />
    );
  }

  // Show full-screen email editor (create or edit mode)
  if (viewState.view === 'email-editor') {
    const isCreateMode = viewState.email === null;
    return (
      <EmailEditorPage
        email={viewState.email}
        eventData={eventData}
        eventSlug={eventSlug}
        onBack={() => setViewState({ view: viewState.returnTo === 'sequence-editor' ? 'sequence-editor' : 'table' })}
        onSave={handleSaveEdit}
        onCreate={isCreateMode ? handleCreateEmail : undefined}
        mode={isCreateMode ? 'create' : 'edit'}
        categories={categories}
        isAdmin={isAdmin}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="p-3 md:p-4">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
          <p className="text-white/60">Loading email automation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Email Automation
            </h2>
            <p className="text-white/60">
              Manage automated emails for your event
            </p>
          </div>
          <div className="flex items-center gap-3">
            {emails.length > 0 && (
              <>
                <button
                  onClick={() => setViewState({ view: 'email-editor', email: null, returnTo: 'table' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Email</span>
                </button>
                <button
                  onClick={() => setViewState({ view: 'sequence-editor' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Sequence Editor</span>
                </button>
                <button
                  onClick={() => setViewState({ view: 'audit-log', filters: null })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                  <FileSearch className="w-4 h-4" />
                  <span className="hidden sm:inline">Audit Log</span>
                </button>
              </>
            )}
            <button
              onClick={() => loadEmails()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <label className="flex items-center gap-1.5 cursor-pointer" title="Auto-refresh every 30s">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-white/10 rounded-full peer-checked:bg-purple-600 transition-all"></div>
                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
              </div>
              <span className="text-[10px] text-white/50">Auto</span>
            </label>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-400 flex-1">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Scheduled Emails */}
      {emails.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-500/30 border border-white/10 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Scheduled Emails Yet
          </h3>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            Generate automated emails from the system template to keep your vendors informed throughout the event lifecycle.
          </p>
          <button
            onClick={handleGenerateEmails}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:from-purple-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Emails from Template
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/60" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterType)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer [&>option]:bg-gray-900 [&>option]:text-white"
              >
                {FILTER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                    {option.label}
                    {option.value !== 'all' && ` (${stats[option.value as keyof typeof stats] || 0})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all' || value === 'all_invitations' || value === 'all_vendors') {
                    setSelectedCategoryId(value);
                  } else {
                    setSelectedCategoryId(Number(value));
                  }
                }}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value="all" className="bg-gray-900 text-white">All Categories ({categories.length})</option>
                <option value="all_invitations" className="bg-gray-900 text-white italic text-white/80">All Invitations</option>
                <option value="all_vendors" className="bg-gray-900 text-white italic text-white/80">All Vendors</option>
                <optgroup label="Vendor Categories" className="bg-gray-900 text-white/60">
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="bg-gray-900 text-white">
                      {category.icon ? `${category.icon} ${category.name}` : category.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              Showing {filteredEmails.length} of {emails.length} emails
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Unified Email Table */}
          <EmailTable
            emails={filteredEmails}
            eventSlug={eventSlug}
            onEdit={(email) => setViewState({ view: 'email-editor', email, returnTo: 'table' })}
            onPause={handlePause}
            onResume={handleResume}
            onSendNow={handleSendNow}
            onRetryFailed={handleRetryFailed}
            onDelete={handleDelete}
            onViewAuditLog={(filters) => setViewState({ view: 'audit-log', filters })}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      )}

      {/* Save as Template Dialog */}
      <SaveAsTemplateDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        eventSlug={eventSlug}
        emailCount={emails.length}
        onSuccess={handleSaveAsTemplate}
      />

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Email Automation Tab"
        data={{
          event,
          eventSlug,
          emails,
          isLoading,
          error,
          successMessage,
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
