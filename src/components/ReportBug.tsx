import { useState } from 'react';
import { X, Bug, Send } from 'lucide-react';
import { bugReportsApi } from '@/services/api';

interface ReportBugProps {
  isOpen: boolean;
  onClose: () => void;
  errorContext?: {
    errorMessage?: string;
    componentName?: string;
    timestamp?: string;
    userAgent?: string;
    url?: string;
    formData?: any;
    stack?: string;
    componentStack?: string;
  };
  autoShow?: boolean; // Whether this was triggered automatically (after failures)
}

export default function ReportBug({
  isOpen,
  onClose,
  errorContext,
  autoShow = false,
}: ReportBugProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setError('Please provide your name and email');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Collect browser and error context
      const bugReport = {
        name: formData.name,
        email: formData.email,
        description: formData.description,
        error_context: {
          ...errorContext,
          browser: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          auto_reported: autoShow,
        },
      };

      console.log('[Bug Report] Submitting:', bugReport);

      // Submit to backend API
      await bugReportsApi.create(bugReport);

      console.log('[Bug Report] Successfully submitted');

      setSubmitted(true);

      // Close after 2 seconds
      setTimeout(() => {
        onClose();
        // Reset form
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: '', email: '', description: '' });
        }, 300);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit bug report:', err);
      setError('Failed to submit report. Please try again or contact team@voxxypresents.com');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="voxxy-overlay-scrim fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="voxxy-modal-surface max-w-md w-full rounded-lg border border-green-500/30 p-6 shadow-xl">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-6 w-6 text-green-700 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Report Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for reporting this issue. Our team will review it shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="voxxy-overlay-scrim fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="voxxy-modal-surface relative max-w-md w-full rounded-lg border border-primary/30 p-6 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Bug className="h-5 w-5 text-violet-700 dark:text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Report a Bug</h2>
            <p className="text-xs text-muted-foreground">
              {autoShow
                ? "We noticed you're having trouble. Help us fix it!"
                : 'Help us improve Voxxy Presents'}
            </p>
          </div>
        </div>

        {/* Auto-show context message */}
        {autoShow && errorContext?.errorMessage && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="mb-1 text-xs font-medium text-red-700 dark:text-red-300">Error Details:</p>
            <p className="text-xs text-muted-foreground">{errorContext.errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="voxxy-input-frost w-full rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Your Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="voxxy-input-frost w-full rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              What happened? (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you were trying to do when the error occurred..."
              rows={4}
              className="voxxy-input-frost w-full resize-none rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Technical Info Notice */}
          <div className="bg-background/5 border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground/80">Note:</strong> Browser information and error details
              will be automatically included to help us diagnose the issue.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-background/5 hover:bg-background/10 border border-border text-foreground text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg voxxy-btn-cta text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>

          {/* Support Email */}
          <p className="text-center text-xs text-foreground/50">
            Or email us directly at{' '}
            <a
              href="mailto:team@voxxypresents.com"
              className="text-primary hover:text-primary underline"
            >
              team@voxxypresents.com
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
