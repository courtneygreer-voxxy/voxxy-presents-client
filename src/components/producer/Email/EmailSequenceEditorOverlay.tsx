import { useState, useRef, useMemo } from 'react';
import { ArrowLeft, Mail, Edit2, Eye, MoreVertical, Play, Pause, Trash2, Save, Megaphone, FileText, CreditCard, Calendar, Settings2 } from 'lucide-react';
import type { ScheduledEmail, EmailCategory } from '@/types/email';

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
    case 'failed':
      return { label: 'Failed', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    default:
      return { label: status, className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  }
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

  // No actions for sent emails
  if (isSent) return null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded text-white/30 hover:text-white hover:bg-white/10 transition-all"
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
  onSaveAsTemplate,
}: EmailSequenceEditorOverlayProps) {
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

    return SEQUENCE_CATEGORIES
      .filter(cat => groups[cat.key]?.length > 0)
      .map(cat => ({
        ...cat,
        emails: groups[cat.key],
      }));
  }, [emails]);

  return (
    <div className="p-3 md:p-4 flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Mail
            </button>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-400" />
              <div>
                <h1 className="text-lg font-semibold text-white">Email Sequence Editor</h1>
                {eventData?.title && (
                  <p className="text-xs text-white/50">{eventData.title}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-white/50">{emails.length} emails</p>
            {onSaveAsTemplate && (
              <button
                onClick={onSaveAsTemplate}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                Save as Template
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Groups */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {groupedEmails.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/50">No emails in sequence</p>
            </div>
          ) : (
            groupedEmails.map(group => {
              const GroupIcon = group.icon;
              return (
                <div key={group.key}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <div className={`p-1 rounded ${group.bg}`}>
                      <GroupIcon className={`w-3.5 h-3.5 ${group.color}`} />
                    </div>
                    <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                      {group.label}
                    </h3>
                    <span className="text-[10px] text-white/30 tabular-nums">{group.emails.length}</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                    {group.emails.map(email => {
                      const status = getStatusBadge(email.status);
                      const isSent = email.status === 'sent';

                      return (
                        <div key={email.id} className="flex items-center gap-3 py-2.5 px-3">
                          <Mail className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                          <span className="text-sm text-white truncate flex-1">{email.name}</span>

                          {/* Status Badge */}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 ${status.className}`}>
                            {status.label}
                          </span>

                          {/* Edit/View Button */}
                          <button
                            onClick={() => onEditEmail(email)}
                            className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                            title={isSent ? 'View email' : 'Edit email'}
                          >
                            {isSent ? <Eye className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                          </button>

                          {/* Action Menu */}
                          <SequenceRowMenu
                            email={email}
                            onPause={onPause}
                            onResume={onResume}
                            onSendNow={onSendNow}
                            onDelete={onDelete}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
