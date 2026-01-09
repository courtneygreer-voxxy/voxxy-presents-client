import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Building2, Mail, Phone, Link as LinkIcon, Instagram, Globe, Star, Music } from 'lucide-react';
import { vendorApplicationsApi, registrationsApi } from '@/services/api';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { EmailConfirmationDialog } from './EmailConfirmationDialog';

interface VendorSubmission {
  id: number;
  business_name: string;
  email: string;
  phone?: string;
  vendor_category: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed';
  payment_status?: 'pending' | 'paid' | 'confirmed' | 'overdue';
  payment_confirmed_at?: string;
  ticket_code: string;
  created_at: string;
  contact_name?: string;
  website?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  portfolio?: string;
  description?: string;
  vendor_application: {
    id: number;
    name: string;
    categories?: string[];
    booth_price?: number;
    pricing?: {
      booth_price?: number;
      currency?: string;
    };
  };
}

interface ApplicantsTabProps {
  eventSlug: string;
}

type StatusFilter = 'all' | 'new' | 'approved' | 'waitlist' | 'rejected';

export default function ApplicantsTab({ eventSlug }: ApplicantsTabProps) {
  const [applicants, setApplicants] = useState<VendorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [allAvailableCategories, setAllAvailableCategories] = useState<string[]>([]);

  // Email notifications hook
  const { dialogOpen, dialogProps, handleEmailNotification, handleConfirmSend, closeDialog } = useEmailNotifications();

  useEffect(() => {
    fetchApplicants();
  }, [eventSlug]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all vendor applications for this event
      const applications = await vendorApplicationsApi.getByEvent(eventSlug);

      // Debug: Log applications data
      console.log('Vendor applications fetched:', applications);
      console.log('First application structure:', applications[0]);

      // Fetch submissions for each application
      const allSubmissions: VendorSubmission[] = [];
      for (const app of applications) {
        try {
          const submissions = await vendorApplicationsApi.getSubmissions(app.id);
          // Add application info to each submission
          const submissionsWithApp = submissions.map((sub: any) => ({
            ...sub,
            vendor_application: {
              id: app.id,
              name: app.name,
              categories: app.categories,
              booth_price: app.booth_price || app.pricing?.booth_price,
              pricing: app.pricing,
            },
          }));
          allSubmissions.push(...submissionsWithApp);
        } catch (err) {
          console.error(`Failed to fetch submissions for application ${app.id}:`, err);
        }
      }

      // Debug: Log first submission to verify data structure
      if (allSubmissions.length > 0) {
        console.log('Sample submission data:', allSubmissions[0]);
      }

      // Collect all unique categories from all vendor applications for this event
      const allCategories = new Set<string>();
      applications.forEach((app, index) => {
        console.log(`Application ${index}:`, {
          id: app.id,
          name: app.name,
          categories: app.categories,
          hasCategories: !!app.categories,
          isArray: Array.isArray(app.categories),
          categoriesLength: app.categories?.length
        });

        if (app.categories && Array.isArray(app.categories)) {
          app.categories.forEach((cat: string) => allCategories.add(cat));
        }
      });

      const categoriesArray = Array.from(allCategories);
      setAllAvailableCategories(categoriesArray);

      console.log('All available categories for event:', categoriesArray);
      console.log('Total unique categories:', categoriesArray.length);

      setApplicants(allSubmissions);
    } catch (err: any) {
      console.error('Failed to fetch applicants:', err);
      setError(err.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    applicantId: number,
    newStatus: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
  ) => {
    try {
      setUpdatingId(applicantId);
      const response = await registrationsApi.update(applicantId, { status: newStatus });

      // Check if email notification is needed
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, undefined, applicantId);
      }

      // Update local state with the actual data returned from backend
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicantId
            ? { ...applicant, status: response.registration?.status || newStatus }
            : applicant
        )
      );
    } catch (err: any) {
      console.error('Failed to update applicant status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdatePaymentStatus = async (
    applicantId: number,
    newPaymentStatus: 'pending' | 'paid' | 'confirmed' | 'overdue'
  ) => {
    try {
      setUpdatingId(applicantId);
      const response = await registrationsApi.update(applicantId, { payment_status: newPaymentStatus });

      // Check if email notification is needed
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, undefined, applicantId);
      }

      // Update local state with the actual data returned from backend
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicantId
            ? {
                ...applicant,
                payment_status: response.registration?.payment_status || newPaymentStatus,
                payment_confirmed_at: response.registration?.payment_confirmed_at || applicant.payment_confirmed_at
              }
            : applicant
        )
      );
    } catch (err: any) {
      console.error('Failed to update payment status:', err);
      alert(`Failed to update payment status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateCategory = async (
    applicantId: number,
    newCategory: string
  ) => {
    try {
      setUpdatingId(applicantId);
      const response = await registrationsApi.update(applicantId, { vendor_category: newCategory });

      // Check if email notification is needed (backend will return notification for category changes)
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, undefined, applicantId);
      }

      // Update local state with the actual data returned from backend
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicantId
            ? {
                ...applicant,
                vendor_category: response.registration?.vendor_category || newCategory
              }
            : applicant
        )
      );
    } catch (err: any) {
      console.error('Failed to update vendor category:', err);
      alert(`Failed to update category: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'New', color: 'bg-blue-500/20 text-blue-400' };
      case 'approved':
      case 'confirmed':
        return { label: 'Approved', color: 'bg-green-500/20 text-green-400' };
      case 'waitlist':
        return { label: 'Waitlist', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-500/20 text-red-400' };
      default:
        return { label: status, color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'paid':
      case 'confirmed':
        return { label: 'Paid', color: 'bg-green-500/20 text-green-400', icon: '✓' };
      case 'overdue':
        return { label: 'Overdue', color: 'bg-red-500/20 text-red-400', icon: '!' };
      case 'pending':
      default:
        return { label: 'Unpaid', color: 'bg-yellow-500/20 text-yellow-400', icon: '○' };
    }
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(applicants.map(a => a.vendor_category)))];

  // Filter applicants
  const filteredApplicants = applicants.filter((applicant) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        applicant.business_name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.contact_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'new' && applicant.status !== 'pending') return false;
      if (statusFilter !== 'new' && applicant.status !== statusFilter) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && applicant.vendor_category !== categoryFilter) {
      return false;
    }

    return true;
  });

  // Calculate counts
  const statusCounts = {
    all: applicants.length,
    new: applicants.filter((a) => a.status === 'pending').length,
    approved: applicants.filter((a) => a.status === 'approved' || a.status === 'confirmed').length,
    waitlist: applicants.filter((a) => a.status === 'waitlist').length,
    rejected: applicants.filter((a) => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchApplicants}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-white">Applicants</h2>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-semibold">
            {statusCounts.all}
          </span>
        </div>
        <p className="text-white/60">Review and manage vendor applications</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">Category: All</option>
            {categories.filter(c => c !== 'all').map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Status Filters */}
          <div className="flex items-center gap-2">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'new', label: 'New' },
                { key: 'approved', label: 'Approved' },
                { key: 'waitlist', label: 'Waitlist' },
                { key: 'rejected', label: 'Rejected' },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  statusFilter === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {label} ({statusCounts[key]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      {filteredApplicants.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <Building2 className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Applicants Found</h3>
          <p className="text-white/60">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Vendor applications will appear here once vendors apply.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#1e1536] rounded-xl border border-purple-500/20 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-6 py-4 bg-white/5 border-b border-white/10">
            <div className="text-sm font-semibold text-white/80">Business Name</div>
            <div className="text-sm font-semibold text-white/80">Category</div>
            <div className="text-sm font-semibold text-white/80">Status</div>
            <div className="text-sm font-semibold text-white/80">Payment</div>
            <div className="text-sm font-semibold text-white/80">Submitted</div>
          </div>

          {/* Table Body */}
          <div>
            {filteredApplicants.map((applicant) => {
              const isExpanded = expandedId === applicant.id;
              const statusBadge = getStatusBadge(applicant.status);

              return (
                <div key={applicant.id} className="border-b border-white/10 last:border-b-0">
                  {/* Row Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : applicant.id)}
                    className="w-full grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-white/60 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/60 flex-shrink-0" />
                      )}
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-white font-medium">{applicant.business_name}</span>
                        {applicant.website && (
                          <LinkIcon className="w-3 h-3 text-white/40" />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                        {applicant.vendor_category}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div>
                      {(() => {
                        const paymentBadge = getPaymentStatusBadge(applicant.payment_status);
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${paymentBadge.color}`}>
                            <span>{paymentBadge.icon}</span>
                            {paymentBadge.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-white/60 text-sm">
                      {formatDate(applicant.created_at)}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pt-6 pb-6 bg-[#14102a]">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Contact Info */}
                        <div className="space-y-4">
                          <h4 className="text-white font-semibold text-sm mb-3">Contact Information</h4>

                          {applicant.contact_name && (
                            <div>
                              <p className="text-white/60 text-xs mb-1">Contact Name</p>
                              <p className="text-white">{applicant.contact_name}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-white/60 text-xs mb-1">Email</p>
                            <a
                              href={`mailto:${applicant.email}`}
                              className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
                            >
                              <Mail className="w-4 h-4" />
                              {applicant.email}
                            </a>
                          </div>

                          {applicant.phone && (
                            <div>
                              <p className="text-white/60 text-xs mb-1">Phone</p>
                              <a
                                href={`tel:${applicant.phone}`}
                                className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
                              >
                                <Phone className="w-4 h-4" />
                                {applicant.phone}
                              </a>
                            </div>
                          )}

                          {/* Social Links */}
                          <div>
                            <p className="text-white/60 text-xs mb-2">Social Links</p>
                            <div className="space-y-2">
                              {/* Instagram */}
                              <div className="flex items-center gap-2">
                                <Instagram className="w-4 h-4 text-white/60" />
                                {applicant.instagram_handle ? (
                                  <a
                                    href={applicant.instagram_handle}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 text-sm"
                                  >
                                    {applicant.instagram_handle}
                                  </a>
                                ) : (
                                  <span className="text-white/40 text-sm">N/A</span>
                                )}
                              </div>

                              {/* TikTok */}
                              <div className="flex items-center gap-2">
                                <Music className="w-4 h-4 text-white/60" />
                                {applicant.tiktok_handle ? (
                                  <a
                                    href={applicant.tiktok_handle}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 text-sm"
                                  >
                                    {applicant.tiktok_handle}
                                  </a>
                                ) : (
                                  <span className="text-white/40 text-sm">N/A</span>
                                )}
                              </div>

                              {/* Website/Portfolio */}
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-white/60" />
                                {applicant.website ? (
                                  <a
                                    href={applicant.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 text-sm"
                                  >
                                    {applicant.website}
                                  </a>
                                ) : (
                                  <span className="text-white/40 text-sm">N/A</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-white/60 text-xs mb-1">Ticket Code</p>
                            <code className="text-sm text-purple-300 font-mono bg-black/20 px-2 py-1 rounded">
                              {applicant.ticket_code}
                            </code>
                          </div>
                        </div>

                        {/* Right Column - Application Details & Actions */}
                        <div className="space-y-4">
                          {applicant.description && (
                            <div>
                              <p className="text-white/60 text-xs mb-1">Application Note</p>
                              <p className="text-white/80 text-sm">{applicant.description}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-white/60 text-xs mb-1">Applied</p>
                            <p className="text-white text-sm">{formatDate(applicant.created_at)}</p>
                          </div>

                          {/* Vendor Category */}
                          <div className="pt-4 border-t border-white/10">
                            <p className="text-white/60 text-xs mb-3">Vendor Category</p>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-purple-500/20 text-purple-400">
                                  {applicant.vendor_category}
                                </span>
                                {allAvailableCategories.length > 0 ? (
                                  <select
                                    value={applicant.vendor_category}
                                    onChange={(e) => handleUpdateCategory(applicant.id, e.target.value)}
                                    disabled={updatingId === applicant.id}
                                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {allAvailableCategories.map((category) => (
                                      <option key={category} value={category}>
                                        {category === applicant.vendor_category ? `Current: ${category}` : `Change to: ${category}`}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-white/40 text-xs italic">No categories available - check event settings</span>
                                )}
                              </div>
                              {(() => {
                                const boothPrice = applicant.vendor_application?.booth_price || applicant.vendor_application?.pricing?.booth_price;
                                return boothPrice ? (
                                  <p className="text-white/40 text-xs">
                                    Booth Price: ${Number(boothPrice).toFixed(2)}
                                  </p>
                                ) : null;
                              })()}
                              {/* Debug info - remove after testing */}
                              {process.env.NODE_ENV === 'development' && (
                                <p className="text-white/30 text-xs font-mono">
                                  Debug: {allAvailableCategories.length} total categories from all applications
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Payment Status */}
                          <div className="pt-4 border-t border-white/10">
                            <p className="text-white/60 text-xs mb-3">Payment Status</p>
                            <div className="flex items-center gap-3">
                              {(() => {
                                const paymentBadge = getPaymentStatusBadge(applicant.payment_status);
                                return (
                                  <>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${paymentBadge.color}`}>
                                      <span>{paymentBadge.icon}</span>
                                      {paymentBadge.label}
                                    </span>
                                    <select
                                      value={applicant.payment_status || 'pending'}
                                      onChange={(e) =>
                                        handleUpdatePaymentStatus(
                                          applicant.id,
                                          e.target.value as 'pending' | 'paid' | 'confirmed' | 'overdue'
                                        )
                                      }
                                      disabled={updatingId === applicant.id}
                                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <option value="pending">Mark as Unpaid</option>
                                      <option value="paid">Mark as Paid</option>
                                      <option value="confirmed">Mark as Confirmed</option>
                                      <option value="overdue">Mark as Overdue</option>
                                    </select>
                                  </>
                                );
                              })()}
                            </div>
                            {applicant.payment_confirmed_at && (
                              <p className="text-white/40 text-xs mt-2">
                                Confirmed: {formatDate(applicant.payment_confirmed_at)}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-4 border-t border-white/10">
                            <p className="text-white/60 text-xs mb-3">Actions</p>
                            {updatingId === applicant.id ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                              </div>
                            ) : applicant.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateStatus(applicant.id, 'approved')}
                                  className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-semibold"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(applicant.id, 'waitlist')}
                                  className="flex-1 px-4 py-2.5 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-sm font-semibold"
                                >
                                  Waitlist
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(applicant.id, 'rejected')}
                                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <select
                                value={applicant.status}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    applicant.id,
                                    e.target.value as 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
                                  )
                                }
                                className="w-full px-4 py-2.5 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-colors"
                              >
                                <option value="pending">New</option>
                                <option value="approved">Approved</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="waitlist">Waitlist</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Email Confirmation Dialog */}
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
