import {
  Shield,
  Database,
  Mail,
  Bug,
  Key,
  Building2,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Store,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface OrganizationSubscription {
  id: number
  name: string
  slug: string
  verified: boolean
  active: boolean
  subscription: {
    status: string | null
    subscribed: boolean
    subscription_active: boolean
    requires_payment: boolean
    display_status: string
    plan: string | null
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    current_period_end: string | null
    trial_ends_at: string | null
  }
}

interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
  status?: 'active' | 'suspended' | 'banned'
  confirmed_at: string | null
  paid?: boolean
  created_at?: string
  updated_at?: string
  last_sign_in_at?: string
  sign_in_count?: number
  current_sign_in_ip?: string
  events_count?: number
  organizations?: OrganizationSubscription[]
  events?: any[]
  vendor_applications?: any[]
  registrations?: any[]
  [key: string]: any
}

interface PresentsAnalytics {
  users: {
    total: number
    producers: number
    vendors: number
  }
  events: {
    total: number
    active: number
    past: number
    published: number
    draft: number
  }
  registrations: {
    total: number
    approved: number
    pending: number
  }
  topEventCreators?: Array<{
    id: number
    name: string
    email: string
    events_count: number
  }>
  recentEvents?: Array<{
    id: number
    title: string
    slug: string
    event_date: string
    status: string
    published: boolean
    organization_name: string
    vendor_applications_count: number
    registrations_count: number
  }>
}

interface Organization {
  id: number
  name: string
  slug: string
  user_id: number
  verified: boolean
  active: boolean
  [key: string]: any
}

interface UserProfile {
  email?: string
  role?: string
  [key: string]: any
}

interface AdminPanelProps {
  analytics: PresentsAnalytics | null
  users: User[]
  organization: Organization | null
  userProfile: UserProfile | null
  loading: boolean
  loadingOrg: boolean
  loadingAnalytics: boolean
  analyticsError: string | null
  expandedUserId: number | null
  expandedAnalyticsSection: string | null
  onLoadUsers: () => Promise<void>
  onLoadAnalytics: () => Promise<void>
  onExpandUser: (userId: number | null) => void
  onExpandAnalyticsSection: (section: string | null) => void
  onToggleUserPaid: (userId: number) => Promise<void>
}

