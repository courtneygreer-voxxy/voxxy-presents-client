import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { registrationsApi } from '@/services/api';

interface Registration {
  id: number;
  ticket_code: string;
  email: string;
  business_name: string;
  vendor_category: string;
  status: string;
  created_at: string;
  event: {
    id: number;
    title: string;
    slug: string;
    dates: {
      start?: string;
    };
    location?: string;
  };
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
  },
  rejected: {
    label: 'Not Selected',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
  },
  waitlist: {
    label: 'Waitlisted',
    icon: AlertCircle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
  },
};

export default function ApplicationTrackingPage() {
  const { ticketCode } = useParams<{ ticketCode: string }>();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticketCode) {
      fetchRegistration(ticketCode);
    }
  }, [ticketCode]);

  const fetchRegistration = async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrationsApi.trackByTicketCode(code);
      setRegistration(data);
    } catch (err: any) {
      console.error('Failed to fetch registration:', err);
      setError(err.message || 'Application not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
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

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Application Not Found</h1>
          <p className="text-white/60 mb-6">
            {error || 'We could not find an application with this tracking code.'}
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

  const statusConfig = STATUS_CONFIG[registration.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Application Status
          </h1>
          <p className="text-white/60">
            Tracking Code: <span className="font-mono text-purple-300">{registration.ticket_code}</span>
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
            <p className="text-white/80">
              Your vendor application for <span className="font-semibold">{registration.event.title}</span>
            </p>
          </div>

          {/* Status Messages */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            {registration.status === 'pending' && (
              <p className="text-white/80 text-center">
                Your application is currently being reviewed by the event organizers. You'll be notified by email when there's an update.
              </p>
            )}
            {registration.status === 'approved' && (
              <p className="text-white/80 text-center">
                Congratulations! Your vendor application has been approved. Check your email for next steps and payment information.
              </p>
            )}
            {registration.status === 'rejected' && (
              <p className="text-white/80 text-center">
                Unfortunately, your application was not selected for this event. We encourage you to apply for future opportunities.
              </p>
            )}
            {registration.status === 'waitlist' && (
              <p className="text-white/80 text-center">
                You've been added to the waitlist. If a spot becomes available, you'll be notified via email.
              </p>
            )}
            {registration.status === 'confirmed' && (
              <p className="text-white/80 text-center">
                Your vendor spot is confirmed! Check your email for event day details and vendor guidelines.
              </p>
            )}
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Application Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/60">Business Name</span>
              <span className="text-white font-medium">{registration.business_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Category</span>
              <span className="px-2 py-1 rounded text-sm bg-purple-500/20 text-purple-300">
                {registration.vendor_category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Email</span>
              <span className="text-white">{registration.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Submitted</span>
              <span className="text-white">{formatDate(registration.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
          <div className="space-y-3">
            {registration.event.dates.start && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-white/60 text-sm">Date</p>
                  <p className="text-white">
                    {new Date(registration.event.dates.start).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
            {registration.event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-white/60 text-sm">Location</p>
                  <p className="text-white">{registration.event.location}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/events/${registration.event.slug}`)}
            className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            View Event
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all"
          >
            Browse More Events
          </button>
        </div>
      </div>
    </div>
  );
}
