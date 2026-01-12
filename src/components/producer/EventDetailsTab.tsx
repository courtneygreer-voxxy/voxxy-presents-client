import { useState, useEffect } from 'react';
import {
  Users,
  Check,
  Mail,
  Settings,
  ArrowRight,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { vendorApplicationsApi } from '@/services/api';

interface Event {
  id: number;
  slug: string;
  title: string;
  description?: string;
  event_date?: string;
  event_end_date?: string;
  start_time?: string;
  end_time?: string;
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
  payment_deadline?: string;
}

interface EventDetailsTabProps {
  event: Event;
  onUpdate?: (eventSlug: string, updates: any) => Promise<void>;
  onNavigateToTab?: (tab: string) => void;
}

interface ApplicationStats {
  total: number;
  new: number;
  approved: number;
  waitlisted: number;
}

export default function EventDetailsTab({ event, onNavigateToTab }: EventDetailsTabProps) {
  const [copiedApplication, setCopiedApplication] = useState(false);
  const [copiedPortal, setCopiedPortal] = useState(false);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    new: 0,
    approved: 0,
    waitlisted: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch application stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const applications = await vendorApplicationsApi.getByEvent(event.slug);

        // Calculate stats from all applications
        let totalApplicants = 0;
        let newApplicants = 0;
        let approvedApplicants = 0;
        let waitlistedApplicants = 0;

        for (const app of applications) {
          try {
            const submissions = await vendorApplicationsApi.getSubmissions(app.id);
            totalApplicants += submissions.length;

            submissions.forEach((sub: any) => {
              if (sub.status === 'pending') newApplicants++;
              if (sub.status === 'approved') approvedApplicants++;
              if (sub.status === 'waitlist') waitlistedApplicants++;
            });
          } catch (err) {
            console.error('Failed to fetch submissions for app', app.id, err);
          }
        }

        setStats({
          total: totalApplicants,
          new: newApplicants,
          approved: approvedApplicants,
          waitlisted: waitlistedApplicants,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [event.slug]);

  // Construct URLs
  const applicationUrl = `${window.location.origin}/events/${event.slug}`;
  const portalUrl = `${window.location.origin}/events/${event.slug}/portal`;

  const handleCopyApplicationUrl = async () => {
    try {
      await navigator.clipboard.writeText(applicationUrl);
      setCopiedApplication(true);
      setTimeout(() => setCopiedApplication(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleCopyPortalUrl = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopiedPortal(true);
      setTimeout(() => setCopiedPortal(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Applicants Card */}
        <div
          onClick={() => onNavigateToTab?.('applicants')}
          className="bg-gradient-to-br from-[#2a1a4a]/50 to-[#1e1536]/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all group cursor-pointer relative overflow-hidden"
        >
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/30 border border-purple-400/20">
                <Users className="w-7 h-7 text-purple-300" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mb-3">
              <p className="text-white/70 text-sm mb-2">Total Applicants</p>
              <p className="text-5xl font-bold text-white">
                {loadingStats ? '...' : stats.total}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span>{stats.new} new</span>
              <span>•</span>
              <span>{stats.approved} approved</span>
              <span>•</span>
              <span>{stats.waitlisted} waitlisted</span>
            </div>
          </div>
        </div>

        {/* Confirmed Vendors Card */}
        <div
          onClick={() => onNavigateToTab?.('vendors')}
          className="bg-gradient-to-br from-[#1a3a2a]/50 to-[#1e1536]/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all group cursor-pointer relative overflow-hidden"
        >
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-green-600/30 border border-green-400/20">
                <Check className="w-7 h-7 text-green-300" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mb-3">
              <p className="text-white/70 text-sm mb-2">Confirmed Vendors</p>
              <p className="text-5xl font-bold text-white">
                {loadingStats ? '...' : stats.approved}
              </p>
            </div>
            <p className="text-sm text-white/60">Approved & paid vendors ready for event</p>
          </div>
        </div>

        {/* Next Scheduled Email Card */}
        <div
          onClick={() => onNavigateToTab?.('emails')}
          className="bg-gradient-to-br from-[#1a2a4a]/50 to-[#1e1536]/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all group cursor-pointer relative overflow-hidden"
        >
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-400/20">
                <Mail className="w-7 h-7 text-blue-300" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mb-3">
              <p className="text-white/70 text-sm mb-2">Next Scheduled Email</p>
              <p className="text-xl font-semibold text-white">12 Days Before Deadli...</p>
            </div>
            <p className="text-sm text-white/60">Scheduled for 2025-12-08 • 0 recipients</p>
          </div>
        </div>

        {/* Event Settings Card */}
        <div
          onClick={() => onNavigateToTab?.('settings')}
          className="bg-gradient-to-br from-[#3a2a1a]/50 to-[#1e1536]/50 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30 hover:border-orange-500/50 transition-all group cursor-pointer relative overflow-hidden"
        >
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 border border-orange-400/20">
                <Settings className="w-7 h-7 text-orange-300" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mb-3">
              <p className="text-white/70 text-sm mb-2">Event Settings</p>
              <p className="text-xl font-semibold text-white">Edit Event Details</p>
            </div>
            <p className="text-sm text-white/60">Update venue, dates, categories, and more</p>
          </div>
        </div>
      </div>

      {/* Link Sharing Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Copy Application Link Button */}
        <button
          onClick={handleCopyApplicationUrl}
          className="flex items-center justify-between p-5 bg-gradient-to-br from-[#2a1a4a]/40 to-[#1e1536]/40 backdrop-blur-sm rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors border border-purple-400/20">
              {copiedApplication ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                {copiedApplication ? 'Link Copied!' : 'Copy Application Link'}
              </p>
              <p className="text-xs text-white/60">Share event application</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
        </button>

        {/* View Application Link Button */}
        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-5 bg-gradient-to-br from-[#1a2a4a]/40 to-[#1e1536]/40 backdrop-blur-sm rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors border border-blue-400/20">
              <ExternalLink className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">View Application</p>
              <p className="text-xs text-white/60">Open application page</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
        </a>
      </div>
    </div>
  );
}
