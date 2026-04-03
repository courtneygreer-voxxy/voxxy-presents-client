import { useState, useRef, useMemo } from 'react';
import { ArrowLeft, Mail, Edit2, Eye, MoreVertical, Play, Pause, Trash2, Save, Megaphone, FileText, CreditCard, Calendar, Settings2, Plus, Clock, Info } from 'lucide-react';
import type { ScheduledEmail } from '@/types/email';
import { getEmailTypeInfo } from '@/utils/emailTypeHelper';

interface EmailSequenceEditorOverlayProps {
  emails: ScheduledEmail[];
  eventSlug: string;
  eventData: any;
  onBack: () => void;
  onEditEmail: (email: ScheduledEmail) => void;
  onPause: (emailId: number) => Promise<void>;
  onResume: (emailId: number) => Promise<void>;
  onSendNow: (emailId: number) => Promise<void>;
  onDelete: (emailId: number) => Promise<void>;
  onCreateEmail: () => void;
  onSaveAsTemplate?: () => void;
}

// Category display order and labels
const SEQUENCE_CATEGORIES = [
  { key: 'event_announcements', label: 'Event Announcements', icon: Megaphone, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { key: 'application_updates', label: 'Application Updates', icon: FileText, color: 'text-pink-400', bg: 'bg-pink-500/20' },
  { key: 'payment_reminders', label: 'Payment Reminders', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { key: 'event_countdown', label: 'Event Countdown', icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/20' },
  { key: 'event_updates', label: 'Event Updates', icon: Settings2, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
] as const;

// Legacy category keys mapped to the 5 groups
const CATEGORY_MAP: Record<string, string> = {
  pre_application: 'event_announcements',
  application: 'application_updates',
  payment: 'payment_reminders',
  pre_event: 'event_countdown',
  event_day: 'event_countdown',
  post_event: 'event_updates',
  system: 'event_updates',
  event_announcements: 'event_announcements',
  application_updates: 'application_updates',
  payment_reminders: 'payment_reminders',
  event_countdown: 'event_countdown',
  event_updates: 'event_updates',
};

// Primary: map trigger_type to category (most reliable)
const TRIGGER_TO_CATEGORY: Record<string, string> = {
  on_application_open: 'event_announcements',
  on_invitation_send: 'event_announcements',
  on_application_submit: 'application_updates',
  on_approval: 'application_updates',
  on_rejection: 'application_updates',
  on_waitlist: 'application_updates',
  on_payment_received: 'payment_reminders',
  days_before_payment_deadline: 'payment_reminders',
  on_payment_deadline: 'payment_reminders',
  days_before_event: 'event_countdown',
  on_event_date: 'event_countdown',
  days_after_event: 'event_updates',
  on_event_update: 'event_updates',
  on_event_cancel: 'event_updates',
  on_category_change: 'event_updates',
  on_bulletin_post: 'event_announcements',
};

/** Infer category from trigger_type first, then fall back to name matching */
function inferCategory(email: ScheduledEmail): string {
  // Trigger-type is the most reliable classifier
  if (TRIGGER_TO_CATEGORY[email.trigger_type]) {
    return TRIGGER_TO_CATEGORY[email.trigger_type];
  }

  // Fallback: name-based inference
  const name = email.name.toLowerCase();
  if (name.includes('payment')) return 'payment_reminders';
  if (name.includes('application') || name.includes('approval') || name.includes('rejected') || name.includes('waitlist')) return 'application_updates';
  if (name.includes('countdown') || name.includes('days before')) return 'event_countdown';
  if (name.includes('announcement') || name.includes('invitation')) return 'event_announcements';

  return 'event_announcements';
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'sent':
      return { label: 'Sent', className: 'bg-green-500/20 text-green-400 border-green-500/30' };
    case 'scheduled':
      return { label: 'Scheduled', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    case 'paused':
      return { label: 'Paused', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    case 'active':
      return { label: 'Active', className: 'bg-green-500/20 text-green-400 border-green-500/30' };
    case 'failed':
      return { label: 'Failed', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    default:
      return { label: status, className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  }
}

// Check if email is a custom countdown (value-based trigger)
function isCustomCountdown(triggerType: string): boolean {
  const customReminderTriggers = [
    'days_before_deadline',
    'days_after_deadline',
    'days_before_payment_deadline',
    'days_after_payment_deadline',
    'days_before_event',
    'days_after_event'
  ];
  return customReminderTriggers.includes(triggerType);
}

// Inline action menu for each row
function SequenceRowMenu({
  email,
  onPause,
  onResume,
  onSendNow,
  onDelete,
}: {
  email: ScheduledEmail;
  onPause: (id: number) => Promise<void>;
  onResume: (id: number) => Promise<void>;
  onSendNow: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const isSent = email.status === 'sent';
  const isScheduled = email.status === 'scheduled';
  const isPaused = email.status === 'paused';
  const isSystemEmail = !isCustomCountdown(email.trigger_type);

  // No actions for sent emails
  if (isSent) return null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10 transition-all"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && btnRef.current && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[101] bg-gray-900 border border-white/20 rounded-lg shadow-xl py-1 min-w-[140px]"
            style={{
              right: `${window.innerWidth - btnRef.current.getBoundingClientRect().right}px`,
              top: `${btnRef.current.getBoundingClientRect().bottom + 4}px`,
            }}
          >
            {(isScheduled || isPaused) && (
              <button
                onClick={() => { setOpen(false); onSendNow(email.id); }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" /> Send Now
              </button>
            )}
            {isScheduled && (
              <button
                onClick={() => { setOpen(false); onPause(email.id); }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            )}
            {isPaused && (
              <button
                onClick={() => { setOpen(false); onResume(email.id); }}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" /> Resume
              </button>
            )}
            {!isSystemEmail && (
              <button
                onClick={() => {
                  setOpen(false);
                  if (confirm('Delete this email? This cannot be undone.')) {
                    onDelete(email.id);
                  }
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/10"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function EmailSequenceEditorOverlay({
  emails,
  eventSlug,
  eventData,
  onBack,
  onEditEmail,
  onPause,
  onResume,
  onSendNow,
  onDelete,
  onCreateEmail,
  onSaveAsTemplate,
}: EmailSequenceEditorOverlayProps) {
  const [selectedEmail, setSelectedEmail] = useState<ScheduledEmail | null>(emails[0] || null);

  // Group emails by category
  const groupedEmails = useMemo(() => {
    const groups: Record<string, ScheduledEmail[]> = {};

    for (const email of emails) {
      const rawCategory = email.email_template_item?.category || inferCategory(email);
      const normalizedCategory = CATEGORY_MAP[rawCategory] || 'event_announcements';
      if (!groups[normalizedCategory]) groups[normalizedCategory] = [];
      groups[normalizedCategory].push(email);
    }

    // Sort emails within each group by position, then by name
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => {
        const posA = a.email_template_item?.position ?? 999;
        const posB = b.email_template_item?.position ?? 999;
        if (posA !== posB) return posA - posB;
        return a.name.localeCompare(b.name);
      });
    }

    return groups;
  }, [emails]);

  // Category labels
  const categoryLabels: Record<string, string> = {
    event_announcements: 'Event Announcements',
    application_updates: 'Application Updates',
    payment_reminders: 'Payment Reminders',
    event_countdown: 'Event Countdown',
    event_updates: 'Event Updates',
  };

  const isSent = selectedEmail?.status === 'sent';
  const isCustomEmail = selectedEmail ? isCustomCountdown(selectedEmail.trigger_type) : false;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 h-full">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Email Sequence Editor
              </h1>
              {eventData?.title && (
                <p className="text-white/60 text-xs mt-0.5">{eventData.title}</p>
              )}
            </div>
            <button
              onClick={onCreateEmail}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium hover:from-green-700 hover:to-emerald-600 transition-all flex items-center gap-2"
              title="Add a custom reminder email (days before/after)"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </button>
            {onSaveAsTemplate && (
              <button
                onClick={onSaveAsTemplate}
                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Template
              </button>
            )}
          </div>
        </div>

        {/* Main Content - Sidebar + Preview */}
        {emails.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-16 bg-white/5 rounded-lg border border-white/10 w-full max-w-2xl">
              <Mail className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 mb-4">No emails in sequence</p>
              <button
                onClick={onCreateEmail}
                className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 hover:bg-purple-500/30 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Email
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
            {/* Left Sidebar - Email Navigation */}
            <div className="w-80 flex-shrink-0 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03]">
              <div className="p-3 border-b border-white/10 sticky top-0 bg-black/40 backdrop-blur-sm z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                    {emails.length} Email{emails.length !== 1 ? 's' : ''}
                  </h3>
                  <button
                    onClick={onCreateEmail}
                    className="p-1 rounded text-purple-400 hover:bg-purple-500/20 transition-all"
                    title="Add reminder email"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Categorized Email List */}
              <div className="p-2 space-y-3">
                {Object.entries(groupedEmails).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-2 py-1">
                      <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                        {categoryLabels[category] || category}
                      </h4>
                    </div>
                    <div className="space-y-0.5">
                      {items.map((email) => {
                        const isCustom = isCustomCountdown(email.trigger_type);
                        const status = getStatusBadge(email.status);
                        return (
                          <button
                            key={email.id}
                            onClick={() => setSelectedEmail(email)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                              selectedEmail?.id === email.id
                                ? 'bg-purple-500/20 border border-purple-500/40'
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="text-sm text-white font-medium truncate">
                                {email.name}
                              </div>
                              {isCustom ? (
                                <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 uppercase tracking-wide">
                                  Custom
                                </span>
                              ) : (
                                <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 uppercase tracking-wide">
                                  System
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getEmailTypeInfo(email.trigger_type).color}`}>
                                {getEmailTypeInfo(email.trigger_type).label}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${status.className}`}>
                                {status.label}
                              </span>
                              {email.category?.name && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-white/70 border border-white/20">
                                  {email.category.name}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Preview Pane */}
            <div className="flex-1 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] min-w-0">
              {selectedEmail ? (
                <div>
                  {/* Preview Header */}
                  <div className="p-4 border-b border-white/10 bg-black/20 sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <h3 className="text-base font-semibold text-white truncate">
                            {selectedEmail.name}
                          </h3>
                          {isCustomEmail ? (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 uppercase tracking-wide">
                              Custom Reminder
                            </span>
                          ) : (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 uppercase tracking-wide">
                              System Email
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getEmailTypeInfo(selectedEmail.trigger_type).color}`}>
                            {getEmailTypeInfo(selectedEmail.trigger_type).label}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadge(selectedEmail.status).className}`}>
                            {getStatusBadge(selectedEmail.status).label}
                          </span>
                          {selectedEmail.category?.name && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/70 border border-white/20">
                              Audience: {selectedEmail.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditEmail(selectedEmail)}
                          className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all text-sm flex items-center gap-1.5"
                        >
                          {isSent ? <Eye className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                          {isSent ? 'View' : 'Edit'}
                        </button>
                        {!isSent && (
                          <SequenceRowMenu
                            email={selectedEmail}
                            onPause={onPause}
                            onResume={onResume}
                            onSendNow={onSendNow}
                            onDelete={onDelete}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* System Email or Custom Reminder Info Banner */}
                  {isCustomEmail ? (
                    // Custom Reminder Info
                    <div className="mx-6 mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-purple-300 mb-1">
                            Custom Reminder
                          </h4>
                          <p className="text-xs text-purple-200/90 leading-relaxed">
                            This is a custom time-based reminder that was added to this event's sequence.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // System Email Info
                    <div className="mx-6 mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-emerald-300 mb-1">
                            System Email
                          </h4>
                          <p className="text-xs text-emerald-200/90 leading-relaxed">
                            This is a core system email that's automatically triggered by vendor actions or event milestones.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Preview Content */}
                  <div className="p-6">
                    {/* Subject */}
                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                        Subject
                      </label>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-sm text-white font-medium">
                          {selectedEmail.subject_template || '(No subject)'}
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div>
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                        Email Body
                      </label>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div
                          className="prose prose-sm prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedEmail.body_template || '<p class="text-white/40">(No content)</p>' }}
                        />
                      </div>
                    </div>

                    {/* Email Stats (if sent/active) */}
                    {(selectedEmail.status === 'sent' || selectedEmail.status === 'active') && (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">
                          Delivery Stats
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Recipients</div>
                            <div className="text-lg font-bold text-white">{selectedEmail.recipient_count || 0}</div>
                          </div>
                          {selectedEmail.delivered_count !== undefined && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <div className="text-[10px] text-green-400/80 uppercase tracking-wide mb-1">Delivered</div>
                              <div className="text-lg font-bold text-green-400">{selectedEmail.delivered_count}</div>
                            </div>
                          )}
                          {selectedEmail.undelivered_count !== undefined && selectedEmail.undelivered_count > 0 && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                              <div className="text-[10px] text-red-400/80 uppercase tracking-wide mb-1">Undelivered</div>
                              <div className="text-lg font-bold text-red-400">{selectedEmail.undelivered_count}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Trigger Details */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">
                        Trigger Settings
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Type</div>
                          <div className="text-sm text-white">{selectedEmail.trigger_type.replace(/_/g, ' ')}</div>
                        </div>
                        {selectedEmail.trigger_value !== null && selectedEmail.trigger_value > 0 && (
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Days</div>
                            <div className="text-sm text-white">{selectedEmail.trigger_value}</div>
                          </div>
                        )}
                        {selectedEmail.scheduled_for && (
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Scheduled For</div>
                            <div className="text-sm text-white">
                              {new Date(selectedEmail.scheduled_for).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <Mail className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">Select an email to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
