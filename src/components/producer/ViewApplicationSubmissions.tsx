import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Clock } from 'lucide-react';
import { vendorApplicationsApi, registrationsApi } from '@/services/api';

interface VendorApplication {
  id: number;
  name: string;
  categories: string[];
}

interface Submission {
  id: number;
  business_name: string;
  contact_name?: string;
  vendor_category: string;
  email: string;
  status: string;
  created_at: string;
}

interface ViewApplicationSubmissionsProps {
  application: VendorApplication;
  onBack: () => void;
}

const STATUS_COLORS = {
  pending: 'bg-blue-500/20 text-blue-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  waitlist: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-purple-500/20 text-purple-400',
};

const STATUS_LABELS = {
  pending: 'New',
  approved: 'Approved',
  rejected: 'Rejected',
  waitlist: 'Waitlist',
  confirmed: 'Paid',
};

export default function ViewApplicationSubmissions({
  application,
  onBack,
}: ViewApplicationSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [application.id]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, selectedStatus]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vendorApplicationsApi.getSubmissions(application.id);
      setSubmissions(data);
    } catch (err: any) {
      console.error('Failed to fetch submissions:', err);
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (selectedStatus) {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }

    setFilteredSubmissions(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleUpdateStatus = async (
    submissionId: number,
    newStatus: 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
  ) => {
    try {
      setUpdatingId(submissionId);
      await registrationsApi.updateStatus(submissionId, newStatus);

      // Update local state
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        )
      );
    } catch (err: any) {
      console.error('Failed to update submission status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchSubmissions}
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
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Command Center
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">
          {application.name}
        </h1>
        <p className="text-white/60">Review and manage applicants</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="text-white/60 text-sm self-center mr-2">Filter by Status:</span>

          {/* Status Filters */}
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}

          {selectedStatus && (
            <button
              onClick={() => setSelectedStatus(null)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            >
              Clear Filter
            </button>
          )}

          <span className="text-white/60 text-sm self-center ml-auto">
            Showing {filteredSubmissions.length} of {submissions.length}
          </span>
        </div>
      </div>

      {/* Submissions Table */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-white/60">
            {submissions.length === 0
              ? 'No submissions yet'
              : 'No submissions match the selected filters'}
          </p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white">
                    Submitted
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{submission.contact_name || submission.business_name}</p>
                      {submission.business_name && submission.contact_name && (
                        <p className="text-white/60 text-xs">{submission.business_name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                        {submission.vendor_category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/80">{submission.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          STATUS_COLORS[submission.status as keyof typeof STATUS_COLORS] ||
                          'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {STATUS_LABELS[submission.status as keyof typeof STATUS_LABELS] ||
                          submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {updatingId === submission.id ? (
                          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                        ) : submission.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(submission.id, 'approved')}
                              className="p-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(submission.id, 'waitlist')}
                              className="p-1.5 rounded bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
                              title="Waitlist"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(submission.id, 'rejected')}
                              className="p-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <select
                            value={submission.status}
                            onChange={(e) =>
                              handleUpdateStatus(
                                submission.id,
                                e.target.value as 'pending' | 'approved' | 'rejected' | 'waitlist' | 'confirmed'
                              )
                            }
                            className="px-3 py-1.5 rounded bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-colors"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="waitlist">Waitlist</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
