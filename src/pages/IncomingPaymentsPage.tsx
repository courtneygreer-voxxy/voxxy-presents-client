import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { incomingPaymentsApi, organizationsApi, eventsApi } from '@/services/api'
import {
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface IncomingPayment {
  id: number
  organization_id: number
  event_id: number | null
  registration_id: number | null
  status: 'received' | 'processing' | 'matched' | 'unmatched' | 'failed'
  ticket_code: string | null
  eventbrite_order_id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  ticket_type: string | null
  payment_date: string | null
  payment_amount: number | null
  payment_currency: string | null
  processed_at: string | null
  error_message: string | null
  created_at: string
  event?: {
    id: number
    title: string
    slug: string
  }
  registration?: {
    id: number
    name: string
    email: string
  }
}

interface Organization {
  id: number
  slug: string
  name: string
  user_id: number
}

export default function IncomingPaymentsPage() {
  const { userProfile } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [payments, setPayments] = useState<IncomingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const perPage = 50

  // Fetch organization
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!userProfile?.id) return

      try {
        const orgs = await organizationsApi.getAll()
        const userOrg = orgs.find((org: Organization) => org.user_id === userProfile.id)
        if (userOrg) {
          setOrganization(userOrg)
        }
      } catch (err) {
        console.error('Failed to fetch organization:', err)
        toast.error('Failed to load organization')
      }
    }

    fetchOrganization()
  }, [userProfile])

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      if (!organization?.slug) return

      try {
        setLoading(true)
        const params: any = {
          page: currentPage,
          per_page: perPage,
        }

        if (statusFilter !== 'all') {
          params.status = statusFilter
        }

        const response = await incomingPaymentsApi.getAll(organization.slug, params)
        setPayments(response.payments)
        setTotalPages(response.pagination.total_pages)
        setTotalCount(response.pagination.total_count)
      } catch (err: any) {
        console.error('Failed to fetch payments:', err)
        toast.error(err.message || 'Failed to load payments')
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [organization, currentPage, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'matched':
        return (
          <span className="inline-flex items-center gap-1 rounded border border-emerald-600/35 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            Matched
          </span>
        )
      case 'unmatched':
        return (
          <span className="inline-flex items-center gap-1 rounded border border-amber-600/35 bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-3 w-3" />
            Unmatched
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 rounded border border-red-600/35 bg-red-500/10 px-2 py-1 text-xs text-red-700 dark:text-red-400">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 rounded border border-blue-600/35 bg-blue-500/10 px-2 py-1 text-xs text-blue-700 dark:text-blue-400">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
            {status}
          </span>
        )
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const formatAmount = (amount: number | null, currency: string | null) => {
    if (amount === null) return 'N/A'
    return `${currency || 'USD'} ${amount.toFixed(2)}`
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const sectionShell = cn('glass-card p-4 shadow-sm')

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className={sectionShell}>
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-primary dark:text-violet-400" />
            <h1 className="text-lg font-semibold text-foreground">Incoming Payments</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            View payment notifications received from n8n webhooks
          </p>
        </div>

        {/* Filters */}
        <div className={sectionShell}>
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground font-medium">Filter by status:</span>
            <div className="flex gap-2">
              {['all', 'matched', 'unmatched', 'failed', 'processing'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status)
                    setCurrentPage(1)
                  }}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground',
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-muted-foreground">
              Total: {totalCount} payment{totalCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Payments Table */}
        <div className={sectionShell}>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No payments found{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-foreground">
                        Received
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-foreground">
                        Name
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-foreground">
                        Amount
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-foreground">
                        Ticket Code
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-foreground">
                        Event
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-foreground">
                        Order ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-border hover:bg-accent/20 transition-colors"
                      >
                        <td className="py-3 px-2 text-xs text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="py-3 px-2">{getStatusBadge(payment.status)}</td>
                        <td className="py-3 px-2 text-xs text-foreground font-medium">
                          {payment.email || 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-xs text-foreground">
                          {payment.first_name && payment.last_name
                            ? `${payment.first_name} ${payment.last_name}`
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-xs text-foreground font-mono">
                          {formatAmount(payment.payment_amount, payment.payment_currency)}
                        </td>
                        <td className="py-3 px-2 text-xs font-mono text-muted-foreground">
                          {payment.ticket_code || 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-xs text-foreground">
                          {payment.event?.title || 'Unknown Event'}
                        </td>
                        <td className="py-3 px-2 text-xs font-mono text-muted-foreground">
                          {payment.eventbrite_order_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
