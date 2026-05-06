/**
 * EmailPreviewModal - Admin Panel
 *
 * Displays email preview from admin testing panel.
 * Shows the email content with glassmorphism styling.
 */

import { X, Mail, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EmailFooterCard from '@/components/shared/EmailFooterCard';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailName: string;
  emailHtml: string;
  loading: boolean;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  emailName,
  emailHtml,
  loading,
}: EmailPreviewModalProps) {
  // Strip HTML tags for clean display
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Remove footer text from body since we have hard-coded footer card
  const removeFooter = (text: string): string => {
    // Remove common footer patterns
    const footerPatterns = [
      /Best regards,?\s*\n?\[?organizationName\]?/gi,
      /Thank you,?\s*\n?\[?organizationName\]?/gi,
      /Sincerely,?\s*\n?\[?organizationName\]?/gi,
      /For questions,?\s*contact us at\s*\[?organizationEmail\]?\.?/gi,
      /If you have any questions,?\s*please contact us at\s*\[?organizationEmail\]?\.?/gi,
      /Please do not reply to this email\.?/gi,
      /Powered by Voxxy\.?/gi,
    ];

    let cleanedText = text;
    footerPatterns.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });

    // Trim excessive whitespace at the end
    return cleanedText.trim();
  };

  const displayText = removeFooter(stripHtml(emailHtml));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto voxxy-gradient-page-cool border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <Mail className="w-5 h-5 text-primary" />
            <span>Email Preview</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-foreground/60">Loading preview...</p>
            </div>
          ) : emailHtml ? (
            <>
              {/* Trigger Type */}
              <div>
                <label className="block text-xs font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide mb-2">
                  Trigger Type
                </label>
                <div className="bg-background/5 rounded-lg p-3 border border-border">
                  <p className="text-foreground/80 text-sm">Test Email</p>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-xs font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide mb-2">
                  Subject Line
                </label>
                <div className="bg-background/5 rounded-lg p-3 border border-border">
                  <p className="text-foreground font-medium text-sm">{emailName}</p>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide mb-2">
                  Message Body
                </label>
                <div className="bg-background/5 rounded-lg p-6 border border-border">
                  <pre className="text-foreground/90 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {displayText}
                  </pre>
                </div>
              </div>

              {/* Hard-coded Footer Card */}
              <EmailFooterCard />
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-foreground/60">No preview available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            onClick={onClose}
            className="voxxy-btn-solid"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
