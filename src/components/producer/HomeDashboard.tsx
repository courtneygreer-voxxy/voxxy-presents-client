import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Eye,
  CheckCircle,
  DollarSign,
  Mail,
  Megaphone,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  Edit2,
  Copy,
  Globe,
  MessageSquare,
} from 'lucide-react';
import {
  vendorApplicationsApi,
  scheduledEmailsApi,
  bulletinsApi,
} from '@/services/api';
import GoLiveCard from './GoLiveCard';
import { formatEventDate } from '@/utils/dateHelpers';

interface HomeDashboardProps {
  eventSlug: string;
  event: any;
  onNavigateToTab?: (tab: string) => void;
  onRefreshEvent?: () => Promise<void>;
  organizationId?: number;
}

interface DashboardStats {
  applied: number;
  newUnreviewed: number;
  approvedPaid: number;
  missingPayments: number;
}

interface ScheduledEmail {
  id: number;
  name: string;
  scheduled_for: string;
  recipient_count: number;
}

interface Bulletin {
  id: number;
  title?: string;
  content?: string;
  message?: string;
  created_at: string;
}

export default function HomeDashboard({ eventSlug, event, onNavigateToTab, onRefreshEvent, organizationId }: HomeDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    applied: 0,
    newUnreviewed: 0,
    approvedPaid: 0,
    missingPayments: 0,
  });
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [eventSlug]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats in parallel (removed invitations fetch for performance)
      const [applications, emails, bulletinsRes] = await Promise.all([
        vendorApplicationsApi.getByEvent(eventSlug).catch(() => []),
        scheduledEmailsApi.getByEvent(eventSlug).catch(() => []),
        bulletinsApi.getByEvent(eventSlug).catch(() => []),
      ]);

      // Fetch all submissions
      let allSubmissions: any[] = [];
      for (const app of applications) {
        try {
          const submissions = await vendorApplicationsApi.getSubmissions(app.id);
          allSubmissions.push(...submissions);
        } catch (err) {
          console.error(`Failed to fetch submissions for app ${app.id}`);
        }
      }

      const applied = allSubmissions.length;
      const newUnreviewed = allSubmissions.filter((sub) => sub.status === 'pending').length;
      const approved = allSubmissions.filter(
        (sub) => sub.status === 'approved' || sub.status === 'confirmed'
      );
      const approvedPaid = approved.filter((sub) => sub.payment_status === 'paid').length;
      const missingPayments = approved.filter(
        (sub) => sub.payment_status !== 'paid'
      ).length;

      // Debug logging to investigate count discrepancies
      console.log('📊 Dashboard Stats Debug:', {
        totalSubmissions: allSubmissions.length,
        applied,
        newUnreviewed,
        approvedCount: approved.length,
        approvedPaid,
        missingPayments,
        statusBreakdown: allSubmissions.reduce((acc: any, sub) => {
          acc[sub.status] = (acc[sub.status] || 0) + 1;
          return acc;
        }, {}),
        paymentStatusBreakdown: approved.reduce((acc: any, sub) => {
          acc[sub.payment_status || 'null'] = (acc[sub.payment_status || 'null'] || 0) + 1;
          return acc;
        }, {}),
      });

      setStats({
        applied,
        newUnreviewed,
        approvedPaid,
        missingPayments,
      });

      // Set scheduled emails (limit to 4 most recent)
      const emailsArray = Array.isArray(emails) ? emails : [];
      setScheduledEmails(emailsArray.slice(0, 4));

      // Set bulletins (limit to 3 most recent)
      const bulletinsArray = Array.isArray(bulletinsRes) ? bulletinsRes : ('bulletins' in bulletinsRes ? bulletinsRes.bulletins : []);
      setBulletins(bulletinsArray.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return formatEventDate(dateString, 'MMM d, yyyy') || 'Invalid date';
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const handleCopyLink = (linkType: 'application' | 'vendor') => {
    const baseUrl = window.location.origin;
    const link =
      linkType === 'application'
        ? `${baseUrl}/events/${eventSlug}`
        : `${baseUrl}/vendor-portal/${eventSlug}`;
    navigator.clipboard.writeText(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Applied */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <ClipboardList className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-white">{stats.applied}</p>
              <p className="text-[10px] text-white/60">Applied</p>
            </div>
          </div>
        </div>

        {/* New / Unreviewed */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Eye className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-white">{stats.newUnreviewed}</p>
              <p className="text-[10px] text-white/60">New / Unreviewed</p>
            </div>
          </div>
        </div>

        {/* Approved & Paid */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-white">{stats.approvedPaid}</p>
              <p className="text-[10px] text-white/60">Approved & Paid</p>
            </div>
          </div>
        </div>

        {/* Missing Payments */}
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-red-500/20">
              <DollarSign className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-white">{stats.missingPayments}</p>
              <p className="text-[10px] text-white/60">Missing Payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Upcoming Emails & Bulletins */}
        <div className="lg:col-span-2 space-y-4">
          {/* Go Live Card */}
          <GoLiveCard
            event={event}
            onGoLive={onRefreshEvent || fetchDashboardData}
            organizationId={organizationId}
          />
          {/* Upcoming Emails */}
          <div className="glass-card p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Upcoming Emails</h3>
              </div>
              <button
                onClick={() => onNavigateToTab?.('emails')}
                className="text-xs text-purple-400 hover:text-purple-300 transition-smooth"
              >
                View All →
              </button>
            </div>

            {scheduledEmails.length === 0 ? (
              <p className="text-xs text-white/40 py-4 text-center">No scheduled emails</p>
            ) : (
              <div className="space-y-2">
                {scheduledEmails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-smooth"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white">{email.name}</p>
                      <p className="text-[10px] text-white/60">
                        {formatDate(email.scheduled_for)} • {email.recipient_count} recipients
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-400">
                      Scheduled
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bulletin Board */}
          <div className="glass-card p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Bulletin Board</h3>
              </div>
              <button
                onClick={() => onNavigateToTab?.('bulletins')}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-medium hover:shadow-lg transition-smooth flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                Create Bulletin
              </button>
            </div>

            {bulletins.length === 0 ? (
              <p className="text-xs text-white/40 py-4 text-center">
                Post updates for your vendors
              </p>
            ) : (
              <div className="space-y-2">
                {bulletins.map((bulletin) => (
                  <div
                    key={bulletin.id}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-smooth"
                  >
                    <p className="text-xs font-medium text-white mb-1">{bulletin.title || 'Bulletin'}</p>
                    <p className="text-[10px] text-white/60 line-clamp-2">{bulletin.content || bulletin.message || ''}</p>
                    <p className="text-[10px] text-white/40 mt-1">
                      {formatDate(bulletin.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Event Details */}
        <div className="glass-card p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Event Details</h3>
            </div>
            <button
              onClick={() => onNavigateToTab?.('settings')}
              className="text-xs text-purple-400 hover:text-purple-300 transition-smooth flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>

          {/* Event Info */}
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-white mb-1">{event.title}</p>
            </div>

            {event.event_date && (
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-white/60 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white">
                    {formatDate(event.event_date)}
                    {event.start_time && ` • ${formatTime(event.start_time)}`}
                    {event.end_time && ` - ${formatTime(event.end_time)}`}
                  </p>
                </div>
              </div>
            )}

            {event.location && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-white/60 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white">{event.location}</p>
              </div>
            )}

            {event.application_deadline && (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-white/60">App deadline</p>
                  <p className="text-xs text-white">{formatDate(event.application_deadline)}</p>
                </div>
              </div>
            )}

            {event.payment_deadline && (
              <div className="flex items-start gap-2">
                <DollarSign className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-white/60">Payment due</p>
                  <p className="text-xs text-white">{formatDate(event.payment_deadline)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
            <button
              onClick={() => handleCopyLink('application')}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-smooth text-xs text-white"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Application Page</span>
              </div>
              <Copy className="w-3 h-3 text-white/60" />
            </button>

            <button
              onClick={() => handleCopyLink('vendor')}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-smooth text-xs text-white"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Vendor Portal</span>
              </div>
              <Copy className="w-3 h-3 text-white/60" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
