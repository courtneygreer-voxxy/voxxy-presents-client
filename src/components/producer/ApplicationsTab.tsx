import { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Calendar, Link2, Check, DollarSign, Tag } from 'lucide-react';
import { vendorApplicationsApi } from '@/services/api';
import CreateApplicationForm from './CreateApplicationForm';
import ViewApplicationSubmissions from './ViewApplicationSubmissions';
import { formatEventDate } from '@/utils/dateHelpers';

interface VendorApplication {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  categories: string[];
  submissions_count: number;
  shareable_code: string;
  shareable_url: string;
  created_at: string;
  updated_at: string;
  pricing?: {
    booth_price: number;
    currency: string;
  };
  install_date?: string;
  install_start_time?: string;
  install_end_time?: string;
  payment_link?: string;
  application_tags?: string;
}

interface Event {
  slug: string;
  title: string;
  event_date?: string;
  location?: string;
}

interface ApplicationsTabProps {
  eventSlug: string;
  event: Event;
}

type View = 'list' | 'create' | 'edit' | 'submissions';

export default function ApplicationsTab({ eventSlug, event }: ApplicationsTabProps) {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [eventSlug]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vendorApplicationsApi.getByEvent(eventSlug);
      setApplications(data);
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchApplications();
    setCurrentView('list');
    setSelectedApplication(null);
  };

  const handleCopyLink = async (application: VendorApplication) => {
    try {
      await navigator.clipboard.writeText(application.shareable_url);
      setCopiedId(application.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Show create/edit form
  if (currentView === 'create' || currentView === 'edit') {
    return (
      <CreateApplicationForm
        event={event}
        onBack={() => {
          setCurrentView('list');
          setSelectedApplication(null);
        }}
        onSuccess={handleSuccess}
        existingApplication={currentView === 'edit' ? selectedApplication || undefined : undefined}
      />
    );
  }

  // Show submissions view
  if (currentView === 'submissions' && selectedApplication) {
    return (
      <ViewApplicationSubmissions
        application={selectedApplication}
        onBack={() => {
          setCurrentView('list');
          setSelectedApplication(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchApplications}
            className="px-4 py-2 rounded-lg voxxy-btn-solid transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Vendor Applications</h2>
        <button
          onClick={() => setCurrentView('create')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg voxxy-btn-cta transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Application
        </button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background/5 mb-4">
            <Calendar className="w-8 h-8 text-foreground/40" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Applications Yet</h3>
          <p className="text-foreground/60 mb-6">
            Create a vendor application form to start accepting vendor submissions for this event.
          </p>
          <button
            onClick={() => setCurrentView('create')}
            className="px-6 py-3 rounded-lg voxxy-btn-cta transition-all shadow-lg"
          >
            Create Your First Application
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-background/5 border border-border rounded-lg p-6 hover:bg-background/10 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {application.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        application.status === 'active'
                          ? 'bg-green-500/20 text-emerald-900 dark:text-green-400'
                          : 'bg-muted/20 text-muted-foreground'
                      }`}
                    >
                      {application.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-foreground/60 mb-3">
                    <span>{application.submissions_count} submissions</span>
                    {application.pricing?.booth_price != null && (
                      <>
                        <span>•</span>
                        <span className="text-green-400 font-medium">
                          ${application.pricing.booth_price.toFixed(2)} booth price
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>Created {formatEventDate(application.created_at, 'MMM d, yyyy')}</span>
                  </div>

                  {/* Application Details */}
                  {(application.install_date || application.payment_link || application.application_tags) && (
                    <div className="bg-background/5 border border-border rounded-lg p-3 mb-3 space-y-2">
                      {/* Install Info */}
                      {application.install_date && (
                        <div className="flex items-start gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-foreground/60 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-foreground/60">Install Date:</span>{' '}
                            <span className="text-foreground">{formatEventDate(application.install_date, 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      )}

                      {/* Payment Link */}
                      {application.payment_link && (
                        <div className="flex items-start gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-foreground/60 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-foreground/60">Payment Link:</span>{' '}
                            <a
                              href={application.payment_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary underline break-all"
                            >
                              {application.payment_link}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {application.application_tags && (
                        <div className="flex items-start gap-2 text-sm">
                          <Tag className="w-4 h-4 text-foreground/60 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-foreground/60">Tags:</span>{' '}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {application.application_tags.split(',').map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-foreground text-xs"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Shareable Link */}
                  <div className="bg-background/5 border border-border rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Application Link</p>
                      <p className="text-xs text-foreground/60 mb-3">Share this link with vendors to apply for this category:</p>
                      
                      {/* Preview Message */}
                      <div className="bg-black/20 rounded-lg p-3 mb-3 border border-border">
                        <p className="text-xs text-foreground/50 mb-1">Preview:</p>
                        <p className="text-sm text-primary">
                          Apply to {application.name} - {event.title}
                        </p>
                      </div>
                      
                      {/* URL */}
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-primary font-mono bg-black/30 px-3 py-2 rounded overflow-x-auto">
                          {application.shareable_url}
                        </code>
                        <button
                          onClick={() => handleCopyLink(application)}
                          className="px-4 py-2 rounded voxxy-btn-solid transition-colors text-sm flex items-center gap-2 whitespace-nowrap font-medium"
                        >
                          {copiedId === application.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Link2 className="w-4 h-4" />
                              Copy Link
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setCurrentView('edit');
                    }}
                    className="px-3 py-2 rounded-lg border border-border text-foreground hover:bg-background/5 transition-all text-sm flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setCurrentView('submissions');
                    }}
                    className="px-3 py-2 rounded-lg bg-background/10 text-foreground hover:bg-background/20 transition-all text-sm flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Applications
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
