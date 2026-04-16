import { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  RefreshCw,
  AlertCircle,
  Check,
  Pause,
  Play,
  Link2,
  Calendar,
  ExternalLink,
  Edit2,
  X,
  Save,
} from 'lucide-react';
import {
  organizationIntegrationsApi,
  paymentIntegrationsApi,
  PaymentApiError,
} from '@/services/paymentApi';
import type {
  PaymentIntegration,
  EventbriteEvent,
  CreatePaymentIntegrationRequest,
} from '@/types/payment';

interface EventPaymentSettingsProps {
  eventSlug: string;
  organizationId: number;
  onIntegrationChange?: (integration: PaymentIntegration | null) => void;
}

export default function EventPaymentSettings({
  eventSlug,
  organizationId,
  onIntegrationChange,
}: EventPaymentSettingsProps) {
  const [integration, setIntegration] = useState<PaymentIntegration | null>(null);
  const [eventbriteEvents, setEventbriteEvents] = useState<EventbriteEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [inputMethod, setInputMethod] = useState<'url' | 'dropdown'>('url');
  const [eventbriteUrl, setEventbriteUrl] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);

  // Edit mode state
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editedUrl, setEditedUrl] = useState('');

  useEffect(() => {
    fetchIntegration();
    checkEventbriteConnection();
  }, [eventSlug, organizationId]);

  const checkEventbriteConnection = async () => {
    try {
      const status = await organizationIntegrationsApi.getEventbriteStatus(organizationId);
      setIsConnected(status.connected);

      if (status.connected) {
        fetchEventbriteEvents();
      }
    } catch (err) {
      console.error('Failed to check Eventbrite connection:', err);
    }
  };

  const fetchEventbriteEvents = async () => {
    try {
      const response = await organizationIntegrationsApi.getEventbriteEvents(organizationId);
      setEventbriteEvents(response.events || []);
    } catch (err) {
      console.error('Failed to fetch Eventbrite events:', err);
    }
  };

  const fetchIntegration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const integrations = await paymentIntegrationsApi.getByEvent(eventSlug);
      const eventbriteIntegration = integrations.find((i) => i.provider === 'eventbrite');
      setIntegration(eventbriteIntegration || null);

      if (eventbriteIntegration) {
        setAutoSync(eventbriteIntegration.auto_sync_enabled);
        setAutoUpdate(eventbriteIntegration.auto_update_payment_status);
      }
    } catch (err: any) {
      console.error('Failed to fetch payment integration:', err);
      setError('Failed to load payment integration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIntegration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      let providerEventId: string | undefined;
      let providerUrl: string | undefined;

      if (inputMethod === 'url') {
        if (!eventbriteUrl.trim()) {
          setError('Please enter an Eventbrite event URL');
          return;
        }
        providerUrl = eventbriteUrl.trim();
      } else {
        if (!selectedEventId) {
          setError('Please select an Eventbrite event');
          return;
        }
        providerEventId = selectedEventId;
        const selectedEvent = eventbriteEvents.find((e) => e.id === selectedEventId);
        if (selectedEvent) {
          providerUrl = selectedEvent.url;
        }
      }

      const data: CreatePaymentIntegrationRequest = {
        provider: 'eventbrite',
        provider_event_id: providerEventId,
        provider_url: providerUrl,
        auto_sync_enabled: autoSync,
        auto_update_payment_status: autoUpdate,
        auto_send_confirmations: false,
      };

      const newIntegration = await paymentIntegrationsApi.create(eventSlug, data);
      setIntegration(newIntegration);
      setSuccess('Payment integration created successfully!');
      setEventbriteUrl('');
      setSelectedEventId('');
      onIntegrationChange?.(newIntegration);
    } catch (err: any) {
      console.error('Failed to create integration:', err);
      setError(err.message || 'Failed to create payment integration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoSync = async () => {
    if (!integration) return;

    try {
      setIsLoading(true);
      setError(null);

      const updated = await paymentIntegrationsApi.update(eventSlug, integration.id, {
        auto_sync_enabled: !integration.auto_sync_enabled,
      });

      setIntegration(updated);
      setAutoSync(updated.auto_sync_enabled);
      setSuccess(`Auto-sync ${updated.auto_sync_enabled ? 'enabled' : 'disabled'}`);
      onIntegrationChange?.(updated);
    } catch (err: any) {
      console.error('Failed to toggle auto-sync:', err);
      setError(err.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEditUrl = () => {
    setEditedUrl(integration?.provider_url || '');
    setIsEditingUrl(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEditUrl = () => {
    setIsEditingUrl(false);
    setEditedUrl('');
  };

  const handleSaveUrl = async () => {
    if (!integration) return;

    if (!editedUrl.trim()) {
      setError('Please enter a valid Eventbrite URL');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const updated = await paymentIntegrationsApi.update(eventSlug, integration.id, {
        provider_url: editedUrl.trim(),
      });

      setIntegration(updated);
      setIsEditingUrl(false);
      setEditedUrl('');
      setSuccess('Ticket link updated successfully!');
      onIntegrationChange?.(updated);
    } catch (err: any) {
      console.error('Failed to update ticket link:', err);
      setError(err.message || 'Failed to update ticket link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!integration) return;

    try {
      setIsSyncing(true);
      setError(null);
      setSuccess(null);

      const response = await paymentIntegrationsApi.sync(eventSlug, integration.id);
      setSuccess(
        `Sync completed! Fetched ${response.sync_log.transactions_fetched} transactions, matched ${response.sync_log.contacts_matched} vendors`
      );

      await fetchIntegration();
    } catch (err: any) {
      console.error('Failed to sync payments:', err);
      setError(err.message || 'Failed to sync payments');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteIntegration = async () => {
    if (!integration) return;

    if (
      !confirm(
        'Are you sure you want to delete this payment integration? This will not delete existing payment records.'
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await paymentIntegrationsApi.delete(eventSlug, integration.id);
      setIntegration(null);
      setSuccess('Payment integration deleted');
      onIntegrationChange?.(null);
    } catch (err: any) {
      console.error('Failed to delete integration:', err);
      setError(err.message || 'Failed to delete integration');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-200 mb-1">Eventbrite Not Connected</h3>
            <p className="text-sm text-yellow-300/80">
              Please connect your Eventbrite account in Organization Settings before enabling payment
              syncing for events.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-200">{success}</p>
        </div>
      )}

      {!integration ? (
        <div className="bg-background/5 rounded-lg border border-border p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Enable Payment Syncing</h3>
              <p className="text-sm text-foreground/60">
                Connect this event to an Eventbrite event to automatically sync vendor payments
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-3">
              How would you like to connect?
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setInputMethod('url')}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  inputMethod === 'url'
                    ? 'border-purple-500 bg-purple-500/20 text-foreground'
                    : 'border-border hover:border-border text-foreground/70'
                }`}
              >
                <Link2 className="w-5 h-5 mb-2 mx-auto" />
                <p className="font-medium text-sm">Paste Event URL</p>
              </button>
              <button
                onClick={() => setInputMethod('dropdown')}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  inputMethod === 'dropdown'
                    ? 'border-purple-500 bg-purple-500/20 text-foreground'
                    : 'border-border hover:border-border text-foreground/70'
                }`}
              >
                <Calendar className="w-5 h-5 mb-2 mx-auto" />
                <p className="font-medium text-sm">Select from List</p>
              </button>
            </div>
          </div>

          {inputMethod === 'url' ? (
            <div>
              <label htmlFor="eventbrite-url" className="block text-sm font-medium text-foreground/90 mb-2">
                Eventbrite Event URL
              </label>
              <input
                id="eventbrite-url"
                type="text"
                value={eventbriteUrl}
                onChange={(e) => setEventbriteUrl(e.target.value)}
                placeholder="https://www.eventbrite.com/e/your-event-name-123456789"
                className="w-full px-4 py-2 bg-background/5 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-foreground/60">
                Paste the URL of your Eventbrite event (e.g., from the event dashboard)
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="eventbrite-event" className="block text-sm font-medium text-foreground/90 mb-2">
                Select Eventbrite Event
              </label>
              <select
                id="eventbrite-event"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-4 py-2 bg-background/5 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">Choose an event...</option>
                {eventbriteEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name.text} ({event.status})
                  </option>
                ))}
              </select>
              {eventbriteEvents.length === 0 && (
                <p className="mt-2 text-sm text-foreground/60">No Eventbrite events found</p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 border-border rounded focus:ring-purple-500"
              />
              <div>
                <span className="font-medium text-sm text-foreground">Auto-sync every 15 minutes</span>
                <p className="text-sm text-foreground/60">
                  Automatically check for new payments and update vendor statuses
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 border-border rounded focus:ring-purple-500"
              />
              <div>
                <span className="font-medium text-sm text-foreground">
                  Auto-update payment status
                </span>
                <p className="text-sm text-foreground/60">
                  Automatically mark vendors as paid and trigger confirmation emails
                </p>
              </div>
            </label>
          </div>

          <button
            onClick={handleCreateIntegration}
            disabled={isLoading}
            className="w-full px-6 py-3 voxxy-btn-solid rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? 'Creating...' : 'Enable Payment Syncing'}
          </button>
        </div>
      ) : (
        <div className="bg-background/5 rounded-lg border border-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Payment Syncing Enabled</h3>
                <p className="text-sm text-foreground/60">
                  Status: <span className="capitalize">{integration.sync_status}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleAutoSync}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  integration.auto_sync_enabled
                    ? 'bg-green-500/20 text-emerald-900 dark:text-green-400 hover:bg-green-500/30'
                    : 'bg-background/10 text-foreground/60 hover:bg-background/20'
                }`}
                title={integration.auto_sync_enabled ? 'Disable auto-sync' : 'Enable auto-sync'}
              >
                {integration.auto_sync_enabled ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="p-2 bg-purple-500/20 text-violet-950 dark:text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                title="Sync now"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background/5 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-foreground/60">Eventbrite Event</p>
                {!isEditingUrl && (
                  <button
                    onClick={handleStartEditUrl}
                    disabled={isLoading}
                    className="p-1 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                    title="Edit ticket link"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isEditingUrl ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedUrl}
                    onChange={(e) => setEditedUrl(e.target.value)}
                    placeholder="https://www.eventbrite.com/e/..."
                    className="w-full px-3 py-2 text-sm bg-background/5 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUrl}
                      disabled={isLoading}
                      className="flex-1 px-3 py-1.5 text-xs voxxy-btn-solid rounded disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditUrl}
                      disabled={isLoading}
                      className="flex-1 px-3 py-1.5 text-xs bg-background/10 text-foreground rounded hover:bg-background/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium text-sm text-foreground truncate">{integration.provider_event_id || 'Connected'}</p>
                  {integration.provider_url && (
                    <a
                      href={integration.provider_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      View on Eventbrite
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </>
              )}
            </div>

            <div className="p-4 bg-background/5 rounded-lg border border-border">
              <p className="text-sm text-foreground/60 mb-1">Last Synced</p>
              <p className="font-medium text-sm text-foreground">
                {integration.last_synced_at
                  ? new Date(integration.last_synced_at).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>

          {integration.latest_sync_log && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <h4 className="font-medium text-sm text-purple-200 mb-2">Latest Sync Results</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-purple-300">Transactions: {integration.latest_sync_log.transactions_fetched}</p>
                </div>
                <div>
                  <p className="text-purple-300">Matched: {integration.latest_sync_log.contacts_matched}</p>
                </div>
                <div>
                  <p className="text-purple-300">Updated: {integration.latest_sync_log.registrations_updated}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleManualSync}
              disabled={isSyncing || isLoading}
              className="flex-1 px-6 py-3 voxxy-btn-solid rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>

            <button
              onClick={handleDeleteIntegration}
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 text-destructive-foreground rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Disable
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
