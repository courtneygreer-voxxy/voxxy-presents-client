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

  // Extract footer from body
  const extractFooter = (text: string): { body: string; footer: string | null } => {
    const footerMatch = text.match(/\n\n(Best regards|Sincerely|Thank you|Thanks|Cheers|Warm regards),?[\s\S]*$/i);
    if (footerMatch) {
      return {
        body: text.substring(0, footerMatch.index),
        footer: footerMatch[0].trim(),
      };
    }
    return { body: text, footer: null };
  };

  const displayText = stripHtml(emailHtml);
  const { body: displayBody, footer: displayFooter } = extractFooter(displayText);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <Mail className="w-5 h-5 text-purple-400" />
            <span>Email Preview</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Name */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-white font-medium">{emailName}</h3>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
              <p className="text-white/60">Loading preview...</p>
            </div>
          ) : emailHtml ? (
            <>
              {/* Message Body */}
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                  Message Body
                </label>
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <pre className="text-white/90 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {displayBody}
                  </pre>
                </div>
              </div>

              {/* Footer */}
              {displayFooter && (
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                    Email Footer
                  </label>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <pre className="text-white/70 text-sm whitespace-pre-wrap font-sans">
                      {displayFooter}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/60">No preview available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
