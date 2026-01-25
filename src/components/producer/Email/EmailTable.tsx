import { ScheduledEmail } from '@/types/email';
import EmailRow from './EmailRow';

interface EmailTableProps {
  emails: ScheduledEmail[];
  onEdit?: (email: ScheduledEmail) => void;
  onPreview?: (email: ScheduledEmail) => void;
  onPause?: (emailId: number) => Promise<void>;
  onResume?: (emailId: number) => Promise<void>;
  onSendNow?: (emailId: number) => Promise<void>;
  onRetryFailed?: (emailId: number) => Promise<void>;
  onDelete?: (emailId: number) => Promise<void>;
}

export default function EmailTable({
  emails,
  onEdit,
  onPreview,
  onPause,
  onResume,
  onSendNow,
  onRetryFailed,
  onDelete,
}: EmailTableProps) {
  if (emails.length === 0) {
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-12 text-center">
        <p className="text-white/60">No emails found</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-white/10">
        <div className="grid grid-cols-[200px,240px,130px,110px,80px,80px,80px,100px,80px] gap-3 px-4 py-2 items-center text-xs font-semibold text-white/70 uppercase tracking-wide">
          <div>Email Name</div>
          <div>Subject</div>
          <div>Scheduled</div>
          <div>Category</div>
          <div className="text-center">Recipients</div>
          <div className="text-center cursor-help" title="Emails that bounced or were dropped by SendGrid">
            Undelivered
          </div>
          <div className="text-center cursor-help" title="Recipients who unsubscribed from emails">
            Unsub
          </div>
          <div className="text-center">Status</div>
          <div className="text-right">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div>
        {emails.map((email) => (
          <EmailRow
            key={`${email.id}-${email.scheduled_for}`}
            email={email}
            onEdit={onEdit}
            onPreview={onPreview}
            onPause={onPause}
            onResume={onResume}
            onSendNow={onSendNow}
            onRetryFailed={onRetryFailed}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
