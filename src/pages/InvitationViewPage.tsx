import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Mail, Building2, Clock, Users, DollarSign } from 'lucide-react';
import { eventInvitationsApi, EventInvitation } from '@/services/api';

export default function InvitationViewPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<EventInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Applications closed';
    if (diffDays === 0) return 'Applications close today';
    if (diffDays === 1) return '1 day left until applications close';
    return `${diffDays} days left until applications close`;
  };

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

  const formatTimeString = (timeString?: string) => {
    if (!timeString) return '';
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
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#d946ef] via-[#a855f7] to-[#3b82f6] text-white hover:opacity-90 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820]">
      {/* Header */}
      <div className="bg-[#1a0d2e]/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            voxxy
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Card Container */}
        <div className="bg-[#1e1b2e] border border-white/10 rounded-lg p-6 md:p-8">
          {/* You're Invited Badge */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-500/90 backdrop-blur-sm border border-purple-400/50 shadow-lg">
              <Mail className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">You're Invited!</span>
            </div>
          </div>

          {/* Event Title and Location */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {invitation.event?.title}
            </h1>
            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="w-4 h-4" />
              <span>{invitation.event?.location}</span>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="py-6 border-t border-b border-white/10 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* Event Date */}
              {invitation.event?.dates?.start && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs mb-1">Event Date</p>
                    <p className="text-white text-sm">
                      {new Date(invitation.event.dates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {invitation.event.dates.end && ` - ${new Date(invitation.event.dates.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Time */}
              {(invitation.event?.dates?.start_time || invitation.event?.dates?.end_time) && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs mb-1">Time</p>
                    <p className="text-white text-sm">
                      {invitation.event.dates.start_time && formatTimeString(invitation.event.dates.start_time)}
                      {invitation.event.dates.start_time && invitation.event.dates.end_time && ' - '}
                      {invitation.event.dates.end_time && formatTimeString(invitation.event.dates.end_time)}
                    </p>
                  </div>
                </div>
              )}

              {/* Venue */}
              {invitation.event?.venue && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs mb-1">Venue</p>
                    <p className="text-white text-sm">{invitation.event.venue}</p>
                  </div>
                </div>
              )}

              {/* Invited By */}
              {invitation.vendor_contact && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs mb-1">Invited By</p>
                    <p className="text-white text-sm">{invitation.event?.organization?.name || invitation.vendor_contact.business_name || invitation.vendor_contact.name}</p>
                  </div>
                </div>
              )}

              {/* Apply By */}
              {invitation.event?.application_deadline && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs mb-1">Apply By</p>
                    <p className="text-white text-sm">
                      {new Date(invitation.event.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Age */}
              {invitation.event?.age_restriction && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs mb-1">Age</p>
                    <p className="text-white text-sm">{invitation.event.age_restriction}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* About This Event */}
          {invitation.event?.description && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {invitation.event.description}
              </p>
            </div>
          )}

          {/* Application Categories */}
          {invitation.event?.vendor_applications && invitation.event.vendor_applications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Application Categories</h2>

              {/* Map through all vendor applications */}
              <div className="space-y-4">
                {invitation.event.vendor_applications.map((application: any) => (
                  <div key={application.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                    {/* Title and Price Row */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">
                        {application.name}
                      </h3>
                      <div className="text-right">
                        {application.booth_price && (
                          <>
                            <p className="text-2xl font-bold text-purple-400">
                              ${Number(application.booth_price).toFixed(0)}
                            </p>
                            {invitation.event?.application_deadline && (
                              <p className="text-white/60 text-xs mt-1">
                                Early bird: {new Date(invitation.event.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {application.description && (
                      <p className="text-white/80 text-sm mb-4">
                        {application.description}
                      </p>
                    )}

                    {/* Tags */}
                    {application.application_tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {application.application_tags.split(',').map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Install Date & Time */}
                    {application.install?.install_date && (
                      <div className="flex items-center gap-4 text-white/80 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span>Install: {new Date(application.install.install_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {(application.install.install_start_time || application.install.install_end_time) && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span>
                              {application.install.install_start_time && formatTimeString(application.install.install_start_time)}
                              {application.install.install_start_time && application.install.install_end_time && ' - '}
                              {application.install.install_end_time && formatTimeString(application.install.install_end_time)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Apply Now Button */}
                    <a
                      href={`/events/${invitation.event!.slug}/apply/${application.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-6 py-3 rounded-lg bg-gradient-to-r from-[#d946ef] via-[#a855f7] to-[#3b82f6] text-white font-semibold hover:opacity-90 transition-all shadow-lg"
                    >
                      Apply Now
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Powered by Voxxy Presents */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <span>Powered by</span>
            <img
              src="/VoxxyTriangle.svg"
              alt="Voxxy"
              className="w-4 h-4 opacity-60"
            />
            <span className="font-semibold">Voxxy Presents</span>
          </div>
        </div>
      </div>
    </div>
  );
}
