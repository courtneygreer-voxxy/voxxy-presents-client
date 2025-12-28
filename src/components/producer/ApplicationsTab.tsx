import { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Calendar, Link2, Check } from 'lucide-react';
import { vendorApplicationsApi } from '@/services/api';
import CreateApplicationForm from './CreateApplicationForm';
import ViewApplicationSubmissions from './ViewApplicationSubmissions';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
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
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
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
        <h2 className="text-2xl font-bold text-white">Vendor Applications</h2>
        <button
          onClick={() => setCurrentView('create')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Application
        </button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <Calendar className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
          <p className="text-white/60 mb-6">
            Create a vendor application form to start accepting vendor submissions for this event.
          </p>
          <button
            onClick={() => setCurrentView('create')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg"
          >
            Create Your First Application
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {application.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        application.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {application.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
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
                    <span>Created {formatDate(application.created_at)}</span>
                  </div>

                  {/* Shareable Link */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/60 mb-1">Shareable Link:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm text-purple-300 font-mono bg-black/20 px-2 py-1 rounded overflow-x-auto">
                        {application.shareable_url}
                      </code>
                      <button
                        onClick={() => handleCopyLink(application)}
                        className="px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setCurrentView('edit');
                    }}
                    className="px-3 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all text-sm flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setCurrentView('submissions');
                    }}
                    className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all text-sm flex items-center gap-2"
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
