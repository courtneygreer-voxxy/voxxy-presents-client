import { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Instagram,
  Music,
  Globe,
  ExternalLink,
  Star,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { vendorApplicationsApi, registrationsApi } from '@/services/api';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { EmailConfirmationDialog } from './EmailConfirmationDialog';

interface Applicant {
  id: number;
  business_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  vendor_category: string;
  status: 'pending' | 'waitlist';
  portfolio?: string;
  website?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  created_at: string;
  reviewed_at?: string;
}

interface ApplicantsTabProps {
  eventSlug: string;
}

type StatusFilter = 'all' | 'pending' | 'waitlist';

export default function ApplicantsTab({ eventSlug }: ApplicantsTabProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Email notifications hook
  const { dialogOpen, dialogProps, handleEmailNotification, handleConfirmSend, closeDialog } =
    useEmailNotifications();

  useEffect(() => {
    fetchApplicants();
  }, [eventSlug]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all vendor applications for this event
      const applications = await vendorApplicationsApi.getByEvent(eventSlug);

      // Fetch submissions for each application
      const allSubmissions: Applicant[] = [];
      for (const app of applications) {
        try {
          const submissions = await vendorApplicationsApi.getSubmissions(app.id);
          // Filter to only non-approved (pending/waitlist)
          const nonApprovedSubmissions = submissions.filter(
            (sub: any) => sub.status === 'pending' || sub.status === 'waitlist'
          );
          allSubmissions.push(...nonApprovedSubmissions);
        } catch (err) {
          console.error(`Failed to fetch submissions for application ${app.id}:`, err);
        }
      }

      setApplicants(allSubmissions);
    } catch (err: any) {
      console.error('Failed to fetch applicants:', err);
      setError(err.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    applicant: Applicant,
    newStatus: 'approved' | 'waitlist' | 'rejected'
  ) => {
    try {
      setUpdatingId(applicant.id);

      const response = await registrationsApi.update(applicant.id, { status: newStatus });

      // Handle email notification
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, undefined, applicant.id);
      }

      // Remove from list if approved or rejected
      if (newStatus === 'approved' || newStatus === 'rejected') {
        setApplicants((prev) => prev.filter((a) => a.id !== applicant.id));
      } else {
        // Update status for waitlist
        setApplicants((prev) =>
          prev.map((a) => (a.id === applicant.id ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Review',
          color: 'bg-blue-500/20 text-blue-400',
          icon: Clock,
        };
      case 'waitlist':
        return {
          label: 'Waitlisted',
          color: 'bg-yellow-500/20 text-yellow-400',
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-500/20 text-gray-400',
          icon: Clock,
        };
    }
  };

  // Filter applicants
  const filteredApplicants = applicants.filter((applicant) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matches =
        applicant.business_name.toLowerCase().includes(query) ||
        applicant.contact_name?.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.vendor_category.toLowerCase().includes(query);
      if (!matches) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && applicant.status !== statusFilter) return false;

    return true;
  });

  const hasActiveFilters = statusFilter !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 md:p-4">
        <div className="text-center py-12">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={fetchApplicants}
            className="px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-smooth"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-lg font-bold text-white mb-0.5">Applicants</h2>
        <p className="text-[10px] text-white/60">
          {filteredApplicants.length} applications pending review
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
        <input
          type="text"
          placeholder="Search applicants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="waitlist">Waitlisted</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs transition-smooth"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Applicants Grid */}
      {filteredApplicants.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Building2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No Pending Applications</h3>
          <p className="text-xs text-white/60">
            {hasActiveFilters
              ? 'Try adjusting your filters or search query.'
              : 'All applications have been reviewed!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredApplicants.map((applicant) => {
            const statusBadge = getStatusBadge(applicant.status);
            const StatusIcon = statusBadge.icon;
            const isUpdating = updatingId === applicant.id;

            return (
              <div
                key={applicant.id}
                className="glass-card p-3 hover:bg-white/8 hover:border-white/20 transition-smooth"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate mb-0.5">
                      {applicant.business_name}
                    </h3>
                    {applicant.contact_name && (
                      <p className="text-[11px] text-white/60 truncate">{applicant.contact_name}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge.color} flex-shrink-0 ml-2`}
                  >
                    <StatusIcon className="w-2.5 h-2.5" />
                    {statusBadge.label}
                  </span>
                </div>

                {/* Category */}
                <div className="mb-2">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-400">
                    {applicant.vendor_category}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 mb-3">
                  <a
                    href={`mailto:${applicant.email}`}
                    className="flex items-center gap-1.5 text-[11px] text-purple-400 hover:text-purple-300 transition-smooth"
                  >
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{applicant.email}</span>
                  </a>

                  {applicant.phone && (
                    <a
                      href={`tel:${applicant.phone}`}
                      className="flex items-center gap-1.5 text-[11px] text-purple-400 hover:text-purple-300 transition-smooth"
                    >
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{applicant.phone}</span>
                    </a>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {applicant.portfolio && (
                    <a
                      href={
                        applicant.portfolio.startsWith('http')
                          ? applicant.portfolio
                          : `https://${applicant.portfolio}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-smooth"
                    >
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>Portfolio</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {applicant.instagram_handle && (
                    <a
                      href={
                        applicant.instagram_handle.startsWith('http')
                          ? applicant.instagram_handle
                          : `https://instagram.com/${applicant.instagram_handle.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-smooth"
                    >
                      <Instagram className="w-3 h-3" />
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {applicant.tiktok_handle && (
                    <a
                      href={
                        applicant.tiktok_handle.startsWith('http')
                          ? applicant.tiktok_handle
                          : `https://tiktok.com/@${applicant.tiktok_handle.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-smooth"
                    >
                      <Music className="w-3 h-3" />
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {applicant.website && (
                    <a
                      href={
                        applicant.website.startsWith('http')
                          ? applicant.website
                          : `https://${applicant.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-white/80 hover:text-white transition-smooth"
                    >
                      <Globe className="w-3 h-3" />
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  {isUpdating ? (
                    <div className="flex items-center justify-center w-full py-2">
                      <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(applicant, 'approved')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-smooth"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(applicant, 'waitlist')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium transition-smooth"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Waitlist
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(applicant, 'rejected')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-smooth"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Email Notification Dialog */}
      <EmailConfirmationDialog
        open={dialogOpen}
        onOpenChange={closeDialog}
        onConfirm={handleConfirmSend}
        title={dialogProps.title}
        warning={dialogProps.warning}
        recipientCount={dialogProps.recipientCount}
        recipientEmail={dialogProps.recipientEmail}
        type={dialogProps.type}
        isLoading={dialogProps.isLoading}
      />
    </div>
  );
}
