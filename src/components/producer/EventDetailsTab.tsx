import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Edit2,
  Save,
  X,
  Building2,
  Users,
  Link as LinkIcon,
  Tag,
  AlertCircle,
  Check,
  Copy,
  Mail,
  Settings,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { eventsApi, vendorApplicationsApi } from '@/services/api';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { EmailConfirmationDialog } from './EmailConfirmationDialog';
import GoLiveCard from './GoLiveCard';
import HomeDashboard from './HomeDashboard';
import { formatEventDate } from '@/utils/dateHelpers';

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
  dates?: {
    start?: string;
    end?: string;
    start_time?: string;
    end_time?: string;
  };
  venue?: string;
  location?: string;
  age_restriction?: string;
  ticket_link?: string;
  application_deadline?: string;
  payment_deadline?: string;
}

interface EventDetailsTabProps {
  event: Event;
  onUpdate?: (eventSlug: string, updates: any) => Promise<void>;
  onNavigateToTab?: (tab: string) => void;
  onRefreshEvent?: () => Promise<void>;
  organizationId?: number;
  isAdmin?: boolean;
}

interface ApplicationStats {
  total: number;
  new: number;
  approved: number;
  waitlisted: number;
}

export default function EventDetailsTab({ event, onUpdate, onNavigateToTab, onRefreshEvent, organizationId, isAdmin }: EventDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Email notifications hook
  const { dialogOpen, dialogProps, handleEmailNotification, handleConfirmSend, closeDialog } = useEmailNotifications();
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    new: 0,
    approved: 0,
    waitlisted: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    event_date: event.event_date || event.dates?.start || '',
    event_end_date: event.event_end_date || event.dates?.end || '',
    start_time: event.start_time || event.dates?.start_time || '',
    end_time: event.end_time || event.dates?.end_time || '',
    venue: event.venue || '',
    location: event.location || '',
    age_restriction: event.age_restriction || '',
    ticket_link: event.ticket_link || '',
    application_deadline: event.application_deadline || '',
    payment_deadline: event.payment_deadline || '',
  });

  // Update formData when event prop changes
  useEffect(() => {
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date || event.dates?.start || '',
      event_end_date: event.event_end_date || event.dates?.end || '',
      start_time: event.start_time || event.dates?.start_time || '',
      end_time: event.end_time || event.dates?.end_time || '',
      venue: event.venue || '',
      location: event.location || '',
      age_restriction: event.age_restriction || '',
      ticket_link: event.ticket_link || '',
      application_deadline: event.application_deadline || '',
      payment_deadline: event.payment_deadline || '',
    });
  }, [event]);

  // Fetch application stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const applications = await vendorApplicationsApi.getByEvent(event.slug);

        // Calculate stats from all applications
        let totalApplicants = 0;
        let newApplicants = 0;
        let approvedApplicants = 0;
        let waitlistedApplicants = 0;

        for (const app of applications) {
          try {
            const submissions = await vendorApplicationsApi.getSubmissions(app.id);
            totalApplicants += submissions.length;

            submissions.forEach((sub: any) => {
              if (sub.status === 'pending') newApplicants++;
              if (sub.status === 'approved') approvedApplicants++;
              if (sub.status === 'waitlist') waitlistedApplicants++;
            });
          } catch (err) {
            console.error('Failed to fetch submissions for app', app.id, err);
          }
        }

        setStats({
          total: totalApplicants,
          new: newApplicants,
          approved: approvedApplicants,
          waitlisted: waitlistedApplicants,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [event.slug]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date || event.dates?.start || '',
      event_end_date: event.event_end_date || event.dates?.end || '',
      start_time: event.start_time || event.dates?.start_time || '',
      end_time: event.end_time || event.dates?.end_time || '',
      venue: event.venue || '',
      location: event.location || '',
      age_restriction: event.age_restriction || '',
      ticket_link: event.ticket_link || '',
      application_deadline: event.application_deadline || '',
      payment_deadline: event.payment_deadline || '',
    });
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await eventsApi.update(event.slug, formData);

      // Check if email notification is needed
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, event.slug);
      }

      if (onUpdate) {
        await onUpdate(event.slug, formData);
      }

      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update event:', err);
      setError(err.message || 'Failed to update event details');
    } finally {
      setIsSaving(false);
    }
  };

  // Construct public event URL using namespaced slug
  const publicEventUrl = `${window.location.origin}/events/${event.namespaced_slug || event.slug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicEventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return formatEventDate(dateString, 'EEEE, MMMM d, yyyy') || dateString;
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Not set';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  return (
    <>
      <HomeDashboard eventSlug={event.slug} event={event} onNavigateToTab={onNavigateToTab} onRefreshEvent={onRefreshEvent} organizationId={organizationId} isAdmin={isAdmin} />
      {/* Original detailed view below - can be accessed via Edit button */}
      <div className="hidden p-6 space-y-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applicants Card */}
        <div
          onClick={() => onNavigateToTab?.('applicants')}
          className="bg-[#1e1536] rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all group cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
          </div>
          <div className="mb-2">
            <p className="text-white/60 text-sm mb-1">Total Applicants</p>
            <p className="text-3xl font-bold text-white">
              {loadingStats ? '...' : stats.total}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span>{stats.new} new</span>
            <span>•</span>
            <span>{stats.approved} approved</span>
            <span>•</span>
            <span>{stats.waitlisted} waitlisted</span>
          </div>
        </div>

        {/* Confirmed Vendors Card */}
        <div
          onClick={() => onNavigateToTab?.('vendors')}
          className="bg-[#1e1536] rounded-xl p-5 border border-green-500/20 hover:border-green-500/40 transition-all group cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
          </div>
          <div className="mb-2">
            <p className="text-white/60 text-sm mb-1">Confirmed Vendors</p>
            <p className="text-3xl font-bold text-white">
              {loadingStats ? '...' : stats.approved}
            </p>
          </div>
          <p className="text-xs text-white/50">Approved & paid vendors ready for event</p>
        </div>

        {/* Event Settings Card */}
        <div
          onClick={handleEdit}
          className="bg-[#1e1536] rounded-xl p-5 border border-orange-500/20 hover:border-orange-500/40 transition-all group cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-lg bg-orange-500/20">
              <Settings className="w-6 h-6 text-orange-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
          </div>
          <div className="mb-2">
            <p className="text-white/60 text-sm mb-1">Event Settings</p>
            <p className="text-lg font-semibold text-white">Edit Event Details</p>
          </div>
          <p className="text-xs text-white/50">Update venue, dates, categories, and more</p>
        </div>
      </div>

      {/* Link Sharing Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Copy Link Button */}
        <button
          onClick={handleCopyUrl}
          className="flex items-center justify-between p-4 bg-[#1e1536] rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                {copied ? 'Link Copied!' : 'Copy Link'}
              </p>
              <p className="text-xs text-white/60">Share event URL</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
        </button>

        {/* View Link Button */}
        <a
          href={publicEventUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-[#1e1536] rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
              <ExternalLink className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">View Link</p>
              <p className="text-xs text-white/60">Open application page</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
        </a>
      </div>

      {/* Go Live Card - moved here from above */}
      <GoLiveCard
        event={event}
        onGoLive={() => window.location.reload()}
        organizationId={organizationId}
      />

      {/* Edit Form (Hidden by default) */}
      {isEditing && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-xl font-bold text-white">Edit Event Details</h3>
              <p className="text-white/60 text-sm mt-1">Update your event information</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/5 transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-[#1e1536] rounded-xl p-6 border border-purple-500/20 space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-white/90 font-medium mb-2">Event Name *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Event Description */}
            <div>
              <label className="block text-white/90 font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Venue & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 font-medium mb-2">Venue</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g., Brooklyn Steel"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/90 font-medium mb-2">Location (City) *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Brooklyn, NY"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Event Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 font-medium mb-2">Event Date *</label>
                <p className="text-white/50 text-xs mb-2">Start date for multi-day events</p>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/90 font-medium mb-2">Event End Date</label>
                <p className="text-white/50 text-xs mb-2">Optional for multi-day events</p>
                <input
                  type="date"
                  value={formData.event_end_date}
                  onChange={(e) => setFormData({ ...formData, event_end_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Event Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/90 font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Age Restriction */}
            <div>
              <label className="block text-white/90 font-medium mb-2">Age Restriction</label>
              <input
                type="text"
                value={formData.age_restriction}
                onChange={(e) => setFormData({ ...formData, age_restriction: e.target.value })}
                placeholder="e.g., All Ages, 18+, 21+"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Ticket Link */}
            <div>
              <label className="block text-white/90 font-medium mb-2">Ticket Link</label>
              <input
                type="url"
                value={formData.ticket_link}
                onChange={(e) => setFormData({ ...formData, ticket_link: e.target.value })}
                placeholder="https://example.com/tickets"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Application Deadline & Payment Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 font-medium mb-2">Application Deadline *</label>
                <p className="text-white/50 text-xs mb-2">Deadline for vendors to submit applications</p>
                <input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/90 font-medium mb-2">Payment Deadline</label>
                <p className="text-white/50 text-xs mb-2">Deadline for approved vendors to pay</p>
                <input
                  type="date"
                  value={formData.payment_deadline}
                  onChange={(e) => setFormData({ ...formData, payment_deadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Display (Always visible) */}
      {!isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info Card */}
          <div className="bg-[#1e1536] rounded-xl p-6 border border-purple-500/20 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>

            <div>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                <Tag className="w-4 h-4" />
                Event Name
              </div>
              <p className="text-white font-medium">{event.title}</p>
            </div>

            {event.description && (
              <div>
                <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Description
                </div>
                <p className="text-white/80">{event.description}</p>
              </div>
            )}

            {event.venue && (
              <div>
                <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                  <Building2 className="w-4 h-4" />
                  Venue
                </div>
                <p className="text-white">{event.venue}</p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                Location
              </div>
              <p className="text-white">{event.location || 'Not set'}</p>
            </div>

            {event.age_restriction && (
              <div>
                <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                  <Users className="w-4 h-4" />
                  Age Restriction
                </div>
                <p className="text-white">{event.age_restriction}</p>
              </div>
            )}

            {event.ticket_link && (
              <div>
                <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                  <LinkIcon className="w-4 h-4" />
                  Ticket Link
                </div>
                <a
                  href={event.ticket_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline break-all"
                >
                  {event.ticket_link}
                </a>
              </div>
            )}
          </div>

          {/* Date & Time Card - Hidden to avoid timezone display issues */}
          {/* Users can view/edit dates in the Settings tab */}
        </div>
      )}

      {/* Email Confirmation Dialog */}
      <EmailConfirmationDialog
        open={dialogOpen}
        onOpenChange={closeDialog}
        onConfirm={handleConfirmSend}
        title={dialogProps.title}
        warning={dialogProps.warning}
        recipientCount={dialogProps.recipientCount}
        recipientEmail={dialogProps.recipientEmail}
        type={dialogProps.type}
        isLoading={dialogProps.isLoading}
      />
      </div>
    </>
  );
}
