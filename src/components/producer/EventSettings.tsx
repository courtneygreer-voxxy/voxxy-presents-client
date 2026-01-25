import { useState, useEffect } from 'react';
import { Eye, EyeOff, Calendar, Trash2, FileText, Edit, Pause, Link, Copy, ExternalLink, Check } from 'lucide-react';
import { vendorApplicationsApi } from '@/services/api';
import CreateApplicationForm from './CreateApplicationForm';

interface Event {
  id: number;
  slug: string;
  title: string;
  description?: string;
  event_date?: string;
  event_end_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  location?: string;
  application_deadline?: string;
  payment_due_date?: string;
  ticket_link?: string;
  age_restriction?: string;
  status?: {
    published?: boolean;
    registration_open?: boolean;
    status?: 'draft' | 'published' | 'cancelled' | 'completed';
  };
  published?: boolean;
  capacity?: {
    total?: number;
    registered?: number;
    remaining?: number;
    is_full?: boolean;
  };
}

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

interface EventSettingsProps {
  event: Event;
  onUpdate?: (eventSlug: string, updates: any) => Promise<void>;
  onDelete?: (eventSlug: string) => Promise<void>;
}

type View = 'settings' | 'create_app' | 'edit_app';

export default function EventSettings({ event, onUpdate, onDelete }: EventSettingsProps) {
  const [currentView, setCurrentView] = useState<View>('settings');
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [loadingApps, setLoadingApps] = useState(false);

  // Original settings state
  const [isPublished, setIsPublished] = useState(event.published || event.status?.published || false);
  const [registrationOpen, setRegistrationOpen] = useState(event.status?.registration_open || false);
  const [eventStatus, setEventStatus] = useState<'draft' | 'published' | 'cancelled' | 'completed'>(
    event.status?.status || 'draft'
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Copy link states
  const [copiedApplicationLink, setCopiedApplicationLink] = useState(false);
  const [copiedPortalLink, setCopiedPortalLink] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [event.slug]);

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const data = await vendorApplicationsApi.getByEvent(event.slug);
      setApplications(data);
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!onUpdate) {
      alert('Settings will be saved');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdate(event.slug, {
        published: isPublished,
        status: eventStatus,
        registration_open: registrationOpen,
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!onDelete) {
      alert('Event will be deleted');
      return;
    }

    try {
      await onDelete(event.slug);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleApplicationSuccess = () => {
    fetchApplications();
    setCurrentView('settings');
    setSelectedApplication(null);
  };

  const copyToClipboard = async (text: string, type: 'application' | 'portal') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'application') {
        setCopiedApplicationLink(true);
        setTimeout(() => setCopiedApplicationLink(false), 2000);
      } else {
        setCopiedPortalLink(true);
        setTimeout(() => setCopiedPortalLink(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link to clipboard');
    }
  };

  // Get the first application's shareable code for links
  const firstApplication = applications.length > 0 ? applications[0] : null;
  const applicationLink = firstApplication
    ? `${window.location.origin}/apply/${firstApplication.shareable_code}`
    : '';
  const portalLink = `${window.location.origin}/portal/${event.slug}`;

  // Show create/edit form
  if (currentView === 'create_app' || currentView === 'edit_app') {
    return (
      <CreateApplicationForm
        event={{
          slug: event.slug,
          title: event.title,
          event_date: event.event_date,
          location: event.location,
        }}
        onBack={() => {
          setCurrentView('settings');
          setSelectedApplication(null);
        }}
        onSuccess={handleApplicationSuccess}
        existingApplication={currentView === 'edit_app' ? selectedApplication || undefined : undefined}
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Application Settings Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <FileText className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Application Settings</h2>
            <p className="text-white/60 text-sm">Control which categories are accepting applications</p>
          </div>
        </div>

        {/* All Applications Master Toggle */}
        <div className="bg-[#1e1536] rounded-xl p-5 border border-purple-500/20 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">All Applications</h3>
              <p className="text-white/60 text-sm">Master toggle for all categories</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${registrationOpen ? 'text-green-400' : 'text-white/60'}`}>
                {registrationOpen ? 'Open' : 'Closed'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={registrationOpen}
                  onChange={(e) => setRegistrationOpen(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-green-600 peer-checked:to-green-500 transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Category Controls */}
        <div className="space-y-3">
          <p className="text-white/60 text-sm uppercase tracking-wide font-semibold">Category Controls</p>

          {loadingApps ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-[#1e1536] rounded-xl p-8 border border-purple-500/20 text-center">
              <FileText className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 mb-4">No application categories created yet</p>
              <button
                onClick={() => setCurrentView('create_app')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                Create First Category
              </button>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="bg-[#1e1536] rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-white font-semibold">{app.name}</h4>
                      {app.pricing?.booth_price != null && (
                        <span className="text-green-400 font-semibold text-sm">
                          ${app.pricing.booth_price.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm">
                      {app.submissions_count} {app.submissions_count === 1 ? 'application' : 'applications'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Pause Button (Coming Soon) */}
                    <button
                      disabled
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white/40 cursor-not-allowed"
                      title="Coming soon"
                    >
                      <Pause className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setSelectedApplication(app);
                        setCurrentView('edit_app');
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/5 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Status Toggle */}
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${app.status === 'active' ? 'text-green-400' : 'text-white/60'}`}>
                        {app.status === 'active' ? 'Accepting' : 'Closed'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={app.status === 'active'}
                          onChange={() => {
                            // TODO: Toggle application status
                            console.log('Toggle application status:', app.id);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-green-600 peer-checked:to-green-500 transition-all"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {applications.length > 0 && (
            <button
              onClick={() => setCurrentView('create_app')}
              className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-white/20 text-white/60 hover:border-purple-500/40 hover:text-white transition-all"
            >
              + Add Category
            </button>
          )}
        </div>
      </div>

      {/* Event Links Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Link className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Event Links</h2>
            <p className="text-white/60 text-sm">Share these links with vendors</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Application Link */}
          {applicationLink && (
            <div className="bg-[#1e1536] rounded-xl p-5 border border-purple-500/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Application Page</h3>
                  <p className="text-white/60 text-sm mb-3">
                    Share this link for vendors to apply to your event
                  </p>
                  <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3">
                    <code className="text-purple-400 text-sm flex-1 overflow-x-auto">
                      {applicationLink}
                    </code>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(applicationLink, 'application')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all"
                    title="Copy link"
                  >
                    {copiedApplicationLink ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={applicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/5 transition-all"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Portal Link */}
          <div className="bg-[#1e1536] rounded-xl p-5 border border-purple-500/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Event Portal</h3>
                <p className="text-white/60 text-sm mb-3">
                  Share this link with accepted vendors to view event details, payment info, and updates
                </p>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3">
                  <code className="text-blue-400 text-sm flex-1 overflow-x-auto">
                    {portalLink}
                  </code>
                </div>
                <p className="text-white/40 text-xs mt-2">
                  Vendors will need their email address to access (must have applied to the event)
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(portalLink, 'portal')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all"
                  title="Copy link"
                >
                  {copiedPortalLink ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={portalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/5 transition-all"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Settings Sections */}
      <div className="space-y-6">
        {/* Visibility Settings */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              {isPublished ? (
                <Eye className="w-5 h-5 text-purple-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Event Visibility</h3>
              <p className="text-white/60 text-sm mb-4">
                {isPublished
                  ? 'Your event is visible to the public and can receive applications.'
                  : 'Your event is hidden from the public. Only you can see it.'}
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-500 transition-all"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="text-white/90 text-sm font-medium">
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Event Status */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Event Status</h3>
              <p className="text-white/60 text-sm mb-4">
                Update the current status of your event.
              </p>
              <div className="max-w-xs">
                <select
                  value={eventStatus}
                  onChange={(e) => setEventStatus(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Danger Zone</h3>
              <p className="text-white/60 text-sm mb-4">
                Permanently delete this event and all associated data. This action cannot be undone.
              </p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  Delete Event
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
