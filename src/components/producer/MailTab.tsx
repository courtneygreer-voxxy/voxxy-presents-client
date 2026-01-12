import { useState, useEffect } from 'react';
import { Mail, Calendar, Users, Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { scheduledEmailsApi, emailCampaignTemplatesApi } from '@/services/api';
import type { ScheduledEmail, EmailCampaignTemplate } from '@/types/email';

interface MailTabProps {
  eventSlug: string;
}

export default function MailTab({ eventSlug }: MailTabProps) {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [templates, setTemplates] = useState<EmailCampaignTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadEmailData();
  }, [eventSlug]);

  const loadEmailData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('='.repeat(80));
      console.log('📧 MAIL TAB - LOADING EMAIL DATA');
      console.log('='.repeat(80));
      console.log('Event Slug:', eventSlug);
      console.log('');

      // Fetch scheduled emails for this event
      console.log('🔄 Fetching scheduled emails...');
      const scheduledEmailsData = await scheduledEmailsApi.getByEvent(eventSlug);
      console.log(`✅ Fetched ${scheduledEmailsData.length} scheduled emails`);
      console.log('');

      // Fetch all email campaign templates
      console.log('🔄 Fetching email campaign templates...');
      const templatesData = await emailCampaignTemplatesApi.getAll();
      console.log(`✅ Fetched ${templatesData.length} email campaign templates`);
      console.log('');

      setEmails(scheduledEmailsData);
      setTemplates(templatesData);

      // Log detailed information to console
      console.log('📊 EMAIL CAMPAIGN TEMPLATES AVAILABLE:');
      console.log('-'.repeat(80));
      templatesData.forEach((template, index) => {
        console.log(`${index + 1}. ${template.name}`);
        console.log(`   Type: ${template.template_type} (${template.is_default ? 'Default' : 'Custom'})`);
        console.log(`   Description: ${template.description || 'N/A'}`);
        console.log(`   Email Count: ${template.email_count}`);
        console.log(`   Events Using: ${template.events_count}`);
        console.log(`   Created: ${new Date(template.created_at).toLocaleDateString()}`);
        console.log('');
      });

      console.log('📋 SCHEDULED EMAILS FOR THIS EVENT:');
      console.log('-'.repeat(80));

      if (scheduledEmailsData.length === 0) {
        console.log('⚠️  No emails configured for this event yet.');
        console.log('💡 Tip: Use "Generate Emails from Template" to create automated emails.');
      } else {
        scheduledEmailsData.forEach((email, index) => {
          console.log(`${index + 1}. ${email.name}`);
          console.log(`   Status: ${email.status}`);
          console.log(`   Trigger: ${email.trigger_type}${email.trigger_value ? ` (${email.trigger_value} days)` : ''}`);
          console.log(`   Scheduled For: ${email.scheduled_for ? new Date(email.scheduled_for).toLocaleString() : 'Not scheduled'}`);
          console.log(`   Recipients: ${email.recipient_count}`);
          console.log(`   Subject: ${email.subject_template}`);

          // Show first 100 characters of body
          const bodyPreview = email.body_template.replace(/<[^>]*>/g, '').substring(0, 100);
          console.log(`   Body Preview: ${bodyPreview}...`);

          if (email.sent_at) {
            console.log(`   Sent At: ${new Date(email.sent_at).toLocaleString()}`);
          }

          console.log('');
        });
      }

      console.log('='.repeat(80));
      console.log('📧 EMAIL DATA SUMMARY:');
      console.log(`   Total Templates Available: ${templatesData.length}`);
      console.log(`   Scheduled Emails for Event: ${scheduledEmailsData.length}`);
      console.log(`   Emails Sent: ${scheduledEmailsData.filter(e => e.status === 'sent').length}`);
      console.log(`   Emails Scheduled: ${scheduledEmailsData.filter(e => e.status === 'scheduled').length}`);
      console.log(`   Emails Paused: ${scheduledEmailsData.filter(e => e.status === 'paused').length}`);
      console.log('='.repeat(80));

    } catch (err: any) {
      console.error('❌ Failed to load email data:', err);
      setError(err.message || 'Failed to load email data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTrigger = (email: ScheduledEmail) => {
    const triggerLabels: Record<string, string> = {
      'days_before_event': 'Days Before Event',
      'days_after_event': 'Days After Event',
      'days_before_deadline': 'Days Before Deadline',
      'days_after_deadline': 'Days After Deadline',
      'on_application_open': 'When Applications Open',
      'on_application_submit': 'When Application Submitted',
      'on_approval': 'When Approved',
      'on_event_date': 'On Event Date',
      'days_before_payment_deadline': 'Days Before Payment Deadline',
      'on_payment_deadline': 'On Payment Deadline',
    };

    const label = triggerLabels[email.trigger_type] || email.trigger_type;
    if (email.trigger_value) {
      return `${label} (${email.trigger_value} days)`;
    }
    return label;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      scheduled: { label: 'Scheduled', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      paused: { label: 'Paused', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
      sent: { label: 'Sent', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
      failed: { label: 'Failed', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
    };

    const badge = badges[status] || { label: status, className: 'bg-white/10 text-white/70 border-white/20' };
    return badge;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-400 font-medium mb-1">Error Loading Emails</h3>
            <p className="text-red-400/80 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Email Automation</h2>
          <p className="text-white/60">Automated emails configured for this event</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-0.5">Total Emails</p>
            <p className="text-lg font-bold text-white">{emails.length}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-blue-400/70">Scheduled</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {emails.filter(e => e.status === 'scheduled').length}
          </p>
        </div>

        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-green-400" />
            <p className="text-xs text-green-400/70">Sent</p>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {emails.filter(e => e.status === 'sent').length}
          </p>
        </div>

        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-yellow-400/70">Paused</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {emails.filter(e => e.status === 'paused').length}
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-white/60" />
            <p className="text-xs text-white/50">Total Recipients</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {emails.reduce((sum, e) => sum + (e.recipient_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* Email List */}
      <div className="space-y-3">
        {emails.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">No Emails Configured</h3>
            <p className="text-white/60 mb-4">
              Generate automated emails from a template to start your email campaign
            </p>
          </div>
        ) : (
          emails.map((email) => {
            const isExpanded = expandedId === email.id;
            const statusBadge = getStatusBadge(email.status);

            return (
              <div
                key={email.id}
                className="bg-[#1e1536] rounded-xl border border-purple-500/20 overflow-hidden"
              >
                {/* Email Header (Always Visible) */}
                <div
                  className="p-5 cursor-pointer hover:bg-purple-500/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : email.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{email.name}</h3>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mb-2">{email.subject_template}</p>
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatTrigger(email)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {email.recipient_count} recipients
                        </span>
                        {email.scheduled_for && (
                          <span>
                            Scheduled: {new Date(email.scheduled_for).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-white/40 hover:text-white transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-purple-500/10 bg-[#0f0a1f] p-5 space-y-4">
                    <div>
                      <label className="block text-xs text-white/50 mb-1">EMAIL BODY</label>
                      <div
                        className="bg-[#1e1536] rounded-lg p-4 border border-white/10 text-sm text-white/70 max-h-64 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: email.body_template }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">TRIGGER TYPE</label>
                        <p className="text-white text-sm">{email.trigger_type}</p>
                      </div>
                      {email.trigger_value && (
                        <div>
                          <label className="block text-xs text-white/50 mb-1">TRIGGER VALUE</label>
                          <p className="text-white text-sm">{email.trigger_value} days</p>
                        </div>
                      )}
                      {email.sent_at && (
                        <div>
                          <label className="block text-xs text-white/50 mb-1">SENT AT</label>
                          <p className="text-white text-sm">
                            {new Date(email.sent_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {email.error_message && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-xs text-red-400/70 mb-1">ERROR MESSAGE</p>
                        <p className="text-red-400 text-sm">{email.error_message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Templates Info */}
      {templates.length > 0 && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <h3 className="text-white font-semibold mb-3">Available Email Templates</h3>
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div>
                  <p className="text-white text-sm font-medium">{template.name}</p>
                  <p className="text-white/50 text-xs">{template.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm">{template.email_count} emails</p>
                  <p className="text-white/50 text-xs">
                    {template.template_type === 'system' ? 'System' : 'Custom'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
