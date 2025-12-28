import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Mail, Building2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { eventInvitationsApi, EventInvitation } from '@/services/api';

const STATUS_CONFIG = {
  pending: {
    label: 'Invitation Pending',
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
  },
  sent: {
    label: 'Invitation Sent',
    icon: Mail,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
  },
  viewed: {
    label: 'Invitation Viewed',
    icon: Mail,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
  },
  declined: {
    label: 'Declined',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
  },
};

export default function InvitationViewPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<EventInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');

  useEffect(() => {
    if (token) {
      fetchInvitation(token);
    }
  }, [token]);

  const fetchInvitation = async (invitationToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventInvitationsApi.getByToken(invitationToken);
      setInvitation(data.invitation);
    } catch (err: any) {
      console.error('Failed to fetch invitation:', err);
      setError(err.message || 'Invitation not found');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (status: 'accepted' | 'declined') => {
    if (!token) return;

    try {
      setResponding(true);
      const result = await eventInvitationsApi.respond(token, status, responseNotes || undefined);
      setInvitation(result.invitation);
      setResponseNotes('');
    } catch (err: any) {
      console.error('Failed to respond to invitation:', err);
      alert(err.message || 'Failed to submit response. Please try again.');
    } finally {
      setResponding(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invitation Not Found</h1>
          <p className="text-white/60 mb-6">
            {error || 'We could not find an invitation with this link.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[invitation.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const canRespond = invitation.can_respond && !invitation.is_expired;
  const hasResponded = invitation.status === 'accepted' || invitation.status === 'declined';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Event Invitation
          </h1>
          <p className="text-white/60">
            You've been invited to participate in an event
          </p>
        </div>

        {/* Status Card */}
        <div className={`bg-white/5 border ${statusConfig.border} rounded-lg p-8 mb-6`}>
          <div className="flex items-center justify-center mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusConfig.bg}`}>
              <StatusIcon className={`w-12 h-12 ${statusConfig.color}`} />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold ${statusConfig.color} mb-2`}>
              {statusConfig.label}
            </h2>
            {invitation.event && (
              <p className="text-white/80">
                Invitation for <span className="font-semibold">{invitation.event.title}</span>
              </p>
            )}
          </div>

          {/* Status Messages */}
          {invitation.is_expired ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-4">
              <p className="text-red-300 text-center">
                This invitation has expired. The application deadline has passed.
              </p>
            </div>
          ) : hasResponded ? (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <p className="text-white/80 text-center mb-4">
                {invitation.status === 'accepted'
                  ? "Thank you for accepting! You'll receive further details via email."
                  : "Thank you for your response. We hope to work with you in the future."}
              </p>
              {invitation.response_notes && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm mb-2">Your message:</p>
                  <p className="text-white/80 italic">"{invitation.response_notes}"</p>
                </div>
              )}
              {invitation.responded_at && (
                <p className="text-white/40 text-sm text-center mt-4">
                  Responded on {formatDateTime(invitation.responded_at)}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <p className="text-white/80 text-center">
                You've been invited to participate as a vendor. Please review the event details below and respond to this invitation.
              </p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        {invitation.vendor_contact && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Invitation For</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Contact Name</span>
                <span className="text-white font-medium">{invitation.vendor_contact.name}</span>
              </div>
              {invitation.vendor_contact.company_name && (
                <div className="flex justify-between">
                  <span className="text-white/60">Company</span>
                  <span className="text-white">{invitation.vendor_contact.company_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/60">Email</span>
                <span className="text-white">{invitation.vendor_contact.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Event Details */}
        {invitation.event && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
            <div className="space-y-4">
              {invitation.event.description && (
                <div>
                  <p className="text-white/60 text-sm mb-1">Description</p>
                  <p className="text-white/80">{invitation.event.description}</p>
                </div>
              )}
              {invitation.event.event_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-white/60 text-sm">Event Date</p>
                    <p className="text-white">{formatDate(invitation.event.event_date)}</p>
                  </div>
                </div>
              )}
              {invitation.event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-white/60 text-sm">Location</p>
                    <p className="text-white">{invitation.event.location}</p>
                  </div>
                </div>
              )}
              {invitation.event.application_deadline && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-white/60 text-sm">Application Deadline</p>
                    <p className="text-white">{formatDateTime(invitation.event.application_deadline)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Response Section */}
        {canRespond && !hasResponded && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Respond to Invitation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Add a message to the event organizer..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRespond('declined')}
                  disabled={responding}
                  className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {responding ? 'Submitting...' : 'Decline'}
                </button>
                <button
                  onClick={() => handleRespond('accepted')}
                  disabled={responding}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {responding ? 'Submitting...' : 'Accept Invitation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {invitation.event && (
            <button
              onClick={() => navigate(`/events/${invitation.event!.slug}`)}
              className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              View Event Details
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all"
          >
            Browse Events
          </button>
        </div>
      </div>
    </div>
  );
}
