import { useState, useEffect, useMemo } from 'react';
import { Building2, Mail, Phone, Globe, Instagram, Music, Link as LinkIcon, Star, Search, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';
import { vendorApplicationsApi } from '@/services/api';

interface VendorSubmission {
  id: number;
  business_name: string;
  email: string;
  phone?: string;
  vendor_category: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed';
  ticket_code: string;
  created_at: string;
  contact_name?: string;
  website?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  portfolio?: string;
  payment_status?: 'paid' | 'pending' | 'unpaid';
  vendor_application: {
    id: number;
    name: string;
  };
}

interface VendorsTabProps {
  eventSlug: string;
}

type SortField = 'business_name' | 'category' | 'email' | 'phone' | 'payment';
type SortDirection = 'asc' | 'desc';

export default function VendorsTab({ eventSlug }: VendorsTabProps) {
  const [vendors, setVendors] = useState<VendorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('business_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Multi-select state
  const [selectedVendors, setSelectedVendors] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchVendors();
  }, [eventSlug]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all vendor applications for this event
      const applications = await vendorApplicationsApi.getByEvent(eventSlug);

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
            },
          }));
          allSubmissions.push(...submissionsWithApp);
        } catch (err) {
          console.error(`Failed to fetch submissions for application ${app.id}:`, err);
        }
      }

      // Filter to only approved/confirmed vendors
      const approvedVendors = allSubmissions.filter(
        (v) => v.status === 'approved' || v.status === 'confirmed'
      );

      setVendors(approvedVendors);
    } catch (err: any) {
      console.error('Failed to fetch vendors:', err);
      setError(err.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getPaymentBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return { label: 'Paid', color: 'bg-green-500/20 text-green-400' };
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' };
      default:
        return { label: 'Pending', color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(vendors.map(v => v.vendor_category)))];
  }, [vendors]);

  // Filter and sort vendors
  const filteredAndSortedVendors = useMemo(() => {
    let result = [...vendors];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.business_name.toLowerCase().includes(query) ||
          v.email.toLowerCase().includes(query) ||
          v.contact_name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((v) => v.vendor_category === categoryFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      result = result.filter((v) => (v.payment_status || 'pending') === paymentFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'business_name':
          aVal = a.business_name.toLowerCase();
          bVal = b.business_name.toLowerCase();
          break;
        case 'category':
          aVal = a.vendor_category.toLowerCase();
          bVal = b.vendor_category.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'phone':
          aVal = a.phone || '';
          bVal = b.phone || '';
          break;
        case 'payment':
          aVal = a.payment_status || 'pending';
          bVal = b.payment_status || 'pending';
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [vendors, searchQuery, categoryFilter, paymentFilter, sortField, sortDirection]);

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
            onClick={fetchVendors}
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
          <h2 className="text-2xl font-bold text-white">Event Vendors</h2>
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
            {vendors.length}
          </span>
        </div>
        <p className="text-white/60">Approved vendors participating in your event</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">Category: All</option>
            {categories.filter(c => c !== 'all').map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">Payment: All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Vendors Table */}
      {filteredAndSortedVendors.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <Building2 className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Approved Vendors</h3>
          <p className="text-white/60">
            {searchQuery || categoryFilter !== 'all' || paymentFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Approved vendors will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#1e1536] rounded-xl border border-purple-500/20 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_2fr_1.5fr_2fr_1.5fr_1fr_40px] gap-4 px-6 py-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectedVendors.size === filteredAndSortedVendors.length && filteredAndSortedVendors.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedVendors(new Set(filteredAndSortedVendors.map(v => v.id)));
                  } else {
                    setSelectedVendors(new Set());
                  }
                }}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
              />
            </div>
            <button
              onClick={() => handleSort('business_name')}
              className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors text-left"
            >
              Name
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort('category')}
              className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors text-left"
            >
              Category
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort('email')}
              className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors text-left"
            >
              Email
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort('phone')}
              className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors text-left"
            >
              Phone
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort('payment')}
              className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors text-left"
            >
              Payment
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <div className="text-sm font-semibold text-white/80"></div>
          </div>

          {/* Table Body */}
          <div>
            {filteredAndSortedVendors.map((vendor) => {
              const paymentBadge = getPaymentBadge(vendor.payment_status);
              const isExpanded = expandedRows.has(vendor.id);
              const isSelected = selectedVendors.has(vendor.id);

              return (
                <div key={vendor.id}>
                  {/* Main Row */}
                  <div
                    className={`grid grid-cols-[40px_2fr_1.5fr_2fr_1.5fr_1fr_40px] gap-4 px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors ${isSelected ? 'bg-purple-500/10' : ''}`}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSelected = new Set(selectedVendors);
                          if (e.target.checked) {
                            newSelected.add(vendor.id);
                          } else {
                            newSelected.delete(vendor.id);
                          }
                          setSelectedVendors(newSelected);
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                      />
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{vendor.contact_name || vendor.business_name}</p>
                        {vendor.business_name && vendor.contact_name && (
                          <p className="text-white/60 text-xs truncate">{vendor.business_name}</p>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                        {vendor.vendor_category}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <a
                        href={`mailto:${vendor.email}`}
                        className="text-purple-400 hover:text-purple-300 text-sm truncate"
                      >
                        {vendor.email}
                      </a>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2 min-w-0">
                      {vendor.phone ? (
                        <>
                          <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
                          <a
                            href={`tel:${vendor.phone}`}
                            className="text-purple-400 hover:text-purple-300 text-sm truncate"
                          >
                            {vendor.phone}
                          </a>
                        </>
                      ) : (
                        <span className="text-white/40 text-sm">—</span>
                      )}
                    </div>

                    {/* Payment Status */}
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${paymentBadge.color}`}>
                        {paymentBadge.label}
                      </span>
                    </div>

                    {/* Expand Button */}
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedRows);
                          if (isExpanded) {
                            newExpanded.delete(vendor.id);
                          } else {
                            newExpanded.add(vendor.id);
                          }
                          setExpandedRows(newExpanded);
                        }}
                        className="text-white/60 hover:text-purple-400 transition-colors p-1 hover:bg-white/5 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 py-4 bg-white/5 border-b border-white/10">
                      <div className="grid grid-cols-2 gap-6 pl-14">
                        {/* Left Column */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                              Business Name
                            </p>
                            <p className="text-sm text-white">
                              {vendor.business_name || '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                              Email
                            </p>
                            <a
                              href={`mailto:${vendor.email}`}
                              className="text-sm text-purple-400 hover:text-purple-300"
                            >
                              {vendor.email}
                            </a>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                              Phone
                            </p>
                            {vendor.phone ? (
                              <a
                                href={`tel:${vendor.phone}`}
                                className="text-sm text-purple-400 hover:text-purple-300"
                              >
                                {vendor.phone}
                              </a>
                            ) : (
                              <p className="text-sm text-white/40">—</p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                              Category
                            </p>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                              {vendor.vendor_category}
                            </span>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                              Payment Status
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${paymentBadge.color}`}>
                              {paymentBadge.label}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                              Accepted Date
                            </p>
                            <p className="text-sm text-white">
                              {new Date(vendor.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                              Social Links
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {vendor.instagram_handle && (
                                <a
                                  href={vendor.instagram_handle}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-white/60 hover:text-purple-400 transition-colors"
                                  title="Instagram"
                                >
                                  <Instagram className="w-4 h-4" />
                                  <span className="text-sm">Instagram</span>
                                </a>
                              )}
                              {vendor.tiktok_handle && (
                                <a
                                  href={vendor.tiktok_handle}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-white/60 hover:text-purple-400 transition-colors"
                                  title="TikTok"
                                >
                                  <Music className="w-4 h-4" />
                                  <span className="text-sm">TikTok</span>
                                </a>
                              )}
                              {vendor.website && (
                                <a
                                  href={vendor.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-white/60 hover:text-purple-400 transition-colors"
                                  title="Website"
                                >
                                  <Globe className="w-4 h-4" />
                                  <span className="text-sm">Website</span>
                                </a>
                              )}
                              {vendor.portfolio && (
                                <a
                                  href={vendor.portfolio}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-white/60 hover:text-purple-400 transition-colors"
                                  title="Portfolio"
                                >
                                  <Star className="w-4 h-4" />
                                  <span className="text-sm">Portfolio</span>
                                </a>
                              )}
                              {!vendor.instagram_handle && !vendor.tiktok_handle && !vendor.website && !vendor.portfolio && (
                                <span className="text-sm text-white/40">No links available</span>
                              )}
                            </div>
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
    </div>
  );
}
