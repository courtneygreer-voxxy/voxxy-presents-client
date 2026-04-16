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

  const displaySubject = template.subject_template.replace(/<[^>]*>/g, '');
  const displayBody = template.body_template;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto voxxy-gradient-page-cool border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <Mail className="w-5 h-5 text-purple-400" />
            <span>Email Template Preview</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Name */}
          <div className="bg-background/5 rounded-lg p-4 border border-border">
            <h3 className="text-foreground font-medium">{template.name}</h3>
            {template.description && (
              <p className="text-foreground/60 text-sm mt-1">{template.description}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide mb-2">
              Subject
            </label>
            <div className="bg-background/5 rounded-lg p-4 border border-border">
              <p className="text-foreground font-medium">{displaySubject}</p>
            </div>
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide mb-2">
              Message Body
            </label>
            <div className="bg-background/5 rounded-lg p-6 border border-border max-h-96 overflow-y-auto">
              <div
                className="text-foreground/90 text-sm leading-relaxed prose prose-invert prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:text-foreground/90 [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1 [&_a]:text-purple-400 [&_a]:underline [&_strong]:text-foreground [&_hr]:border-border"
                dangerouslySetInnerHTML={{ __html: displayBody }}
              />
            </div>
          </div>

          {/* Hard-coded Footer Card */}
          <EmailFooterCard />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          {onSendTest && (
            <Button
              onClick={onSendTest}
              variant="outline"
              className="bg-background/5 border-border text-foreground hover:bg-background/10"
            >
              <Send className="w-4 h-4 mr-2" />
              Test Email
            </Button>
          )}
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
