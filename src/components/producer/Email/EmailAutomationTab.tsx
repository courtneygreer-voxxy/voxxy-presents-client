import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Save, AlertCircle, CheckCircle, Loader2, Sparkles, Search, Filter } from 'lucide-react';
import { scheduledEmailsApi, eventInvitationsApi, eventsApi } from '@/services/api';
import type { ScheduledEmail, UpdateEmailRequest, ScheduledEmailStatus } from '@/types/email';
import EmailTable from './EmailTable';
import SaveAsTemplateDialog from './SaveAsTemplateDialog';
import EmailPreviewModal from './EmailPreviewModal';
import EditScheduledEmailModal from './EditScheduledEmailModal';

interface EmailAutomationTabProps {
  eventSlug: string;
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

export default function EmailAutomationTab({ eventSlug }: EmailAutomationTabProps) {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewEmail, setPreviewEmail] = useState<ScheduledEmail | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editEmail, setEditEmail] = useState<ScheduledEmail | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [eventData, setEventData] = useState<any | null>(null); // Store event data for preview calculations

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');

  // Load scheduled emails
  useEffect(() => {
    loadEmails();
  }, [eventSlug]);

  const loadEmails = async () => {
    setIsLoading(true);
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

      // Fetch invitations (non-blocking)
      const invitationsData = await eventInvitationsApi.getByEvent(eventSlug).catch((err) => {
        console.error('❌ Failed to fetch invitations:', err.message);
        console.error('   Full error:', err);
        return { invitations: [], meta: { total_count: 0, sent_count: 0, pending_count: 0, viewed_count: 0, accepted_count: 0, declined_count: 0, expired_count: 0 } };
      });

      console.log('📨 Invitations API Response:', {
        total_count: invitationsData.meta.total_count,
        sent_count: invitationsData.meta.sent_count,
        viewed_count: invitationsData.meta.viewed_count,
        invitations_with_sent_at: invitationsData.invitations.filter((inv: any) => inv.sent_at).length
      });

      // Create virtual "Event Announcement (Invitations Sent)" email if invitations exist
      const allEmails: ScheduledEmail[] = [...scheduledEmailsData];

      if (invitationsData.meta.sent_count > 0) {
        console.log('🎯 Creating virtual invitation email (sent_count:', invitationsData.meta.sent_count, ')');

        // Find the earliest sent invitation to use as the sent date
        const sentInvitations = invitationsData.invitations.filter((inv: any) => inv.sent_at);
        console.log('   Found', sentInvitations.length, 'invitations with sent_at timestamp');

        const earliestSentDate: string = sentInvitations.length > 0
          ? (sentInvitations.reduce((earliest: any, inv: any) => {
              return new Date(inv.sent_at) < new Date(earliest.sent_at) ? inv : earliest;
            }).sent_at as string)
          : new Date().toISOString();

        console.log('   Using earliest sent date:', earliestSentDate);

        // Create virtual invitation announcement email with delivery stats
        const deliveryStats = (invitationsData.meta as any).delivery_stats || {};
        const invitationEmail: ScheduledEmail = {
          id: -1, // Negative ID to avoid conflicts
          event_id: -1,
          email_campaign_template_id: null,
          email_template_item_id: null,
          name: 'Event Announcement (Invitations Sent)',
          subject_template: 'You\'re Invited: {{event_title}} - Apply Now!',
          body_template: '',
          trigger_type: 'on_application_open',
          trigger_value: 0,
          trigger_time: null,
          scheduled_for: earliestSentDate,
          filter_criteria: {},
          status: 'sent',
          sent_at: earliestSentDate,
          recipient_count: invitationsData.meta.sent_count,
          // Add delivery tracking stats from API
          undelivered_count: deliveryStats.undelivered || 0,
          unsubscribed_count: deliveryStats.unsubscribed || 0,
          delivered_count: deliveryStats.delivered || 0,
          delivery_counts: {
            total_sent: deliveryStats.total_sent || invitationsData.meta.sent_count,
            delivered: deliveryStats.delivered || 0,
            bounced: deliveryStats.bounced || 0,
            dropped: deliveryStats.dropped || 0,
            unsubscribed: deliveryStats.unsubscribed || 0,
            pending: deliveryStats.pending || 0
          },
          error_message: null,
          created_at: earliestSentDate,
          updated_at: earliestSentDate,
          isInvitationAnnouncement: true // Flag for special handling
        };

        // Add invitation email at the beginning
        allEmails.unshift(invitationEmail);
        console.log('✅ Added invitation announcement email to position 0');
        console.log('   Virtual email object:', {
          name: invitationEmail.name,
          status: invitationEmail.status,
          recipient_count: invitationEmail.recipient_count,
          scheduled_for: invitationEmail.scheduled_for,
          isInvitationAnnouncement: invitationEmail.isInvitationAnnouncement
        });
      } else {
        console.log('ℹ️  No sent invitations found (sent_count: 0), skipping virtual email creation');
      }

      console.log('📋 Total emails to display:', allEmails.length);
      console.log('   - Scheduled emails from API:', scheduledEmailsData.length);
      console.log('   - Virtual invitation email:', allEmails.some(e => e.isInvitationAnnouncement) ? 'YES' : 'NO');

      setEmails(allEmails);
    } catch (err: any) {
      console.error('❌ Failed to load emails:', err);
      setError(err.message || 'Failed to load scheduled emails');
    } finally {
      setIsLoading(false);
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

  const handlePreview = (email: ScheduledEmail) => {
    setPreviewEmail(email);
    setIsPreviewOpen(true);
  };

  const handleEdit = (email: ScheduledEmail) => {
    // Don't allow editing invitation announcements (virtual emails)
    if (email.isInvitationAnnouncement) {
      setError('Invitation emails cannot be edited. They are sent immediately when you create invitations.');
      return;
    }

    setEditEmail(email);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (emailId: number, data: UpdateEmailRequest) => {
    const updated = await scheduledEmailsApi.update(eventSlug, emailId, data);
    console.log('📧 Updated email received from server:', updated);
    console.log('   New scheduled_for:', updated.scheduled_for);

    // Close modal first
    setIsEditOpen(false);

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

    // Search by name or subject
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(email =>
        email.name.toLowerCase().includes(query) ||
        email.subject_template.toLowerCase().includes(query)
      );
    }

    // Sort by scheduled_for date (ascending)
    return result.sort((a, b) => {
      const dateA = a.scheduled_for ? new Date(a.scheduled_for).getTime() : 0;
      const dateB = b.scheduled_for ? new Date(b.scheduled_for).getTime() : 0;
      return dateA - dateB;
    });
  }, [emails, searchQuery, statusFilter]);

  // Calculate statistics
  const stats = {
    total: emails.length,
    scheduled: emails.filter(e => e.status === 'scheduled').length,
    paused: emails.filter(e => e.status === 'paused').length,
    sent: emails.filter(e => e.status === 'sent').length,
    failed: emails.filter(e => e.status === 'failed').length,
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
          <p className="text-white/60">Loading email automation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
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
              <button
                onClick={() => setIsSaveDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save as Template</span>
              </button>
            )}
            <button
              onClick={loadEmails}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
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
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
              >
                {FILTER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                    {option.value !== 'all' && ` (${stats[option.value as keyof typeof stats] || 0})`}
                  </option>
                ))}
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

          {/* Email Table */}
          <EmailTable
            emails={filteredEmails}
            onEdit={handleEdit}
            onPreview={handlePreview}
            onPause={handlePause}
            onResume={handleResume}
            onSendNow={handleSendNow}
            onDelete={handleDelete}
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

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        email={previewEmail}
        eventSlug={eventSlug}
      />

      {/* Edit Email Modal */}
      <EditScheduledEmailModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        email={editEmail}
        eventData={eventData}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
