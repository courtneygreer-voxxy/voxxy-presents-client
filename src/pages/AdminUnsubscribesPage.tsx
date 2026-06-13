import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  MailX,
  Calendar,
  Building2,
  Globe,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/services/api'

interface UnsubscribeRecord {
  id: number
  email: string
  scope: 'event' | 'organization' | 'global'
  unsubscribed_at: string
  unsubscribe_source: string | null
  event: {
    id: number
    title: string
    slug: string
    event_date: string
  } | null
  organization: {
    id: number
    name: string
    slug: string
  } | null
  created_at: string
  updated_at: string
}

interface UnsubscribeData {
  unsubscribes: UnsubscribeRecord[]
  summary: {
    total: number
    by_scope: Record<string, number>
    by_source: Record<string, number>
    last_24_hours: number
    last_7_days: number
    last_30_days: number
  }
  pagination: {
    current_page: number
    per_page: number
    total_pages: number
    total_unsubscribes: number
  }
}

export default function AdminUnsubscribesPage() {
  const { userProfile } = useAuth()
  const [data, setData] = useState<UnsubscribeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Filters
  const [searchEmail, setSearchEmail] = useState('')
  const [scopeFilter, setScopeFilter] = useState<string>('')
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadUnsubscribes()
  }, [currentPage, scopeFilter, sourceFilter])

  const loadUnsubscribes = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await adminApi.getUnsubscribedUsers({
        page: currentPage,
        per_page: 25,
        scope: scopeFilter || undefined,
        source: sourceFilter || undefined,
        search: searchEmail || undefined,
      })
      setData(result)
    } catch (err) {
      console.error('Failed to load unsubscribes:', err)
      setError(err instanceof Error ? err.message : 'Failed to load unsubscribes')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUnsubscribes()
  }

  const getScopeBadgeColor = (scope: string) => {
    switch (scope) {
      case 'event':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-950 dark:text-blue-300'
      case 'organization':
        return 'bg-primary/20 border-primary/30 text-violet-950 dark:text-primary'
      case 'global':
        return 'bg-red-500/20 border-red-400/30 text-red-950 dark:text-red-300'
      default:
        return 'bg-muted/20 border-border/30 text-muted-foreground'
    }
  }

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'organization':
        return <Building2 className="h-4 w-4" />
      case 'global':
        return <Globe className="h-4 w-4" />
      default:
        return <MailX className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  return (
    <div className="min-h-screen voxxy-gradient-page-alt relative overflow-hidden">
      <div className="relative z-10 min-h-screen px-4 py-12 md:py-16">
        <div className="w-full max-w-7xl mx-auto space-y-8 my-8 md:my-12">
          {/* Header Card */}
          <Card className="bg-background/10 backdrop-blur-sm border border-border shadow-2xl">
            <CardHeader className="border-b border-border">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <MailX className="h-8 w-8 text-red-400" />
                  Unsubscribed Users
                </CardTitle>
                <CardDescription className="text-foreground/85 dark:text-gray-200 mt-1">
                  Monitor and analyze email unsubscribes
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Summary Statistics */}
              {data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-4">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Total Unsubscribes
                    </p>
                    <p className="text-foreground text-3xl font-bold mt-2">{data.summary.total}</p>
                  </div>
                  <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-4">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Last 24 Hours
                    </p>
                    <p className="text-foreground text-3xl font-bold mt-2">
                      {data.summary.last_24_hours}
                    </p>
                  </div>
                  <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-4">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Last 7 Days
                    </p>
                    <p className="text-foreground text-3xl font-bold mt-2">
                      {data.summary.last_7_days}
                    </p>
                  </div>
                  <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-4">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Last 30 Days
                    </p>
                    <p className="text-foreground text-3xl font-bold mt-2">
                      {data.summary.last_30_days}
                    </p>
                  </div>
                </div>
              )}

              {/* Scope Breakdown */}
              {data && (
                <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-4">
                  <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    By Scope
                  </h3>
                  <div className="flex gap-4 flex-wrap">
                    {Object.entries(data.summary.by_scope).map(([scope, count]) => (
                      <div key={scope} className="flex items-center gap-2">
                        {getScopeIcon(scope)}
                        <span className="text-foreground capitalize">{scope}:</span>
                        <span className="text-foreground font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search and Filters */}
              <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-4 space-y-4">
                <h3 className="text-foreground font-semibold flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search & Filter
                </h3>

                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="Search by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="bg-background/10 border-border text-foreground placeholder:text-foreground/50"
                  />

                  <select
                    value={scopeFilter}
                    onChange={(e) => {
                      setScopeFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="px-3 py-2 rounded-lg bg-background/10 border border-border text-foreground text-sm"
                  >
                    <option value="">All Scopes</option>
                    <option value="event">Event</option>
                    <option value="organization">Organization</option>
                    <option value="global">Global</option>
                  </select>

                  <select
                    value={sourceFilter}
                    onChange={(e) => {
                      setSourceFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="px-3 py-2 rounded-lg bg-background/10 border border-border text-foreground text-sm"
                  >
                    <option value="">All Sources</option>
                    <option value="user_action">User Action</option>
                    <option value="sendgrid_webhook">SendGrid Webhook</option>
                    <option value="admin_action">Admin Action</option>
                  </select>

                  <Button type="submit" className="voxxy-btn-solid">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </form>
              </div>

              {/* Unsubscribe List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  <p className="text-muted-foreground mt-4">Loading unsubscribes...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              ) : data && data.unsubscribes.length === 0 ? (
                <div className="text-center py-12">
                  <MailX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No unsubscribes found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.unsubscribes.map((unsub) => {
                    const isExpanded = expandedId === unsub.id
                    return (
                      <div
                        key={unsub.id}
                        className="bg-background/10 backdrop-blur-sm border border-border rounded-lg overflow-hidden transition-all"
                      >
                        {/* Unsubscribe Header */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : unsub.id)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-background/5 transition-colors text-left"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-3">
                              <Mail className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <h4 className="text-sm font-semibold text-foreground">
                                  {unsub.email}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {formatRelativeTime(unsub.unsubscribed_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`${getScopeBadgeColor(unsub.scope)} text-xs capitalize`}
                            >
                              {unsub.scope}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="text-foreground font-mono">{unsub.email}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Scope</p>
                                <p className="text-foreground capitalize">{unsub.scope}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Unsubscribed At</p>
                                <p className="text-foreground">
                                  {formatDate(unsub.unsubscribed_at)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Source</p>
                                <p className="text-foreground">
                                  {unsub.unsubscribe_source || 'N/A'}
                                </p>
                              </div>
                            </div>

                            {/* Event Details */}
                            {unsub.event && (
                              <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-3">
                                <h5 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                                  <Calendar className="h-4 w-4 text-blue-300" />
                                  Event
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <p className="text-foreground">{unsub.event.title}</p>
                                  <p className="text-muted-foreground">Slug: {unsub.event.slug}</p>
                                  <p className="text-muted-foreground">
                                    Date: {new Date(unsub.event.event_date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Organization Details */}
                            {unsub.organization && (
                              <div className="bg-background/10 backdrop-blur-sm border border-border rounded-lg p-3">
                                <h5 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                                  <Building2 className="h-4 w-4 text-primary" />
                                  Organization
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <p className="text-foreground">{unsub.organization.name}</p>
                                  <p className="text-muted-foreground">
                                    Slug: {unsub.organization.slug}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Timestamps */}
                            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                              <div>
                                <p>Created: {formatDate(unsub.created_at)}</p>
                              </div>
                              <div>
                                <p>Updated: {formatDate(unsub.updated_at)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {data && data.pagination.total_pages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <p className="text-muted-foreground text-sm">
                    Page {data.pagination.current_page} of {data.pagination.total_pages} (
                    {data.pagination.total_unsubscribes} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="bg-background/10 border-border text-foreground disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(data.pagination.total_pages, p + 1))
                      }
                      disabled={currentPage === data.pagination.total_pages}
                      variant="outline"
                      size="sm"
                      className="bg-background/10 border-border text-foreground disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
