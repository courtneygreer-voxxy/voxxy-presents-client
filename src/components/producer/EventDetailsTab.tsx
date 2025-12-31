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
  Copy
} from 'lucide-react';
import { eventsApi } from '@/services/api';

interface Event {
  id: number;
  slug: string;
  title: string;
  description?: string;
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
}

interface EventDetailsTabProps {
  event: Event;
  onUpdate?: (eventSlug: string, updates: any) => Promise<void>;
}

export default function EventDetailsTab({ event, onUpdate }: EventDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    event_date: event.dates?.start || '',
    event_end_date: event.dates?.end || '',
    start_time: event.dates?.start_time || '',
    end_time: event.dates?.end_time || '',
    venue: event.venue || '',
    location: event.location || '',
    age_restriction: event.age_restriction || '',
    ticket_link: event.ticket_link || '',
    application_deadline: event.application_deadline || '',
  });

  // Update formData when event prop changes
  useEffect(() => {
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_date: event.dates?.start || '',
      event_end_date: event.dates?.end || '',
      start_time: event.dates?.start_time || '',
      end_time: event.dates?.end_time || '',
      venue: event.venue || '',
      location: event.location || '',
      age_restriction: event.age_restriction || '',
      ticket_link: event.ticket_link || '',
      application_deadline: event.application_deadline || '',
    });
  }, [event]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_date: event.dates?.start || '',
      event_end_date: event.dates?.end || '',
      start_time: event.dates?.start_time || '',
      end_time: event.dates?.end_time || '',
      venue: event.venue || '',
      location: event.location || '',
      age_restriction: event.age_restriction || '',
      ticket_link: event.ticket_link || '',
      application_deadline: event.application_deadline || '',
    });
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      await eventsApi.update(event.slug, formData);

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

  // Construct public event URL
  const publicEventUrl = `${window.location.origin}/events/${event.slug}`;

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
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
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

  if (isEditing) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Event Details</h2>
            <p className="text-white/60 text-sm mt-1">Update your event information</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all disabled:opacity-50"
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

        <div className="bg-white/5 rounded-xl p-6 space-y-6">
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

          {/* Application Deadline */}
          <div>
            <label className="block text-white/90 font-medium mb-2">Application Deadline *</label>
            <input
              type="date"
              value={formData.application_deadline}
              onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    );
  }

  // View Mode
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Event Details</h2>
          <p className="text-white/60 text-sm mt-1">View and manage your event information</p>
        </div>
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg transition-all"
        >
          <Edit2 className="w-4 h-4" />
          Edit Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info Card */}
        <div className="bg-white/5 rounded-xl p-6 space-y-4">
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

        {/* Date & Time Card */}
        <div className="bg-white/5 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Date & Time</h3>

          <div>
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <Calendar className="w-4 h-4" />
              Event Date
            </div>
            <p className="text-white">{formatDate(event.dates?.start)}</p>
          </div>

          {event.dates?.end && (
            <div>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Event End Date
              </div>
              <p className="text-white">{formatDate(event.dates.end)}</p>
            </div>
          )}

          {event.dates?.start_time && (
            <div>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                <Clock className="w-4 h-4" />
                Start Time
              </div>
              <p className="text-white">{formatTime(event.dates.start_time)}</p>
            </div>
          )}

          {event.dates?.end_time && (
            <div>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                <Clock className="w-4 h-4" />
                End Time
              </div>
              <p className="text-white">{formatTime(event.dates.end_time)}</p>
            </div>
          )}

          {event.application_deadline && (
            <div>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Application Deadline
              </div>
              <p className="text-white">{formatDate(event.application_deadline)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Public Event URL Card - Split Design */}
      <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-2 border-purple-500/30 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-purple-500/30">
          {/* Left Side - Copy Link */}
          <button
            onClick={handleCopyUrl}
            className="group relative p-6 hover:bg-purple-600/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {copied ? 'Copied!' : 'Copy Link'}
                </h3>
                <p className="text-xs text-white/60">
                  {copied ? 'Link copied to clipboard' : 'Click to copy URL'}
                </p>
              </div>
            </div>
            <div className="text-xs text-purple-300/80 font-mono bg-black/20 px-3 py-2 rounded break-all">
              {publicEventUrl}
            </div>
          </button>

          {/* Right Side - Open Link */}
          <a
            href={publicEventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-6 hover:bg-blue-600/20 transition-all flex items-center justify-center"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors mb-3">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors mb-1">
                Open Event Page
              </h3>
              <p className="text-xs text-white/60">
                View in new window
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
