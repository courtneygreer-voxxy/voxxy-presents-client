import { useState } from 'react';
import { Settings, Eye, EyeOff, Users, Calendar, Trash2 } from 'lucide-react';

interface Event {
  id: number;
  slug: string;
  title: string;
  description?: string;
  event_date?: string;
  event_end_date?: string;
  location?: string;
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

interface EventSettingsProps {
  event: Event;
  onUpdate?: (eventSlug: string, updates: any) => Promise<void>;
  onDelete?: (eventSlug: string) => Promise<void>;
}

export default function EventSettings({ event, onUpdate, onDelete }: EventSettingsProps) {
  const [isPublished, setIsPublished] = useState(event.published || event.status?.published || false);
  const [registrationOpen, setRegistrationOpen] = useState(event.status?.registration_open || false);
  const [eventStatus, setEventStatus] = useState<'draft' | 'published' | 'cancelled' | 'completed'>(
    event.status?.status || 'draft'
  );
  const [capacity, setCapacity] = useState(event.capacity?.total?.toString() || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Event Settings</h2>
        <p className="text-white/60 text-sm">Manage visibility, registration, and other event configurations</p>
      </div>

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

        {/* Registration Settings */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Vendor Registration</h3>
              <p className="text-white/60 text-sm mb-4">
                {registrationOpen
                  ? 'Vendors can apply to participate in your event.'
                  : 'Vendor registration is currently closed.'}
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={registrationOpen}
                    onChange={(e) => setRegistrationOpen(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-500 transition-all"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="text-white/90 text-sm font-medium">
                  {registrationOpen ? 'Registration Open' : 'Registration Closed'}
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
