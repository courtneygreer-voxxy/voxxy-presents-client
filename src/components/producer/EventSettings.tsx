import { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Users, Calendar, Trash2, FileText, Edit, Pause } from 'lucide-react';
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
  const [capacity, setCapacity] = useState(event.capacity?.total?.toString() || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        capacity: capacity ? parseInt(capacity) : null,
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
      {/* Event Details Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Settings className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Event Details</h2>
              <p className="text-white/60 text-sm">Core event information • Changes will notify all applicants</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/5 transition-all">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="bg-[#1e1536] rounded-xl p-6 border border-purple-500/20 space-y-6">
          {/* Event Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">EVENT NAME</label>
              <p className="text-white font-medium">{event.title}</p>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">APPLICATION DEADLINE</label>
              <p className="text-white font-medium">
                {event.application_deadline
                  ? new Date(event.application_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'Not set'}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">DATE & TIME</label>
              <p className="text-white font-medium">
                {event.event_date
                  ? `${new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
                  : 'Not set'}
              </p>
              {event.start_time && event.end_time && (
                <p className="text-white/60 text-sm mt-1">
                  {event.start_time} - {event.end_time}
                </p>
              )}
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">PAYMENT DUE DATE</label>
              <p className="text-white font-medium">
                {event.payment_due_date
                  ? new Date(event.payment_due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'Not set'}
              </p>
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-white/70 text-sm mb-2">VENUE</label>
            <p className="text-white font-medium">{event.venue || 'Not set'}</p>
            {event.location && (
              <p className="text-white/60 text-sm mt-1">{event.location}</p>
            )}
          </div>

          {/* Ticket Link & Age Restriction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">TICKET LINK</label>
              {event.ticket_link ? (
                <a
                  href={event.ticket_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors break-all"
                >
                  {event.ticket_link}
                </a>
              ) : (
                <p className="text-white/60">Not set</p>
              )}
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">AGE RESTRICTION</label>
              <p className="text-white font-medium">{event.age_restriction || 'All Ages'}</p>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <label className="block text-white/70 text-sm mb-2">EVENT DETAILS</label>
            <p className="text-white/80">{event.description || 'No description provided'}</p>
          </div>
        </div>
      </div>

      {/* Links & Embed Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Links & Embed</h2>
            <p className="text-white/60 text-sm">Share your application page or embed it on your website</p>
          </div>
        </div>

        <div className="bg-[#1e1536] rounded-xl p-6 border border-purple-500/20 space-y-4">
          {/* Application Page Link */}
          <div>
            <label className="block text-white/70 text-sm mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Application Page Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`${window.location.origin}/apply/${event.slug}`}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg bg-[#0f0a1f] border border-white/10 text-white text-sm focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/apply/${event.slug}`);
                }}
                className="p-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                title="Copy link"
              >
                <FileText className="w-4 h-4" />
              </button>
              <a
                href={`${window.location.origin}/apply/${event.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                title="Open in new tab"
              >
                <Eye className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Event Portal Link (for accepted vendors) */}
          <div>
            <label className="block text-white/70 text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Event Portal Link
            </label>
            <p className="text-white/60 text-xs mb-2">
              Accepted vendors use their registration code to access live event details and updates
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`${window.location.origin}/events/${event.slug}/portal`}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg bg-[#0f0a1f] border border-white/10 text-white text-sm focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/events/${event.slug}/portal`);
                }}
                className="p-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                title="Copy link"
              >
                <FileText className="w-4 h-4" />
              </button>
              <a
                href={`${window.location.origin}/events/${event.slug}/portal`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
                title="Open in new tab"
              >
                <Eye className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

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

        {/* Capacity Settings */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Vendor Capacity</h3>
              <p className="text-white/60 text-sm mb-4">
                Set the maximum number of vendors that can participate in this event.
              </p>
              <div className="max-w-xs">
                <label className="block text-white/90 text-sm mb-2">Maximum Vendors</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="Unlimited"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {event.capacity?.registered !== undefined && (
                  <p className="text-white/60 text-xs mt-2">
                    Currently registered: {event.capacity.registered} vendors
                  </p>
                )}
              </div>
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
