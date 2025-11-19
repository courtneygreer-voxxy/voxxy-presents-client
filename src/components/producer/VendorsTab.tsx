import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, Tag, Filter, Users } from 'lucide-react';
import { vendorApplicationsApi, registrationsApi } from '@/services/api';

interface VendorSubmission {
  id: number;
  business_name: string;
  email: string;
  phone?: string;
  vendor_category: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed';
  ticket_code: string;
  created_at: string;
  vendor_application: {
    id: number;
    name: string;
  };
}

interface VendorsTabProps {
  eventSlug: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'confirmed' | 'waitlist' | 'rejected';

export default function VendorsTab({ eventSlug }: VendorsTabProps) {
  const [vendors, setVendors] = useState<VendorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

      setVendors(allSubmissions);
    } catch (err: any) {
      console.error('Failed to fetch vendors:', err);
      setError(err.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'waitlist':
        return 'bg-blue-500/20 text-blue-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleUpdateStatus = async (
    vendorId: number,
    newStatus: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
  ) => {
    try {
      setUpdatingId(vendorId);
      await registrationsApi.updateStatus(vendorId, newStatus);

      // Update local state
      setVendors((prev) =>
        prev.map((vendor) =>
          vendor.id === vendorId ? { ...vendor, status: newStatus } : vendor
        )
      );
    } catch (err: any) {
      console.error('Failed to update vendor status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    if (statusFilter === 'all') return true;
    return vendor.status === statusFilter;
  });

  const statusCounts = {
    all: vendors.length,
    pending: vendors.filter((v) => v.status === 'pending').length,
    approved: vendors.filter((v) => v.status === 'approved').length,
    confirmed: vendors.filter((v) => v.status === 'confirmed').length,
    waitlist: vendors.filter((v) => v.status === 'waitlist').length,
    rejected: vendors.filter((v) => v.status === 'rejected').length,
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
        <h2 className="text-2xl font-bold text-white mb-2">Vendor Submissions</h2>
        <p className="text-white/60">
          Manage all vendor applications and submissions for this event
        </p>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'confirmed', label: 'Confirmed' },
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

      {/* Vendors List */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <Users className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {statusFilter === 'all' ? 'No Vendor Submissions Yet' : `No ${statusFilter} Vendors`}
          </h3>
          <p className="text-white/60">
            {statusFilter === 'all'
              ? 'Vendor submissions will appear here once vendors apply through your application forms.'
              : `There are no vendors with status "${statusFilter}" at this time.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Business Name & Status */}
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">
                      {vendor.business_name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        vendor.status
                      )}`}
                    >
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </span>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Mail className="w-4 h-4" />
                      <a
                        href={`mailto:${vendor.email}`}
                        className="hover:text-purple-400 transition-colors"
                      >
                        {vendor.email}
                      </a>
                    </div>
                    {vendor.phone && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Phone className="w-4 h-4" />
                        <a
                          href={`tel:${vendor.phone}`}
                          className="hover:text-purple-400 transition-colors"
                        >
                          {vendor.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Category & Metadata */}
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>{vendor.vendor_category}</span>
                    </div>
                    <span>•</span>
                    <span>Applied {formatDate(vendor.created_at)}</span>
                    <span>•</span>
                    <span className="font-mono text-xs bg-black/20 px-2 py-0.5 rounded">
                      {vendor.ticket_code}
                    </span>
                  </div>

                  {/* Application Form Used */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-white/40">
                      Applied via:{' '}
                      <span className="text-white/60 font-medium">
                        {vendor.vendor_application.name}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  {updatingId === vendor.id ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                  ) : vendor.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(vendor.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(vendor.id, 'waitlist')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                      >
                        Waitlist
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(vendor.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <select
                      value={vendor.status}
                      onChange={(e) =>
                        handleUpdateStatus(
                          vendor.id,
                          e.target.value as 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="waitlist">Waitlist</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
