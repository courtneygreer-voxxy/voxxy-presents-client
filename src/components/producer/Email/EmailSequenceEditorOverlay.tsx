import { useState, useRef, useMemo } from 'react';
import { ArrowLeft, Mail, Edit2, Eye, MoreVertical, Play, Pause, Trash2, Megaphone, FileText, CreditCard, Calendar, Settings2, Plus, HelpCircle, Send, Loader2, X } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import type { ScheduledEmail } from '@/types/email';
import { getEmailTypeInfo } from '@/utils/emailTypeHelper';
import { scheduledEmailsApi } from '@/services/api';
import { logger } from '@/utils/logger';

interface EmailSequenceEditorOverlayProps {
  emails: ScheduledEmail[];
  eventSlug: string;
  eventData: any;
  onBack: () => void;
  onEditEmail: (email: ScheduledEmail) => void;
  onPause: (emailId: number) => Promise<void>;
  onResume: (emailId: number) => Promise<void>;
  onSendNow?: (emailId: number) => Promise<void>;
  onDelete: (emailId: number) => Promise<void>;
  onCreateEmail: (categoryId: number | null) => void;
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
      return { label: 'Sent', variant: 'tintGreen' as BadgeVariant };
    case 'scheduled':
      return { label: 'Scheduled', variant: 'tintBlue' as BadgeVariant };
    case 'paused':
      return { label: 'Paused', variant: 'tintYellow' as BadgeVariant };
    case 'active':
      return { label: 'Active', variant: 'tintGreen' as BadgeVariant };
    case 'failed':
      return { label: 'Failed', variant: 'tintRed' as BadgeVariant };
    case 'cancelled':
      return { label: 'Cancelled', variant: 'tintMuted' as BadgeVariant };
    default:
      return { label: status, variant: 'tintMuted' as BadgeVariant };
  }
}

// Check if email is a custom countdown (value-based trigger)
// These are time-based reminders that can be edited/deleted (not core system emails)
function isCustomCountdown(triggerType: string): boolean {
  const customReminderTriggers = [
    'days_before_deadline',
    'days_after_deadline',
    'days_before_payment_deadline',
    'on_payment_deadline',  // Time-based, not event-triggered
    'days_after_payment_deadline',
    'days_before_event',
    'on_event_date',  // Time-based, not event-triggered
    'days_after_event'
  ];
  return customReminderTriggers.includes(triggerType);
}

/** Get audience label for an email (All Invitations, All Vendors, or specific category) */
function getAudienceLabel(email: ScheduledEmail): string {
  // If email has a specific category, show it
  if (email.category?.name) {
    return email.category.name;
  }

  // No category - determine if it's "All Invitations" or "All Vendors"
  const emailCategory = inferCategory(email);

  // Application updates (approval, rejection, etc.) go to "All Invitations"
  if (emailCategory === 'application_updates') {
    return 'All Invitations';
  }

  // Everything else without a category goes to "All Vendors"
  return 'All Vendors';
}

