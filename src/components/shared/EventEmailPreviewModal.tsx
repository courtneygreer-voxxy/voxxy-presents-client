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
import EmailFooterCard from '@/components/shared/EmailFooterCard';

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
  trigger_type?: string;
  trigger_value?: number | null;
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

// Format trigger type for display
const formatTrigger = (triggerType?: string, triggerValue?: number | null): string => {
  if (!triggerType) return '';

  switch (triggerType) {
    case 'days_before_event':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} before event`;
    case 'days_after_event':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} after event`;
    case 'days_before_deadline':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} before payment deadline`;
    case 'on_application_open':
      return 'When applications open';
    case 'on_application_submit':
      return 'On application submission';
    case 'on_approval':
      return 'On application approval';
    case 'on_payment_deadline':
      return 'On payment deadline';
    case 'on_event_date':
      return 'On event day';
    default:
      return triggerType.replace(/_/g, ' ');
  }
};

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

  // Remove footer text from body since we have hard-coded footer card
  // Works with both HTML and plain text
  const removeFooter = (html: string): string => {
    if (!html) return '';

    // Remove common footer patterns (handles both HTML and text)
    const footerPatterns = [
      /<p[^>]*>Best regards,?\s*<\/p>/gi,
      /<p[^>]*>Thank you,?\s*<\/p>/gi,
      /<p[^>]*>Sincerely,?\s*<\/p>/gi,
      /<p[^>]*>Please do not reply to this email\.?<\/p>/gi,
      /<p[^>]*>For questions,?\s*contact.*?<\/p>/gi,
      /<p[^>]*>If you have any questions.*?<\/p>/gi,
      /<p[^>]*>Powered by Voxxy.*?<\/p>/gi,
      /Best regards,?\s*\n?\[?organizationName\]?/gi,
      /Thank you,?\s*\n?\[?organizationName\]?/gi,
      /Sincerely,?\s*\n?\[?organizationName\]?/gi,
      /For questions,?\s*contact us at\s*\[?organizationEmail\]?\.?/gi,
      /If you have any questions,?\s*please contact us at\s*\[?organizationEmail\]?\.?/gi,
      /Please do not reply to this email\.?/gi,
      /Powered by Voxxy\.?/gi,
    ];

    let cleanedHtml = html;
    footerPatterns.forEach(pattern => {
      cleanedHtml = cleanedHtml.replace(pattern, '');
    });

    // Remove trailing empty paragraphs
    cleanedHtml = cleanedHtml.replace(/(<p[^>]*>\s*<\/p>\s*)+$/gi, '');

    return cleanedHtml.trim();
  };

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
      console.error('Preview error:', errorMessage);
      setError(errorMessage);
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
          {/* Top Section: Trigger Type & Scheduled Send Date */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex flex-wrap items-center gap-4">
              {/* Trigger */}
              {email.trigger_type && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-xs text-white/60">Trigger Type</p>
                    <p className="text-sm font-medium text-white">
                      {formatTrigger(email.trigger_type, email.trigger_value)}
                    </p>
                  </div>
                </div>
              )}

              {/* Scheduled Send Date */}
              {email.scheduled_for && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-xs text-white/60">Scheduled For</p>
                    <p className="text-sm font-medium text-white">
                      {format(new Date(email.scheduled_for), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              {email.status && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ml-auto ${
                    statusColor[email.status as keyof typeof statusColor] ||
                    'bg-gray-500/20 border-gray-500/30 text-gray-400'
                  }`}
                >
                  {statusLabel[email.status as keyof typeof statusLabel] || email.status}
                </span>
              )}
            </div>

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

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
              <p className="text-white/60">Loading preview...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Middle Section: Subject, Body, Footer */}
          {previewData && !isLoading && (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                  Subject
                </label>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-medium">{previewData.subject}</p>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                  Message Body
                </label>
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div
                    className="email-preview-content"
                    dangerouslySetInnerHTML={{
                      __html: removeFooter(previewData.body)
                    }}
                  />
                </div>
              </div>

              {/* Hard-coded Footer Card */}
              <EmailFooterCard />
            </div>
          )}

          {/* Bottom Section: Recipients */}
          {previewData && !isLoading && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-xs text-white/60">Recipients</p>
                  <p className="text-sm font-medium text-white">
                    {email.recipient_count
                      ? `${email.recipient_count} recipients`
                      : 'All Applicants'}
                  </p>
                </div>
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
