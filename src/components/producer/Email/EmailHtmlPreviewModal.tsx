/**
 * EmailHtmlPreviewModal - Accurate HTML email preview in sandboxed iframe
 *
 * Fetches fully-rendered HTML from backend (matching production email rendering)
 * and displays it in a secure sandboxed iframe with subject line.
 */

import { useEffect, useState, useRef } from 'react';
import { Eye, Loader2, Mail, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/config/environments';
import { getAuthToken } from '@/services/api';

interface EmailHtmlPreviewModalProps {
  open: boolean;
  onClose: () => void;
  previewUrl: string; // API endpoint URL to fetch HTML
  subject?: string; // Optional: pass resolved subject directly
  title?: string; // Modal title
  apiMethod?: 'GET' | 'POST'; // HTTP method (GET for templates, POST for scheduled emails)
}

export function EmailHtmlPreviewModal({
  open,
  onClose,
  previewUrl,
  subject,
  title = 'Email Preview',
  apiMethod = 'GET',
}: EmailHtmlPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [resolvedSubject, setResolvedSubject] = useState<string>(subject || '');
  const [isMockData, setIsMockData] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch HTML preview from backend
  const fetchPreview = async () => {
    if (!previewUrl) {
      console.error('No preview URL provided');
      return;
    }

    // Construct full API URL
    const apiBaseUrl = getApiUrl();
    const fullUrl = `${apiBaseUrl}${previewUrl}`;

    console.log('Fetching preview from:', fullUrl);
    console.log('Method:', apiMethod);

    setLoading(true);
    setError(null);

    try {
      // Get auth token for Rails authentication
      const token = getAuthToken();
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Added auth token to request');
      } else {
        console.warn('No auth token found - request may fail');
      }

      // Fetch HTML from backend (.html extension tells Rails to return HTML format)
      console.log('Fetching HTML...');
      const htmlResponse = await fetch(fullUrl, {
        method: apiMethod,
        credentials: 'include',
        headers,
      });

      console.log('HTML Response status:', htmlResponse.status);
      console.log('HTML Response headers:', Object.fromEntries(htmlResponse.headers.entries()));

      if (!htmlResponse.ok) {
        const errorText = await htmlResponse.text();
        console.error('HTML Response error:', errorText);
        throw new Error(`Failed to load preview (${htmlResponse.status}): ${htmlResponse.statusText}`);
      }

      const html = await htmlResponse.text();
      console.log('Received HTML length:', html.length);
      console.log('HTML preview (first 500 chars):', html.substring(0, 500));

      setHtmlContent(html);

      // If subject not provided, fetch JSON to get resolved subject
      if (!subject) {
        console.log('Fetching subject from JSON...');
        // Replace .html with .json in the URL
        const jsonUrl = fullUrl.replace('.html', '.json');
        const jsonResponse = await fetch(jsonUrl, {
          method: apiMethod,
          credentials: 'include',
          headers,
        });

        if (jsonResponse.ok) {
          const data = await jsonResponse.json();
          console.log('JSON response:', data);
          // Handle both response formats (template vs scheduled email)
          setResolvedSubject(data.email_item?.subject || data.subject || '');
          setIsMockData(data.sample_data_used || data.is_mock_data || false);
        }
      } else {
        console.log('Using provided subject:', subject);
      }

      setLoading(false);
      console.log('Preview fetch complete');
    } catch (err: any) {
      console.error('Preview fetch error:', err);
      setError(err.message || 'Failed to load email preview');
      setLoading(false);
    }
  };

  // Fetch preview when modal opens or URL changes
  useEffect(() => {
    if (open && previewUrl) {
      fetchPreview();
    }
  }, [open, previewUrl]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] voxxy-gradient-page-cool border-primary/20 p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <DialogTitle className="text-foreground text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-foreground/60 text-sm flex items-start gap-2">
            <Eye className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This preview shows how your email will appear in recipients' inboxes with all variables resolved.
              {isMockData && (
                <span className="block mt-1 text-amber-700 dark:text-yellow-400/80 text-xs">
                  � Using sample data (no registrations found for this event)
                </span>
              )}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Subject Line Display */}
        {resolvedSubject && (
          <div className="px-6 py-2 bg-muted/30 border-b border-border flex-shrink-0">
            <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-0.5">
              Subject Line
            </label>
            <p className="text-sm text-foreground font-medium">{resolvedSubject}</p>
          </div>
        )}

        {/* Preview Content */}
        <div className="flex-1 min-h-[600px] overflow-auto relative bg-gray-50">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-foreground/70">Loading preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-md p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium text-sm mb-1">Preview Error</p>
                    <p className="text-red-400/80 text-xs">{error}</p>
                    <Button
                      onClick={fetchPreview}
                      variant="outline"
                      size="sm"
                      className="mt-3 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && htmlContent && (
            <div className="w-full h-full overflow-auto">
              <div className="min-h-full flex items-start justify-center p-6">
                <iframe
                  ref={iframeRef}
                  srcDoc={htmlContent}
                  sandbox="allow-same-origin allow-popups" // Security: sandboxed iframe
                  className="w-full max-w-4xl border-0 shadow-xl rounded-lg"
                  title="Email Preview"
                  style={{
                    backgroundColor: 'white',
                    height: '1200px',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2 border-t border-border bg-muted/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground/50">
              Preview rendered using {isMockData ? 'sample data' : 'actual event data'}. Variables are resolved to show actual values.
            </p>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="bg-background/5 border-border text-foreground hover:bg-background/10"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
