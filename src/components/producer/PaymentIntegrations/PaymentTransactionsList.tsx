import { useState, useEffect } from 'react'
import { DollarSign, RefreshCw, AlertCircle, Check, X, Search, Filter } from 'lucide-react'
import { paymentTransactionsApi } from '@/services/paymentApi'
import type { PaymentTransaction } from '@/types/payment'

interface PaymentTransactionsListProps {
  eventSlug: string
  onTransactionUpdate?: () => void
}

export default function PaymentTransactionsList({
  eventSlug,
  onTransactionUpdate,
}: PaymentTransactionsListProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<PaymentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [matchFilter, setMatchFilter] = useState<string>('all')

  useEffect(() => {
    fetchTransactions()
  }, [eventSlug])

  useEffect(() => {
    applyFilters()
  }, [transactions, searchQuery, statusFilter, matchFilter])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await paymentTransactionsApi.getByEvent(eventSlug)
      setTransactions(data)
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err)
      setError('Failed to load payment transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.payer_email.toLowerCase().includes(query) ||
          t.payer_first_name?.toLowerCase().includes(query) ||
          t.payer_last_name?.toLowerCase().includes(query) ||
          t.provider_transaction_id.toLowerCase().includes(query),
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.payment_status === statusFilter)
    }

    // Match filter
    if (matchFilter === 'matched') {
      filtered = filtered.filter((t) => t.vendor_contact_id !== null)
    } else if (matchFilter === 'unmatched') {
      filtered = filtered.filter((t) => t.vendor_contact_id === null)
    }

    setFilteredTransactions(filtered)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return badges[status as keyof typeof badges] || 'bg-muted text-gray-800'
  }

  const formatAmount = (amount: string, currency: string) => {
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(num)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-background/5 rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Payment Transactions</h3>
              <p className="text-sm text-foreground/60">
                {filteredTransactions.length} of {transactions.length} transactions
              </p>
            </div>
          </div>

          <button
            onClick={fetchTransactions}
            disabled={isLoading}
            className="p-2 text-foreground/60 hover:bg-background/10 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email, name, ID..."
              className="w-full pl-10 pr-4 py-2 bg-background/5 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-background/5 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={matchFilter}
            onChange={(e) => setMatchFilter(e.target.value)}
            className="px-4 py-2 bg-background/5 border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          >
            <option value="all">All Transactions</option>
            <option value="matched">Matched Only</option>
            <option value="unmatched">Unmatched Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-background/5 rounded-lg border border-border p-12 text-center">
          <DollarSign className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">No transactions found</h3>
          <p className="text-sm text-foreground/60">
            {transactions.length === 0
              ? 'No payment transactions have been synced yet.'
              : 'No transactions match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="voxxy-table-shell">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="voxxy-table-header">
                <tr>
                  <th className="voxxy-table-header-row px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Payer
                  </th>
                  <th className="voxxy-table-header-row px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="voxxy-table-header-row px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="voxxy-table-header-row px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Matched Vendor
                  </th>
                  <th className="voxxy-table-header-row px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="voxxy-table-row voxxy-table-row-hover">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-foreground">
                          {transaction.payer_first_name} {transaction.payer_last_name}
                        </p>
                        <p className="text-sm text-foreground/60">{transaction.payer_email}</p>
                        <p className="text-xs text-foreground/40 mt-1">
                          ID: {transaction.provider_transaction_id}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </p>
                      <p className="text-xs text-foreground/40">{transaction.provider}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          transaction.payment_status,
                        )}`}
                      >
                        {transaction.payment_status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {transaction.vendor_contact ? (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {transaction.vendor_contact.name}
                            </p>
                            <p className="text-xs text-foreground/60">
                              {transaction.vendor_contact.business_name}
                            </p>
                            {transaction.registration?.vendor_fee_paid && (
                              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Paid
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <X className="w-4 h-4" />
                          <span className="text-sm">Not matched</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {transaction.transaction_created_at
                          ? new Date(transaction.transaction_created_at).toLocaleDateString()
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {transaction.transaction_created_at
                          ? new Date(transaction.transaction_created_at).toLocaleTimeString()
                          : ''}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-background/5 rounded-lg border border-border p-4">
            <p className="text-sm text-foreground/60 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
          </div>

          <div className="bg-background/5 rounded-lg border border-border p-4">
            <p className="text-sm text-foreground/60 mb-1">Matched</p>
            <p className="text-2xl font-bold text-green-400">
              {transactions.filter((t) => t.vendor_contact_id).length}
            </p>
          </div>

          <div className="bg-background/5 rounded-lg border border-border p-4">
            <p className="text-sm text-foreground/60 mb-1">Unmatched</p>
            <p className="text-2xl font-bold text-yellow-400">
              {transactions.filter((t) => !t.vendor_contact_id).length}
            </p>
          </div>

          <div className="bg-background/5 rounded-lg border border-border p-4">
            <p className="text-sm text-foreground/60 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-foreground">
              {formatAmount(
                transactions
                  .filter((t) => t.payment_status === 'paid')
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                  .toString(),
                'USD',
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
