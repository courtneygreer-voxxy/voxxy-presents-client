import React, { useState, useEffect } from 'react';
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
  MapPin,
  Calendar,
  CreditCard,
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
  location?: string;
  portfolio_images?: string[];
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
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

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
      // Auto-select first applicant if available
      if (allSubmissions.length > 0 && !selectedApplicant) {
        setSelectedApplicant(allSubmissions[0]);
      }
    } catch (err: any) {
      console.error('Failed to fetch applicants:', err);
      setError(err.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (applicant: Applicant, newCategory: string) => {
    try {
      setIsUpdatingCategory(true);
      await registrationsApi.update(applicant.id, { vendor_category: newCategory });

      // Update local state
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, vendor_category: newCategory } : a
        )
      );

      // Update selected applicant if it's the one being modified
      if (selectedApplicant?.id === applicant.id) {
        setSelectedApplicant({ ...selectedApplicant, vendor_category: newCategory });
      }
    } catch (err: any) {
      console.error('Failed to update category:', err);
      alert(`Failed to update category: ${err.message}`);
    } finally {
      setIsUpdatingCategory(false);
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
        setApplicants((prev) => {
          const updated = prev.filter((a) => a.id !== applicant.id);
          // Select next applicant if current one was selected
          if (selectedApplicant?.id === applicant.id && updated.length > 0) {
            setSelectedApplicant(updated[0]);
          } else if (updated.length === 0) {
            setSelectedApplicant(null);
          }
          return updated;
        });
      } else {
        // Update status for waitlist
        setApplicants((prev) =>
          prev.map((a) => (a.id === applicant.id ? { ...a, status: newStatus } : a))
        );
        // Update selected applicant if it's the one being modified
        if (selectedApplicant?.id === applicant.id) {
          setSelectedApplicant({ ...selectedApplicant, status: newStatus });
        }
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
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
    <div className="h-full flex flex-col">
      {/* Two-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Applicant List */}
        <div className="w-80 border-r border-white/10 flex flex-col bg-[#0f0820]/50">
          {/* List Header */}
          <div className="p-3 border-b border-white/10">
            <div className="mb-2">
              <h2 className="text-sm font-bold text-white">Applicants</h2>
              <p className="text-[10px] text-white/60">
                {filteredApplicants.length} pending review
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="waitlist">Waitlist</option>
              </select>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-2 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs transition-smooth"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Applicant List */}
          <div className="flex-1 overflow-y-auto">
            {filteredApplicants.length === 0 ? (
              <div className="p-4 text-center">
                <Building2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/60">
                  {hasActiveFilters ? 'No matches found' : 'No pending applications'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredApplicants.map((applicant) => {
                  const statusBadge = getStatusBadge(applicant.status);
                  const StatusIcon = statusBadge.icon;
                  const isSelected = selectedApplicant?.id === applicant.id;

                  return (
                    <button
                      key={applicant.id}
                      onClick={() => setSelectedApplicant(applicant)}
                      className={`w-full p-2 rounded-lg text-left transition-smooth ${
                        isSelected
                          ? 'bg-purple-600/20 border border-purple-500/50'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-xs font-semibold text-white truncate flex-1">
                          {applicant.business_name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${statusBadge.color} flex-shrink-0 ml-2`}
                        >
                          <StatusIcon className="w-2 h-2" />
                          {statusBadge.label === 'Pending Review' ? 'Pending' : statusBadge.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/60 truncate mb-1">
                        {applicant.contact_name || applicant.email}
                      </p>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-500/20 text-purple-400">
                        {applicant.vendor_category}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Detail View */}
        <div className="flex-1 overflow-y-auto">
          {!selectedApplicant ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Building2 className="w-16 h-16 text-white/20 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">No Applicant Selected</h3>
                <p className="text-xs text-white/60">Select an applicant from the list to view details</p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {/* Detail Header */}
              <div className="glass-card p-4 mb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white mb-1">{selectedApplicant.business_name}</h2>
                    {selectedApplicant.contact_name && (
                      <p className="text-sm text-white/80 mb-2">{selectedApplicant.contact_name}</p>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        getStatusBadge(selectedApplicant.status).color
                      }`}
                    >
                      {React.createElement(getStatusBadge(selectedApplicant.status).icon, {
                        className: 'w-3 h-3',
                      })}
                      {getStatusBadge(selectedApplicant.status).label}
                    </span>
                  </div>
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-white/60 mb-1">Email</p>
                    <a
                      href={`mailto:${selectedApplicant.email}`}
                      className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-smooth"
                    >
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{selectedApplicant.email}</span>
                    </a>
                  </div>
                  {selectedApplicant.phone && (
                    <div>
                      <p className="text-[10px] text-white/60 mb-1">Phone</p>
                      <a
                        href={`tel:${selectedApplicant.phone}`}
                        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-smooth"
                      >
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{selectedApplicant.phone}</span>
                      </a>
                    </div>
                  )}
                  {selectedApplicant.location && (
                    <div>
                      <p className="text-[10px] text-white/60 mb-1">Location</p>
                      <div className="flex items-center gap-1.5 text-xs text-white/80">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-white/60" />
                        <span>{selectedApplicant.location}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-white/60 mb-1">Applied</p>
                    <div className="flex items-center gap-1.5 text-xs text-white/80">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-white/60" />
                      <span>{formatDate(selectedApplicant.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="mb-3">
                  <p className="text-[10px] text-white/60 mb-1">Category</p>
                  <select
                    value={selectedApplicant.vendor_category}
                    onChange={(e) => handleUpdateCategory(selectedApplicant, e.target.value)}
                    disabled={isUpdatingCategory}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Artist">Artist</option>
                    <option value="Artisan">Artisan</option>
                    <option value="Crafts">Crafts</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home Goods">Home Goods</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Social & Links */}
              <div className="glass-card p-4 mb-3">
                <h3 className="text-sm font-semibold text-white mb-3">Social & Links</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.instagram_handle && (
                    <a
                      href={
                        selectedApplicant.instagram_handle.startsWith('http')
                          ? selectedApplicant.instagram_handle
                          : `https://instagram.com/${selectedApplicant.instagram_handle.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white transition-smooth border border-white/10"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Instagram</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {selectedApplicant.tiktok_handle && (
                    <a
                      href={
                        selectedApplicant.tiktok_handle.startsWith('http')
                          ? selectedApplicant.tiktok_handle
                          : `https://tiktok.com/@${selectedApplicant.tiktok_handle.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white transition-smooth border border-white/10"
                    >
                      <Music className="w-4 h-4" />
                      <span>TikTok</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {selectedApplicant.portfolio && (
                    <a
                      href={
                        selectedApplicant.portfolio.startsWith('http')
                          ? selectedApplicant.portfolio
                          : `https://${selectedApplicant.portfolio}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white transition-smooth border border-white/10"
                    >
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>Portfolio</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {selectedApplicant.website && (
                    <a
                      href={
                        selectedApplicant.website.startsWith('http')
                          ? selectedApplicant.website
                          : `https://${selectedApplicant.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white transition-smooth border border-white/10"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white transition-smooth border border-white/10">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    <span>Voxxy Card</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </button>
                </div>
              </div>

              {/* Portfolio Images */}
              {selectedApplicant.portfolio_images && selectedApplicant.portfolio_images.length > 0 && (
                <div className="glass-card p-4 mb-3">
                  <h3 className="text-sm font-semibold text-white mb-3">Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedApplicant.portfolio_images.map((image, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg bg-white/5 border border-white/10 overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Portfolio ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="glass-card p-4">
                {updatingId === selectedApplicant.id ? (
                  <div className="flex items-center justify-center py-3">
                    <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedApplicant, 'approved')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-smooth"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApplicant, 'waitlist')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium transition-smooth"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Waitlist
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApplicant, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-smooth"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
