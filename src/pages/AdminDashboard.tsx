import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Shield, Building2, Store, Menu, X, LogOut, Mail, Users, Calendar, BarChart3, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi, eventsApi, organizationsApi, vendorApplicationsApi, eventInvitationsApi, contactListsApi } from "@/services/api";
import SettingsPage from './SettingsPage';
import EmailTestingPanel from '@/components/admin/EmailTestingPanel';
import EventsEmptyState from '@/components/producer/EventsEmptyState';
import { CreateEventWizard, WizardState } from '@/components/producer/CreateEventWizard';
import EditEventForm from '@/components/producer/EditEventForm';
import EventsList from '@/components/producer/EventsList';
import LoadingCommandCenter from '@/components/producer/LoadingCommandCenter';
import CommandCenter from '@/components/producer/CommandCenter';
import { NetworkPage } from '@/components/producer/Network';
import EmailTemplatesPage from './EmailTemplatesPage';

type NavItem = 'admin' | 'events' | 'network' | 'email-templates' | 'email-testing' | 'settings';
type EventsView = 'list' | 'create' | 'edit' | 'command-center' | 'empty';

interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
  status?: 'active' | 'suspended' | 'banned'
  confirmed_at: string | null
  created_at?: string
  events_count?: number
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
    upcoming: number
    today: number
    draft: number
    published: number
  }
  organizations: {
    total: number
    verified: number
  }
  registrations: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  top_creators: Array<{
    id: number
    name: string
    email: string
    role: string
    events_count: number
  }>
  users_with_events: Array<User>
  recent_events: Array<{
    id: number
    title: string
    slug: string
    event_date: string
    published: boolean
    registered_count: number
    created_at: string
    organization_name: string
  }>
}

interface Organization {
  id: number;
  slug: string;
  name: string;
  user_id: number;
}

