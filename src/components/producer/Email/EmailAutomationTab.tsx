import { useState, useEffect } from 'react';
import { RefreshCw, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { scheduledEmailsApi } from '@/services/api';
import type { ScheduledEmail } from '@/types/email';
import ScheduledEmailList from './ScheduledEmailList';
import SaveAsTemplateDialog from './SaveAsTemplateDialog';

interface EmailAutomationTabProps {
  eventSlug: string;
}

export default function EmailAutomationTab({ eventSlug }: EmailAutomationTabProps) {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load scheduled emails
  useEffect(() => {
    loadEmails();
  }, [eventSlug]);

  const loadEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await scheduledEmailsApi.getByEvent(eventSlug);
      setEmails(data);
    } catch (err: any) {
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

  const handleSaveAsTemplate = (templateId: number) => {
    showSuccess('Template saved successfully! You can now reuse it for other events.');
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

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

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/60 text-sm mb-1">Total Emails</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <p className="text-blue-400/80 text-sm mb-1">Scheduled</p>
            <p className="text-2xl font-bold text-blue-400">{stats.scheduled}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
            <p className="text-yellow-400/80 text-sm mb-1">Paused</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.paused}</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <p className="text-green-400/80 text-sm mb-1">Sent</p>
            <p className="text-2xl font-bold text-green-400">{stats.sent}</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
            <p className="text-red-400/80 text-sm mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
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

      {/* Scheduled Emails List */}
      <ScheduledEmailList
        emails={emails}
        onPause={handlePause}
        onResume={handleResume}
        onSendNow={handleSendNow}
        onDelete={handleDelete}
      />

      {/* Save as Template Dialog */}
      <SaveAsTemplateDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        eventSlug={eventSlug}
        emailCount={emails.length}
        onSuccess={handleSaveAsTemplate}
      />
    </div>
  );
}
