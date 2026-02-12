import { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Building2,
  Mail,
  Phone,
  Instagram,
  Music,
  Globe,
  Star,
  Check,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { eventInvitationsApi, vendorApplicationsApi, registrationsApi, emailDeliveriesApi } from '@/services/api';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { EmailConfirmationDialog } from './EmailConfirmationDialog';

// Unified invite row interface
interface InviteRow {
  id: string;
  businessName: string;
  contactName?: string;
  email: string;
  phone?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
  portfolioUrl?: string;
  category: string;
  status: 'invited' | 'applied' | 'approved' | 'waitlist' | 'declined' | 'bounced' | 'unsubscribed';
  paymentStatus?: 'paid' | 'pending' | 'confirmed' | 'overdue' | 'n/a';
  source: 'contact' | 'net_new';
  isReturning?: boolean;
  hasVoxxyCard?: boolean;
  voxxyCardId?: string | null;
  reviewedAt?: string | null;
  appliedAt?: string | null;
  producerNotes?: string | null;
  location?: string;
  tags?: string[];
  registrationId?: number;
  invitationId?: number;
}

interface InvitesTabProps {
  eventSlug: string;
  organizationId?: number;
}

type StatusFilter = 'all' | 'invited' | 'applied' | 'approved' | 'waitlist' | 'declined' | 'bounced' | 'unsubscribed';
type ReviewFilter = 'all' | 'reviewed' | 'unreviewed';
type PaymentFilter = 'all' | 'paid' | 'pending' | 'n/a';
type SourceFilter = 'all' | 'contact' | 'net_new';

export default function InvitesTab({ eventSlug, organizationId }: InvitesTabProps) {
  const [inviteRows, setInviteRows] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const PER_PAGE = 50;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesEditValue, setNotesEditValue] = useState('');
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Email history state
  const [emailHistoryExpanded, setEmailHistoryExpanded] = useState<string | null>(null);
  const [emailHistoryData, setEmailHistoryData] = useState<Record<string, any[]>>({});
  const [loadingEmailHistory, setLoadingEmailHistory] = useState<string | null>(null);

  // Email notifications hook
  const { dialogOpen, dialogProps, handleEmailNotification, handleConfirmSend, closeDialog } = useEmailNotifications();

  useEffect(() => {
    fetchInviteRows(1);
  }, [eventSlug]);

  const fetchInviteRows = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch invitations (people who were invited) with pagination
      const invitationsResponse = await eventInvitationsApi.getByEvent(eventSlug, page, PER_PAGE);
      const invitations = invitationsResponse.invitations || [];

      // Store pagination metadata
      if (invitationsResponse.meta?.pagination) {
        setCurrentPage(invitationsResponse.meta.pagination.current_page);
        setTotalPages(invitationsResponse.meta.pagination.total_pages);
        setTotalCount(invitationsResponse.meta.pagination.total_count);
        setHasNextPage(invitationsResponse.meta.pagination.has_next_page);
      }

      // Fetch vendor applications and their submissions
      const vendorApps = await vendorApplicationsApi.getByEvent(eventSlug);

      // Extract unique categories from all applications
      const categoriesSet = new Set<string>();
      vendorApps.forEach((app: any) => {
        if (app.categories && Array.isArray(app.categories)) {
          app.categories.forEach((cat: string) => categoriesSet.add(cat));
        }
      });
      setAvailableCategories(Array.from(categoriesSet).sort());

      const allSubmissions: any[] = [];

      for (const app of vendorApps) {
        try {
          const submissions = await vendorApplicationsApi.getSubmissions(app.id);
          const submissionsWithApp = submissions.map((sub: any) => ({
            ...sub,
            vendor_application: { id: app.id, name: app.name },
          }));
          allSubmissions.push(...submissionsWithApp);
        } catch (err) {
          console.error(`Failed to fetch submissions for app ${app.id}:`, err);
        }
      }

      // Merge logic: match by email (case-insensitive)
      const emailMap = new Map<string, InviteRow>();

      // First, add all submissions/registrations
      allSubmissions.forEach((submission) => {
        const email = submission.email?.toLowerCase();
        if (!email) return;

        emailMap.set(email, {
          id: `reg-${submission.id}`,
          businessName: submission.business_name,
          contactName: submission.contact_name || submission.name,
          email: submission.email,
          phone: submission.phone,
          instagram: submission.instagram_handle,
          tiktok: submission.tiktok_handle,
          website: submission.website,
          portfolioUrl: submission.portfolio,
          category: submission.vendor_category,
          status: mapRegistrationStatus(submission.status),
          paymentStatus: submission.payment_status || 'pending',
          source: 'net_new', // Will be updated if matched with invitation
          appliedAt: submission.created_at,
          registrationId: submission.id,
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
          existing.isReturning = contact.source === 'returning' || contact.source === 'past_event';
          existing.producerNotes = contact.notes;
          existing.tags = contact.tags || [];
          existing.location = contact.location || existing.location;
          existing.invitationId = invitation.id; // Track invitation for email history
          // Merge social media - prefer application data but fall back to contact data
          existing.instagram = existing.instagram || contact.instagram_handle;
          existing.tiktok = existing.tiktok || contact.tiktok_handle;
          existing.website = existing.website || contact.website;
          existing.phone = existing.phone || contact.phone;
        } else {
          // Contact was invited but hasn't applied yet
          emailMap.set(email, {
            id: `inv-${invitation.id}`,
            businessName: contact.business_name || contact.name,
            contactName: contact.name,
            email: contact.email,
            phone: contact.phone,
            instagram: contact.instagram_handle,
            tiktok: contact.tiktok_handle,
            website: contact.website,
            category: contact.contact_type || 'Unknown',
            status: 'invited',
            paymentStatus: 'n/a',
            source: 'contact',
            isReturning: contact.source === 'returning' || contact.source === 'past_event',
            producerNotes: contact.notes,
            tags: contact.tags || [],
            location: contact.location,
            invitationId: invitation.id,
          });
        }
      });

      if (append) {
        setInviteRows((prev) => [...prev, ...Array.from(emailMap.values())]);
      } else {
        setInviteRows(Array.from(emailMap.values()));
      }
    } catch (err: any) {
      console.error('Failed to fetch invite rows:', err);
      setError(err.message || 'Failed to load invite data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore) {
      fetchInviteRows(currentPage + 1, true);
    }
  };

  // Map registration status to invite row status
  const mapRegistrationStatus = (regStatus: string): InviteRow['status'] => {
    switch (regStatus) {
      case 'pending':
        return 'applied';
      case 'approved':
      case 'confirmed':
        return 'approved';
      case 'waitlist':
        return 'waitlist';
      case 'rejected':
        return 'declined';
      default:
        return 'applied';
    }
  };

  // Handle expanding row (sets reviewedAt if not already set)
  const handleExpandRow = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    // Mark as reviewed if not already
    const row = inviteRows.find((r) => r.id === id);
    if (row && !row.reviewedAt) {
      setInviteRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, reviewedAt: new Date().toISOString() } : r
        )
      );
    }
  };

  // Handle category update
  const handleUpdateCategory = async (row: InviteRow, newCategory: string) => {
    if (!row.registrationId) {
      alert('Cannot update category: No application found');
      return;
    }

    try {
      setIsUpdatingCategory(true);
      await registrationsApi.update(row.registrationId, { vendor_category: newCategory });

      // Update local state
      setInviteRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, category: newCategory } : r))
      );
    } catch (err: any) {
      console.error('Failed to update category:', err);
      alert(`Failed to update category: ${err.message}`);
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (row: InviteRow, newStatus: 'approved' | 'waitlist' | 'declined') => {
    if (!row.registrationId) {
      alert('Cannot update status: No application found');
      return;
    }

    try {
      setUpdatingId(row.id);

      // Map to registration status
      const regStatus = newStatus === 'approved' ? 'approved' : newStatus === 'waitlist' ? 'waitlist' : 'rejected';
      const response = await registrationsApi.update(row.registrationId, { status: regStatus });

      // Handle email notification
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, undefined, row.registrationId);
      }

      // Update local state
      setInviteRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, status: newStatus, reviewedAt: r.reviewedAt || new Date().toISOString() } : r
        )
      );
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle payment status toggle
  const handleTogglePayment = async (row: InviteRow) => {
    if (!row.registrationId || row.status !== 'approved') return;

    try {
      setUpdatingId(row.id);
      const newPaymentStatus = row.paymentStatus === 'paid' ? 'pending' : 'paid';
      const response = await registrationsApi.update(row.registrationId, { payment_status: newPaymentStatus });

      // Handle email notification
      if (response.email_notification) {
        handleEmailNotification(response.email_notification, undefined, row.registrationId);
      }

      setInviteRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, paymentStatus: newPaymentStatus } : r))
      );
    } catch (err: any) {
      console.error('Failed to update payment status:', err);
      alert(`Failed to update payment: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle producer notes save
  const handleSaveNotes = async (row: InviteRow) => {
    // For now, just update local state
    // TODO: Add API call to save notes if backend supports it
    setInviteRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, producerNotes: notesEditValue } : r))
    );
    setEditingNotesId(null);
    setNotesEditValue('');
  };

  // Handle email history toggle
  const handleToggleEmailHistory = async (rowId: string, registrationId?: number, invitationId?: number) => {
    console.log('[EMAIL HISTORY DEBUG] Toggle called with:', {
      rowId,
      registrationId,
      invitationId,
      eventSlug
    });

    // If clicking the same row, collapse it
    if (emailHistoryExpanded === rowId) {
      console.log('[EMAIL HISTORY DEBUG] Collapsing row');
      setEmailHistoryExpanded(null);
      return;
    }

    // Expand this row
    setEmailHistoryExpanded(rowId);

    // If we already have data for this row, don't fetch again
    if (emailHistoryData[rowId]) {
      console.log('[EMAIL HISTORY DEBUG] Using cached data:', emailHistoryData[rowId]);
      return;
    }

    // Fetch email history
    try {
      setLoadingEmailHistory(rowId);
      let history;

      if (registrationId) {
        console.log('[EMAIL HISTORY DEBUG] Fetching from registration endpoint:', registrationId);
        history = await emailDeliveriesApi.getByRegistration(registrationId);
        console.log('[EMAIL HISTORY DEBUG] Registration response:', history);
      } else if (invitationId) {
        console.log('[EMAIL HISTORY DEBUG] Fetching from invitation endpoint:', { eventSlug, invitationId });
        history = await emailDeliveriesApi.getByInvitation(eventSlug, invitationId);
        console.log('[EMAIL HISTORY DEBUG] Invitation response:', history);
      } else {
        console.error('[EMAIL HISTORY DEBUG] No ID provided!');
        throw new Error('No registration or invitation ID provided');
      }

      console.log('[EMAIL HISTORY DEBUG] Setting history data, length:', history?.length || 0);
      setEmailHistoryData((prev) => ({ ...prev, [rowId]: history }));
    } catch (err: any) {
      console.error('[EMAIL HISTORY DEBUG] Error caught:', {
        message: err.message,
        status: err.status,
        response: err.response,
        fullError: err
      });
      // Show empty state instead of alerting
      setEmailHistoryData((prev) => ({ ...prev, [rowId]: [] }));
    } finally {
      setLoadingEmailHistory(null);
    }
  };

  const getStatusBadge = (status: InviteRow['status']) => {
    switch (status) {
      case 'invited':
        return { label: 'Invited', color: 'bg-slate-500/20 text-slate-400' };
      case 'applied':
        return { label: 'Applied', color: 'bg-blue-500/20 text-blue-400' };
      case 'approved':
        return { label: 'Approved', color: 'bg-green-500/20 text-green-400' };
      case 'waitlist':
        return { label: 'Waitlist', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'declined':
        return { label: 'Declined', color: 'bg-red-500/20 text-red-400' };
      case 'bounced':
        return { label: 'Bounced', color: 'bg-orange-500/20 text-orange-400' };
      case 'unsubscribed':
        return { label: 'Unsubscribed', color: 'bg-gray-500/20 text-gray-400' };
      default:
        return { label: status, color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  const getPaymentBadge = (paymentStatus?: InviteRow['paymentStatus']) => {
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
        return { label: '—', color: 'text-white/20' };
    }
  };

  // Filter rows
  const filteredRows = inviteRows.filter((row) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matches =
        row.businessName?.toLowerCase().includes(query) ||
        row.contactName?.toLowerCase().includes(query) ||
        row.email?.toLowerCase().includes(query) ||
        row.category?.toLowerCase().includes(query) ||
        row.location?.toLowerCase().includes(query);
      if (!matches) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;

    // Review filter
    if (reviewFilter === 'reviewed' && !row.reviewedAt) return false;
    if (reviewFilter === 'unreviewed' && row.reviewedAt) return false;

    // Payment filter
    if (paymentFilter !== 'all') {
      if (paymentFilter === 'n/a' && row.paymentStatus !== 'n/a') return false;
      if (paymentFilter === 'paid' && row.paymentStatus !== 'paid' && row.paymentStatus !== 'confirmed') return false;
      if (paymentFilter === 'pending' && row.paymentStatus !== 'pending') return false;
    }

    // Source filter
    if (sourceFilter !== 'all' && row.source !== sourceFilter) return false;

    return true;
  });

  const hasActiveFilters = statusFilter !== 'all' || reviewFilter !== 'all' || paymentFilter !== 'all' || sourceFilter !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setStatusFilter('all');
    setReviewFilter('all');
    setPaymentFilter('all');
    setSourceFilter('all');
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
            onClick={() => fetchInviteRows(1)}
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
        <h2 className="text-lg font-bold text-white mb-0.5">Invites</h2>
        <p className="text-[10px] text-white/60">{filteredRows.length} contacts</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
        <input
          type="text"
          placeholder="Search name, email, category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all">All Status</option>
          <option value="invited">Invited</option>
          <option value="applied">Applied</option>
          <option value="approved">Approved</option>
          <option value="waitlist">Waitlist</option>
          <option value="declined">Declined</option>
        </select>

        {/* Review Filter */}
        <select
          value={reviewFilter}
          onChange={(e) => setReviewFilter(e.target.value as ReviewFilter)}
          className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all">All Reviews</option>
          <option value="reviewed">Reviewed</option>
          <option value="unreviewed">Unreviewed</option>
        </select>

        {/* Payment Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
          className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all">All Payment</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="n/a">N/A</option>
        </select>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
          className="px-2.5 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all">All Sources</option>
          <option value="contact">Contact</option>
          <option value="net_new">Net New</option>
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

      {/* Table */}
      {filteredRows.length === 0 ? (
        <div className="glass-card p-6 text-center">
          <Building2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/60">No invites found</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-3 py-2 bg-white/5 border-b border-white/10">
            <div className="w-6" /> {/* Expand icon */}
            <div className="text-xs font-semibold text-white/80">Business Name</div>
            <div className="text-xs font-semibold text-white/80">Category</div>
            <div className="text-xs font-semibold text-white/80">Status</div>
            <div className="text-xs font-semibold text-white/80">Payment</div>
            <div className="text-xs font-semibold text-white/80">Source</div>
            <div className="text-xs font-semibold text-white/80">Reviewed</div>
          </div>

          {/* Table Body */}
          <div>
            {filteredRows.map((row) => {
              const isExpanded = expandedId === row.id;
              const statusBadge = getStatusBadge(row.status);
              const paymentBadge = getPaymentBadge(row.paymentStatus);
              const isUnreviewed = row.status === 'applied' && !row.reviewedAt;

              return (
                <div
                  key={row.id}
                  className={`border-b border-white/10 last:border-b-0 ${
                    isUnreviewed ? 'bg-blue-500/5' : ''
                  } ${isExpanded ? 'bg-white/5 border-l-2 border-l-purple-500' : ''}`}
                >
                  {/* Row Header */}
                  <button
                    onClick={() => handleExpandRow(row.id)}
                    className="w-full grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-3 py-2.5 hover:bg-white/5 transition-smooth text-left"
                  >
                    <div className="flex items-center">
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-white/60" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium">{row.businessName}</span>
                      {row.isReturning && <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />}
                    </div>
                    <div>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-400">
                        {row.category}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div>
                      {row.status === 'approved' && row.paymentStatus !== 'n/a' ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${paymentBadge.color}`}>
                          {paymentBadge.label}
                        </span>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </div>
                    <div>
                      {row.source === 'net_new' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-400">
                          Net New
                        </span>
                      ) : (
                        <span className="text-xs text-white/60">Contact</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      {row.reviewedAt ? (
                        <div title={`Reviewed ${new Date(row.reviewedAt).toLocaleDateString()}`}>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        </div>
                      ) : row.status === 'applied' ? (
                        <div className="w-2 h-2 rounded-full bg-blue-400" title="Unreviewed" />
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </div>
                  </button>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-3 py-3 bg-[#14102a] border-t border-white/10">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Column - Contact Info */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide">Contact Info</h4>

                          {row.contactName && (
                            <div>
                              <p className="text-[10px] text-white/60 mb-0.5">Name</p>
                              <p className="text-sm text-white">{row.contactName}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-[10px] text-white/60 mb-0.5">Email</p>
                            <a href={`mailto:${row.email}`} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" />
                              {row.email}
                            </a>
                          </div>

                          {row.phone && (
                            <div>
                              <p className="text-[10px] text-white/60 mb-0.5">Phone</p>
                              <a href={`tel:${row.phone}`} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" />
                                {row.phone}
                              </a>
                            </div>
                          )}

                          {row.location && (
                            <div>
                              <p className="text-[10px] text-white/60 mb-0.5">Location</p>
                              <p className="text-sm text-white/80">{row.location}</p>
                            </div>
                          )}

                          {/* Social Links */}
                          <div>
                            <p className="text-[10px] text-white/60 mb-1.5">Social Links</p>
                            <div className="flex flex-wrap gap-2">
                              {row.instagram && (
                                <a
                                  href={row.instagram.startsWith('http') ? row.instagram : `https://instagram.com/${row.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/80 hover:text-white transition-smooth"
                                >
                                  <Instagram className="w-3 h-3" />
                                  <span>Instagram</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              {row.tiktok && (
                                <a
                                  href={row.tiktok.startsWith('http') ? row.tiktok : `https://tiktok.com/@${row.tiktok.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/80 hover:text-white transition-smooth"
                                >
                                  <Music className="w-3 h-3" />
                                  <span>TikTok</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              {row.website && (
                                <a
                                  href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/80 hover:text-white transition-smooth"
                                >
                                  <Globe className="w-3 h-3" />
                                  <span>Website</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              {!row.instagram && !row.tiktok && !row.website && (
                                <span className="text-xs text-white/40 italic">N/A</span>
                              )}
                            </div>
                          </div>

                          {/* Email History Section */}
                          {(row.registrationId || row.invitationId) && (
                            <div className="pt-3 border-t border-white/10">
                              <button
                                onClick={() => handleToggleEmailHistory(row.id, row.registrationId, row.invitationId)}
                                className="w-full flex items-center justify-between text-left hover:bg-white/5 p-2 rounded-lg transition-smooth"
                              >
                                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                                  Email History
                                </span>
                                {emailHistoryExpanded === row.id ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-white/60" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                                )}
                              </button>

                              {/* Email History List */}
                              {emailHistoryExpanded === row.id && (
                                <div className="mt-2 space-y-2">
                                  {loadingEmailHistory === row.id ? (
                                    <div className="flex items-center justify-center py-4">
                                      <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                    </div>
                                  ) : emailHistoryData[row.id]?.length > 0 ? (
                                    emailHistoryData[row.id].map((delivery: any) => {
                                      const deliveryStatus = delivery.status;
                                      const emailSubject = delivery.scheduled_email?.subject || 'Unknown Email';
                                      const deliveredDate = delivery.delivered_at || delivery.sent_at || delivery.created_at;

                                      // Status badge colors
                                      let statusColor = 'bg-gray-500/20 text-gray-400';
                                      if (deliveryStatus === 'delivered') statusColor = 'bg-green-500/20 text-green-400';
                                      else if (deliveryStatus === 'bounced') statusColor = 'bg-red-500/20 text-red-400';
                                      else if (deliveryStatus === 'dropped') statusColor = 'bg-orange-500/20 text-orange-400';
                                      else if (deliveryStatus === 'unsubscribed') statusColor = 'bg-yellow-500/20 text-yellow-400';

                                      return (
                                        <div
                                          key={delivery.id}
                                          className="bg-white/5 border border-white/10 rounded-lg p-2.5 space-y-1.5"
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs text-white font-medium truncate">
                                                {emailSubject}
                                              </p>
                                              <p className="text-[10px] text-white/60 mt-0.5">
                                                {deliveredDate ? new Date(deliveredDate).toLocaleDateString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                                  hour: 'numeric',
                                                  minute: '2-digit'
                                                }) : 'Date unknown'}
                                              </p>
                                            </div>
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor} whitespace-nowrap`}>
                                              {deliveryStatus}
                                            </span>
                                          </div>

                                          {/* Bounce/Drop reason */}
                                          {(delivery.bounce_reason || delivery.drop_reason) && (
                                            <p className="text-[10px] text-red-400/80 mt-1">
                                              {delivery.bounce_type && `${delivery.bounce_type}: `}
                                              {delivery.bounce_reason || delivery.drop_reason}
                                            </p>
                                          )}

                                          {/* Action buttons */}
                                          <div className="flex gap-2 mt-2">
                                            {(deliveryStatus === 'bounced' || deliveryStatus === 'dropped') && (
                                              <button
                                                onClick={async () => {
                                                  try {
                                                    await emailDeliveriesApi.retry(delivery.id);
                                                    alert('Email queued for retry');
                                                    // Refresh email history
                                                    const updated = await emailDeliveriesApi.getByRegistration(row.registrationId!);
                                                    setEmailHistoryData((prev) => ({ ...prev, [row.id]: updated }));
                                                  } catch (err: any) {
                                                    alert(`Failed to retry: ${err.message}`);
                                                  }
                                                }}
                                                className="text-[10px] px-2 py-1 rounded bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-smooth"
                                              >
                                                Retry
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="text-xs text-white/40 italic py-2">No email history found</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right Column - Actions & Notes */}
                        <div className="space-y-3">
                          {/* Status Actions (only for applied/approved/waitlist/declined) */}
                          {row.status !== 'invited' && row.registrationId && (
                            <div>
                              <p className="text-[10px] text-white/60 mb-1.5 uppercase tracking-wide">Status</p>
                              {updatingId === row.id ? (
                                <div className="flex items-center justify-center py-3">
                                  <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                </div>
                              ) : row.status === 'applied' ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateStatus(row, 'approved')}
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-smooth text-xs font-medium"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(row, 'waitlist')}
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-smooth text-xs font-medium"
                                  >
                                    Waitlist
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(row, 'declined')}
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-smooth text-xs font-medium"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex px-2.5 py-1.5 rounded-lg text-xs font-medium ${statusBadge.color}`}>
                                    {statusBadge.label}
                                  </span>
                                  <select
                                    value={row.status}
                                    onChange={(e) => {
                                      const newStatus = e.target.value as 'approved' | 'waitlist' | 'declined';
                                      handleUpdateStatus(row, newStatus);
                                    }}
                                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-xs border border-white/20 hover:bg-white/20 transition-smooth"
                                  >
                                    <option value="approved">Change to Approved</option>
                                    <option value="waitlist">Change to Waitlist</option>
                                    <option value="declined">Change to Declined</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Category Dropdown (only for applied/approved/waitlist) */}
                          {row.status !== 'invited' && row.registrationId && (
                            <div>
                              <p className="text-[10px] text-white/60 mb-1.5 uppercase tracking-wide">Category</p>
                              <select
                                value={row.category}
                                onChange={(e) => handleUpdateCategory(row, e.target.value)}
                                disabled={isUpdatingCategory}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 text-white text-xs border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {availableCategories.length > 0 ? (
                                  // Show all available categories, ensuring current category is included
                                  [...new Set([row.category, ...availableCategories])].filter(Boolean).sort().map((category) => (
                                    <option key={category} value={category}>
                                      {category}
                                    </option>
                                  ))
                                ) : (
                                  <option value={row.category}>{row.category}</option>
                                )}
                              </select>
                            </div>
                          )}

                          {/* Payment Toggle (only for approved) */}
                          {row.status === 'approved' && row.paymentStatus !== 'n/a' && (
                            <div>
                              <p className="text-[10px] text-white/60 mb-1.5 uppercase tracking-wide">Payment</p>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex px-2.5 py-1.5 rounded-lg text-xs font-medium ${paymentBadge.color}`}>
                                  {paymentBadge.label}
                                </span>
                                <button
                                  onClick={() => handleTogglePayment(row)}
                                  disabled={updatingId === row.id}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs border border-white/20 hover:bg-white/20 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Mark as {row.paymentStatus === 'paid' ? 'Pending' : 'Paid'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Producer Notes */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-[10px] text-white/60 uppercase tracking-wide">Producer Notes</p>
                              {editingNotesId !== row.id && (
                                <button
                                  onClick={() => {
                                    setEditingNotesId(row.id);
                                    setNotesEditValue(row.producerNotes || '');
                                  }}
                                  className="text-purple-400 hover:text-purple-300"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {editingNotesId === row.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={notesEditValue}
                                  onChange={(e) => setNotesEditValue(e.target.value)}
                                  placeholder="Add private notes..."
                                  rows={3}
                                  className="w-full px-2.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveNotes(row)}
                                    className="px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-smooth text-xs"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingNotesId(null);
                                      setNotesEditValue('');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-smooth text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-white/80">
                                {row.producerNotes || <span className="text-white/40 italic">No notes yet</span>}
                              </p>
                            )}
                          </div>

                          {/* Meta Info */}
                          <div className="pt-3 border-t border-white/10">
                            <p className="text-[10px] text-white/40">
                              {row.appliedAt && `Applied: ${new Date(row.appliedAt).toLocaleDateString()}`}
                              {row.appliedAt && row.reviewedAt && ' • '}
                              {row.reviewedAt && `Reviewed: ${new Date(row.reviewedAt).toLocaleDateString()}`}
                              {(row.appliedAt || row.reviewedAt) && ' • '}
                              Source: {row.source === 'contact' ? 'Contact List' : 'Net New'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="px-3 py-4 border-t border-white/10 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loadingMore ? (
                  <>
                    <div className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  `Load More (${filteredRows.length} of ${totalCount})`
                )}
              </button>
            </div>
          )}
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
