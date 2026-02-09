/**
 * EmailPreviewModal - Admin Panel
 *
 * Displays email preview from admin testing panel.
 * Shows the full rendered HTML email in an iframe.
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
            /* Email HTML */
            <div className="bg-white rounded-lg overflow-hidden">
              <iframe
                srcDoc={emailHtml}
                title="Email Preview"
                className="w-full h-[600px] border-0"
                sandbox="allow-same-origin"
              />
            </div>
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
