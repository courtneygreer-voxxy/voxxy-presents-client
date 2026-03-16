import { useState, useEffect, useRef } from 'react';
import { Send, Mail, AlertCircle, Check, Edit } from 'lucide-react';
import { eventsApi } from '@/services/api';
import GoLiveInvitationEditor from './GoLiveInvitationEditor';

interface GoLiveCardProps {
  event: any;
  onGoLive: () => void | Promise<void>;
  organizationId?: number;
}

export default function GoLiveCard({ event, onGoLive, organizationId }: GoLiveCardProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [updatingInvitations, setUpdatingInvitations] = useState(false);

  // Track previous invitation count to detect changes
  const prevCountRef = useRef<number>(0);

  // Live status state - use state instead of derived value to ensure re-renders
  const [isLive, setIsLive] = useState(event.status?.is_live || false);

  // Update isLive when event prop changes (fixes issue where state doesn't update after going live)
  useEffect(() => {
    const newIsLive = event.status?.is_live || false;
    console.log('🔄 [GoLiveCard] Event status changed:', {
      slug: event.slug,
      isLive: newIsLive,
      status: event.status
    });
    setIsLive(newIsLive);
  }, [event, event.status?.is_live]);

  const invitationCount = event.invitation_draft?.total_count || 0;
  const hasInvitations = invitationCount > 0;

  // Count scheduled emails that are paused
  // Note: This would need to be passed from parent or fetched separately
  // For now, we'll show a generic message
  const hasScheduledEmails = true;

  const handleSaveInvitations = async (data: {
    invitation_list_ids: number[];
    invitation_contact_ids: number[];
    invitation_excluded_ids: number[];
  }) => {
    setUpdatingInvitations(true);
    setError(null);

    try {
      await eventsApi.update(event.slug, data);
      await onGoLive();
      setShowEditor(false);
    } catch (err: any) {
      console.error('Failed to update invitation list:', err);
      setError(err.message || 'Failed to update invitation list');
    } finally {
      setUpdatingInvitations(false);
    }
  };

  const handleGoLive = async () => {
    setLoading(true);
    setError(null);

    try {
      await eventsApi.goLive(event.slug);
      setSuccess(true);
      setShowConfirm(false);
      await onGoLive();
      setSuccess(false);
    } catch (err: any) {
      console.error('Failed to go live:', err);
      setError(err.message || 'Failed to activate event');
    } finally {
      setLoading(false);
    }
  };

  // Already live - show success state
  if (isLive) {
    return (
      <div className="bg-[#1e1536] rounded-xl p-5 border border-green-500/20">
        <div className="flex items-start justify-between mb-3">
          <div className="p-3 rounded-lg bg-green-500/20">
            <Check className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="mb-2">
          <p className="text-white/60 text-sm mb-1">Event Status</p>
          <p className="text-lg font-semibold text-white">Live</p>
        </div>
        <p className="text-xs text-white/50">
          Invitations sent, emails active
        </p>
      </div>
    );
  }

  // Success animation
  if (success) {
    return (
      <div className="bg-[#1e1536] rounded-xl p-5 border-2 border-green-500/30 animate-pulse">
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <Check className="w-8 h-8 text-green-400" />
          <p className="text-sm font-semibold text-green-300">
            Going live...
          </p>
        </div>
      </div>
    );
  }

  // Confirmation dialog
  if (showConfirm) {
    return (
      <div className="bg-[#1e1536] rounded-xl p-5 border-2 border-purple-500/30">
        <div className="flex items-start justify-between mb-3">
          <div className="p-3 rounded-lg bg-purple-500/20">
            <AlertCircle className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="mb-3">
          <p className="text-white/60 text-sm mb-1">Confirm Go Live</p>
          <p className="text-sm text-white/70 mb-3">This will:</p>
          <ul className="space-y-1 text-xs text-white/60">
            {hasInvitations && (
              <li className="flex items-center gap-1.5">
                <Send className="w-3 h-3 text-purple-400" />
                Send {invitationCount} invitation{invitationCount !== 1 ? 's' : ''}
              </li>
            )}
            {hasScheduledEmails && (
              <li className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-purple-400" />
                Activate scheduled emails
              </li>
            )}
          </ul>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleGoLive}
            disabled={loading}
            className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Going Live...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Confirm
              </>
            )}
          </button>
          <button
            onClick={() => {
              setShowConfirm(false);
              setError(null);
            }}
            disabled={loading}
            className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Editor view - review and edit invitation list
  if (showEditor) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {updatingInvitations ? (
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-white/10 p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/60">Saving changes...</p>
            </div>
          </div>
        ) : (
          <>
            <GoLiveInvitationEditor
              event={event}
              organizationId={organizationId}
              onSave={handleSaveInvitations}
              onCancel={() => {
                setShowEditor(false);
                setError(null);
              }}
            />
            {error && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-md w-full mx-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Initial state - not live yet
  return (
    <div className="bg-[#1e1536] rounded-xl p-5 border border-amber-500/20 hover:border-amber-500/40 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="p-3 rounded-lg bg-amber-500/20">
          <AlertCircle className="w-6 h-6 text-amber-400" />
        </div>
      </div>
      <div className="mb-2">
        <p className="text-white/60 text-sm mb-1">Event Status</p>
        <p className="text-lg font-semibold text-white mb-1">Not Live Yet</p>
      </div>

      {hasInvitations && (
        <p className="text-xs text-white/50 mb-3">
          {invitationCount} contact{invitationCount !== 1 ? 's' : ''} ready to invite
        </p>
      )}

      <div className="flex flex-col gap-2">
        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}
        <button
          onClick={() => {
            if (!organizationId) {
              setError('Organization information is required');
              console.error('Missing organizationId for invitation editor');
              return;
            }
            setShowEditor(true);
            setError(null);
          }}
          className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5"
        >
          <Edit className="w-3.5 h-3.5" />
          Review Invitations
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Go Live Now
        </button>
      </div>
    </div>
  );
}
