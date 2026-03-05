import { useState, useEffect } from 'react';
import { Eye, EyeOff, Calendar, Trash2, FileText, Edit, Pause, Link, Copy, ExternalLink, Check, X, Download, Database } from 'lucide-react';
import { vendorApplicationsApi, registrationsApi, eventInvitationsApi } from '@/services/api';
import CreateApplicationForm from './CreateApplicationForm';
import { formatDateForInput, formatEventDate } from '@/utils/dateHelpers';
import { DebugPanel } from './DebugPanel';

interface Event {
  id: number;
  slug: string;
  namespaced_slug?: string;
  title: string;
  description?: string;
  event_date?: string;
  event_end_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  location?: string;
  application_deadline?: string;
  payment_deadline?: string;
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
  event_portal?: {
    access_token: string;
    view_count: number;
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
  install_date?: string;
  install_start_time?: string;
  install_end_time?: string;
  payment_link?: string;
  application_tags?: string;
}

interface EventSettingsProps {
  event: Event;
  onUpdate?: (eventSlug: string, updates: any) => Promise<void>;
  onDelete?: (eventSlug: string) => Promise<void>;
  isAdmin?: boolean;
}

type View = 'settings' | 'create_app' | 'edit_app';

export default function EventSettings({ event, onUpdate, onDelete, isAdmin }: EventSettingsProps) {
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

  // Event details edit state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    event_date: formatDateForInput(event.event_date) || '',
    event_end_date: formatDateForInput(event.event_end_date) || '',
    start_time: event.start_time || '',
    end_time: event.end_time || '',
    venue: event.venue || '',
    location: event.location || '',
    application_deadline: formatDateForInput(event.application_deadline) || '',
    payment_deadline: formatDateForInput(event.payment_deadline) || '',
  });

  // Copy link states
  const [copiedEventPageLink, setCopiedEventPageLink] = useState(false);
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

  const handleSaveEventDetails = async () => {
    if (!onUpdate) {
      alert('Event details will be saved');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdate(event.slug, eventFormData);
      setIsEditingDetails(false);
      alert('Event details saved successfully!');
    } catch (err) {
      console.error('Failed to save event details:', err);
      alert('Failed to save event details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditDetails = () => {
    setEventFormData({
      title: event.title || '',
      description: event.description || '',
      event_date: formatDateForInput(event.event_date) || '',
      event_end_date: formatDateForInput(event.event_end_date) || '',
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      venue: event.venue || '',
      location: event.location || '',
      application_deadline: formatDateForInput(event.application_deadline) || '',
      payment_deadline: formatDateForInput(event.payment_deadline) || '',
    });
    setIsEditingDetails(false);
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

  const copyToClipboard = async (text: string, type: 'eventpage' | 'portal') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'eventpage') {
        setCopiedEventPageLink(true);
        setTimeout(() => setCopiedEventPageLink(false), 2000);
      } else {
        setCopiedPortalLink(true);
        setTimeout(() => setCopiedPortalLink(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link to clipboard');
    }
  };

  const handleExportInvitesCSV = async () => {
    try {
      console.log('🔍 === CSV Export Debug ===');
      console.log('Event slug:', event.slug);

      // Fetch all invitations and registrations
      let invitationsResponse: any = { invitations: [] };
      let registrations: any = { vendor_registrations: [] };

      try {
        invitationsResponse = await eventInvitationsApi.getByEvent(event.slug, 1, 1000);
        console.log('📨 Invitations API Response:', {
          count: invitationsResponse?.invitations?.length || 0,
          sampleInvitation: invitationsResponse?.invitations?.[0] || 'none',
          allFieldsInSample: invitationsResponse?.invitations?.[0] ? Object.keys(invitationsResponse.invitations[0]) : []
        });
      } catch (err) {
        console.warn('No invitations found or error fetching invitations:', err);
      }

      try {
        registrations = await registrationsApi.getByEvent(event.slug);
        console.log('📝 Registrations API Response:', {
          count: registrations?.vendor_registrations?.length || 0,
          sampleRegistration: registrations?.vendor_registrations?.[0] || 'none',
          allFieldsInSample: registrations?.vendor_registrations?.[0] ? Object.keys(registrations.vendor_registrations[0]) : []
        });
      } catch (err) {
        console.warn('No registrations found or error fetching registrations:', err);
      }

      // Combine and format data for CSV
      const csvData: any[] = [];

      // Add invitations
      const invitations = invitationsResponse?.invitations || [];
      invitations.forEach((inv: any) => {
        const csvRow = {
          name: inv.contact_name || inv.name || '',
          email: inv.contact_email || inv.email || '',
          business_name: inv.business_name || '',
          category: inv.vendor_category || '',
          status: 'Invited',
          invited_at: inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '',
          applied: 'No',
          application_date: '',
          application_status: '',
          payment_status: ''
        };
        csvData.push(csvRow);
      });
      console.log(`✅ Processed ${invitations.length} invitations`);

      // Add registrations (applications)
      const registrationList = registrations?.vendor_registrations || [];
      registrationList.forEach((reg: any) => {
        const csvRow = {
          name: reg.name || '',
          email: reg.email || '',
          business_name: reg.business_name || '',
          category: reg.vendor_category || '',
          status: 'Applied',
          invited_at: '',
          applied: 'Yes',
          application_date: reg.created_at ? new Date(reg.created_at).toLocaleDateString() : '',
          application_status: reg.status || '',
          payment_status: reg.payment_status || ''
        };
        csvData.push(csvRow);
      });
      console.log(`✅ Processed ${registrationList.length} registrations`);

      console.log('📊 CSV Data Summary:', {
        totalRows: csvData.length,
        sampleRows: csvData.slice(0, 3),
        emptyFields: csvData.map(row => ({
          name: !row.name,
          email: !row.email,
          business_name: !row.business_name,
          category: !row.category
        })).filter(row => row.name || row.email || row.business_name || row.category).length
      });

      // Convert to CSV
      if (csvData.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = ['Name', 'Email', 'Business Name', 'Category', 'Status', 'Invited At', 'Applied', 'Application Date', 'Application Status', 'Payment Status'];
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => [
          `"${row.name}"`,
          `"${row.email}"`,
          `"${row.business_name}"`,
          `"${row.category}"`,
          `"${row.status}"`,
          `"${row.invited_at}"`,
          `"${row.applied}"`,
          `"${row.application_date}"`,
          `"${row.application_status}"`,
          `"${row.payment_status}"`
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${event.slug}-invites-and-applications-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export CSV: ' + (err.message || 'Unknown error'));
    }
  };

  // Generate public event page URL using namespaced slug
  // Format: /events/[org-slug]-[org_id]/[event-slug]-[event_id]
  const eventPageLink = `${window.location.origin}/events/${event.namespaced_slug || event.slug}`;

  // Generate portal URL using namespaced slug
  const portalLink = `${window.location.origin}/portal/${event.namespaced_slug || event.slug}`;

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
    <div className="p-3 md:p-4 max-w-6xl mx-auto space-y-8">
      {/* Event Details Section - MOVED TO TOP */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Edit className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Event Details</h2>
            <p className="text-white/60 text-sm">Manage basic event information</p>
          </div>
        </div>

        <div className="bg-[#1e1536] rounded-xl p-6 border border-purple-500/20">
          {!isEditingDetails ? (
            <>
              {/* View Mode */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Event Title</p>
                    <p className="text-white">{event.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-1">Venue</p>
                    <p className="text-white">{event.venue || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-1">Location</p>
                    <p className="text-white">{event.location || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-1">Event Date</p>
                    <p className="text-white">{event.event_date ? formatEventDate(event.event_date, 'MMM d, yyyy') : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-1">Application Deadline</p>
                    <p className="text-white">{event.application_deadline ? formatEventDate(event.application_deadline, 'MMM d, yyyy') : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-1">Payment Deadline</p>
                    <p className="text-white">{event.payment_deadline ? formatEventDate(event.payment_deadline, 'MMM d, yyyy') : '—'}</p>
                  </div>
                </div>
                {event.description && (
                  <div>
                    <p className="text-xs text-white/60 mb-1">Description</p>
                    <p className="text-white text-sm">{event.description}</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setIsEditingDetails(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit Details
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Description</label>
                  <textarea
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Venue</label>
                    <input
                      type="text"
                      value={eventFormData.venue}
                      onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Location</label>
                    <input
                      type="text"
                      value={eventFormData.location}
                      onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Event Date</label>
                    <input
                      type="date"
                      value={eventFormData.event_date}
                      onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">End Date</label>
                    <input
                      type="date"
                      value={eventFormData.event_end_date}
                      onChange={(e) => setEventFormData({ ...eventFormData, event_end_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={eventFormData.start_time}
                      onChange={(e) => setEventFormData({ ...eventFormData, start_time: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">End Time</label>
                    <input
                      type="time"
                      value={eventFormData.end_time}
                      onChange={(e) => setEventFormData({ ...eventFormData, end_time: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Application Deadline</label>
                    <input
                      type="date"
                      value={eventFormData.application_deadline}
                      onChange={(e) => setEventFormData({ ...eventFormData, application_deadline: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Payment Deadline</label>
                    <input
                      type="date"
                      value={eventFormData.payment_deadline}
                      onChange={(e) => setEventFormData({ ...eventFormData, payment_deadline: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEventDetails}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEditDetails}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
              </div>
            </>
          )}
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
          {/* Application Page Link */}
          <div className="bg-[#1e1536] rounded-xl p-5 border border-purple-500/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Application Page</h3>
                <p className="text-white/60 text-sm mb-3">
                  Share this link to the public application page where vendors can apply
                </p>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3">
                  <code className="text-purple-400 text-sm flex-1 overflow-x-auto">
                    {eventPageLink}
                  </code>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(eventPageLink, 'eventpage')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all"
                  title="Copy link"
                >
                  {copiedEventPageLink ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={eventPageLink}
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

          {/* Portal Link */}
          <div className="bg-[#1e1536] rounded-xl p-5 border border-purple-500/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Vendor Portal</h3>
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

        {/* Data Export Section */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Data Export</h3>
              <p className="text-white/60 text-sm mb-4">
                Export your event data for offline use or integration with other tools.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/30 transition-all">
                  <div>
                    <h4 className="text-white text-sm font-medium mb-1">Invites & Applications CSV</h4>
                    <p className="text-white/50 text-xs">
                      Download all invited contacts and submitted applications with their current status
                    </p>
                  </div>
                  <button
                    onClick={handleExportInvitesCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
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

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Event Settings Tab"
        data={{
          event,
          currentView,
          applications,
          selectedApplication,
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
