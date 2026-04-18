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
  DollarSign,
  ArrowLeftRight,
  MailX,
} from 'lucide-react';
import { vendorApplicationsApi, registrationsApi, eventInvitationsApi, emailDeliveriesApi } from '@/services/api';
import { toast } from 'sonner';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { EmailConfirmationDialog } from './EmailConfirmationDialog';
import { DebugPanel } from './DebugPanel';

interface Applicant {
  id: string; // Changed to string to support "inv-X" and "reg-X" format
  registrationId?: number; // Actual registration ID for API calls
  invitationId?: number; // Invitation ID for email history
  business_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  vendor_category: string;
  status: 'invited' | 'pending' | 'approved' | 'confirmed' | 'waitlist' | 'rejected' | 'cancelled';
  payment_status?: 'paid' | 'pending' | 'confirmed' | 'overdue' | 'n/a';
  source?: 'contact' | 'net_new';
  is_returning?: boolean;
  portfolio?: string;
  website?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  created_at: string;
  reviewed_at?: string;
  location?: string;
  portfolio_images?: string[];
  producer_notes?: string;
  tags?: string[];
  email_unsubscribed?: boolean;
  unsubscribe_status?: {
    is_unsubscribed: boolean;
    scope: 'global' | 'organization' | 'event' | null;
  };
}

interface ApplicantsTabProps {
  eventSlug: string;
  event?: any;
  isAdmin?: boolean;
}

type StatusFilter = 'all' | 'invited' | 'pending' | 'approved' | 'confirmed' | 'waitlist' | 'rejected' | 'cancelled';

