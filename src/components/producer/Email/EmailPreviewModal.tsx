import { X, Mail, Calendar, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { scheduledEmailsApi } from '@/services/api';
import type { ScheduledEmail } from '@/types/email';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: ScheduledEmail | null;
  eventSlug: string;
}

interface PreviewData {
  subject: string;
  body: string;
  recipient_email: string;
  recipient_name: string;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  email,
  eventSlug
}: EmailPreviewModalProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && email) {
      loadPreview();
    } else {
      setPreviewData(null);
      setError(null);
    }
  }, [isOpen, email]);

  const loadPreview = async () => {
    if (!email) return;

    setIsLoading(true);
    setError(null);
    try {
      // Pass empty object - backend should use sample registration for preview
      const data = await scheduledEmailsApi.preview(eventSlug, email.id, {} as any);
      setPreviewData(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load email preview';

      // Provide helpful message when no registrations exist
      if (errorMessage.includes('No registration found')) {
        setError('No vendor applications found for this event yet. The preview will be available once vendors start applying.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f0a1e] border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <Mail className="w-5 h-5 text-purple-400" />
            <span>Email Preview</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Info */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-white font-medium mb-3">{email.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {email.scheduled_for && (
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Sends: {format(new Date(email.scheduled_for), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/60">
                <Users className="w-4 h-4" />
                <span>{email.recipient_count || 0} recipients</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
              <p className="text-white/60">Loading preview...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className={`p-4 rounded-lg ${
              error.includes('No vendor applications')
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <p className={error.includes('No vendor applications') ? 'text-yellow-400' : 'text-red-400'}>
                {error}
              </p>
            </div>
          )}

          {/* Preview Content */}
          {previewData && !isLoading && (
            <div className="space-y-4">
              {/* Sample Recipient */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Preview Recipient
                </label>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-medium">{previewData.recipient_name}</p>
                  <p className="text-white/60 text-sm">{previewData.recipient_email}</p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Subject Line
                </label>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-medium">{previewData.subject}</p>
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Email Body
                </label>
                <div
                  className="bg-white rounded-lg p-6 border border-white/10 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewData.body }}
                />
              </div>

              {/* Info Note */}
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> This preview shows the email with variables resolved using a sample recipient.
                  Actual emails sent to other recipients may vary based on their specific information.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
