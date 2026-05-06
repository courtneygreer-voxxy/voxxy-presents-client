import { useState, useEffect } from 'react';
import { Bug, Calendar, User, Mail, AlertCircle, ChevronDown, ChevronUp, ExternalLink, ArrowLeft } from 'lucide-react';
import { bugReportsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface BugReport {
  id: number;
  name: string;
  email: string;
  bug_description: string;
  error_context?: {
    errorMessage?: string;
    componentName?: string;
    timestamp?: string;
    browser?: string;
    url?: string;
    screen_resolution?: string;
    viewport?: string;
    auto_reported?: boolean;
    stack?: string;
    componentStack?: string;
    formData?: any;
  };
  created_at: string;
}

export default function AdminBugReportsPage() {
  const { userProfile } = useAuth();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin') {
      window.location.href = '/';
    }
  }, [userProfile]);

  useEffect(() => {
    loadBugReports();
  }, []);

  const loadBugReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bugReportsApi.getAll();
      setReports(data);
      console.log('Bug reports loaded:', data);
    } catch (err: any) {
      console.error('Failed to load bug reports:', err);
      setError(err.message || 'Failed to load bug reports');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-6 text-center max-w-md">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={loadBugReports}
            className="px-4 py-2 voxxy-btn-solid rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen voxxy-gradient-page-cool">
      <div className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => window.close()}
                className="flex items-center gap-2 px-3 py-2 bg-background/5 hover:bg-background/10 border border-border text-foreground rounded-lg transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Close
              </button>
              <button
                onClick={loadBugReports}
                className="px-4 py-2 bg-background/10 hover:bg-background/15 border border-border text-foreground rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-lg flex items-center justify-center">
                <Bug className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Bug Reports</h1>
                <p className="text-muted-foreground">
                  {reports.length} {reports.length === 1 ? 'report' : 'reports'} submitted by users
                </p>
              </div>
            </div>
          </div>

          {/* Reports List */}
          {reports.length === 0 ? (
            <div className="bg-background/5 border border-border rounded-lg p-12 text-center">
              <Bug className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Bug Reports Yet</h3>
              <p className="text-foreground/60">
                Bug reports submitted by users will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const isExpanded = expandedId === report.id;
                const isAutoReported = report.error_context?.auto_reported;

                return (
                  <div
                    key={report.id}
                    className="bg-background/5 border border-border rounded-lg overflow-hidden hover:border-border transition-colors"
                  >
                    {/* Report Header (Always Visible) */}
                    <button
                      onClick={() => toggleExpand(report.id)}
                      className="w-full p-4 flex items-start gap-4 text-left hover:bg-background/5 transition-colors"
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isAutoReported
                          ? 'bg-red-500/20 border border-red-400/30'
                          : 'bg-primary/20 border border-primary/30'
                      }`}>
                        {isAutoReported ? (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : (
                          <Bug className="w-5 h-5 text-primary" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-foreground font-medium truncate">
                              {report.error_context?.errorMessage || report.bug_description || 'Bug Report'}
                            </h3>
                            {report.error_context?.componentName && (
                              <p className="text-xs text-primary mt-1">
                                {report.error_context.componentName}
                              </p>
                            )}
                          </div>
                          {isAutoReported && (
                            <span className="px-2 py-1 bg-red-500/20 border border-red-400/30 text-red-950 dark:text-red-300 text-xs rounded">
                              Auto-reported
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/60">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {report.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {report.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(report.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-foreground/60" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-foreground/60" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border p-4 space-y-4 bg-black/20">
                        {/* User Description */}
                        {report.bug_description && (
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">User Description</h4>
                            <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                              {report.bug_description}
                            </p>
                          </div>
                        )}

                        {/* Error Context */}
                        {report.error_context && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground">Technical Details</h4>

                            {/* URL */}
                            {report.error_context.url && (
                              <div>
                                <p className="text-xs text-foreground/50 mb-1">Page URL</p>
                                <a
                                  href={report.error_context.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:text-primary flex items-center gap-1"
                                >
                                  {report.error_context.url}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}

                            {/* Browser & Resolution */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {report.error_context.browser && (
                                <div>
                                  <p className="text-xs text-foreground/50 mb-1">Browser</p>
                                  <p className="text-sm text-foreground/70 font-mono text-xs truncate">
                                    {report.error_context.browser}
                                  </p>
                                </div>
                              )}
                              {report.error_context.screen_resolution && (
                                <div>
                                  <p className="text-xs text-foreground/50 mb-1">Screen / Viewport</p>
                                  <p className="text-sm text-foreground/70">
                                    {report.error_context.screen_resolution}
                                    {report.error_context.viewport && ` / ${report.error_context.viewport}`}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Stack Trace */}
                            {report.error_context.stack && (
                              <div>
                                <p className="text-xs text-foreground/50 mb-1">Stack Trace</p>
                                <pre className="text-xs text-red-300 font-mono bg-black/40 border border-red-500/20 rounded p-3 overflow-x-auto max-h-48">
                                  {report.error_context.stack}
                                </pre>
                              </div>
                            )}

                            {/* Component Stack */}
                            {report.error_context.componentStack && (
                              <div>
                                <p className="text-xs text-foreground/50 mb-1">Component Stack</p>
                                <pre className="text-xs text-foreground/60 font-mono bg-black/40 border border-border rounded p-3 overflow-x-auto max-h-32">
                                  {report.error_context.componentStack}
                                </pre>
                              </div>
                            )}

                            {/* Form Data (if available) */}
                            {report.error_context.formData && (
                              <div>
                                <p className="text-xs text-foreground/50 mb-1">Form Data (at time of error)</p>
                                <pre className="text-xs text-foreground/60 font-mono bg-black/40 border border-border rounded p-3 overflow-x-auto max-h-48">
                                  {JSON.stringify(report.error_context.formData, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Contact Action */}
                        <div className="pt-3 border-t border-border">
                          <a
                            href={`mailto:${report.email}?subject=Re: Bug Report #${report.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 voxxy-btn-solid text-sm rounded-lg transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Email Reporter
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
