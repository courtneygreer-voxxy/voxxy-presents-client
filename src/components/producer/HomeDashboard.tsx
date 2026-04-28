import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Eye,
  CheckCircle,
  Check,
  DollarSign,
  Mail,
  Megaphone,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  Edit2,
  ExternalLink,
  ChevronDown,
  Globe,
  MessageSquare,
  Building,
  FileText,
  Ticket,
  Shield,
  Pin,
  User,
  X,
  Save,
} from 'lucide-react';
import {
  vendorApplicationsApi,
  scheduledEmailsApi,
  bulletinsApi,
  eventsApi,
} from '@/services/api';
import { ScheduledEmail } from '@/types/email';
import { CreateBulletinRequest } from '@/types/bulletin';
import GoLiveCard from './GoLiveCard';
import { formatEventDate } from '@/utils/dateHelpers';
import { CreateBulletinModal } from './Bulletins/CreateBulletinModal';
import { DebugPanel } from './DebugPanel';
import { Badge } from '@/components/ui/badge';

interface HomeDashboardProps {
  eventSlug: string;
  event: any;
  onNavigateToTab?: (tab: string) => void;
  onRefreshEvent?: () => Promise<void>;
  organizationId?: number;
  isAdmin?: boolean;
}

interface DashboardStats {
  applied: number;
  newUnreviewed: number;
  approvedPaid: number;
  missingPayments: number;
}

interface CategoryStat {
  name: string;
  applied: number;
  unreviewed: number;
  paid: number;
  unpaid: number;
}