export default function ApplicantsTab({ eventSlug, event, isAdmin }: ApplicantsTabProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Email history state
  const [emailHistoryData, setEmailHistoryData] = useState<any[]>([]);
  const [loadingEmailHistory, setLoadingEmailHistory] = useState(false);

  // Status change confirmation modal state
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    applicant: Applicant;
    newStatus: 'approved' | 'waitlist' | 'rejected';
  } | null>(null);

  // Category change confirmation modal state
  const [showCategoryConfirmModal, setShowCategoryConfirmModal] = useState(false);
  const [pendingCategoryChange, setPendingCategoryChange] = useState<{
    applicant: Applicant;
    newCategory: string;
  } | null>(null);

  // Payment change confirmation modal state
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false);
  const [pendingPaymentChange, setPendingPaymentChange] = useState<{
    applicant: Applicant;
    newPaymentStatus: 'paid' | 'pending';
  } | null>(null);

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

      // Fetch invitations (people who were invited)
      const invitationsResponse = await eventInvitationsApi.getByEvent(eventSlug, 1, 100);
      const invitations = invitationsResponse.invitations || [];

      // Fetch all vendor applications for this event
      const applications = await vendorApplicationsApi.getByEvent(eventSlug);

      // Build available categories from vendor application names
      const categoriesSet = new Set<string>();
      applications.forEach((app: any) => {
        if (app.name) categoriesSet.add(app.name);
      });

      // Fetch submissions for each application
      const allSubmissions: any[] = [];
      for (const app of applications) {
        try {
          const submissions = await vendorApplicationsApi.getSubmissions(app.id);
          const submissionsWithApp = submissions.map((sub: any) => ({
            ...sub,
            vendor_application: { id: app.id, name: app.name },
          }));
          allSubmissions.push(...submissionsWithApp);

          // Add submission categories to the set
          submissions.forEach((sub: any) => {
            if (sub.vendor_category) categoriesSet.add(sub.vendor_category);
          });
        } catch (err) {
          console.error(`Failed to fetch submissions for application ${app.id}:`, err);
        }
      }

      setAvailableCategories(Array.from(categoriesSet).sort());

      // Merge logic: match by email (case-insensitive)
      const emailMap = new Map<string, Applicant>();

      // First, add all submissions/registrations
      allSubmissions.forEach((submission) => {
        const email = submission.email?.toLowerCase();
        if (!email) return;

        emailMap.set(email, {
          id: `reg-${submission.id}`,
          registrationId: submission.id,
          business_name: submission.business_name,
          contact_name: submission.contact_name || submission.name,
          email: submission.email,
          phone: submission.phone,
          instagram_handle: submission.instagram_handle,
          tiktok_handle: submission.tiktok_handle,
          website: submission.website,
          portfolio: submission.portfolio,
          vendor_category: submission.vendor_category,
          status: mapRegistrationStatus(submission.status),
          payment_status: submission.payment_status || 'pending',
          source: 'net_new', // Will be updated if matched with invitation
          created_at: submission.created_at,
          location: submission.location,
          portfolio_images: submission.portfolio_images,
          producer_notes: submission.producer_notes,
          email_unsubscribed: submission.email_unsubscribed,
          unsubscribe_status: submission.email_unsubscribed ? {
            is_unsubscribed: true,
            scope: submission.unsubscribe_scope || 'event'
          } : undefined,
        });
      });

      // Then, merge invitations
      invitations.forEach((invitation: any) => {
        const contact = invitation.vendor_contact;
        if (!contact) return;

        const email = contact.email?.toLowerCase();
        if (!email) return;

        if (emailMap.has(email)) {
          // Contact applied - update source and merge contact data
          const existing = emailMap.get(email)!;
          existing.source = 'contact';
          existing.is_returning = contact.source === 'returning' || contact.source === 'past_event';
          existing.producer_notes = contact.notes || existing.producer_notes;
          existing.tags = contact.tags || [];
          existing.location = contact.location || existing.location;
          existing.invitationId = invitation.id;
          // Merge social media - prefer application data but fall back to contact data
          existing.instagram_handle = existing.instagram_handle || contact.instagram_handle;
          existing.tiktok_handle = existing.tiktok_handle || contact.tiktok_handle;
          existing.website = existing.website || contact.website;
          existing.phone = existing.phone || contact.phone;
          // Merge unsubscribe status - prefer registration data but fall back to contact data
          existing.unsubscribe_status = existing.unsubscribe_status || contact.unsubscribe_status;
          existing.email_unsubscribed = existing.email_unsubscribed || contact.unsubscribe_status?.is_unsubscribed;
        } else {
          // Contact was invited but hasn't applied yet
          emailMap.set(email, {
            id: `inv-${invitation.id}`,
            invitationId: invitation.id,
            business_name: contact.business_name || contact.name,
            contact_name: contact.name,
            email: contact.email,
            phone: contact.phone,
            instagram_handle: contact.instagram_handle,
            tiktok_handle: contact.tiktok_handle,
            website: contact.website,
            vendor_category: 'Pending Application',
            status: 'invited',
            payment_status: 'n/a',
            source: 'contact',
            is_returning: contact.source === 'returning' || contact.source === 'past_event',
            producer_notes: contact.notes,
            tags: contact.tags || [],
            location: contact.location,
            created_at: invitation.created_at || new Date().toISOString(),
            unsubscribe_status: contact.unsubscribe_status,
            email_unsubscribed: contact.unsubscribe_status?.is_unsubscribed,
          });
        }
      });

      const mergedApplicants = Array.from(emailMap.values());
      setApplicants(mergedApplicants);

      // Auto-select first applicant if available
      if (mergedApplicants.length > 0 && !selectedApplicant) {
        setSelectedApplicant(mergedApplicants[0]);
      }
    } catch (err: any) {
      console.error('Failed to fetch applicants:', err);
      setError(err.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  // Map registration status to applicant status
  const mapRegistrationStatus = (regStatus: string): Applicant['status'] => {
    switch (regStatus) {
      case 'pending':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'confirmed':
        return 'confirmed';
      case 'waitlist':
        return 'waitlist';
      case 'rejected':
        return 'rejected';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  // Show confirmation modal before category change
  const requestCategoryChange = (applicant: Applicant, newCategory: string) => {
    if (newCategory === applicant.vendor_category) return; // No change
    setPendingCategoryChange({ applicant, newCategory });
    setShowCategoryConfirmModal(true);
  };

  // Confirm and execute category change
  const confirmCategoryChange = async () => {
    if (!pendingCategoryChange) return;

    const { applicant, newCategory } = pendingCategoryChange;

    // Close modal
    setShowCategoryConfirmModal(false);
    setPendingCategoryChange(null);

    // Execute the category change
    await handleUpdateCategory(applicant, newCategory);
  };

  // Cancel category change
  const cancelCategoryChange = () => {
    setShowCategoryConfirmModal(false);
    setPendingCategoryChange(null);
    // Reset the dropdown to original value
    if (selectedApplicant) {
      setSelectedApplicant({ ...selectedApplicant });
    }
  };

  const handleUpdateCategory = async (applicant: Applicant, newCategory: string) => {
    if (!applicant.registrationId) {
      alert('Cannot update category: No application found');
      return;
    }

    try {
      setIsUpdatingCategory(true);
      const response = await registrationsApi.update(applicant.registrationId, { vendor_category: newCategory });

      // Handle email notification
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, undefined, applicant.registrationId);
      }

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

  // Show confirmation modal before status change
  const requestStatusChange = (applicant: Applicant, newStatus: 'approved' | 'waitlist' | 'rejected') => {
    setPendingStatusChange({ applicant, newStatus });
    setShowStatusConfirmModal(true);
  };

  // Confirm and execute status change
  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { applicant, newStatus } = pendingStatusChange;

    // Close modal
    setShowStatusConfirmModal(false);
    setPendingStatusChange(null);

    // Execute the status change
    await handleUpdateStatus(applicant, newStatus);
  };

  // Cancel status change
  const cancelStatusChange = () => {
    setShowStatusConfirmModal(false);
    setPendingStatusChange(null);
  };

  const handleUpdateStatus = async (
    applicant: Applicant,
    newStatus: 'approved' | 'waitlist' | 'rejected'
  ) => {
    if (!applicant.registrationId) {
      alert('Cannot update status: No application found');
      return;
    }

    try {
      setUpdatingId(applicant.id);

      const response = await registrationsApi.update(applicant.registrationId, { status: newStatus });

      // Handle email notification
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, undefined, applicant.registrationId);
      }

      // Update status in local state
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id
            ? { ...a, status: newStatus, reviewed_at: a.reviewed_at || new Date().toISOString() }
            : a
        )
      );

      // Update selected applicant if it's the one being modified
      if (selectedApplicant?.id === applicant.id) {
        setSelectedApplicant({
          ...selectedApplicant,
          status: newStatus,
          reviewed_at: selectedApplicant.reviewed_at || new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Show confirmation modal before payment change
  const requestPaymentChange = (applicant: Applicant) => {
    if (!applicant.registrationId || applicant.status !== 'approved') return;
    // Only allow marking as paid, not reversing back to pending
    if (applicant.payment_status === 'paid') return;
    const newPaymentStatus = 'paid';
    setPendingPaymentChange({ applicant, newPaymentStatus });
    setShowPaymentConfirmModal(true);
  };

  // Confirm and execute payment change
  const confirmPaymentChange = async () => {
    if (!pendingPaymentChange) return;

    const { applicant, newPaymentStatus } = pendingPaymentChange;

    // Close modal
    setShowPaymentConfirmModal(false);
    setPendingPaymentChange(null);

    // Execute the payment change
    await handleTogglePayment(applicant, newPaymentStatus);
  };

  // Cancel payment change
  const cancelPaymentChange = () => {
    setShowPaymentConfirmModal(false);
    setPendingPaymentChange(null);
  };

  // Handle payment status toggle
  const handleTogglePayment = async (applicant: Applicant, newPaymentStatus: 'paid' | 'pending') => {
    if (!applicant.registrationId || applicant.status !== 'approved') return;

    try {
      setUpdatingId(applicant.id);
      const response = await registrationsApi.update(applicant.registrationId, { payment_status: newPaymentStatus });

      // Handle email notification
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, undefined, applicant.registrationId);
      }

      setApplicants((prev) =>
        prev.map((a) => (a.id === applicant.id ? { ...a, payment_status: newPaymentStatus } : a))
      );

      if (selectedApplicant?.id === applicant.id) {
        setSelectedApplicant({ ...selectedApplicant, payment_status: newPaymentStatus });
      }
    } catch (err: any) {
      console.error('Failed to update payment status:', err);
      alert(`Failed to update payment: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Fetch email history when applicant changes
  useEffect(() => {
    const fetchEmailHistory = async () => {
      if (!selectedApplicant) {
        setEmailHistoryData([]);
        return;
      }

      // Only fetch if applicant has registration or invitation
      if (!selectedApplicant.registrationId && !selectedApplicant.invitationId) {
        setEmailHistoryData([]);
        return;
      }

      try {
        setLoadingEmailHistory(true);
        let allHistory: any[] = [];

        // Fetch registration emails if registrationId exists
        if (selectedApplicant.registrationId) {
          const registrationHistory = await emailDeliveriesApi.getByRegistration(selectedApplicant.registrationId);
          allHistory = [...(registrationHistory || [])];
        }

        // Fetch invitation emails if invitationId exists
        if (selectedApplicant.invitationId) {
          const invitationHistory = await emailDeliveriesApi.getByInvitation(eventSlug, selectedApplicant.invitationId);
          allHistory = [...allHistory, ...(invitationHistory || [])];
        }

        // Sort by date (most recent first)
        allHistory.sort((a, b) => {
          const dateA = new Date(a.delivered_at || a.sent_at || a.created_at).getTime();
          const dateB = new Date(b.delivered_at || b.sent_at || b.created_at).getTime();
          return dateB - dateA;
        });

        setEmailHistoryData(allHistory);
      } catch (err: any) {
        console.error('Failed to fetch email history:', err);
        setEmailHistoryData([]);
      } finally {
        setLoadingEmailHistory(false);
      }
    };

    fetchEmailHistory();
  }, [selectedApplicant, eventSlug]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return {
          label: 'Invited',
          color: 'bg-slate-500/20 text-slate-400',
          icon: Mail,
        };
      case 'pending':
        return {
          label: 'Pending',
          color: 'bg-blue-500/20 text-blue-400',
          icon: Clock,
        };
      case 'approved':
        return {
          label: 'Approved',
          color: 'bg-green-500/20 text-green-400',
          icon: CheckCircle,
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          color: 'bg-green-600/20 text-green-300',
          icon: CheckCircle,
        };
      case 'waitlist':
        return {
          label: 'Waitlisted',
          color: 'bg-yellow-500/20 text-yellow-400',
          icon: AlertCircle,
        };
      case 'rejected':
        return {
          label: 'Declined',
          color: 'bg-red-500/20 text-red-400',
          icon: XCircle,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'bg-gray-500/20 text-gray-400',
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-500/20 text-gray-400',
          icon: Clock,
        };
    }
  };

  const getPaymentBadge = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'paid':
      case 'confirmed':
        return { label: 'Paid', color: 'bg-green-500/20 text-green-400' };
      case 'overdue':
        return { label: 'Overdue', color: 'bg-red-500/20 text-red-400' };
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'n/a':
      default:
        return null;
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

    // Category filter
    if (categoryFilter !== 'all' && applicant.vendor_category !== categoryFilter) return false;

    return true;
  });

  // Derive unique categories from applicants
  const uniqueCategories = [...new Set(applicants.map(a => a.vendor_category).filter(Boolean))].sort();

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
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
        <div className="w-80 border-r border-white/10 flex flex-col">
          {/* List Header */}
          <div className="px-3 md:px-4 pb-3 border-b border-white/10">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-white">Vendors & Applicants</h2>
              <p className="text-[10px] text-white/60">
                {filteredApplicants.length} total
                {statusFilter !== 'all' && ` • ${statusFilter}`}
                {categoryFilter !== 'all' && ` • ${categoryFilter}`}
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

            {/* Status & Category Filters */}
            <div className="space-y-1.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-2 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              >
                <option value="all">All Status</option>
                <option value="invited">Invited (No Application)</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlist">Waitlist</option>
                <option value="rejected">Declined</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {uniqueCategories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full px-2 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs transition-smooth"
                >
                  Clear filters
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
              <div className="py-2 px-3 md:px-4 space-y-1">
                {filteredApplicants.map((applicant) => {
                  const statusBadge = getStatusBadge(applicant.status);
                  const StatusIcon = statusBadge.icon;
                  const isSelected = selectedApplicant?.id === applicant.id;

                  const paymentBadge = getPaymentBadge(applicant.payment_status);

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
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <h3 className="text-xs font-semibold text-white truncate">
                            {applicant.contact_name || applicant.business_name}
                          </h3>
                          {applicant.is_returning && (
                            <Star className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0" fill="currentColor" />
                          )}
                          {applicant.email_unsubscribed && (
                            <MailX className="w-2.5 h-2.5 text-orange-400 flex-shrink-0" />
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${statusBadge.color} flex-shrink-0 ml-2`}
                        >
                          <StatusIcon className="w-2 h-2" />
                          {statusBadge.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/60 truncate mb-1.5">
                        {applicant.contact_name ? applicant.business_name || applicant.email : applicant.email}
                      </p>
                      <div className="flex flex-wrap items-center gap-1">
                        {applicant.status !== 'invited' && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-500/20 text-purple-400">
                            {applicant.vendor_category}
                          </span>
                        )}
                        {applicant.source === 'net_new' && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-cyan-500/20 text-cyan-400">
                            New
                          </span>
                        )}
                        {paymentBadge && applicant.status === 'approved' && (
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${paymentBadge.color}`}>
                            <DollarSign className="w-2 h-2" />
                            {paymentBadge.label}
                          </span>
                        )}
                      </div>
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
            <div className="px-3 md:px-4 pb-4">
              {/* Detail Header */}
              <div className="glass-card p-4 mb-3">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-lg font-bold text-white">{selectedApplicant.contact_name || selectedApplicant.business_name}</h2>
                      {selectedApplicant.is_returning && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                          <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                          <span className="text-[10px] font-medium text-yellow-400">Returning</span>
                        </div>
                      )}
                      {selectedApplicant.source && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          selectedApplicant.source === 'net_new'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {selectedApplicant.source === 'net_new' ? 'New Applicant' : 'From Contacts'}
                        </span>
                      )}
                      {selectedApplicant.email_unsubscribed && selectedApplicant.unsubscribe_status && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30">
                          <MailX className="w-3 h-3 text-orange-400" />
                          <span className="text-[10px] font-medium text-orange-400">
                            Unsubscribed ({selectedApplicant.unsubscribe_status.scope})
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedApplicant.contact_name && selectedApplicant.business_name && (
                      <p className="text-sm text-white/80 mb-2">{selectedApplicant.business_name}</p>
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
                  {selectedApplicant.status === 'invited' ? (
                    <div className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white/40 text-xs border border-white/10 italic">
                      Pending Application
                    </div>
                  ) : (
                    <select
                      value={selectedApplicant.vendor_category}
                      onChange={(e) => requestCategoryChange(selectedApplicant, e.target.value)}
                      disabled={isUpdatingCategory}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {availableCategories.length > 0 ? (
                        // Show all available categories, ensuring current category is included
                        [...new Set([selectedApplicant.vendor_category, ...availableCategories])].filter(Boolean).sort().map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))
                      ) : (
                        <option value={selectedApplicant.vendor_category}>
                          {selectedApplicant.vendor_category}
                        </option>
                      )}
                    </select>
                  )}
                </div>
              </div>

              {/* Social & Links */}
              <div className="glass-card p-3 mb-3">
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
                </div>
              </div>

              {/* Portfolio Images */}
              {selectedApplicant.portfolio_images && selectedApplicant.portfolio_images.length > 0 && (
                <div className="glass-card p-3 mb-3">
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

              {/* Status & Payment Management - Only show for applicants who have applied */}
              {selectedApplicant.status !== 'invited' && selectedApplicant.registrationId && (
                <div className="glass-card p-3 mb-3">
                  <h3 className="text-sm font-semibold text-white mb-3">Status & Actions</h3>
                  {updatingId === selectedApplicant.id ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                  ) : selectedApplicant.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => requestStatusChange(selectedApplicant, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs font-medium transition-smooth"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => requestStatusChange(selectedApplicant, 'waitlist')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs font-medium transition-smooth"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Waitlist
                      </button>
                      <button
                        onClick={() => requestStatusChange(selectedApplicant, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-smooth"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Vendor Status Row */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div>
                          <p className="text-[10px] text-white/60 mb-1">Vendor Status</p>
                          <p className="text-xs text-white font-medium">{getStatusBadge(selectedApplicant.status).label}</p>
                        </div>
                        <select
                          value={selectedApplicant.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'approved' | 'waitlist' | 'rejected';
                            if (newStatus !== selectedApplicant.status) {
                              requestStatusChange(selectedApplicant, newStatus);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-xs border border-white/20 hover:bg-white/20 transition-smooth"
                        >
                          <option value={selectedApplicant.status}>Keep as {getStatusBadge(selectedApplicant.status).label}</option>
                          <option value="approved">Change to Approved</option>
                          <option value="waitlist">Change to Waitlist</option>
                          <option value="rejected">Change to Declined</option>
                        </select>
                      </div>

                      {/* Payment Status Row - Only for approved with payment tracking */}
                      {selectedApplicant.status === 'approved' && selectedApplicant.payment_status !== 'n/a' && (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-white/60 mb-1">Payment Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              getPaymentBadge(selectedApplicant.payment_status)?.color || 'bg-gray-500/20 text-gray-400'
                            }`}>
                              <DollarSign className="w-3.5 h-3.5" />
                              {getPaymentBadge(selectedApplicant.payment_status)?.label || 'Unknown'}
                            </span>
                          </div>
                          {selectedApplicant.payment_status !== 'paid' && (
                            <button
                              onClick={() => requestPaymentChange(selectedApplicant)}
                              disabled={updatingId === selectedApplicant.id}
                              className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs border border-white/20 hover:bg-white/20 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Email History */}
              {(selectedApplicant.registrationId || selectedApplicant.invitationId) && (
                <div className="glass-card p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Email History</h3>

                  {loadingEmailHistory ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                  ) : emailHistoryData.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {emailHistoryData.map((delivery: any) => {
                        const deliveryStatus = delivery.status;
                        const emailSubject = delivery.subject || delivery.scheduled_email?.subject || 'Unknown Email';
                        const deliveredDate = delivery.delivered_at || delivery.sent_at || delivery.created_at;

                        let statusColor = 'text-white/40';
                        if (deliveryStatus === 'delivered') statusColor = 'text-green-400';
                        else if (deliveryStatus === 'bounced') statusColor = 'text-red-400';
                        else if (deliveryStatus === 'dropped') statusColor = 'text-orange-400';
                        else if (deliveryStatus === 'unsubscribed') statusColor = 'text-yellow-400';

                        return (
                          <div key={delivery.id} className="flex items-center gap-2 py-1.5">
                            <Mail className="w-3 h-3 text-white/30 flex-shrink-0" />
                            <span className="text-[10px] text-white/70 truncate flex-1">{emailSubject}</span>
                            <span className="text-[10px] text-white/40 tabular-nums flex-shrink-0">
                              {deliveredDate ? new Date(deliveredDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              }) : '—'}
                            </span>
                            <span className={`text-[10px] font-medium ${statusColor} flex-shrink-0 w-16 text-right`}>
                              {deliveryStatus}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-3 px-2">
                      {selectedApplicant.unsubscribe_status?.is_unsubscribed ? (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                          <MailX className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-orange-400 font-medium mb-1">
                              No Emails Sent (Unsubscribed)
                            </p>
                            <p className="text-[10px] text-white/60">
                              This vendor unsubscribed from {selectedApplicant.unsubscribe_status.scope} emails.
                              No automated messages will be sent.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                          <Clock className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-white/60 font-medium mb-1">No Email History</p>
                            <p className="text-[10px] text-white/40">
                              No automated emails have been triggered yet.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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

      {/* Status Change Confirmation Modal */}
      {showStatusConfirmModal && pendingStatusChange && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-white/10 max-w-md w-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                pendingStatusChange.newStatus === 'approved'
                  ? 'bg-green-500/20'
                  : pendingStatusChange.newStatus === 'rejected'
                  ? 'bg-red-500/20'
                  : 'bg-yellow-500/20'
              }`}>
                <Mail className={`w-5 h-5 ${
                  pendingStatusChange.newStatus === 'approved'
                    ? 'text-green-400'
                    : pendingStatusChange.newStatus === 'rejected'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Change Status to {pendingStatusChange.newStatus === 'approved' ? 'Approved' : pendingStatusChange.newStatus === 'rejected' ? 'Declined' : 'Waitlisted'}?
                </h3>
                <p className="text-sm text-white/60">
                  This will send an automated email notification
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <p className="text-xs text-orange-400">
                <strong>⚠️ Email will be sent to:</strong><br />
                {pendingStatusChange.applicant.email}
              </p>
            </div>

            {/* Vendor Info */}
            <div className="bg-white/5 rounded-lg p-3 space-y-1">
              <p className="text-sm text-white font-medium">
                {pendingStatusChange.applicant.business_name}
              </p>
              <p className="text-xs text-white/60">
                {pendingStatusChange.applicant.contact_name || pendingStatusChange.applicant.email}
              </p>
              <p className="text-xs text-purple-400">
                {pendingStatusChange.applicant.vendor_category}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={cancelStatusChange}
                className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-smooth text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-smooth ${
                  pendingStatusChange.newStatus === 'approved'
                    ? 'bg-green-600 hover:bg-green-500'
                    : pendingStatusChange.newStatus === 'rejected'
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-yellow-600 hover:bg-yellow-500'
                }`}
              >
                Confirm & Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Change Confirmation Modal */}
      {showCategoryConfirmModal && pendingCategoryChange && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-white/10 max-w-md w-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <ArrowLeftRight className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Reassign Category?
                </h3>
                <p className="text-sm text-white/60">
                  This may affect pricing. You can notify the vendor in the next step.
                </p>
              </div>
            </div>

            {/* Category Change Info */}
            <div className="bg-white/5 rounded-lg p-3 space-y-2">
              <p className="text-sm text-white font-medium">
                {pendingCategoryChange.applicant.business_name}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 line-through">
                  {pendingCategoryChange.applicant.vendor_category}
                </span>
                <span className="text-white/40">→</span>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">
                  {pendingCategoryChange.newCategory}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={cancelCategoryChange}
                className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-smooth text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmCategoryChange}
                className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-smooth"
              >
                Reassign Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Change Confirmation Modal */}
      {showPaymentConfirmModal && pendingPaymentChange && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-white/10 max-w-md w-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                pendingPaymentChange.newPaymentStatus === 'paid'
                  ? 'bg-green-500/20'
                  : 'bg-yellow-500/20'
              }`}>
                <Mail className={`w-5 h-5 ${
                  pendingPaymentChange.newPaymentStatus === 'paid'
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Mark as {pendingPaymentChange.newPaymentStatus === 'paid' ? 'Paid' : 'Pending'}?
                </h3>
                <p className="text-sm text-white/60">
                  This will send an automated email notification
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <p className="text-xs text-orange-400">
                <strong>⚠️ Email will be sent to:</strong><br />
                {pendingPaymentChange.applicant.email}
              </p>
            </div>

            {/* Payment Change Info */}
            <div className="bg-white/5 rounded-lg p-3 space-y-2">
              <p className="text-sm text-white font-medium">
                {pendingPaymentChange.applicant.business_name}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <DollarSign className="w-4 h-4 text-white/60" />
                <span className={`px-2 py-1 rounded ${
                  pendingPaymentChange.applicant.payment_status === 'paid'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                } line-through`}>
                  {pendingPaymentChange.applicant.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
                <span className="text-white/40">→</span>
                <span className={`px-2 py-1 rounded ${
                  pendingPaymentChange.newPaymentStatus === 'paid'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {pendingPaymentChange.newPaymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={cancelPaymentChange}
                className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-smooth text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmPaymentChange}
                className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-smooth ${
                  pendingPaymentChange.newPaymentStatus === 'paid'
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-yellow-600 hover:bg-yellow-500'
                }`}
              >
                Confirm & Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Applicants Tab"
        data={{
          event,
          eventSlug,
          applicants,
          selectedApplicant,
          statusFilter,
          searchQuery,
          availableCategories,
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