// Inline action menu for each row
function SequenceRowMenu({
  email,
  onPause,
  onResume,
  onSendNow,
}: {
  email: ScheduledEmail;
  onPause: (id: number) => Promise<void>;
  onResume: (id: number) => Promise<void>;
  onSendNow?: (id: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const isSent = email.status === 'sent';
  const isScheduled = email.status === 'scheduled';
  const isPaused = email.status === 'paused';

  // No actions for sent emails
  if (isSent) return null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded text-foreground/50 hover:text-foreground hover:bg-background/10 transition-all"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && btnRef.current && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[101] bg-muted border border-border rounded-lg shadow-xl py-1 min-w-[140px]"
            style={{
              right: `${window.innerWidth - btnRef.current.getBoundingClientRect().right}px`,
              top: `${btnRef.current.getBoundingClientRect().bottom + 4}px`,
            }}
          >
            {(isScheduled || isPaused) && onSendNow && (
              <button
                onClick={() => { setOpen(false); onSendNow(email.id); }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background/10 flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" /> Send Now
              </button>
            )}
            {isScheduled && (
              <button
                onClick={() => { setOpen(false); onPause(email.id); }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background/10 flex items-center gap-2"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            )}
            {isPaused && (
              <button
                onClick={() => { setOpen(false); onResume(email.id); }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background/10 flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" /> Resume
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
}: EmailSequenceEditorOverlayProps) {
  const [selectedEmail, setSelectedEmail] = useState<ScheduledEmail | null>(emails[0] || null);

  // Test email dialog state
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailError, setTestEmailError] = useState<string | null>(null);
  const [testEmailSuccess, setTestEmailSuccess] = useState<string | null>(null);

  // Handler for sending test email
  const handleSendTest = async () => {
    if (!selectedEmail || !testEmailAddress) return;

    setIsSendingTest(true);
    setTestEmailError(null);

    try {
      const result = await scheduledEmailsApi.sendTest(eventSlug, selectedEmail.id, testEmailAddress);
      setTestEmailSuccess(`Test email sent to ${result.recipient}`);
      setTimeout(() => setTestEmailSuccess(null), 5000);
      setShowTestEmailDialog(false);
      setTestEmailAddress('');
    } catch (error: any) {
      logger.error('Failed to send test email', { eventSlug, emailId: selectedEmail.id, error });
      setTestEmailError(error?.message || 'Failed to send test email');
      setTimeout(() => setTestEmailError(null), 5000);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Group emails by system vs reminders
  const groupedEmails = useMemo(() => {
    const groups: Record<'system' | 'reminders', ScheduledEmail[]> = {
      system: [],
      reminders: [],
    };

    for (const email of emails) {
      const isReminder = isCustomCountdown(email.trigger_type);
      if (isReminder) {
        groups.reminders.push(email);
      } else {
        groups.system.push(email);
      }
    }

    // Sort emails within each group by position, then by name
    for (const key of Object.keys(groups) as Array<'system' | 'reminders'>) {
      groups[key].sort((a, b) => {
        const posA = a.email_template_item?.position ?? 999;
        const posB = b.email_template_item?.position ?? 999;
        if (posA !== posB) return posA - posB;
        return a.name.localeCompare(b.name);
      });
    }

    return groups;
  }, [emails]);

  // Group labels
  const groupLabels: Record<'system' | 'reminders', string> = {
    system: 'System',
    reminders: 'Reminders',
  };

  const isSent = selectedEmail?.status === 'sent';
  const isCustomEmail = selectedEmail ? isCustomCountdown(selectedEmail.trigger_type) : false;

  return (
    <div className="fixed inset-0 voxxy-gradient-editor z-50 flex flex-col">
      {/* Header — semantic surface in light; dark bar only in dark theme */}
      <div className="voxxy-nav-surface border-b border-border sticky top-0 z-10 shadow-sm dark:shadow-lg">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-1.5 text-xs text-foreground hover:bg-foreground/5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Mail
              </Button>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 shrink-0 text-purple-700 dark:text-purple-400" />
                <div>
                  <h1 className="text-base font-semibold text-foreground">Email Sequence Editor</h1>
                  {eventData?.title && (
                    <p className="text-xs text-muted-foreground">{eventData.title}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              {/* TEMPORARILY HIDDEN - Will be re-enabled later */}
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateEmail(selectedEmail?.category_id || null)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Reminder
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Sidebar + Preview */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-6 py-4">
          {emails.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-16 bg-background/5 rounded-lg border border-border w-full max-w-2xl">
                <Mail className="w-12 h-12 text-foreground/40 mx-auto mb-3" />
                <p className="text-foreground/60 mb-4">No emails in sequence</p>
                {/* TEMPORARILY HIDDEN - Will be re-enabled later */}
                {/* <button
                  onClick={() => onCreateEmail(null)}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-violet-950 dark:text-purple-400 hover:bg-purple-500/30 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add First Email
                </button> */}
              </div>
            </div>
          ) : (
            <div className="h-full flex gap-4 min-h-0 overflow-hidden">
            {/* Left Sidebar - Email Navigation */}
            <div className="w-80 flex-shrink-0 overflow-y-auto rounded-lg border border-border bg-background/[0.03]">
              <div className="sticky top-0 z-10 border-b border-border bg-muted/90 p-3 backdrop-blur-sm dark:bg-black/40">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                    {emails.length} Email{emails.length !== 1 ? 's' : ''}
                  </h3>
                  {/* TEMPORARILY HIDDEN - Will be re-enabled later */}
                  {/* <button
                    onClick={() => onCreateEmail(selectedEmail?.category_id || null)}
                    className="p-1 rounded text-purple-400 hover:bg-purple-500/20 transition-all"
                    title="Add reminder email"
                  >
                    <Plus className="w-4 h-4" />
                  </button> */}
                </div>
              </div>

              {/* Grouped Email List - System then Reminders */}
              <div className="p-2 space-y-3">
                {(['system', 'reminders'] as const).map((groupKey) => {
                  const items = groupedEmails[groupKey];
                  if (items.length === 0) return null;

                  return (
                    <div key={groupKey}>
                      <div className="px-2 py-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {groupLabels[groupKey]}
                        </h4>
                      </div>
                      <div className="space-y-0.5">
                        {items.map((email) => {
                          const isCustom = isCustomCountdown(email.trigger_type);
                          const emailStatusBadge = getStatusBadge(email.status);
                          return (
                            <button
                              key={email.id}
                              onClick={() => setSelectedEmail(email)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                                selectedEmail?.id === email.id
                                  ? 'bg-purple-500/20 border border-purple-500/40'
                                  : 'hover:bg-background/5 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="text-sm text-foreground font-medium truncate">
                                  {email.name}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getEmailTypeInfo(email.trigger_type).color}`}>
                                  {getEmailTypeInfo(email.trigger_type).label}
                                </span>
                                <Badge variant={emailStatusBadge.variant} className="rounded px-1.5 py-0.5 text-[9px] font-medium">
                                  {emailStatusBadge.label}
                                </Badge>
                                <Badge variant="tintBlueSoft" className="rounded px-1.5 py-0.5 text-[9px] font-medium">
                                  {getAudienceLabel(email)}
                                </Badge>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Preview Pane */}
            <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-background/[0.03] min-w-0">
              {selectedEmail ? (
                <div>
                  {/* Preview Header */}
                  <div className="sticky top-0 z-10 border-b border-border bg-muted/70 p-4 backdrop-blur-sm dark:bg-black/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 shrink-0 text-purple-700 dark:text-purple-400" />
                          <h3 className="text-base font-semibold text-foreground truncate">
                            {selectedEmail.name}
                          </h3>
                          {isCustomEmail ? (
                            <div className="flex items-center gap-1">
                              <Badge variant="tintPurple" className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                Reminder
                              </Badge>
                              <Tooltip.Provider delayDuration={200}>
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <button
                                      type="button"
                                      className="text-purple-700 transition-colors hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200"
                                    >
                                      <HelpCircle className="h-3.5 w-3.5" />
                                    </button>
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      className="bg-muted text-foreground text-xs px-3 py-2 rounded-lg border border-purple-400/30 shadow-xl max-w-xs z-50"
                                      sideOffset={5}
                                    >
                                      This is a time-based reminder that was added to this event's sequence.
                                      <Tooltip.Arrow className="fill-gray-900" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Badge variant="tintGreen" className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                System
                              </Badge>
                              <Tooltip.Provider delayDuration={200}>
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <button
                                      type="button"
                                      className="text-emerald-800 transition-colors hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-200"
                                    >
                                      <HelpCircle className="h-3.5 w-3.5" />
                                    </button>
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      className="bg-muted text-foreground text-xs px-3 py-2 rounded-lg border border-emerald-400/30 shadow-xl max-w-xs z-50"
                                      sideOffset={5}
                                    >
                                      This is a core system email that's automatically triggered by vendor actions or event milestones.
                                      <Tooltip.Arrow className="fill-gray-900" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getEmailTypeInfo(selectedEmail.trigger_type).color}`}>
                            {getEmailTypeInfo(selectedEmail.trigger_type).label}
                          </span>
                          <Badge variant={getStatusBadge(selectedEmail.status).variant} className="rounded px-2 py-0.5 text-[10px] font-medium">
                            {getStatusBadge(selectedEmail.status).label}
                          </Badge>
                          <Badge variant="tintBlueSoft" className="rounded px-2 py-0.5 text-[10px] font-medium">
                            Audience: {getAudienceLabel(selectedEmail)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowTestEmailDialog(true)}
                          className="px-3 py-1.5 rounded-lg border border-green-500/40 bg-green-500/20 text-emerald-900 dark:text-green-300 hover:bg-green-500/30 transition-all text-sm flex items-center gap-1.5"
                          title="Send test email"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send Test
                        </button>
                        <button
                          onClick={() => onEditEmail(selectedEmail)}
                          className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/20 text-violet-950 dark:text-purple-300 hover:bg-purple-500/30 transition-all text-sm flex items-center gap-1.5"
                        >
                          {isSent ? <Eye className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                          {isSent ? 'View' : 'Edit'}
                        </button>
                        {!isSent && isCustomCountdown(selectedEmail.trigger_type) && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this email? This cannot be undone.')) {
                                onDelete(selectedEmail.id);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/20 text-red-950 dark:text-red-300 hover:bg-red-500/30 transition-all text-sm flex items-center gap-1.5"
                            title="Delete email"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}
                        {!isSent && (
                          <SequenceRowMenu
                            email={selectedEmail}
                            onPause={onPause}
                            onResume={onResume}
                            onSendNow={onSendNow}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email Preview Content */}
                  <div className="p-6">
                    {/* Subject */}
                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-2">
                        Subject
                      </label>
                      <div className="p-3 rounded-lg bg-background/5 border border-border">
                        <p className="text-sm text-foreground font-medium">
                          {selectedEmail.subject_template || '(No subject)'}
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-2">
                        Email Body
                      </label>
                      <div className="p-4 rounded-lg bg-background/5 border border-border">
                        <div
                          className="prose prose-sm prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedEmail.body_template || '<p class="text-foreground/40">(No content)</p>' }}
                        />
                      </div>
                    </div>

                    {/* Email Stats (if sent/active) */}
                    {(selectedEmail.status === 'sent' || selectedEmail.status === 'active') && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-3">
                          Delivery Stats
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg bg-background/5 border border-border">
                            <div className="text-[10px] text-foreground/40 uppercase tracking-wide mb-1">Recipients</div>
                            <div className="text-lg font-bold text-foreground">{selectedEmail.recipient_count || 0}</div>
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
                    <div className="mt-6 pt-6 border-t border-border">
                      <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-3">
                        Trigger Settings
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-background/5 border border-border">
                          <div className="text-[10px] text-foreground/40 uppercase tracking-wide mb-1">Type</div>
                          <div className="text-sm text-foreground">{selectedEmail.trigger_type.replace(/_/g, ' ')}</div>
                        </div>
                        {selectedEmail.trigger_value !== null && selectedEmail.trigger_value > 0 && (
                          <div className="p-3 rounded-lg bg-background/5 border border-border">
                            <div className="text-[10px] text-foreground/40 uppercase tracking-wide mb-1">Days</div>
                            <div className="text-sm text-foreground">{selectedEmail.trigger_value}</div>
                          </div>
                        )}
                        {selectedEmail.scheduled_for && (
                          <div className="p-3 rounded-lg bg-background/5 border border-border">
                            <div className="text-[10px] text-foreground/40 uppercase tracking-wide mb-1">Scheduled For</div>
                            <div className="text-sm text-foreground">
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
                    <Mail className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                    <p className="text-foreground/40 text-sm">Select an email to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Test Email Dialog */}
      {showTestEmailDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-foreground">Send Test Email</h3>
              </div>
              <button
                onClick={() => {
                  setShowTestEmailDialog(false);
                  setTestEmailAddress('');
                  setTestEmailError(null);
                }}
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {testEmailSuccess && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-green-400 text-sm">{testEmailSuccess}</p>
                </div>
              )}

              {testEmailError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm">{testEmailError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 bg-background/5 border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  autoFocus
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-blue-400 text-xs">
                  This will send a preview of "{selectedEmail?.name}" with all variables populated with sample data.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-4 border-t border-border">
              <button
                onClick={() => {
                  setShowTestEmailDialog(false);
                  setTestEmailAddress('');
                  setTestEmailError(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-background/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTest}
                disabled={isSendingTest || !testEmailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-foreground font-medium hover:from-green-700 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
