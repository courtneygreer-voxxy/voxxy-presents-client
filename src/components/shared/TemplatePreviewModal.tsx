/**
 * TemplatePreviewModal
 *
 * Used for previewing email templates WITHOUT event context
 * Shows raw template with [variables] unresolved
 *
 * Locations:
 * - Mail page → Default Event Campaign → View button
 * - Mail page → System Emails → View button
 * - Admin → Template preview
 */

import { X, Mail, Send, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EmailFooterCard from '@/components/shared/EmailFooterCard';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    name: string;
    subject_template: string;
    body_template: string;
    description?: string;
  };
  onSendTest?: () => void;
}

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onSendTest,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  // Strip HTML tags for display (templates stored as HTML in backend)
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const displaySubject = stripHtml(template.subject_template);
  const displayBody = stripHtml(template.body_template);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <Mail className="w-5 h-5 text-purple-400" />
            <span>Email Template Preview</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Name */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-white font-medium">{template.name}</h3>
            {template.description && (
              <p className="text-white/60 text-sm mt-1">{template.description}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
              Subject
            </label>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white font-medium">{displaySubject}</p>
            </div>
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
              Message Body
            </label>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 max-h-96 overflow-y-auto">
              <pre className="text-white/90 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {displayBody}
              </pre>
            </div>
          </div>

          {/* Hard-coded Footer Card */}
          <EmailFooterCard />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          {onSendTest && (
            <Button
              onClick={onSendTest}
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
