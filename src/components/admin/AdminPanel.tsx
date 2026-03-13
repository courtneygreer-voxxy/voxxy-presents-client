import { Shield, Database, Mail, Bug, Key, Building2, BarChart3, TrendingUp, CheckCircle2, XCircle, Clock, Users, Store, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  email: string;
  name: string;
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest';
  status?: 'active' | 'suspended' | 'banned';
  confirmed_at: string | null;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  sign_in_count?: number;
  current_sign_in_ip?: string;
  events_count?: number;
  organizations?: any[];
  events?: any[];
  vendor_applications?: any[];
  registrations?: any[];
  [key: string]: any;
}

interface PresentsAnalytics {
  users: {
    total: number;
    producers: number;
    vendors: number;
  };
  events: {
    total: number;
    active: number;
    past: number;
    published: number;
    draft: number;
  };
  registrations: {
    total: number;
    approved: number;
    pending: number;
  };
  topEventCreators?: Array<{
    id: number;
    name: string;
    email: string;
    events_count: number;
  }>;
  recentEvents?: Array<{
    id: number;
    title: string;
    slug: string;
    event_date: string;
    status: string;
    published: boolean;
    organization_name: string;
    vendor_applications_count: number;
    registrations_count: number;
  }>;
}

interface Organization {
  id: number;
  name: string;
  slug: string;
  user_id: number;
  verified: boolean;
  active: boolean;
  [key: string]: any;
}

interface UserProfile {
  email?: string;
  role?: string;
  [key: string]: any;
}