interface Event {
  id: number;
  slug: string;
  title: string;
  description?: string;
  dates?: {
    start?: string;
    end?: string;
  };
  event_date?: string;
  event_end_date?: string;
  location?: string;
  status?: {
    published?: boolean;
    registration_open?: boolean;
    status?: 'draft' | 'published' | 'cancelled' | 'completed';
  };
  published?: boolean;
  registered_count?: number;
  capacity?: {
    total?: number;
    registered?: number;
    remaining?: number;
    is_full?: boolean;
  };
}

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>('admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [eventsView, setEventsView] = useState<EventsView>('empty');
  const { userProfile, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Admin tab state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics tab state
  const [analytics, setAnalytics] = useState<PresentsAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Producer functionality state
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingCommandCenter, setLoadingCommandCenter] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load users for admin tab
  useEffect(() => {
    loadUsers();
  }, []);

  // Fetch user's organization for producer functionality
  useEffect(() => {
    const fetchOrCreateOrganization = async () => {
      if (!userProfile?.id) return;

      try {
        setLoadingOrg(true);
        setError(null);

        // Get current user's organization directly
        console.log('Fetching organization for admin user...');
        const response = await organizationsApi.getMine();
        console.log('My organization response:', response);

        let userOrg = response?.organization !== null ? response : null;

        // Handle case where response is { organization: null }
        if (response?.organization === null) {
          userOrg = null;
        }

        // If no organization exists, create one automatically
        if (!userOrg) {
          console.log('No organization found, creating one for admin user...');
          try {
            const newOrg = await organizationsApi.create({
              name: userProfile.name || 'Admin Organization',
              description: 'Event production and venue management',
            });
            console.log('Organization created:', newOrg);
            userOrg = newOrg;
          } catch (createErr: any) {
            console.error('Failed to create organization:', createErr);
            console.log('Error details:', {
              status: createErr?.status,
              message: createErr?.message,
              errors: createErr?.errors
            });

            // If creation failed due to duplicate, refetch the user's organization
            if (createErr?.status === 422) {
              console.log('422 error - organization may already exist. Refetching...');
              const retryResponse = await organizationsApi.getMine();
              console.log('Retry response:', retryResponse);

              if (retryResponse && retryResponse.organization !== null) {
                userOrg = retryResponse;
              } else {
                setError('Organization exists but could not be loaded. Please contact support or try logging out and back in.');
                setLoadingOrg(false);
                return;
              }
            } else {
              setError(`Failed to create organization: ${createErr?.message || 'Unknown error'}`);
              setLoadingOrg(false);
              return;
            }
          }
        }

        if (userOrg) {
          console.log('Setting organization:', userOrg);
          setOrganization(userOrg);
          // Fetch events for this organization
          await fetchEvents(userOrg.slug);
        }
      } catch (err) {
        console.error('Failed to fetch organization:', err);
        setError('Failed to load organization data');
      } finally {
        setLoadingOrg(false);
      }
    };

    if (userProfile) {
      fetchOrCreateOrganization();
    }
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Analytics tab: Load analytics data
  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      const data = await adminApi.getPresentsAnalytics();
      setAnalytics(data);
      console.log('✅ Analytics loaded:', data);
    } catch (err) {
      console.error('❌ Failed to load analytics:', err);
      setAnalyticsError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Admin tab: Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const allUsers = await adminApi.getAllUsers();

      console.log('📥 Raw user data from API:', allUsers.slice(0, 3));

      // Filter to only show Voxxy Presents users (vendors and venue_owners/producers)
      const presentsUsers = allUsers.filter((user: User) => {
        if (!user.role) {
          return true;
        }
        return user.role === 'vendor' || user.role === 'venue_owner' || user.role === 'producer';
      });

      setUsers(presentsUsers);
      console.log(`✅ Loaded ${presentsUsers.length} users (filtered from ${allUsers.length} total)`);
    } catch (err) {
      console.error('❌ Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Producer functionality: Fetch events for organization
  const fetchEvents = async (orgSlug: string) => {
    try {
      setLoadingEvents(true);
      console.log('Fetching events for organization:', orgSlug);
      const fetchedEvents = await eventsApi.getByOrganization(orgSlug);
      console.log('Fetched events:', fetchedEvents);
      console.log('Number of events:', fetchedEvents.length);
      setEvents(fetchedEvents);

      // Set view based on whether there are events
      if (fetchedEvents.length === 0) {
        console.log('No events found, setting view to empty');
        setEventsView('empty');
      } else {
        console.log('Events found, setting view to list');
        setEventsView('list');
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Producer functionality: Handle create event
  const handleCreateEvent = async (wizardState: WizardState) => {
    if (!organization) {
      console.error('No organization found');
      return;
    }

    try {
      // Step 1: Create the event with all event fields including new ones
      const newEvent = await eventsApi.create(organization.slug, {
        title: wizardState.eventDetails.title,
        description: wizardState.eventDetails.description || undefined,
        event_date: wizardState.eventDetails.event_date,
        event_end_date: wizardState.eventDetails.event_end_date || undefined,
        start_time: wizardState.eventDetails.start_time || undefined,
        end_time: wizardState.eventDetails.end_time || undefined,
        venue: wizardState.eventDetails.venue || undefined,
        location: wizardState.eventDetails.location,
        age_restriction: wizardState.eventDetails.age_restriction || undefined,
        ticket_link: wizardState.eventDetails.ticket_link || undefined,
        application_deadline: wizardState.eventDetails.application_deadline,
        payment_deadline: wizardState.eventDetails.payment_deadline || undefined,
        status: 'draft',
        published: false,
      });

      // Step 2: Batch create vendor applications with all application fields
      if (wizardState.applicationDetails.applications.length > 0) {
        const applicationPromises = wizardState.applicationDetails.applications.map((app) => {
          return vendorApplicationsApi.create(newEvent.slug, {
            name: app.name,
            description: app.description || undefined,
            booth_price: app.booth_price,
            install_date: app.install_date || undefined,
            install_start_time: app.install_start_time || undefined,
            install_end_time: app.install_end_time || undefined,
            payment_link: app.payment_link || undefined,
            application_tags: app.application_tags && app.application_tags.length > 0
              ? app.application_tags.join(',')
              : undefined,
            status: 'active',
          });
        });

        const results = await Promise.allSettled(applicationPromises);

        // Check for any failures
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
          console.error(`${failures.length} applications failed to create:`, failures);
        }
      }

      // Step 3: Handle invited contacts (from lists + manual selection)
      // Instead of fetching contacts client-side, send list IDs to backend
      // Backend will resolve all contacts from lists (no pagination limits!)
      const hasInvites =
        wizardState.inviteList.selectedListIds.length > 0 ||
        wizardState.inviteList.invitedContactIds.length > 0;

      if (hasInvites) {
        console.log(`Sending invitation batch with:`);
        console.log(`  - ${wizardState.inviteList.selectedListIds.length} lists`);
        console.log(`  - ${wizardState.inviteList.invitedContactIds.length} manual contacts`);
        console.log(`  - ${wizardState.inviteList.excludedContactIds.length} excluded contacts`);

        try {
          const result = await eventInvitationsApi.createBatch(
            newEvent.slug,
            {
              list_ids: wizardState.inviteList.selectedListIds,
              vendor_contact_ids: wizardState.inviteList.invitedContactIds,
              excluded_contact_ids: wizardState.inviteList.excludedContactIds,
            }
          );
          console.log(`✅ ${result.created_count} invitations sent successfully`);
          if (result.errors.length > 0) {
            console.warn('Some invitations failed:', result.errors);
          }

          // Update last_used_at for selected lists
          if (wizardState.inviteList.selectedListIds.length > 0) {
            // Note: Backend should handle this automatically when lists are used
            // We could add an API call here if needed: contactListsApi.markAsUsed(listId)
          }
        } catch (error) {
          console.error('Failed to send invitations:', error);
          // Don't throw - invitations are optional, event creation succeeded
        }
      }

      // Note: Scheduled emails are automatically generated by the backend when event is created
      // No need to call scheduledEmailsApi.generate() manually

      // Step 4: Refresh events list and navigate back
      await fetchEvents(organization.slug);
      setEventsView('list');
    } catch (err) {
      console.error('Failed to create event:', err);
      throw err; // Re-throw to let wizard handle the error
    }
  };

  // Producer functionality: Handle update event
  const handleUpdateEvent = async (eventSlug: string, eventData: {
    title: string;
    description: string;
    event_date: string;
    location: string;
  }) => {
    if (!organization) {
      console.error('No organization found');
      return;
    }

    try {
      console.log('Updating event:', eventSlug);
      await eventsApi.update(eventSlug, eventData);
      console.log('Event updated successfully');

      // Refresh events list
      await fetchEvents(organization.slug);

      // Navigate back to list
      setEventsView('list');
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to update event:', err);
      throw err;
    }
  };

  // Producer functionality: Handle delete event
  const handleDeleteEvent = async (eventSlug: string) => {
    if (!organization) {
      console.error('No organization found');
      return;
    }

    try {
      console.log('Deleting event:', eventSlug);
      await eventsApi.delete(eventSlug);
      console.log('Event deleted successfully');

      // Refresh events list
      await fetchEvents(organization.slug);

      // Navigate back to list
      setEventsView(events.length > 1 ? 'list' : 'empty');
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to delete event:', err);
      throw err;
    }
  };

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

  // Load analytics when admin tab is active
  useEffect(() => {
    if (activeNav === 'admin' && !analytics) {
      loadAnalytics();
    }
  }, [activeNav]);

  const navItems = [
    { id: 'admin' as NavItem, label: 'Admin', icon: Shield },
    { id: 'events' as NavItem, label: 'Events', icon: Calendar },
    { id: 'network' as NavItem, label: 'Network', icon: Users },
    { id: 'email-templates' as NavItem, label: 'Emails', icon: Mail },
    { id: 'email-testing' as NavItem, label: 'Email Testing', icon: Mail },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ];

  // Render events content based on current view
  const renderEventsContent = () => {
    if (loadingOrg || loadingEvents) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      );
    }

    if (error && activeNav === 'events') {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => organization && fetchEvents(organization.slug)}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (eventsView === 'empty') {
      return <EventsEmptyState onCreateEvent={() => setEventsView('create')} />;
    }

    if (eventsView === 'create') {
      return (
        <CreateEventWizard
          onCancel={() => setEventsView(events.length > 0 ? 'list' : 'empty')}
          onSubmit={handleCreateEvent}
          organizationId={organization?.id || 0}
        />
      );
    }

    if (eventsView === 'edit' && selectedEvent) {
      return (
        <EditEventForm
          event={selectedEvent}
          onCancel={() => {
            setEventsView('list');
            setSelectedEvent(null);
          }}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
      );
    }

    if (eventsView === 'command-center') {
      if (loadingCommandCenter && selectedEvent) {
        return <LoadingCommandCenter eventName={selectedEvent.title} />;
      }

      if (selectedEvent) {
        return (
          <CommandCenter
            event={selectedEvent}
            onBack={() => {
              setEventsView('list');
              setSelectedEvent(null);
            }}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={async (eventSlug: string) => {
              await handleDeleteEvent(eventSlug);
              setEventsView('list');
              setSelectedEvent(null);
            }}
          />
        );
      }
    }

    return (
      <EventsList
        events={events}
        onCreateEvent={() => setEventsView('create')}
        onEditEvent={(slug) => {
          const event = events.find(e => e.slug === slug);
          if (event) {
            setSelectedEvent(event);
            setEventsView('edit');
          }
        }}
        onCommandCenter={(slug) => {
          const event = events.find(e => e.slug === slug);
          if (event) {
            setSelectedEvent(event);
            setLoadingCommandCenter(true);
            setEventsView('command-center');

            // Simulate loading delay
            setTimeout(() => {
              setLoadingCommandCenter(false);
            }, 2000);
          }
        }}
      />
    );
  };

  return (
    <div className="flex h-screen bg-[#1a0d2e] overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        w-[220px]
        bg-[#0f0820] flex flex-col transition-all duration-300
        fixed lg:relative inset-y-0 left-0 z-50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-3xl font-bold text-white tracking-wider block mb-2">VOXXY</span>
              <p className="text-sm text-white/60">Admin</p>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-white/70 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setIsMobileMenuOpen(false);
                  // Reset to appropriate events view when clicking Events nav
                  if (item.id === 'events' && eventsView === 'create') {
                    setEventsView(events.length > 0 ? 'list' : 'empty');
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Organization & User Profile */}
        <div className="border-t border-white/10">
          {/* Organization Info */}
          {organization && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {organization.name}
                  </p>
                  <p className="text-xs text-white/60">Organization</p>
                </div>
              </div>
            </div>
          )}

          {/* User Profile & Sign Out */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userProfile?.name || userProfile?.email}
                </p>
                <p className="text-xs text-white/60">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Top Navbar */}
        <header className="h-14 bg-[#0f0820] border-b border-white/10 flex items-center px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-white/70 hover:text-white mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h2 className="text-white font-medium">
            {userProfile?.name || 'Admin Dashboard'}
          </h2>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {activeNav === 'settings' ? (
            <SettingsPage onBack={() => setActiveNav('admin')} />
          ) : activeNav === 'events' ? (
            renderEventsContent()
          ) : activeNav === 'network' ? (
            <div className="p-4 lg:p-6">
              {organization ? (
                <NetworkPage organizationId={organization.id} />
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-white/60">Loading organization...</p>
                </div>
              )}
            </div>
          ) : activeNav === 'email-templates' ? (
            <div className="p-4 lg:p-6">
              {organization ? (
                <EmailTemplatesPage organizationId={organization.id} />
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-white/60">Loading organization...</p>
                </div>
              )}
            </div>
          ) : activeNav === 'email-testing' ? (
            <EmailTestingPanel />
          ) : activeNav === 'admin' ? (
            <div className="p-4 lg:p-6">
              <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
                {/* Header Section */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 lg:p-6">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-xl lg:text-2xl font-bold text-white">Admin Dashboard</h1>
                      <p className="text-sm lg:text-base text-gray-300">Platform analytics and user management</p>
                    </div>
                    <Button
                      onClick={() => {
                        loadUsers();
                        loadAnalytics();
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15"
                      disabled={loading || loadingAnalytics}
                    >
                      {loading || loadingAnalytics ? 'Loading...' : 'Refresh All'}
                    </Button>
                  </div>
                </div>

                {/* Analytics Stats Overview */}
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  </div>
                ) : analyticsError ? (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-6 text-center">
                    <p className="text-red-300">{analyticsError}</p>
                    <Button
                      onClick={loadAnalytics}
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                    >
                      Retry Analytics
                    </Button>
                  </div>
                ) : analytics ? (
                  <>
                    {/* Stats Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Total Events */}
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">Total Events</p>
                          <Calendar className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{analytics.events.total}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {analytics.events.published} published, {analytics.events.draft} draft
                        </p>
                      </div>

                      {/* Active Events */}
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">Active Events</p>
                          <TrendingUp className="h-5 w-5 text-green-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{analytics.events.active}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {analytics.events.upcoming} upcoming
                        </p>
                      </div>

                      {/* Past Events */}
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">Past Events</p>
                          <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{analytics.events.past}</p>
                        <p className="text-xs text-gray-400 mt-1">Completed</p>
                      </div>

                      {/* Total Users */}
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">Total Users</p>
                          <Users className="h-5 w-5 text-purple-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{analytics.users.total}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {analytics.users.producers} producers, {analytics.users.vendors} vendors
                        </p>
                      </div>
                    </div>

                    {/* Registrations Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">Total Applications</p>
                          <Mail className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{analytics.registrations.total}</p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">Approved</p>
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{analytics.registrations.approved}</p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">Pending</p>
                          <Clock className="h-5 w-5 text-yellow-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{analytics.registrations.pending}</p>
                      </div>
                    </div>

                    {/* Top Event Creators */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 lg:p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Top Event Creators</h3>
                      <div className="space-y-3">
                        {analytics.top_creators.slice(0, 5).map((creator, index) => (
                          <div key={creator.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{creator.name}</p>
                                <p className="text-xs text-gray-400">{creator.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-purple-400">{creator.events_count}</p>
                              <p className="text-xs text-gray-400">events</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {/* All Users with Event Counts Table */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 lg:p-6">
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-4">
                    All Users {analytics ? `(${analytics.users_with_events.length})` : `(${users.length})`}
                  </h3>

                  {error && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-300">Loading users...</p>
                    </div>
                  ) : analytics?.users_with_events ? (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left px-3 lg:px-4 py-3 text-xs lg:text-sm font-semibold text-white">Name</th>
                              <th className="text-left px-3 lg:px-4 py-3 text-xs lg:text-sm font-semibold text-white">Email</th>
                              <th className="text-left px-3 lg:px-4 py-3 text-xs lg:text-sm font-semibold text-white">Role</th>
                              <th className="text-right px-3 lg:px-4 py-3 text-xs lg:text-sm font-semibold text-white">Events</th>
                              <th className="text-left px-3 lg:px-4 py-3 text-xs lg:text-sm font-semibold text-white">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.users_with_events.map((user) => (
                              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm text-gray-200">
                                  {user.name || 'No name'}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm text-gray-200">
                                  {user.email}
                                </td>
                                <td className="px-3 lg:px-4 py-3">
                                  <Badge className={`${getRoleBadgeColor(user.role)} text-xs flex items-center gap-1 w-fit`}>
                                    {getRoleIcon(user.role)}
                                    {getDisplayRole(user.role)}
                                  </Badge>
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-right">
                                  <span className="text-lg font-bold text-purple-400">{user.events_count || 0}</span>
                                </td>
                                <td className="px-3 lg:px-4 py-3">
                                  <Badge
                                    variant={user.confirmed_at ? "default" : "outline"}
                                    className={
                                      user.confirmed_at
                                        ? "bg-green-500/20 border-green-400/30 text-green-300 text-xs"
                                        : "bg-yellow-500/20 border-yellow-400/30 text-yellow-300 text-xs"
                                    }
                                  >
                                    {user.confirmed_at ? 'Verified' : 'Unverified'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 lg:p-6">
              <div className="text-white/40 text-center mt-20">
                <p className="text-base lg:text-lg">{activeNav} content coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
