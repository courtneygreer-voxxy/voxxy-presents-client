import { X } from 'lucide-react';
import type { EmailTemplateItem } from '@/types/email';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: EmailTemplateItem | null;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  email,
}: EmailPreviewModalProps) {
  if (!isOpen || !email) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-white/10 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{email.name}</h2>
            <p className="text-sm text-white/60 mt-1">Email Preview</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
              Subject
            </label>
            <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-white">{email.subject_template}</p>
            </div>
          </div>

          {/* Trigger */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                Trigger Type
              </label>
              <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white capitalize">{email.trigger_type.replace(/_/g, ' ')}</p>
              </div>
            </div>
            {email.trigger_value !== null && (
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                  Trigger Value
                </label>
                <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-white">{email.trigger_value} days</p>
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
              Email Body
            </label>
            <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10 max-h-96 overflow-y-auto">
              <div
                className="text-sm text-white/90 prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: email.body_template }}
              />
            </div>
          </div>

          {/* Filter Criteria */}
          {email.filter_criteria && Object.keys(email.filter_criteria).length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                Recipient Filters
              </label>
              <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                <pre className="text-xs text-white/70 whitespace-pre-wrap">
                  {JSON.stringify(email.filter_criteria, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Description */}
          {email.description && (
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                Description
              </label>
              <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/70">{email.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
