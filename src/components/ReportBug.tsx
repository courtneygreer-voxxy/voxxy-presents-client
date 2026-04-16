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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="voxxy-gradient-page-cool border border-green-500/30 rounded-lg p-6 max-w-md w-full shadow-xl">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Report Submitted!</h3>
            <p className="text-sm text-foreground/70">
              Thank you for reporting this issue. Our team will review it shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="voxxy-gradient-page-cool border border-purple-500/30 rounded-lg p-6 max-w-md w-full shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Bug className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Report a Bug</h2>
            <p className="text-xs text-foreground/60">
              {autoShow
                ? "We noticed you're having trouble. Help us fix it!"
                : 'Help us improve Voxxy Presents'}
            </p>
          </div>
        </div>

        {/* Auto-show context message */}
        {autoShow && errorContext?.errorMessage && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-xs text-red-300 mb-1 font-medium">Error Details:</p>
            <p className="text-xs text-foreground/70">{errorContext.errorMessage}</p>
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
              className="w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
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
              className="w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
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
              className="w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Technical Info Notice */}
          <div className="bg-background/5 border border-border rounded-lg p-3">
            <p className="text-xs text-foreground/60">
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
              className="text-purple-400 hover:text-purple-300 underline"
            >
              team@voxxypresents.com
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