interface BulletinAuthor {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Bulletin {
  id: number;
  subject: string;
  body: string;
  created_at: string;
  pinned: boolean;
  author: BulletinAuthor;
  view_count: number;
  read_count: number;
}

export default function HomeDashboard({ eventSlug, event, onNavigateToTab, onRefreshEvent, organizationId, isAdmin }: HomeDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    applied: 0,
    newUnreviewed: 0,
    approvedPaid: 0,
    missingPayments: 0,
  });
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [vendorApplications, setVendorApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLinksExpanded, setCategoryLinksExpanded] = useState(false);
  const [isCreateBulletinModalOpen, setIsCreateBulletinModalOpen] = useState(false);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [showAllBulletins, setShowAllBulletins] = useState(false);

  // Ticket link edit state
  const [isEditingTicketLink, setIsEditingTicketLink] = useState(false);
  const [editedTicketLink, setEditedTicketLink] = useState('');
  const [ticketLinkError, setTicketLinkError] = useState<string | null>(null);

  // Live status state - use state instead of derived value to ensure re-renders
  const [isLive, setIsLive] = useState(event.status?.is_live || false);

  // Update isLive when event prop changes (fixes issue where state doesn't update after going live)
  useEffect(() => {
    const newIsLive = event.status?.is_live || false;
    console.log('🔄 [HomeDashboard] Event status changed:', {
      slug: event.slug,
      isLive: newIsLive,
      status: event.status
    });
    setIsLive(newIsLive);
  }, [event, event.status?.is_live]);

  useEffect(() => {
    fetchDashboardData();
  }, [eventSlug]);

  // Combined refresh function that updates both event AND dashboard data
  const handleRefresh = async () => {
    if (onRefreshEvent) {
      await onRefreshEvent();
    }
    await fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats in parallel (removed invitations fetch for performance)
      const [applications, emails, bulletinsRes] = await Promise.all([
        vendorApplicationsApi.getByEvent(eventSlug).catch(() => []),
        scheduledEmailsApi.getByEvent(eventSlug).catch(() => []),
        bulletinsApi.getByEvent(eventSlug).catch(() => []),
      ]);

      // Save applications to state
      setVendorApplications(applications);

      // Fetch all submissions and build per-category stats
      let allSubmissions: any[] = [];
      const perCategoryStats: CategoryStat[] = [];
      for (const app of applications) {
        try {
          const submissions = await vendorApplicationsApi.getSubmissions(app.id);
          allSubmissions.push(...submissions);
          const catApproved = submissions.filter(
            (s: any) => s.status === 'approved' || s.status === 'confirmed'
          );
          perCategoryStats.push({
            name: app.name,
            applied: submissions.length,
            unreviewed: submissions.filter((s: any) => s.status === 'pending').length,
            paid: catApproved.filter((s: any) => s.payment_status === 'paid').length,
            unpaid: catApproved.filter((s: any) => s.payment_status !== 'paid').length,
          });
        } catch (err) {
          console.error(`Failed to fetch submissions for app ${app.id}`);
        }
      }
      setCategoryStats(perCategoryStats);

      const applied = allSubmissions.length;
      const newUnreviewed = allSubmissions.filter((sub) => sub.status === 'pending').length;
      const approved = allSubmissions.filter(
        (sub) => sub.status === 'approved' || sub.status === 'confirmed'
      );
      const approvedPaid = approved.filter((sub) => sub.payment_status === 'paid').length;
      const missingPayments = approved.filter(
        (sub) => sub.payment_status !== 'paid'
      ).length;

      setStats({
        applied,
        newUnreviewed,
        approvedPaid,
        missingPayments,
      });

      // Set scheduled emails (filter out sent/failed/cancelled, limit to 4 most recent)
      const emailsArray = Array.isArray(emails) ? emails : [];
      const upcomingEmails = emailsArray.filter(
        email => email.status === 'scheduled' || email.status === 'paused'
      );
      setScheduledEmails(upcomingEmails.slice(0, 4));

      // Set bulletins (pinned first, then sorted newest first)
      const bulletinsArray = Array.isArray(bulletinsRes) ? bulletinsRes : ('bulletins' in bulletinsRes ? bulletinsRes.bulletins : []);
      bulletinsArray.sort((a: Bulletin, b: Bulletin) => {
        // Pinned bulletins come first
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        // Then sort by created_at (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setBulletins(bulletinsArray);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err); // Keep for now - affects many parts of dashboard
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const applicationPageUrl = `${window.location.origin}/events/${event.namespaced_slug || event.slug}`;
  const vendorPortalUrl = `${window.location.origin}/portal/${event.namespaced_slug || event.slug}`;

  const handleCreateBulletin = async (data: CreateBulletinRequest) => {
    try {
      await bulletinsApi.create(eventSlug, data);
      await fetchDashboardData(); // Refresh bulletins
      setIsCreateBulletinModalOpen(false);
    } catch (err) {
      console.error('Failed to create bulletin:', err);
      throw err;
    }
  };

  const handleStartEditTicketLink = () => {
    setEditedTicketLink(event.ticket_link || '');
    setIsEditingTicketLink(true);
    setTicketLinkError(null);
  };

  const handleCancelEditTicketLink = () => {
    setIsEditingTicketLink(false);
    setEditedTicketLink('');
    setTicketLinkError(null);
  };

  const handleSaveTicketLink = async () => {
    try {
      setTicketLinkError(null);

      await eventsApi.update(eventSlug, {
        ticket_link: editedTicketLink.trim() || undefined,
      });

      setIsEditingTicketLink(false);
      setEditedTicketLink('');

      // Refresh event data
      if (onRefreshEvent) {
        await onRefreshEvent();
      }
    } catch (err: any) {
      console.error('Failed to update ticket link:', err);
      setTicketLinkError(err.message || 'Failed to update ticket link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isEventCancelled = event.status?.status === 'cancelled';

  const commandPanelClass = 'glass-card voxxy-hover-panel rounded-2xl shadow-sm';
  const commandRowClass = 'voxxy-surface-subtle voxxy-hover-row flex items-center justify-between rounded-xl px-3 py-2.5 transition-smooth hover:bg-accent/50 dark:hover:bg-background/10';
  const commandInsetClass = 'voxxy-surface-subtle rounded-xl';
  const sideLinkClass = 'voxxy-surface-subtle w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs text-foreground transition-smooth hover:bg-accent/50 dark:hover:bg-background/10 group';

  return (
    <div className="px-3 md:px-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">Command Center</h2>
        <p className="mt-1 text-sm text-foreground/65">{event.title}</p>
      </div>

      {isEventCancelled && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 flex-shrink-0">
              <Shield className="w-5 h-5 text-red-700 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground mb-1">Event Locked - Cancelled</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This event has been cancelled and is now in read-only mode. You cannot create bulletins, edit emails, or change the event status. All vendors have been notified of the cancellation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column (Stats/Emails/Bulletins) + Right Column (Event Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column - Vendor Stats (when live) or Go Live Card (when not live), then Emails & Bulletins */}
        <div className="lg:col-span-3 space-y-4">
          {isLive ? (
            /* Vendor Stats Cards - 4 in a row when LIVE */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Applied */}
              <div className={`${commandPanelClass} p-3.5`}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <ClipboardList className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-foreground">{stats.applied}</p>
                    <p className="text-[10px] text-foreground/60">Applied</p>
                  </div>
                </div>
                {categoryStats.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border space-y-0.5">
                    {categoryStats.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <span className="text-[10px] text-foreground/50 truncate mr-2">{cat.name}</span>
                        <span className="text-[10px] text-foreground/70 font-medium tabular-nums">{cat.applied}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* New / Unreviewed */}
              <div className={`${commandPanelClass} p-3.5`}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Eye className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-foreground">{stats.newUnreviewed}</p>
                    <p className="text-[10px] text-foreground/60">New / Unreviewed</p>
                  </div>
                </div>
                {categoryStats.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border space-y-0.5">
                    {categoryStats.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <span className="text-[10px] text-foreground/50 truncate mr-2">{cat.name}</span>
                        <span className="text-[10px] text-foreground/70 font-medium tabular-nums">{cat.unreviewed}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Approved & Paid */}
              <div className={`${commandPanelClass} p-3.5`}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-foreground">{stats.approvedPaid}</p>
                    <p className="text-[10px] text-foreground/60">Approved & Paid</p>
                  </div>
                </div>
                {categoryStats.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border space-y-0.5">
                    {categoryStats.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <span className="text-[10px] text-foreground/50 truncate mr-2">{cat.name}</span>
                        <span className="text-[10px] text-foreground/70 font-medium tabular-nums">{cat.paid}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Payments */}
              <div className={`${commandPanelClass} p-3.5`}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <DollarSign className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-foreground">{stats.missingPayments}</p>
                    <p className="text-[10px] text-foreground/60">Missing Payments</p>
                  </div>
                </div>
                {categoryStats.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border space-y-0.5">
                    {categoryStats.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <span className="text-[10px] text-foreground/50 truncate mr-2">{cat.name}</span>
                        <span className="text-[10px] text-foreground/70 font-medium tabular-nums">{cat.unpaid}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Go Live Card - Show when event is NOT live */
            <GoLiveCard
              event={event}
              onGoLive={handleRefresh}
              organizationId={organizationId}
            />
          )}

          {/* Upcoming Emails */}
          <div className={`${commandPanelClass} p-3.5`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-foreground">Upcoming Emails</h3>
              </div>
              <button
                onClick={() => onNavigateToTab?.('emails')}
                className="text-xs text-purple-700 transition-smooth hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
              >
                View All →
              </button>
            </div>

            {scheduledEmails.length === 0 ? (
              <p className="text-xs text-foreground/40 py-4 text-center">No upcoming emails</p>
            ) : (
              <div className="space-y-2">
                {scheduledEmails.map((email) => (
                  <div
                    key={email.id}
                    className={commandRowClass}
                  >
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{email.name}</p>
                      <p className="text-[10px] text-foreground/60">
                        {formatDate(email.scheduled_for)} • {email.recipient_count} recipients
                      </p>
                    </div>
                    <Badge
                      variant={email.status === 'paused' ? 'tintYellow' : 'tintBlue'}
                      className="px-2 py-0.5 text-[10px] font-medium"
                    >
                      {email.status === 'paused' ? 'Paused' : 'Scheduled'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bulletin Board */}
          <div className={`${commandPanelClass} p-3.5`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-foreground">Bulletin Board</h3>
                <span className="text-[10px] text-foreground/40">({bulletins.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {bulletins.length > 3 && (
                  <button
                    onClick={() => setShowAllBulletins(!showAllBulletins)}
                    className="text-xs text-purple-700 transition-smooth hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    {showAllBulletins ? 'Show Less' : 'View All →'}
                  </button>
                )}
                <button
                  onClick={() => !isEventCancelled && setIsCreateBulletinModalOpen(true)}
                  disabled={isEventCancelled}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-smooth flex items-center gap-1 ${
                    isEventCancelled
                      ? 'cursor-not-allowed opacity-50 bg-muted text-muted-foreground'
                      : 'voxxy-btn-cta hover:shadow-lg'
                  }`}
                  title={isEventCancelled ? 'Cannot create bulletins for cancelled events' : 'Create a new bulletin'}
                >
                  <MessageSquare className="w-3 h-3" />
                  Create Bulletin
                </button>
              </div>
            </div>

            {bulletins.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Post updates for your vendors
              </p>
            ) : (
              <div className={`space-y-3 ${showAllBulletins ? 'max-h-[400px] overflow-y-auto pr-1' : ''}`}>
                {(showAllBulletins ? bulletins : bulletins.slice(0, 3)).map((bulletin) => (
                  <div
                    key={bulletin.id}
                    className={`rounded-xl border p-3 transition-smooth ${
                      bulletin.pinned
                        ? 'voxxy-surface-subtle border-purple-500/40 dark:border-purple-400/24'
                        : 'voxxy-surface-subtle'
                    } ${
                      bulletin.pinned ? 'dark:border-purple-400/28' : ''
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-2 mb-2">
                      {/* Author Avatar */}
                      <div className="w-7 h-7 rounded-full voxxy-accent-tile flex items-center justify-center flex-shrink-0">
                        <span className="text-foreground font-bold text-[10px]">
                          {getInitials(bulletin.author.name)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h4 className="text-xs font-semibold text-foreground truncate">
                            {bulletin.subject}
                          </h4>
                          {bulletin.pinned && (
                            <Pin className="h-3 w-3 shrink-0 fill-purple-700 text-purple-700 dark:fill-purple-400 dark:text-purple-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {bulletin.author.name} · {formatTimeAgo(bulletin.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <p className="text-[10px] text-foreground/80 line-clamp-2 mb-2 whitespace-pre-wrap">
                      {bulletin.body}
                    </p>

                    {/* Footer Stats */}
                    <div className="flex items-center gap-3 border-t border-border pt-2 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{bulletin.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{bulletin.read_count} read</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Event Details */}
        <div className={`${commandPanelClass} p-3.5`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-foreground">Event Details</h3>
              </div>
            <button
              onClick={() => onNavigateToTab?.('settings')}
              className="flex items-center gap-1 text-xs text-purple-700 transition-smooth hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>

          {/* Event Info */}
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-foreground mb-1">{event.title}</p>
            </div>

            {/* Event Status */}
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                {event.status?.status === 'cancelled' ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center">
                    <X className="w-2.5 h-2.5 text-white" />
                  </div>
                ) : event.status?.status === 'completed' ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                ) : isLive ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-foreground" />
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/50" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">Event Status</p>
                <p className={`text-xs font-medium ${
                  event.status?.status === 'cancelled' ? 'text-red-700 dark:text-red-400' :
                  event.status?.status === 'completed' ? 'text-blue-700 dark:text-blue-400' :
                  isLive ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-yellow-400'
                }`}>
                  {event.status?.status === 'cancelled' ? 'Cancelled' :
                   event.status?.status === 'completed' ? 'Completed' :
                   isLive ? 'Live' : 'Draft'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">Description</p>
                <p className="text-xs text-foreground">{event.description || 'N/A'}</p>
              </div>
            </div>

            {/* Event Date & Time */}
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">Event Date</p>
                <p className="text-xs text-foreground">
                  {formatDate(event.event_date)}
                  {event.start_time && ` • ${formatTime(event.start_time)}`}
                  {event.end_time && ` - ${formatTime(event.end_time)}`}
                </p>
                {event.event_end_date && event.event_end_date !== event.event_date && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Ends: {formatDate(event.event_end_date)}
                  </p>
                )}
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-start gap-2">
              <Building className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">Venue</p>
                <p className="text-xs text-foreground">{event.venue || 'N/A'}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">Location</p>
                <p className="text-xs text-foreground">{event.location || 'N/A'}</p>
              </div>
            </div>

            {/* Age Restriction */}
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">Age Restriction</p>
                <p className="text-xs text-foreground">{event.age_restriction || 'N/A'}</p>
              </div>
            </div>

            {/* Ticket Link */}
            <div className="flex items-start gap-2">
              <Ticket className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground">Ticket Link</p>
                  {!isEditingTicketLink && (
                    <button
                      onClick={handleStartEditTicketLink}
                      className="p-0.5 text-purple-700 transition-colors hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                      title="Edit ticket link"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {isEditingTicketLink ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={editedTicketLink}
                      onChange={(e) => setEditedTicketLink(e.target.value)}
                      placeholder="https://..."
                      className="voxxy-input-frost w-full rounded-lg px-2 py-1 text-xs focus:border-transparent focus:ring-1 focus:ring-purple-500"
                    />
                    {ticketLinkError && (
                      <p className="text-[10px] text-red-400">{ticketLinkError}</p>
                    )}
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleSaveTicketLink}
                        className="flex-1 px-2 py-1 text-[10px] voxxy-btn-solid rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <Save className="w-2.5 h-2.5" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditTicketLink}
                        className="flex-1 rounded px-2 py-1 text-[10px] text-foreground transition-colors hover:bg-accent/60 dark:hover:bg-background/10 flex items-center justify-center gap-1"
                      >
                        <X className="w-2.5 h-2.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {event.ticket_link ? (
                      <a
                        href={event.ticket_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-xs text-purple-700 underline transition-colors hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        {event.ticket_link}
                      </a>
                    ) : (
                      <p className="text-xs text-foreground">N/A</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Application Deadline */}
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-foreground/60">Application Deadline</p>
                <p className="text-xs text-foreground">{formatDate(event.application_deadline)}</p>
              </div>
            </div>

            {/* Payment Deadline */}
            <div className="flex items-start gap-2">
              <DollarSign className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-foreground/60">Payment Deadline</p>
                <p className="text-xs text-foreground">{formatDate(event.payment_deadline)}</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-4 space-y-2 border-t border-border pt-3">
            <a
              href={applicationPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={sideLinkClass}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                <span>Application Page</span>
              </div>
              <ExternalLink className="w-3 h-3 text-foreground/40 group-hover:text-foreground/60" />
            </a>

            <a
              href={vendorPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={sideLinkClass}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                <span>Vendor Portal</span>
              </div>
              <ExternalLink className="w-3 h-3 text-foreground/40 group-hover:text-foreground/60" />
            </a>

            {/* Category Application Links - collapsible */}
            {vendorApplications.length > 0 && (
              <div className={commandInsetClass}>
                <button
                  onClick={() => setCategoryLinksExpanded(!categoryLinksExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-foreground transition-smooth hover:bg-accent/50 dark:hover:bg-background/10"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Category Links</span>
                    <span className="text-[10px] text-foreground/40">({vendorApplications.filter(a => a.status === 'active').length})</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-foreground/40 transition-transform ${categoryLinksExpanded ? 'rotate-180' : ''}`} />
                </button>
                {categoryLinksExpanded && (
                  <div className="space-y-1 border-t border-border px-2 pb-2 pt-1">
                    {vendorApplications.map((app) => (
                      <a
                        key={app.id}
                        href={`${window.location.origin}/events/${event.slug}/apply/${app.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-smooth text-xs text-foreground group ${
                          app.status === 'active'
                            ? 'hover:bg-accent/50 dark:hover:bg-background/10'
                            : 'opacity-40 pointer-events-none'
                        }`}
                      >
                        <span className="truncate">{app.name}</span>
                        <ExternalLink className="w-3 h-3 text-foreground/40 group-hover:text-foreground/60 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Bulletin Modal */}
      <CreateBulletinModal
        isOpen={isCreateBulletinModalOpen}
        onClose={() => setIsCreateBulletinModalOpen(false)}
        onSubmit={handleCreateBulletin}
        eventSlug={eventSlug}
      />

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Home Dashboard"
        data={{
          event,
          eventSlug,
          organizationId,
          stats,
          scheduledEmails,
          bulletins,
          loading,
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
