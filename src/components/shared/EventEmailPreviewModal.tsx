/**
 * EventEmailPreviewModal
 *
 * Used for previewing emails WITH event context
 * Calls backend API to resolve [variables] → actual values
 * Shows status, date, recipient info, and supports category switching
 *
 * Locations:
 * - Command Center → Mail tab → Preview button
 * - Event Creation Wizard → Email preview step
 */

import { useEffect, useState } from 'react';
import { X, Mail, Calendar, Users, Loader2, Send, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { scheduledEmailsApi, eventInvitationsApi } from '@/services/api';
import type { ScheduledEmail } from '@/types/email';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Flexible email type that works with both ScheduledEmail and EmailTemplateItem
type EmailPreviewData = {
  id: number;
  name: string;
  subject_template?: string;
  body_template?: string;
  scheduled_for?: string;
  recipient_count?: number;
  status?: 'sent' | 'scheduled' | 'pending' | 'sending';
  overdue?: boolean;
  overdue_message?: string;
  isInvitationAnnouncement?: boolean;
};

interface EventEmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: (ScheduledEmail | EmailPreviewData) | null;
  eventSlug: string;

  // Category support for emails with category-specific variables
  hasCategorySpecificContent?: boolean;
  availableCategories?: Array<{ value: string; label: string }>;

  onSendTest?: (category?: string) => void;
}

interface PreviewData {
  subject: string;
  body: string;
  recipient_email: string;
  recipient_name: string;
}

const DEFAULT_CATEGORIES = [
  { value: 'artist', label: 'Artist' },
  { value: 'food_vendor', label: 'Food Vendor' },
  { value: 'table_vendor', label: 'Table Vendor' },
  { value: 'sponsor', label: 'Sponsor' },
];

export default function EventEmailPreviewModal({
  isOpen,
  onClose,
  email,
  eventSlug,
  hasCategorySpecificContent = false,
  availableCategories = DEFAULT_CATEGORIES,
  onSendTest,
}: EventEmailPreviewModalProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    availableCategories[0]?.value || 'artist'
  );

  useEffect(() => {
    if (isOpen && email) {
      loadPreview();
    } else {
      setPreviewData(null);
      setError(null);
    }
  }, [isOpen, email, selectedCategory]);

  const loadPreview = async () => {
    if (!email) return;

    setIsLoading(true);
    setError(null);
    try {
      // Special handling for invitation emails
      if (email.isInvitationAnnouncement) {
        const data = await eventInvitationsApi.previewEmail(eventSlug);
        setPreviewData(data);
      } else {
        // Pass category context if needed
        const context = hasCategorySpecificContent
          ? { category: selectedCategory }
          : {};

        const data = await scheduledEmailsApi.preview(
          eventSlug,
          email.id,
          context as any
        );
        setPreviewData(data);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load email preview';

      // Provide helpful message when no registrations exist
      if (errorMessage.includes('No registration found')) {
        setError(
          'No vendor applications found for this event yet. The preview will be available once vendors start applying.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // loadPreview will be triggered by useEffect
  };

  const handleSendTest = () => {
    if (onSendTest) {
      onSendTest(hasCategorySpecificContent ? selectedCategory : undefined);
    }
  };

  if (!email) return null;

  const statusColor = {
    sent: 'bg-green-500/20 border-green-500/30 text-green-400',
    scheduled: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    pending: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    sending: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  };

  const statusLabel = {
    sent: 'Sent',
    scheduled: 'Scheduled',
    pending: 'Pending',
    sending: 'Sending',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <Mail className="w-5 h-5 text-purple-400" />
            <span>Email Preview</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Metadata */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {/* Date */}
              {email.scheduled_for && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>
                    {format(new Date(email.scheduled_for), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              )}

              {/* Recipients */}
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Users className="w-4 h-4 text-purple-400" />
                <span>
                  {email.recipient_count
                    ? `${email.recipient_count} recipients`
                    : 'All Applicants'}
                </span>
              </div>

              {/* Status Badge */}
              {email.status && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    statusColor[email.status as keyof typeof statusColor] ||
                    'bg-gray-500/20 border-gray-500/30 text-gray-400'
                  }`}
                >
                  {statusLabel[email.status as keyof typeof statusLabel] || email.status}
                </span>
              )}
            </div>

            <h3 className="text-white font-medium">{email.name}</h3>

            {/* Overdue Warning */}
            {email.overdue && email.overdue_message && (
              <div className="flex items-center gap-2 px-3 py-2 mt-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-red-400">
                  Overdue: {email.overdue_message}
                </span>
              </div>
            )}
          </div>

          {/* Category Selector */}
          {hasCategorySpecificContent && !isLoading && !error && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Preview for Category
              </label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2e] border-purple-500/20">
                  {availableCategories.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className="text-white"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-purple-300/60 mt-2">
                This email contains category-specific content. Switch categories to see
                different values (e.g., prices, install times).
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
              <p className="text-white/60">Loading preview...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div
              className={`p-4 rounded-lg ${
                error.includes('No vendor applications')
                  ? 'bg-yellow-500/10 border border-yellow-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              <p
                className={
                  error.includes('No vendor applications')
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }
              >
                {error}
              </p>
            </div>
          )}

          {/* Preview Content */}
          {previewData && !isLoading && (
            <div className="space-y-4">
              {/* Sample Recipient */}
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                  Preview Recipient
                </label>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white font-medium text-sm">
                    {previewData.recipient_name}
                  </p>
                  <p className="text-white/60 text-xs">{previewData.recipient_email}</p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                  Subject
                </label>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-medium">{previewData.subject}</p>
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                  Message Body
                </label>
                <div
                  className="bg-white rounded-lg p-6 border border-white/10 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewData.body }}
                />
              </div>

              {/* Info Note */}
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> This preview shows the email with variables
                  resolved using a sample recipient. Actual emails sent to other recipients
                  may vary based on their specific information.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          {onSendTest && !error && previewData && (
            <Button
              onClick={handleSendTest}
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <Send className="w-4 h-4 mr-2" />
              Test Email
            </Button>
          )}
          <Button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
