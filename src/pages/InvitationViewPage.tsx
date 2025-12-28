import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Mail, Building2, ArrowRight, Clock } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820]">
      {/* Hero Section with Event Title */}
      <div className="relative h-[180px] md:h-[300px] overflow-hidden">
        {invitation.event?.poster_url ? (
          <img
            src={invitation.event.poster_url}
            alt={invitation.event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-900 to-blue-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0d2e] via-[#1a0d2e]/80 to-transparent" />

        {/* Invitation Badge */}
        <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full bg-purple-500/90 backdrop-blur-sm border border-purple-400/50 shadow-lg">
            <Mail className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <span className="text-white font-semibold text-sm md:text-base">You're Invited!</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
              {invitation.event?.title}
            </h1>
            {invitation.event?.organization ? (
              <p className="text-white/80 text-base md:text-lg">
                Presented by {invitation.event.organization.name}
              </p>
            ) : invitation.vendor_contact?.company_name ? (
              <p className="text-white/80 text-base md:text-lg">
                Invited by {invitation.vendor_contact.company_name}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Details */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-white/80 whitespace-pre-wrap">
                {invitation.event?.description || 'No description available.'}
              </p>
            </div>

            {/* Vendor Opportunities Section */}
            {invitation.event?.vendor_applications && invitation.event.vendor_applications.length > 0 && (
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Vendor Opportunities
                </h2>

                {/* Application Deadline Timer */}
                {invitation.event.application_deadline && (
                  <div className="mb-4 flex items-center gap-2 text-purple-300">
                    <Clock className="w-4 h-4" />
                    <p className="text-sm font-medium">
                      {getDaysUntilDeadline(invitation.event.application_deadline)}
                    </p>
                  </div>
                )}

                {invitation.event.vendor_applications.map((application: any) => (
                  <div key={application.id} className="mb-6 last:mb-0 pb-6 last:pb-0 border-b border-white/10 last:border-0">
                    <p className="text-lg text-purple-300 mb-2">
                      {application.name}
                    </p>

                    {/* Booth Price */}
                    {application.booth_price && (
                      <p className="text-2xl font-bold text-white mb-4">
                        ${Number(application.booth_price).toFixed(2)}
                      </p>
                    )}

                    {application.description && (
                      <p className="text-white/80 mb-6 whitespace-pre-wrap">
                        {application.description}
                      </p>
                    )}

                    {/* Categories */}
                    {application.categories && application.categories.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-white/60 mb-2">
                          Seeking Vendors In:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {application.categories.map((category: string) => (
                            <span
                              key={category}
                              className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <a
                      href={`/events/${invitation.event!.slug}/apply/${application.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg"
                    >
                      Apply as Vendor
                      <ArrowRight className="w-5 h-5" />
                    </a>

                    {application.submissions_count > 0 && (
                      <p className="text-white/40 text-sm mt-4">
                        {application.submissions_count} vendors have applied
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold text-white/60 mb-1">Date & Time</h3>
                  <p className="text-white">
                    {invitation.event?.event_date ? formatDate(invitation.event.event_date) : 'TBA'}
                  </p>
                </div>
              </div>

              {/* Location */}
              {invitation.event?.location && (
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/60 mb-1">Location</h3>
                    <p className="text-white">{invitation.event.location}</p>
                  </div>
                </div>
              )}

              {/* Application Deadline */}
              {invitation.event?.application_deadline && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/60 mb-1">Application Deadline</h3>
                    <p className="text-white">{formatDateTime(invitation.event.application_deadline)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Invitation Info */}
            {invitation.vendor_contact && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/60 mb-1">Invited By</h3>
                    <p className="text-white font-medium">{invitation.vendor_contact.name}</p>
                    {invitation.vendor_contact.company_name && (
                      <p className="text-white/80 text-sm">{invitation.vendor_contact.company_name}</p>
                    )}
                    <p className="text-white/60 text-sm mt-2">{invitation.vendor_contact.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Powered by Voxxy Presents */}
        <div className="mt-12 pt-8 border-t border-white/10">
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
