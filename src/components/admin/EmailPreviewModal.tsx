import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailName: string;
  emailHtml: string;
  loading: boolean;
}

export default function EmailPreviewModal({ isOpen, onClose, emailName, emailHtml, loading }: EmailPreviewModalProps) {
  const [iframeKey, setIframeKey] = useState(0);

  // Reset iframe when HTML changes
  useEffect(() => {
    setIframeKey(prev => prev + 1);
  }, [emailHtml]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-6xl h-[85vh] m-4 flex flex-col bg-[#0f0820] border border-white/20 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl lg:text-2xl font-bold text-white truncate">Email Preview</h2>
            <p className="text-sm text-gray-300 mt-1 truncate">{emailName}</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="ml-4 text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden p-4 lg:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-4" />
              <p className="text-gray-300">Loading email preview...</p>
            </div>
          ) : emailHtml ? (
            <div className="h-full bg-white rounded-lg overflow-hidden shadow-inner">
              <iframe
                key={iframeKey}
                srcDoc={emailHtml}
                title="Email Preview"
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No preview available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 lg:p-6 border-t border-white/10 flex-shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