interface AdminPanelProps {
  analytics: PresentsAnalytics | null;
  users: User[];
  organization: Organization | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loadingOrg: boolean;
  loadingAnalytics: boolean;
  analyticsError: string | null;
  expandedUserId: number | null;
  expandedAnalyticsSection: string | null;
  onLoadUsers: () => Promise<void>;
  onLoadAnalytics: () => Promise<void>;
  onExpandUser: (userId: number | null) => void;
  onExpandAnalyticsSection: (section: string | null) => void;
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
}: AdminPanelProps) {

  // Utility functions
  const getRoleBadgeColor = (role?: string) => {
    if (!role) return 'bg-gray-500/20 border-gray-400/30 text-gray-300';
    switch (role) {
      case 'venue_owner':
      case 'producer':
        return 'bg-green-500/20 border-green-400/30 text-green-300';
      case 'vendor':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-300';
      case 'consumer':
        return 'bg-amber-500/20 border-amber-400/30 text-amber-300';
      case 'admin':
        return 'bg-purple-500/20 border-purple-400/30 text-purple-300';
      default:
        return 'bg-gray-500/20 border-gray-400/30 text-gray-300';
    }
  };

  const getRoleIcon = (role?: string) => {
    if (!role) return <Users className="h-4 w-4" />;
    switch (role) {
      case 'venue_owner':
      case 'producer':
        return <Building2 className="h-4 w-4" />;
      case 'vendor':
        return <Store className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getDisplayRole = (role?: string) => {
    if (!role) return 'No Role';
    switch (role) {
      case 'venue_owner':
        return 'Producer';
      case 'producer':
        return 'Producer';
      case 'vendor':
        return 'Vendor';
      case 'consumer':
        return 'Consumer';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        {/* Header Section - Terminal Style */}
        <div className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/50 rounded-lg p-4 lg:p-6 shadow-lg shadow-purple-500/20">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500/20 border border-purple-400/50 rounded flex items-center justify-center flex-shrink-0 animate-pulse">
              <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-purple-300" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-purple-300 font-mono flex items-center gap-2">
                <span className="text-green-400">{'>'}</span>
                <span>ADMIN_DASHBOARD</span>
              </h1>
              <p className="text-xs lg:text-sm text-purple-400/60 font-mono">system.root.admin.view</p>
            </div>
            <Button
              onClick={() => {
                onLoadUsers();
                onLoadAnalytics();
              }}
              variant="outline"
              size="sm"
              className="bg-green-500/20 border border-green-400/50 text-green-300 hover:bg-green-500/30 font-mono text-xs"
              disabled={loading || loadingAnalytics}
            >
              {loading || loadingAnalytics ? 'LOADING...' : '↻ REFRESH'}
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-mono">
            <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300">
              USER: {userProfile?.email}
            </div>
            <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-400/50 rounded text-yellow-300">
              ROLE: ADMIN
            </div>
          </div>
        </div>

        {/* Admin Tools - Quick Access */}
        <div className="bg-black/40 backdrop-blur-sm border-2 border-yellow-500/50 rounded-lg p-4 lg:p-6 shadow-lg shadow-yellow-500/20">
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
              className="bg-black/60 border-2 border-red-500/50 rounded p-4 hover:bg-red-500/10 transition-all hover:border-red-500/70 text-left group"
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
                <div className="text-red-400/60">
                  {'>'} Click to access
                </div>
              </div>
            </button>

            {/* Bug Reports Tool */}
            <button
              onClick={() => window.open('/admin/bug-reports', '_blank')}
              className="bg-black/60 border-2 border-yellow-500/50 rounded p-4 hover:bg-yellow-500/10 transition-all hover:border-yellow-500/70 text-left group"
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
                <div className="text-yellow-400/60">
                  {'>'} Click to access
                </div>
              </div>
            </button>

            {/* Placeholder for future admin tools */}
            <div className="bg-black/60 border-2 border-gray-500/30 rounded p-4 opacity-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-500/20 border border-gray-400/50 rounded flex items-center justify-center">
                  <Key className="h-4 w-4 text-gray-300" />
                </div>
                <h3 className="text-gray-300 font-mono font-bold text-sm">
                  MORE TOOLS
                </h3>
              </div>
              <p className="text-gray-400/60 font-mono text-[10px]">
                Coming soon...
              </p>
            </div>
          </div>
        </div>

        {/* Organization System Info - Developer Style */}
        <div className="bg-black/40 backdrop-blur-sm border-2 border-cyan-500/50 rounded-lg p-4 lg:p-6 shadow-lg shadow-cyan-500/20">
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
            <div className={`px-3 py-1 rounded font-mono text-xs font-bold border ${
              organization
                ? 'bg-green-500/20 text-green-300 border-green-400/50 animate-pulse'
                : 'bg-red-500/20 text-red-300 border-red-400/50'
            }`}>
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
                <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                  <div className="text-cyan-400/60 mb-1">org.id</div>
                  <div className="text-yellow-300 font-bold text-base">{organization.id}</div>
                </div>
                <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                  <div className="text-cyan-400/60 mb-1">org.slug</div>
                  <div className="text-purple-300 font-bold text-sm break-all">{organization.slug}</div>
                </div>
                <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                  <div className="text-cyan-400/60 mb-1">org.name</div>
                  <div className="text-white font-bold text-sm">{organization.name}</div>
                </div>
                <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                  <div className="text-cyan-400/60 mb-1">org.user_id</div>
                  <div className="text-yellow-300 font-bold text-base">{organization.user_id}</div>
                </div>
                <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                  <div className="text-cyan-400/60 mb-1">org.verified</div>
                  <div className={`font-bold text-base ${organization.verified ? 'text-green-400' : 'text-red-400'}`}>
                    {organization.verified ? 'TRUE' : 'FALSE'}
                  </div>
                </div>
                <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                  <div className="text-cyan-400/60 mb-1">org.active</div>
                  <div className={`font-bold text-base ${organization.active ? 'text-green-400' : 'text-red-400'}`}>
                    {organization.active ? 'TRUE' : 'FALSE'}
                  </div>
                </div>
              </div>

              <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                <details>
                  <summary className="text-cyan-300 cursor-pointer hover:text-cyan-200 transition-colors font-mono text-xs flex items-center gap-2">
                    <span className="text-green-400">{'>'}</span>
                    <span>JSON.stringify(organization)</span>
                  </summary>
                  <pre className="mt-3 p-3 bg-black/80 rounded text-[10px] overflow-auto max-h-60 text-green-300 border border-green-500/20">
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
          <div className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/50 rounded-lg p-6 shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-center gap-3 min-h-[200px]">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-purple-300 font-mono text-sm">LOADING_ANALYTICS...</p>
            </div>
          </div>
        ) : analyticsError ? (
          <div className="bg-black/40 backdrop-blur-sm border-2 border-red-500/50 rounded-lg p-6 shadow-lg shadow-red-500/20">
            <div className="text-center">
              <p className="text-red-300 font-mono text-sm mb-4">ERROR: {analyticsError}</p>
              <Button
                onClick={onLoadAnalytics}
                className="bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 font-mono text-xs"
              >
                ↻ RETRY_ANALYTICS
              </Button>
            </div>
          </div>
        ) : analytics ? (
          <>
            {/* Platform Analytics - Terminal Style */}
            <div className="bg-black/40 backdrop-blur-sm border-2 border-green-500/50 rounded-lg p-4 lg:p-6 shadow-lg shadow-green-500/20">
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
                <div className="bg-black/60 border border-green-500/30 rounded p-3">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">events.total</div>
                  <div className="text-yellow-300 font-bold text-2xl font-mono">{analytics.events.total}</div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    pub:{analytics.events.published} draft:{analytics.events.draft}
                  </div>
                </div>
                <div className="bg-black/60 border border-green-500/30 rounded p-3">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">events.active</div>
                  <div className="text-cyan-300 font-bold text-2xl font-mono">{analytics.events.active}</div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    upcoming/current
                  </div>
                </div>
                <div className="bg-black/60 border border-green-500/30 rounded p-3">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">events.past</div>
                  <div className="text-purple-300 font-bold text-2xl font-mono">{analytics.events.past}</div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    historical
                  </div>
                </div>
                <div className="bg-black/60 border border-green-500/30 rounded p-3">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">users.total</div>
                  <div className="text-yellow-300 font-bold text-2xl font-mono">{analytics.users.total}</div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    all platform users
                  </div>
                </div>
              </div>

              {/* Users Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-black/60 border border-green-500/30 rounded p-3">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">users.producers</div>
                  <div className="text-yellow-300 font-bold text-2xl font-mono">{analytics.users.producers}</div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    event creators
                  </div>
                </div>
                <div className="bg-black/60 border border-green-500/30 rounded p-3">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">users.vendors</div>
                  <div className="text-cyan-300 font-bold text-2xl font-mono">{analytics.users.vendors}</div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    registered vendors
                  </div>
                </div>
                <div className="bg-black/60 border border-green-500/30 rounded p-3">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">registrations.total</div>
                  <div className="text-purple-300 font-bold text-2xl font-mono">{analytics.registrations.total}</div>
                  <div className="text-green-300/60 font-mono text-[9px] mt-1">
                    all time
                  </div>
                </div>
              </div>

              {/* Registration Status Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/60 border border-green-500/30 rounded p-3">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">registrations.approved</div>
                  <div className="text-green-300 font-bold text-2xl font-mono">{analytics.registrations.approved}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                    <span className="text-green-300/60 font-mono text-[9px]">confirmed</span>
                  </div>
                </div>
                <div className="bg-black/60 border border-green-500/30 rounded p-3">
                  <div className="text-green-400/60 font-mono text-[10px] mb-1">registrations.pending</div>
                  <div className="text-yellow-300 font-bold text-2xl font-mono">{analytics.registrations.pending}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-yellow-400" />
                    <span className="text-green-300/60 font-mono text-[9px]">awaiting review</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Event Creators - Leaderboard */}
            {analytics.topEventCreators && analytics.topEventCreators.length > 0 && (
              <div className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/50 rounded-lg p-4 lg:p-6 shadow-lg shadow-purple-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 border border-purple-400/50 rounded flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-purple-300 font-mono flex items-center gap-2">
                      <span className="text-green-400">{'>'}</span> TOP_EVENT_CREATORS
                    </h2>
                    <p className="text-xs text-purple-400/60 font-mono">system.admin.leaderboard</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {analytics.topEventCreators.map((creator, index) => (
                    <div
                      key={creator.id}
                      className="bg-black/60 border border-purple-500/30 rounded p-3 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-300 border-2 border-yellow-400/50' :
                            index === 1 ? 'bg-gray-400/20 text-gray-300 border-2 border-gray-400/50' :
                            index === 2 ? 'bg-amber-600/20 text-amber-400 border-2 border-amber-500/50' :
                            'bg-purple-500/20 text-purple-300 border border-purple-400/50'
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <div className="text-white font-mono text-sm font-bold">{creator.name}</div>
                            <div className="text-purple-300/60 font-mono text-xs">{creator.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-300 font-mono font-bold text-lg">{creator.events_count}</div>
                          <div className="text-purple-300/60 font-mono text-[10px]">events</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Events Overview */}
            {analytics.recentEvents && analytics.recentEvents.length > 0 && (
              <div className="bg-black/40 backdrop-blur-sm border-2 border-cyan-500/50 rounded-lg p-4 lg:p-6 shadow-lg shadow-cyan-500/20">
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
                      className="bg-black/60 border border-cyan-500/30 rounded p-3 hover:border-cyan-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-white font-mono text-sm font-bold mb-1">{event.title}</div>
                          <div className="text-cyan-300/60 font-mono text-xs mb-2">
                            {event.organization_name} • {event.slug}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300 font-mono text-[9px]">
                              {event.event_date}
                            </div>
                            <div className={`px-2 py-1 rounded font-mono text-[9px] border ${
                              event.published
                                ? 'bg-green-500/20 text-green-300 border-green-400/50'
                                : 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50'
                            }`}>
                              {event.published ? 'PUBLISHED' : 'DRAFT'}
                            </div>
                            <div className="px-2 py-1 bg-purple-500/20 border border-purple-400/50 rounded text-purple-300 font-mono text-[9px]">
                              {event.vendor_applications_count} applications
                            </div>
                            <div className="px-2 py-1 bg-blue-500/20 border border-blue-400/50 rounded text-blue-300 font-mono text-[9px]">
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
          <div className="bg-black/40 backdrop-blur-sm border-2 border-blue-500/50 rounded-lg p-4 lg:p-6 shadow-lg shadow-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-400/50 rounded flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-blue-300 font-mono flex items-center gap-2">
                  <span className="text-green-400">{'>'}</span> ALL_USERS
                </h2>
                <p className="text-xs text-blue-400/60 font-mono">system.admin.users.all ({users.length})</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-black/60 border border-blue-500/30 rounded overflow-hidden hover:border-blue-500/50 transition-colors"
                >
                  <button
                    onClick={() => onExpandUser(expandedUserId === user.id ? null : user.id)}
                    className="w-full p-3 text-left hover:bg-blue-500/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center border ${getRoleBadgeColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <div className="text-white font-mono text-sm font-bold">{user.email}</div>
                          <div className="text-blue-300/60 font-mono text-xs">
                            {user.name || 'No name'} • ID: {user.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded font-mono text-[9px] border ${getRoleBadgeColor(user.role)}`}>
                          {getDisplayRole(user.role)}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          user.confirmed_at ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </div>
                  </button>

                  {expandedUserId === user.id && (
                    <div className="p-4 border-t border-blue-500/30 bg-black/40">
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
  );
}