export default function AdminPanel({
  analytics,
  users,
  organization,
  userProfile,
  loading,
  loadingOrg,
  loadingAnalytics,
  analyticsError,
  expandedUserId,
  expandedAnalyticsSection,
  onLoadUsers,
  onLoadAnalytics,
  onExpandUser,
  onExpandAnalyticsSection,
  onToggleUserPaid,
}: AdminPanelProps) {
  // Utility functions
  const getRoleBadgeColor = (role?: string) => {
    if (!role) return 'bg-muted/20 border-border/30 text-muted-foreground'
    switch (role) {
      case 'venue_owner':
      case 'producer':
        return 'bg-green-500/20 border-green-400/30 text-emerald-900 dark:text-green-300'
      case 'vendor':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-950 dark:text-blue-300'
      case 'consumer':
        return 'bg-amber-500/20 border-amber-400/30 text-amber-950 dark:text-amber-300'
      case 'admin':
        return 'bg-primary/20 border-primary/30 text-violet-950 dark:text-primary'
      default:
        return 'bg-muted/20 border-border/30 text-muted-foreground'
    }
  }

  const getRoleIcon = (role?: string) => {
    if (!role) return <Users className="h-4 w-4" />
    switch (role) {
      case 'venue_owner':
      case 'producer':
        return <Building2 className="h-4 w-4" />
      case 'vendor':
        return <Store className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getDisplayRole = (role?: string) => {
    if (!role) return 'No Role'
    switch (role) {
      case 'venue_owner':
        return 'Producer'
      case 'producer':
        return 'Producer'
      case 'vendor':
        return 'Vendor'
      case 'consumer':
        return 'Consumer'
      case 'admin':
        return 'Admin'
      default:
        return role
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        {/* Header Section - Terminal Style */}
        <div className="rounded-lg border-2 border-primary/50 bg-card/90 p-4 shadow-lg shadow-primary/20 backdrop-blur-sm dark:bg-black/40 lg:p-6">
          {/* Header removed - now in Dashboard.tsx header */}
          <div className="flex items-center justify-end gap-3 lg:gap-4">
            <Button
              onClick={() => {
                onLoadUsers()
                onLoadAnalytics()
              }}
              variant="outline"
              size="sm"
              className="bg-green-500/20 border border-green-400/50 text-emerald-900 dark:text-green-300 hover:bg-green-500/30 font-mono text-xs"
              disabled={loading || loadingAnalytics}
            >
              {loading || loadingAnalytics ? 'LOADING...' : '↻ REFRESH'}
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-mono">
            <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-950 dark:text-cyan-300">
              USER: {userProfile?.email}
            </div>
            <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-400/50 rounded text-yellow-950 dark:text-yellow-300">
              ROLE: ADMIN
            </div>
          </div>
        </div>

        {/* Admin Tools - Quick Access */}
        <div className="rounded-lg border-2 border-yellow-500/50 bg-card/90 p-4 shadow-lg shadow-yellow-500/20 backdrop-blur-sm dark:bg-black/40 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-500/20 border border-yellow-400/50 rounded flex items-center justify-center">
              <Database className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-yellow-300 font-mono flex items-center gap-2">
                <span className="text-green-400">{'>'}</span> ADMIN_TOOLS
              </h2>
              <p className="text-xs text-yellow-400/60 font-mono">system.admin.quick_access</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => window.open('/admin/unsubscribes', '_blank')}
              className="rounded border-2 border-red-500/50 bg-card/95 p-4 text-left transition-all hover:border-red-500/70 hover:bg-red-500/10 dark:bg-black/60 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-500/20 border border-red-400/50 rounded flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <Mail className="h-4 w-4 text-red-300" />
                </div>
                <h3 className="text-red-300 font-mono font-bold text-sm group-hover:text-red-200 transition-colors">
                  UNSUBSCRIBES
                </h3>
              </div>
              <p className="text-red-400/60 font-mono text-[10px] mb-2">
                View all email unsubscribe records
              </p>
              <div className="flex items-center gap-2 text-[9px] font-mono">
                <div className="px-2 py-1 bg-red-500/20 border border-red-400/50 rounded text-red-300">
                  DEBUG
                </div>
                <div className="text-red-400/60">{'>'} Click to access</div>
              </div>
            </button>

            {/* Bug Reports Tool */}
            <button
              onClick={() => window.open('/admin/bug-reports', '_blank')}
              className="rounded border-2 border-yellow-500/50 bg-card/95 p-4 text-left transition-all hover:border-yellow-500/70 hover:bg-yellow-500/10 dark:bg-black/60 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-400/50 rounded flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                  <Bug className="h-4 w-4 text-yellow-300" />
                </div>
                <h3 className="text-yellow-300 font-mono font-bold text-sm group-hover:text-yellow-200 transition-colors">
                  BUG REPORTS
                </h3>
              </div>
              <p className="text-yellow-400/60 font-mono text-[10px] mb-2">
                View all user-submitted bug reports
              </p>
              <div className="flex items-center gap-2 text-[9px] font-mono">
                <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-400/50 rounded text-yellow-300">
                  DEBUG
                </div>
                <div className="text-yellow-400/60">{'>'} Click to access</div>
              </div>
            </button>

            {/* Placeholder for future admin tools */}
            <div className="rounded border-2 border-border/30 bg-card/95 p-4 opacity-50 dark:bg-black/60">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-muted/20 border border-border/50 rounded flex items-center justify-center">
                  <Key className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-muted-foreground font-mono font-bold text-sm">MORE TOOLS</h3>
              </div>
              <p className="text-muted-foreground/60 font-mono text-[10px]">Coming soon...</p>
            </div>
          </div>
        </div>

        {/* Organization System Info - Developer Style */}
        <div className="rounded-lg border-2 border-cyan-500/50 bg-card/90 p-4 shadow-lg shadow-cyan-500/20 backdrop-blur-sm dark:bg-black/40 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-400/50 rounded flex items-center justify-center">
                <Building2 className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-cyan-300 font-mono flex items-center gap-2">
                  <span className="text-green-400">{'>'}</span> ORGANIZATION_CONTEXT
                </h2>
                <p className="text-xs text-cyan-400/60 font-mono">system.admin.organization</p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded font-mono text-xs font-bold border ${
                organization
                  ? 'bg-green-500/20 text-emerald-900 dark:text-green-300 border-green-400/50 animate-pulse'
                  : 'bg-red-500/20 text-red-950 dark:text-red-300 border-red-400/50'
              }`}
            >
              {organization ? '● ACTIVE' : '○ NULL'}
            </div>
          </div>

          {loadingOrg ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <span className="text-cyan-400 font-mono text-sm">LOADING...</span>
            </div>
          ) : organization ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                <div className="rounded border border-cyan-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-cyan-400/60 mb-1">org.id</div>
                  <div className="text-yellow-300 font-bold text-base">{organization.id}</div>
                </div>
                <div className="rounded border border-cyan-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-cyan-400/60 mb-1">org.slug</div>
                  <div className="text-primary font-bold text-sm break-all">
                    {organization.slug}
                  </div>
                </div>
                <div className="rounded border border-cyan-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-cyan-400/60 mb-1">org.name</div>
                  <div className="text-foreground font-bold text-sm">{organization.name}</div>
                </div>
                <div className="rounded border border-cyan-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-cyan-400/60 mb-1">org.user_id</div>
                  <div className="text-yellow-300 font-bold text-base">{organization.user_id}</div>
                </div>
                <div className="rounded border border-cyan-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-cyan-400/60 mb-1">org.verified</div>
                  <div
                    className={`font-bold text-base ${organization.verified ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {organization.verified ? 'TRUE' : 'FALSE'}
                  </div>
                </div>
                <div className="rounded border border-cyan-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-cyan-400/60 mb-1">org.active</div>
                  <div
                    className={`font-bold text-base ${organization.active ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {organization.active ? 'TRUE' : 'FALSE'}
                  </div>
                </div>
              </div>

              <div className="rounded border border-cyan-500/30 bg-card/95 p-3 dark:bg-black/60">
                <details>
                  <summary className="text-cyan-300 cursor-pointer hover:text-cyan-200 transition-colors font-mono text-xs flex items-center gap-2">
                    <span className="text-green-400">{'>'}</span>
                    <span>JSON.stringify(organization)</span>
                  </summary>
                  <pre className="mt-3 max-h-60 overflow-auto rounded border border-green-500/20 bg-card p-3 text-[10px] text-green-800 dark:bg-black/80 dark:text-green-300">
                    {JSON.stringify(organization, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-400/50 rounded p-6 text-center font-mono">
              <p className="text-red-300 font-bold">ERROR: organization === null</p>
              <p className="text-xs text-red-400/60 mt-1">Try window.location.reload()</p>
            </div>
          )}
        </div>

        {/* Analytics Section */}
        {loadingAnalytics ? (
          <div className="rounded-lg border-2 border-primary/50 bg-card/90 p-6 shadow-lg shadow-primary/20 backdrop-blur-sm dark:bg-black/40">
            <div className="flex items-center justify-center gap-3 min-h-[200px]">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-primary font-mono text-sm">LOADING_ANALYTICS...</p>
            </div>
          </div>
        ) : analyticsError ? (
          <div className="rounded-lg border-2 border-red-500/50 bg-card/90 p-6 shadow-lg shadow-red-500/20 backdrop-blur-sm dark:bg-black/40">
            <div className="text-center">
              <p className="text-red-300 font-mono text-sm mb-4">ERROR: {analyticsError}</p>
              <Button
                onClick={onLoadAnalytics}
                className="bg-red-500/20 border border-red-400/50 text-red-950 dark:text-red-300 hover:bg-red-500/30 font-mono text-xs"
              >
                ↻ RETRY_ANALYTICS
              </Button>
            </div>
          </div>
        ) : analytics ? (
          <>
            {/* Platform Analytics - Terminal Style */}
            <div className="rounded-lg border-2 border-green-500/50 bg-card/90 p-4 shadow-lg shadow-green-500/20 backdrop-blur-sm dark:bg-black/40 lg:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 border border-green-400/50 rounded flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-green-300 font-mono flex items-center gap-2">
                    <span className="text-green-400">{'>'}</span> PLATFORM_ANALYTICS
                  </h2>
                  <p className="text-xs text-green-400/60 font-mono">system.admin.analytics</p>
                </div>
              </div>

              {/* Events Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="rounded border border-green-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">events.total</div>
                  <div className="text-yellow-300 font-bold text-2xl font-mono">
                    {analytics.events.total}
                  </div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    pub:{analytics.events.published} draft:{analytics.events.draft}
                  </div>
                </div>
                <div className="rounded border border-green-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">events.active</div>
                  <div className="text-cyan-300 font-bold text-2xl font-mono">
                    {analytics.events.active}
                  </div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    upcoming/current
                  </div>
                </div>
                <div className="rounded border border-green-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">events.past</div>
                  <div className="text-primary font-bold text-2xl font-mono">
                    {analytics.events.past}
                  </div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">historical</div>
                </div>
                <div className="rounded border border-green-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">users.total</div>
                  <div className="text-yellow-300 font-bold text-2xl font-mono">
                    {analytics.users.total}
                  </div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    all platform users
                  </div>
                </div>
              </div>

              {/* Users Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="rounded border border-green-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">
                    users.producers
                  </div>
                  <div className="text-yellow-300 font-bold text-2xl font-mono">
                    {analytics.users.producers}
                  </div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">event creators</div>
                </div>
                <div className="rounded border border-green-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">users.vendors</div>
                  <div className="text-cyan-300 font-bold text-2xl font-mono">
                    {analytics.users.vendors}
                  </div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    registered vendors
                  </div>
                </div>
                <div className="rounded border border-green-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">
                    registrations.total
                  </div>
                  <div className="text-primary font-bold text-2xl font-mono">
                    {analytics.registrations.total}
                  </div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">all time</div>
                </div>
              </div>

              {/* Registration Status Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-green-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">
                    registrations.approved
                  </div>
                  <div className="text-green-300 font-bold text-2xl font-mono">
                    {analytics.registrations.approved}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                    <span className="text-green-300/60 font-mono text-[9px]">confirmed</span>
                  </div>
                </div>
                <div className="rounded border border-green-500/30 bg-card/95 p-3 dark:bg-black/60">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">
                    registrations.pending
                  </div>
                  <div className="text-yellow-300 font-bold text-2xl font-mono">
                    {analytics.registrations.pending}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-yellow-400" />
                    <span className="text-green-300/60 font-mono text-[9px]">awaiting review</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Event Creators - Leaderboard */}
            {analytics.topEventCreators && analytics.topEventCreators.length > 0 && (
              <div className="rounded-lg border-2 border-primary/50 bg-card/90 p-4 shadow-lg shadow-primary/20 backdrop-blur-sm dark:bg-black/40 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 border border-primary/50 rounded flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-primary font-mono flex items-center gap-2">
                      <span className="text-green-400">{'>'}</span> TOP_EVENT_CREATORS
                    </h2>
                    <p className="text-xs text-primary/60 font-mono">system.admin.leaderboard</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {analytics.topEventCreators.map((creator, index) => (
                    <div
                      key={creator.id}
                      className="rounded border border-primary/30 bg-card/95 p-3 transition-colors hover:border-primary/50 dark:bg-black/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-sm ${
                              index === 0
                                ? 'bg-yellow-500/20 text-yellow-950 dark:text-yellow-300 border-2 border-yellow-400/50'
                                : index === 1
                                  ? 'bg-muted/20 text-muted-foreground border-2 border-border/50'
                                  : index === 2
                                    ? 'bg-amber-600/20 text-amber-950 dark:text-amber-400 border-2 border-amber-500/50'
                                    : 'bg-primary/20 text-violet-950 dark:text-primary border border-primary/50'
                            }`}
                          >
                            #{index + 1}
                          </div>
                          <div>
                            <div className="text-foreground font-mono text-sm font-bold">
                              {creator.name}
                            </div>
                            <div className="text-primary/60 font-mono text-xs">{creator.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-300 font-mono font-bold text-lg">
                            {creator.events_count}
                          </div>
                          <div className="text-primary/60 font-mono text-[10px]">events</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Events Overview */}
            {analytics.recentEvents && analytics.recentEvents.length > 0 && (
              <div className="rounded-lg border-2 border-cyan-500/50 bg-card/90 p-4 shadow-lg shadow-cyan-500/20 backdrop-blur-sm dark:bg-black/40 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-400/50 rounded flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-cyan-300 font-mono flex items-center gap-2">
                      <span className="text-green-400">{'>'}</span> RECENT_EVENTS
                    </h2>
                    <p className="text-xs text-cyan-400/60 font-mono">system.admin.events.recent</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {analytics.recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded border border-cyan-500/30 bg-card/95 p-3 transition-colors hover:border-cyan-500/50 dark:bg-black/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-foreground font-mono text-sm font-bold mb-1">
                            {event.title}
                          </div>
                          <div className="text-cyan-300/60 font-mono text-xs mb-2">
                            {event.organization_name} • {event.slug}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-950 dark:text-cyan-300 font-mono text-[9px]">
                              {event.event_date}
                            </div>
                            <div
                              className={`px-2 py-1 rounded font-mono text-[9px] border ${
                                event.published
                                  ? 'bg-green-500/20 text-emerald-900 dark:text-green-300 border-green-400/50'
                                  : 'bg-yellow-500/20 text-yellow-950 dark:text-yellow-300 border-yellow-400/50'
                              }`}
                            >
                              {event.published ? 'PUBLISHED' : 'DRAFT'}
                            </div>
                            <div className="px-2 py-1 bg-primary/20 border border-primary/50 rounded text-violet-950 dark:text-primary font-mono text-[9px]">
                              {event.vendor_applications_count} applications
                            </div>
                            <div className="px-2 py-1 bg-blue-500/20 border border-blue-400/50 rounded text-blue-950 dark:text-blue-300 font-mono text-[9px]">
                              {event.registrations_count} registrations
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* All Users Panel */}
        {users.length > 0 && (
          <div className="rounded-lg border-2 border-blue-500/50 bg-card/90 p-4 shadow-lg shadow-blue-500/20 backdrop-blur-sm dark:bg-black/40 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-400/50 rounded flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-blue-300 font-mono flex items-center gap-2">
                  <span className="text-green-400">{'>'}</span> ALL_USERS
                </h2>
                <p className="text-xs text-blue-400/60 font-mono">
                  system.admin.users.all ({users.length})
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="overflow-hidden rounded border border-blue-500/30 bg-card/95 transition-colors hover:border-blue-500/50 dark:bg-black/60"
                >
                  <button
                    onClick={() => onExpandUser(expandedUserId === user.id ? null : user.id)}
                    className="w-full p-3 text-left hover:bg-blue-500/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center border ${getRoleBadgeColor(user.role)}`}
                        >
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <div className="text-foreground font-mono text-sm font-bold">
                            {user.email}
                          </div>
                          <div className="text-blue-300/60 font-mono text-xs">
                            {user.name || 'No name'} • ID: {user.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-2 py-1 rounded font-mono text-[9px] border ${getRoleBadgeColor(user.role)}`}
                        >
                          {getDisplayRole(user.role)}
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.confirmed_at ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {expandedUserId === user.id && (
                    <div className="border-t border-blue-500/30 bg-card/85 p-4 dark:bg-black/40">
                      {/* Payment Status Control for Producers */}
                      {(user.role === 'venue_owner' || user.role === 'producer') && (
                        <div className="mb-4 pb-4 border-b border-blue-500/20 space-y-4">
                          {/* User-level payment status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-blue-300">
                                USER PAYMENT STATUS:
                              </span>
                              <Badge
                                className={`font-mono text-[10px] ${
                                  user.paid
                                    ? 'bg-green-500/20 border-green-400/30 text-emerald-900 dark:text-green-300'
                                    : 'bg-red-500/20 border-red-400/30 text-red-950 dark:text-red-300'
                                }`}
                              >
                                {user.paid ? 'PAID' : 'UNPAID'}
                              </Badge>
                            </div>
                            <Button
                              onClick={async () => {
                                try {
                                  await onToggleUserPaid(user.id)
                                } catch (error) {
                                  console.error('Failed to toggle paid status:', error)
                                }
                              }}
                              size="default"
                              className={`font-semibold text-xs gap-2 ${
                                user.paid
                                  ? 'bg-red-600 hover:bg-red-700 text-destructive-foreground border-2 border-red-400'
                                  : 'bg-green-600 hover:bg-green-700 text-primary-foreground border-2 border-green-400'
                              }`}
                            >
                              <DollarSign className="h-4 w-4" />
                              {user.paid ? 'MARK UNPAID' : 'MARK PAID'}
                            </Button>
                          </div>

                          {/* Organization subscription details */}
                          {user.organizations && user.organizations.length > 0 && (
                            <div className="space-y-3">
                              <div className="text-xs font-mono text-blue-300 flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                ORGANIZATION SUBSCRIPTION DATA:
                              </div>
                              {user.organizations.map((org: OrganizationSubscription) => (
                                <div
                                  key={org.id}
                                  className="space-y-2 rounded border border-cyan-500/30 bg-card/95 p-3 dark:bg-black/60"
                                >
                                  <div className="font-mono text-xs text-foreground font-bold mb-2">
                                    {org.name} (#{org.id})
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                    <div>
                                      <span className="text-cyan-400/60">subscription_status:</span>
                                      <span
                                        className={`ml-2 font-bold ${
                                          org.subscription.status === 'active'
                                            ? 'text-green-300'
                                            : org.subscription.status === 'past_due'
                                              ? 'text-yellow-300'
                                              : org.subscription.status === 'canceled'
                                                ? 'text-red-300'
                                                : 'text-muted-foreground'
                                        }`}
                                      >
                                        {org.subscription.status || 'inactive'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-cyan-400/60">display_status:</span>
                                      <span className="ml-2 text-foreground font-bold">
                                        {org.subscription.display_status}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-cyan-400/60">subscribed:</span>
                                      <span
                                        className={`ml-2 font-bold ${
                                          org.subscription.subscribed
                                            ? 'text-green-300'
                                            : 'text-red-300'
                                        }`}
                                      >
                                        {org.subscription.subscribed ? 'TRUE' : 'FALSE'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-cyan-400/60">requires_payment:</span>
                                      <span
                                        className={`ml-2 font-bold ${
                                          org.subscription.requires_payment
                                            ? 'text-red-300'
                                            : 'text-green-300'
                                        }`}
                                      >
                                        {org.subscription.requires_payment ? 'TRUE' : 'FALSE'}
                                      </span>
                                    </div>
                                    {org.subscription.plan && (
                                      <div className="col-span-2">
                                        <span className="text-cyan-400/60">plan:</span>
                                        <span className="ml-2 text-primary font-bold">
                                          {org.subscription.plan}
                                        </span>
                                      </div>
                                    )}
                                    {org.subscription.stripe_customer_id && (
                                      <div className="col-span-2">
                                        <span className="text-cyan-400/60">
                                          stripe_customer_id:
                                        </span>
                                        <span className="ml-2 text-yellow-300 font-bold break-all">
                                          {org.subscription.stripe_customer_id}
                                        </span>
                                      </div>
                                    )}
                                    {org.subscription.stripe_subscription_id && (
                                      <div className="col-span-2">
                                        <span className="text-cyan-400/60">
                                          stripe_subscription_id:
                                        </span>
                                        <span className="ml-2 text-yellow-300 font-bold break-all">
                                          {org.subscription.stripe_subscription_id}
                                        </span>
                                      </div>
                                    )}
                                    {org.subscription.current_period_end && (
                                      <div className="col-span-2">
                                        <span className="text-cyan-400/60">
                                          current_period_end:
                                        </span>
                                        <span className="ml-2 text-cyan-300">
                                          {new Date(
                                            org.subscription.current_period_end,
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="text-xs font-mono text-green-400/60 mb-2">
                        FULL JSON DATA:
                      </div>
                      <pre className="text-[10px] text-green-300 font-mono overflow-auto max-h-60">
                        {JSON.stringify(user, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
