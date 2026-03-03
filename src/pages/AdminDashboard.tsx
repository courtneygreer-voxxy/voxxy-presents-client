import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Shield, Building2, Store, Menu, X, LogOut, Mail, Users, Calendar, BarChart3, TrendingUp, CheckCircle2, XCircle, Clock, Bug, Database, Key } from 'lucide-react';
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
import BugReportsTab from '@/components/admin/BugReportsTab';

type NavItem = 'admin' | 'events' | 'network' | 'email-templates' | 'email-testing' | 'bug-reports' | 'settings';
type EventsView = 'list' | 'create' | 'edit' | 'command-center' | 'empty';

interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
  status?: 'active' | 'suspended' | 'banned'
  confirmed_at: string | null
  created_at?: string
  updated_at?: string
  last_sign_in_at?: string
  sign_in_count?: number
  current_sign_in_ip?: string
  events_count?: number
  organizations?: any[]
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
  verified?: boolean;
  active?: boolean;
  description?: string;
  logo_url?: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
    instagram?: string;
  };
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  timezone?: string;
  created_at?: string;
  updated_at?: string;
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
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [expandedAnalyticsSection, setExpandedAnalyticsSection] = useState<string | null>(null);

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
  const [creationProgress, setCreationProgress] = useState<string>('');

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

        // Backend returns org directly when it exists: { id, name, slug, ... }
        // But returns { organization: null } when it doesn't exist
        let userOrg = null;
        if (response) {
          // If response has an 'organization' key with null, no org exists
          if ('organization' in response && response.organization === null) {
            userOrg = null;
          } else {
            // Otherwise, response IS the organization
            userOrg = response;
          }
        }

        console.log('Extracted organization:', userOrg);

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

              // Same logic: response IS the org unless it has organization: null
              if (retryResponse && !('organization' in retryResponse && retryResponse.organization === null)) {
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
          setOrganization(userOrg);
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
    } catch (err) {
      console.error('Failed to load analytics:', err);
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

      // Filter to only show Voxxy Presents users (vendors and venue_owners/producers)
      const presentsUsers = allUsers.filter((user: User) => {
        if (!user.role) {
          return true;
        }
        return user.role === 'vendor' || user.role === 'venue_owner' || user.role === 'producer';
      });

      setUsers(presentsUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
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

    // Prepare temporary event object for loading state
    const tempEvent: Event = {
      id: 0,
      slug: '',
      title: wizardState.eventDetails.title,
      description: wizardState.eventDetails.description,
      event_date: wizardState.eventDetails.event_date,
    };

    try {
      // Show loading state immediately
      setSelectedEvent(tempEvent);
      setLoadingCommandCenter(true);
      setEventsView('command-center');
      setCreationProgress('Creating your event...');

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

      console.log('✅ Event created:', newEvent.slug);

      // Step 2: Batch create vendor applications with all application fields
      if (wizardState.applicationDetails.applications.length > 0) {
        setCreationProgress('Setting up vendor applications...');

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
        console.log('✅ Vendor applications created');
      }

      // Step 3: Save invitation data for "Go Live" later (don't send yet)
      const hasInvites =
        wizardState.inviteList.selectedListIds.length > 0 ||
        wizardState.inviteList.invitedContactIds.length > 0;

      if (hasInvites) {
        setCreationProgress('Saving invitation selections...');

        console.log(`Saving invitation data to event:`);
        console.log(`  - ${wizardState.inviteList.selectedListIds.length} lists`);
        console.log(`  - ${wizardState.inviteList.invitedContactIds.length} manual contacts`);
        console.log(`  - ${wizardState.inviteList.excludedContactIds.length} excluded contacts`);

        try {
          await eventsApi.update(newEvent.slug, {
            invitation_list_ids: wizardState.inviteList.selectedListIds,
            invitation_contact_ids: wizardState.inviteList.invitedContactIds,
            invitation_excluded_ids: wizardState.inviteList.excludedContactIds,
          });
          console.log('✅ Invitation data saved for later');
        } catch (error) {
          console.error('Failed to save invitation data:', error);
          // Don't throw - event creation succeeded, just log the error
        }
      }

      // Note: Scheduled emails are generated in "paused" state by backend
      // They will be activated when event goes live

      // Step 4: Refresh events list and prepare to show Command Center
      setCreationProgress('Loading Command Center...');
      const refreshedEvents = await eventsApi.getByOrganization(organization.slug);
      setEvents(refreshedEvents);

      // Find the newly created event in the refreshed list
      const createdEvent = refreshedEvents.find((e: Event) => e.slug === newEvent.slug);

      if (createdEvent) {
        setSelectedEvent(createdEvent);
      }

      // Turn off loading to reveal Command Center
      setTimeout(() => {
        setLoadingCommandCenter(false);
        setCreationProgress('');
      }, 500); // Small delay for smooth transition
    } catch (err) {
      console.error('Failed to create event:', err);
      // Reset states on error
      setLoadingCommandCenter(false);
      setCreationProgress('');
      setEventsView('create');
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
    { id: 'bug-reports' as NavItem, label: 'Bug Reports', icon: Bug },
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
        return <LoadingCommandCenter eventName={selectedEvent.title} progress={creationProgress} />;
      }

      // Don't render CommandCenter until organization loads
      if (loadingOrg) {
        return <LoadingCommandCenter eventName={selectedEvent?.title || "Event"} progress="Loading organization..." />;
      }

      // Show error if organization failed to load
      if (!organization) {
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-red-400">Failed to load organization. Please refresh.</p>
          </div>
        );
      }

      if (selectedEvent) {
        // Refetch function to update event data
        const refetchSelectedEvent = async () => {
          if (!selectedEvent) {
            return;
          }

          try {
            const updatedEvent = await eventsApi.getById(selectedEvent.slug);
            setSelectedEvent(updatedEvent);
          } catch (err) {
            console.error('Failed to refetch event:', err);
            // Fallback: refresh entire events list
            if (organization) {
              await fetchEvents(organization.slug);
              const refreshedEvent = events.find(e => e.slug === selectedEvent.slug);
              if (refreshedEvent) {
                setSelectedEvent(refreshedEvent);
              }
            }
          }
        };

        return (
          <CommandCenter
            event={selectedEvent}
            organizationId={organization.id}
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
            onRefreshEvent={refetchSelectedEvent}
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
        {/* Sidebar Header - Terminal Style */}
        <div className="p-6 border-b-2 border-cyan-500/30 bg-black/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 font-mono text-xl">{'>'}</span>
                <span className="text-2xl font-bold text-cyan-300 tracking-wider font-mono">VOXXY</span>
              </div>
              <p className="text-xs text-cyan-400/60 font-mono">system.admin.v1.0</p>
              <div className="mt-2 px-2 py-1 bg-purple-500/20 border border-purple-400/50 rounded w-fit">
                <p className="text-[10px] text-purple-300 font-mono font-bold">ROOT_ACCESS</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-cyan-300 hover:text-cyan-200 p-1 bg-red-500/20 border border-red-400/50 rounded"
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
        <div className="border-t border-cyan-500/30">
          {/* Organization Info - Terminal Style */}
          {organization && (
            <div className="p-4 border-b border-cyan-500/30 bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-cyan-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-cyan-400/60">
                    organization.name
                  </p>
                  <p className="text-xs font-bold text-cyan-300 font-mono truncate">
                    {organization.name}
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-cyan-500/20">
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                  <div>
                    <span className="text-cyan-400/60">id: </span>
                    <span className="text-yellow-300">{organization.id}</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/60">verified: </span>
                    <span className={organization.verified ? "text-green-400" : "text-red-400"}>
                      {organization.verified ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Profile & Sign Out - Terminal Style */}
          <div className="p-4 bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-purple-400/60">
                  current_user
                </p>
                <p className="text-xs font-bold text-purple-300 font-mono truncate">
                  {userProfile?.name || userProfile?.email}
                </p>
                <p className="text-[9px] font-mono text-green-400 mt-1">
                  ROLE: ADMIN
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 transition-all"
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
        {/* Top Navbar - Terminal Style */}
        <header className="h-14 bg-black/60 border-b-2 border-cyan-500/30 flex items-center px-4 lg:px-6 backdrop-blur-sm">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-cyan-300 hover:text-cyan-200 mr-4 p-2 bg-cyan-500/20 border border-cyan-400/50 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 border border-green-400/50 rounded flex items-center justify-center animate-pulse">
              <span className="text-green-400 text-lg">●</span>
            </div>
            <div>
              <h2 className="text-cyan-300 font-mono font-bold text-sm">
                {'>'} {userProfile?.name || 'ADMIN_SYSTEM'}
              </h2>
              <p className="text-cyan-400/60 font-mono text-[10px]">
                SESSION_ACTIVE
              </p>
            </div>
          </div>
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
          ) : activeNav === 'bug-reports' ? (
            <BugReportsTab />
          ) : activeNav === 'admin' ? (
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
                        loadUsers();
                        loadAnalytics();
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
                    <div className="px-2 py-1 bg-green-500/20 border border-green-400/50 rounded text-green-300 animate-pulse">
                      ● SYSTEM ONLINE
                    </div>
                    <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-300">
                      USER: {userProfile?.email}
                    </div>
                    <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-400/50 rounded text-yellow-300">
                      ROLE: ADMIN
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

                {/* Analytics Stats Overview */}
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
                        onClick={loadAnalytics}
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
                          <div className="text-green-400 font-bold text-2xl font-mono">{analytics.events.active}</div>
                          <div className="text-green-300/60 font-mono text-[9px] mt-1">
                            upcoming:{analytics.events.upcoming}
                          </div>
                        </div>
                        <div className="bg-black/60 border border-green-500/30 rounded p-3">
                          <div className="text-green-400/60 font-mono text-[10px] mb-1">events.past</div>
                          <div className="text-gray-400 font-bold text-2xl font-mono">{analytics.events.past}</div>
                          <div className="text-green-300/60 font-mono text-[9px] mt-1">completed</div>
                        </div>
                        <div className="bg-black/60 border border-green-500/30 rounded p-3">
                          <div className="text-green-400/60 font-mono text-[10px] mb-1">events.today</div>
                          <div className="text-purple-400 font-bold text-2xl font-mono">{analytics.events.today}</div>
                          <div className="text-green-300/60 font-mono text-[9px] mt-1">happening now</div>
                        </div>
                      </div>

                      {/* Users Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                          <div className="text-cyan-400/60 font-mono text-[10px] mb-1">users.total</div>
                          <div className="text-cyan-300 font-bold text-2xl font-mono">{analytics.users.total}</div>
                        </div>
                        <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                          <div className="text-cyan-400/60 font-mono text-[10px] mb-1">users.producers</div>
                          <div className="text-purple-400 font-bold text-2xl font-mono">{analytics.users.producers}</div>
                        </div>
                        <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                          <div className="text-cyan-400/60 font-mono text-[10px] mb-1">users.vendors</div>
                          <div className="text-blue-400 font-bold text-2xl font-mono">{analytics.users.vendors}</div>
                        </div>
                      </div>

                      {/* Registrations Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-black/60 border border-yellow-500/30 rounded p-3">
                          <div className="text-yellow-400/60 font-mono text-[10px] mb-1">registrations.total</div>
                          <div className="text-yellow-300 font-bold text-2xl font-mono">{analytics.registrations.total}</div>
                        </div>
                        <div className="bg-black/60 border border-yellow-500/30 rounded p-3">
                          <div className="text-yellow-400/60 font-mono text-[10px] mb-1">registrations.approved</div>
                          <div className="text-green-400 font-bold text-2xl font-mono">{analytics.registrations.approved}</div>
                        </div>
                        <div className="bg-black/60 border border-yellow-500/30 rounded p-3">
                          <div className="text-yellow-400/60 font-mono text-[10px] mb-1">registrations.pending</div>
                          <div className="text-yellow-400 font-bold text-2xl font-mono">{analytics.registrations.pending}</div>
                        </div>
                        <div className="bg-black/60 border border-yellow-500/30 rounded p-3">
                          <div className="text-yellow-400/60 font-mono text-[10px] mb-1">registrations.rejected</div>
                          <div className="text-red-400 font-bold text-2xl font-mono">{analytics.registrations.rejected}</div>
                        </div>
                      </div>

                      {/* Organizations Stats */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-black/60 border border-purple-500/30 rounded p-3">
                          <div className="text-purple-400/60 font-mono text-[10px] mb-1">organizations.total</div>
                          <div className="text-purple-300 font-bold text-2xl font-mono">{analytics.organizations.total}</div>
                        </div>
                        <div className="bg-black/60 border border-purple-500/30 rounded p-3">
                          <div className="text-purple-400/60 font-mono text-[10px] mb-1">organizations.verified</div>
                          <div className="text-green-400 font-bold text-2xl font-mono">{analytics.organizations.verified}</div>
                        </div>
                      </div>

                      {/* Raw Analytics JSON */}
                      <div className="mt-4">
                        <details>
                          <summary className="text-green-300 cursor-pointer hover:text-green-200 transition-colors font-mono text-xs flex items-center gap-2">
                            <span className="text-green-400">{'>'}</span>
                            <span>JSON.stringify(analytics)</span>
                            <span className="text-red-400 ml-2">[RAW DATA]</span>
                          </summary>
                          <pre className="mt-3 p-3 bg-black/80 rounded text-[10px] overflow-auto max-h-60 text-green-300 border border-green-500/20">
{JSON.stringify(analytics, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>

                    {/* Top Event Creators - Terminal Style */}
                    <div className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/50 rounded-lg p-4 lg:p-6 shadow-lg shadow-purple-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-500/20 border border-purple-400/50 rounded flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-purple-300" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-purple-300 font-mono flex items-center gap-2">
                            <span className="text-green-400">{'>'}</span> TOP_EVENT_CREATORS
                          </h2>
                          <p className="text-xs text-purple-400/60 font-mono">analytics.top_creators[{analytics.top_creators.length}]</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {analytics.top_creators.slice(0, 10).map((creator, index) => (
                          <div key={creator.id} className="bg-black/60 border border-purple-500/30 rounded p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-purple-500/20 border border-purple-400/50 rounded flex items-center justify-center font-mono text-xs font-bold text-purple-300">
                                  #{index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-mono text-xs">
                                    <span className="text-purple-400/60">[{index}].name: </span>
                                    <span className="text-white">{creator.name}</span>
                                  </div>
                                  <div className="font-mono text-[10px]">
                                    <span className="text-purple-400/60">[{index}].email: </span>
                                    <span className="text-cyan-300 break-all">{creator.email}</span>
                                  </div>
                                  <div className="font-mono text-[10px]">
                                    <span className="text-purple-400/60">[{index}].role: </span>
                                    <span className="text-yellow-300">{creator.role}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="px-3 py-1 bg-green-500/20 border border-green-400/50 rounded">
                                  <div className="text-green-300 font-bold text-xl font-mono">{creator.events_count}</div>
                                  <div className="text-green-400/60 font-mono text-[9px]">events</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Raw Top Creators JSON */}
                      <div className="mt-4">
                        <details>
                          <summary className="text-purple-300 cursor-pointer hover:text-purple-200 transition-colors font-mono text-xs flex items-center gap-2">
                            <span className="text-green-400">{'>'}</span>
                            <span>JSON.stringify(top_creators)</span>
                          </summary>
                          <pre className="mt-3 p-3 bg-black/80 rounded text-[10px] overflow-auto max-h-60 text-purple-300 border border-purple-500/20">
{JSON.stringify(analytics.top_creators, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>

                    {/* Recent Events - Terminal Style */}
                    {analytics.recent_events && analytics.recent_events.length > 0 && (
                      <div className="bg-black/40 backdrop-blur-sm border-2 border-blue-500/50 rounded-lg p-4 lg:p-6 shadow-lg shadow-blue-500/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-500/20 border border-blue-400/50 rounded flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-300" />
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-blue-300 font-mono flex items-center gap-2">
                              <span className="text-green-400">{'>'}</span> RECENT_EVENTS
                            </h2>
                            <p className="text-xs text-blue-400/60 font-mono">analytics.recent_events[{analytics.recent_events.length}]</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {analytics.recent_events.map((event, index) => (
                            <div key={event.id} className="bg-black/60 border border-blue-500/30 rounded p-3">
                              <div className="space-y-1 font-mono text-xs">
                                <div>
                                  <span className="text-blue-400/60">[{index}].title: </span>
                                  <span className="text-white font-bold">{event.title}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <div>
                                    <span className="text-blue-400/60">id: </span>
                                    <span className="text-yellow-300">{event.id}</span>
                                  </div>
                                  <div>
                                    <span className="text-blue-400/60">slug: </span>
                                    <span className="text-purple-300">{event.slug}</span>
                                  </div>
                                  <div>
                                    <span className="text-blue-400/60">published: </span>
                                    <span className={event.published ? "text-green-400" : "text-red-400"}>
                                      {event.published ? "TRUE" : "FALSE"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-blue-400/60">registered: </span>
                                    <span className="text-cyan-300">{event.registered_count || 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-blue-400/60">event_date: </span>
                                    <span className="text-orange-300">{event.event_date ? new Date(event.event_date).toLocaleDateString() : 'NULL'}</span>
                                  </div>
                                  <div>
                                    <span className="text-blue-400/60">organization: </span>
                                    <span className="text-green-300">{event.organization_name}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Raw Recent Events JSON */}
                        <div className="mt-4">
                          <details>
                            <summary className="text-blue-300 cursor-pointer hover:text-blue-200 transition-colors font-mono text-xs flex items-center gap-2">
                              <span className="text-green-400">{'>'}</span>
                              <span>JSON.stringify(recent_events)</span>
                            </summary>
                            <pre className="mt-3 p-3 bg-black/80 rounded text-[10px] overflow-auto max-h-60 text-blue-300 border border-blue-500/20">
{JSON.stringify(analytics.recent_events, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}

                {/* All Users with Full Context - Terminal Style */}
                <div className="bg-black/40 backdrop-blur-sm border-2 border-cyan-500/50 rounded-lg p-4 lg:p-6 shadow-lg shadow-cyan-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-400/50 rounded flex items-center justify-center">
                      <Users className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-cyan-300 font-mono flex items-center gap-2">
                        <span className="text-green-400">{'>'}</span> ALL_USERS
                      </h2>
                      <p className="text-xs text-cyan-400/60 font-mono">
                        users_with_events[{analytics ? analytics.users_with_events.length : users.length}]
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded bg-cyan-500/20 border border-cyan-400/50">
                      <div className="text-cyan-300 font-bold text-xl font-mono">
                        {analytics ? analytics.users_with_events.length : users.length}
                      </div>
                      <div className="text-cyan-400/60 font-mono text-[9px]">total</div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border-2 border-red-400/50 rounded-lg p-4 mb-6">
                      <p className="text-red-300 font-mono text-xs">ERROR: {error}</p>
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                        <p className="text-cyan-300 font-mono text-sm">LOADING_USERS...</p>
                      </div>
                    </div>
                  ) : analytics?.users_with_events ? (
                    <>
                      <div className="space-y-3">
                        {analytics.users_with_events.map((user) => {
                        const isExpanded = expandedUserId === user.id
                        return (
                          <div
                            key={user.id}
                            className="bg-black/40 backdrop-blur-sm border-2 border-cyan-500/50 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/10 transition-all"
                          >
                            {/* User Header - Always Visible */}
                            <button
                              onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/60 transition-colors text-left"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-400/50 rounded flex items-center justify-center">
                                    {getRoleIcon(user.role)}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-cyan-300 font-mono">
                                      {user.name || 'NULL'}
                                    </h4>
                                    <p className="text-xs text-cyan-400/60 font-mono">{user.email}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={`${getRoleBadgeColor(user.role)} text-xs font-mono`}>
                                  {getDisplayRole(user.role)}
                                </Badge>
                                <div className="px-3 py-1 rounded bg-purple-500/20 border border-purple-400/50 text-purple-300 font-mono text-sm font-bold">
                                  {user.events_count || 0} events
                                </div>
                                <Badge
                                  className={
                                    user.confirmed_at
                                      ? "bg-green-500/20 border-green-400/30 text-green-300 text-xs font-mono"
                                      : "bg-yellow-500/20 border-yellow-400/30 text-yellow-300 text-xs font-mono"
                                  }
                                >
                                  {user.confirmed_at ? '✓ VERIFIED' : '○ UNVERIFIED'}
                                </Badge>
                                {isExpanded ? (
                                  <span className="text-cyan-400 font-mono text-lg">▼</span>
                                ) : (
                                  <span className="text-cyan-400 font-mono text-lg">▶</span>
                                )}
                              </div>
                            </button>

                            {/* Expanded User Context - Shows ALL Data */}
                            {isExpanded && (
                              <div className="px-4 pb-4 space-y-4 border-t-2 border-cyan-500/30 pt-4 bg-black/20">
                                {/* User Context Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                    <div className="text-cyan-400/60 mb-1">user.id</div>
                                    <div className="text-yellow-300 font-bold text-base">#{user.id}</div>
                                  </div>
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                    <div className="text-cyan-400/60 mb-1">user.email</div>
                                    <div className="text-white text-xs break-all">{user.email}</div>
                                  </div>
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                    <div className="text-cyan-400/60 mb-1">user.name</div>
                                    <div className="text-white">{user.name || 'NULL'}</div>
                                  </div>
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                    <div className="text-cyan-400/60 mb-1">user.role</div>
                                    <div className="text-purple-300 font-bold">{user.role || 'NULL'}</div>
                                  </div>
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                    <div className="text-cyan-400/60 mb-1">user.created_at</div>
                                    <div className="text-white text-[10px]">
                                      {user.created_at ? new Date(user.created_at).toLocaleString() : 'NULL'}
                                    </div>
                                  </div>
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                    <div className="text-cyan-400/60 mb-1">user.updated_at</div>
                                    <div className="text-white text-[10px]">
                                      {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'NULL'}
                                    </div>
                                  </div>
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                    <div className="text-cyan-400/60 mb-1">user.last_sign_in_at</div>
                                    <div className="text-white text-[10px]">
                                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'NEVER'}
                                    </div>
                                  </div>
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                    <div className="text-cyan-400/60 mb-1">user.sign_in_count</div>
                                    <div className="text-green-400 font-bold text-base">{user.sign_in_count || 0}</div>
                                  </div>
                                  {user.current_sign_in_ip && (
                                    <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                      <div className="text-cyan-400/60 mb-1">user.last_ip</div>
                                      <div className="text-orange-300 font-mono text-xs">{user.current_sign_in_ip}</div>
                                    </div>
                                  )}
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                    <div className="text-cyan-400/60 mb-1">user.confirmed_at</div>
                                    <div className="text-white text-[10px]">
                                      {user.confirmed_at ? new Date(user.confirmed_at).toLocaleString() : 'NOT CONFIRMED'}
                                    </div>
                                  </div>
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-3">
                                    <div className="text-cyan-400/60 mb-1">user.events_count</div>
                                    <div className="text-purple-400 font-bold text-base">{user.events_count || 0}</div>
                                  </div>
                                </div>

                                {/* Organizations Array */}
                                {user.organizations && user.organizations.length > 0 && (
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-4">
                                    <h5 className="text-cyan-300 font-mono text-sm mb-3 flex items-center gap-2">
                                      <Building2 className="h-4 w-4 text-green-400" />
                                      <span className="text-green-400">{'>'}</span> user.organizations[{user.organizations.length}]
                                    </h5>
                                    <div className="space-y-2">
                                      {user.organizations.map((org: any, idx: number) => (
                                        <div key={idx} className="bg-black/80 border border-green-500/20 rounded p-3 text-xs">
                                          <div className="grid grid-cols-2 gap-2 font-mono">
                                            <div>
                                              <span className="text-green-400/60">[{idx}].id: </span>
                                              <span className="text-yellow-300">{org.id}</span>
                                            </div>
                                            <div>
                                              <span className="text-green-400/60">[{idx}].slug: </span>
                                              <span className="text-purple-300">{org.slug}</span>
                                            </div>
                                            <div className="col-span-2">
                                              <span className="text-green-400/60">[{idx}].name: </span>
                                              <span className="text-white">{org.name}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Events Array */}
                                {user.events && user.events.length > 0 && (
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-4">
                                    <h5 className="text-cyan-300 font-mono text-sm mb-3 flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-blue-400" />
                                      <span className="text-green-400">{'>'}</span> user.events[{user.events.length}]
                                    </h5>
                                    <div className="space-y-2">
                                      {user.events.map((event: any, idx: number) => (
                                        <div key={idx} className="bg-black/80 border border-blue-500/20 rounded p-3 text-xs">
                                          <div className="grid grid-cols-2 gap-2 font-mono">
                                            <div>
                                              <span className="text-blue-400/60">[{idx}].id: </span>
                                              <span className="text-yellow-300">{event.id}</span>
                                            </div>
                                            <div>
                                              <span className="text-blue-400/60">[{idx}].slug: </span>
                                              <span className="text-purple-300 text-[10px]">{event.slug}</span>
                                            </div>
                                            <div className="col-span-2">
                                              <span className="text-blue-400/60">[{idx}].title: </span>
                                              <span className="text-white">{event.title}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Registrations Array */}
                                {user.registrations && user.registrations.length > 0 && (
                                  <div className="bg-black/60 border border-cyan-500/30 rounded p-4">
                                    <h5 className="text-cyan-300 font-mono text-sm mb-3 flex items-center gap-2">
                                      <Store className="h-4 w-4 text-yellow-400" />
                                      <span className="text-green-400">{'>'}</span> user.registrations[{user.registrations.length}]
                                    </h5>
                                    <div className="space-y-2">
                                      {user.registrations.map((reg: any, idx: number) => (
                                        <div key={idx} className="bg-black/80 border border-yellow-500/20 rounded p-3 text-xs">
                                          <div className="grid grid-cols-2 gap-2 font-mono">
                                            <div>
                                              <span className="text-yellow-400/60">[{idx}].id: </span>
                                              <span className="text-yellow-300">{reg.id}</span>
                                            </div>
                                            <div>
                                              <span className="text-yellow-400/60">[{idx}].status: </span>
                                              <span className="text-purple-300">{reg.status}</span>
                                            </div>
                                            {reg.business_name && (
                                              <div className="col-span-2">
                                                <span className="text-yellow-400/60">[{idx}].business_name: </span>
                                                <span className="text-white">{reg.business_name}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Raw JSON Debug - All Fields */}
                                <div className="bg-black/60 border border-cyan-500/30 rounded p-4">
                                  <details>
                                    <summary className="text-cyan-300 cursor-pointer hover:text-cyan-200 transition-colors font-mono text-xs flex items-center gap-2">
                                      <span className="text-green-400">{'>'}</span>
                                      <span>JSON.stringify(user)</span>
                                      <span className="text-red-400 ml-2">[ALL FIELDS]</span>
                                    </summary>
                                    <pre className="mt-3 p-3 bg-black/80 rounded text-[10px] overflow-auto max-h-96 text-green-300 border border-green-500/20">
{JSON.stringify(user, null, 2)}
                                    </pre>
                                  </details>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                        })}
                      </div>

                      {/* Raw All Users JSON */}
                      <div className="mt-4">
                        <details>
                          <summary className="text-cyan-300 cursor-pointer hover:text-cyan-200 transition-colors font-mono text-xs flex items-center gap-2">
                            <span className="text-green-400">{'>'}</span>
                            <span>JSON.stringify(users_with_events)</span>
                            <span className="text-red-400 ml-2">[ALL USERS DATA]</span>
                          </summary>
                          <pre className="mt-3 p-3 bg-black/80 rounded text-[10px] overflow-auto max-h-96 text-cyan-300 border border-cyan-500/20">
{JSON.stringify(analytics.users_with_events, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </>
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
