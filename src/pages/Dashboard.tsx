import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Settings, Building2, Menu, X, LogOut, Mail, Shield, ArrowLeft, Info, ClipboardList, Plus, Search, Eye, EyeOff, Filter, Tag, Upload, UserPlus, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { eventsApi, organizationsApi, vendorApplicationsApi, eventInvitationsApi, contactListsApi, emailCampaignTemplatesApi, adminApi } from '@/services/api';
import SettingsPage from './SettingsPage';
import EventsEmptyState from '@/components/producer/EventsEmptyState';
import { CreateEventWizard, WizardState } from '@/components/producer/CreateEventWizard';
import EditEventForm from '@/components/producer/EditEventForm';
import EventsList from '@/components/producer/EventsList';
import LoadingCommandCenter from '@/components/producer/LoadingCommandCenter';
import CommandCenter from '@/components/producer/CommandCenter';
import { NetworkPage } from '@/components/producer/Network';
import { TemplateManager } from '@/components/producer/Email';
import { EmailConfirmationDialog } from '@/components/producer/EmailConfirmationDialog';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import AdminPanel from '@/components/admin/AdminPanel';
import { GuidebookModal } from '@/components/shared/GuidebookModal';

type NavItem = 'admin' | 'events' | 'network' | 'email-templates' | 'settings';
type EventsView = 'list' | 'create' | 'edit' | 'command-center' | 'empty';

interface Organization {
  id: number;
  slug: string;
  name: string;
  user_id: number;
  verified: boolean;
  active: boolean;
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

// Admin-specific interfaces
interface User {
  id: number;
  email: string;
  name: string;
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest';
  status?: 'active' | 'suspended' | 'banned';
  confirmed_at: string | null;
  paid?: boolean;
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

type CommandCenterTab = 'details' | 'applicants' | 'emails' | 'settings';

export default function ProducerDashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>('events');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [eventsView, setEventsView] = useState<EventsView>('empty');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [commandCenterTab, setCommandCenterTab] = useState<CommandCenterTab>('details');

  // Events page controls state
  const [eventsSearchTerm, setEventsSearchTerm] = useState('');
  const [eventsStatusFilter, setEventsStatusFilter] = useState<string | null>(null);
  const [eventsShowPast, setEventsShowPast] = useState(false);
  const [eventsSortBy, setEventsSortBy] = useState<'date' | 'status' | 'name'>('date');

  // Network page controls state
  type NetworkTab = 'contacts' | 'lists' | 'categories';
  const [networkTab, setNetworkTab] = useState<NetworkTab>('contacts');
  const [networkShowAddModal, setNetworkShowAddModal] = useState(false);
  const [networkShowCSVModal, setNetworkShowCSVModal] = useState(false);

  const [loadingOrg, setLoadingOrg] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingCommandCenter, setLoadingCommandCenter] = useState(false);
  const [creationProgress, setCreationProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent race condition when fetching/creating organization
  const isFetchingOrgRef = useRef(false);

  // Admin-specific state
  const [analytics, setAnalytics] = useState<PresentsAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [expandedAnalyticsSection, setExpandedAnalyticsSection] = useState<string | null>(null);

  const { userProfile, isAuthenticated, loading: authLoading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { dialogOpen, dialogProps, handleEmailNotification, handleConfirmSend, closeDialog } = useEmailNotifications();
  const [guidebookOpen, setGuidebookOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch user's organization
  useEffect(() => {
    const fetchOrCreateOrganization = async () => {
      if (!userProfile?.id) return;

      // Prevent race condition - only allow one fetch/create at a time
      if (isFetchingOrgRef.current) {
        console.log('Organization fetch already in progress, skipping...');
        return;
      }

      try {
        isFetchingOrgRef.current = true;
        setLoadingOrg(true);
        setError(null);

        // Get current user's organization directly
        console.log('Fetching organization for current user...');
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
          console.log('No organization found, creating one for user...');
          try {
            const newOrg = await organizationsApi.create({
              name: userProfile.name || 'My Organization',
              description: 'Event production and venue management',
            });
            console.log('Organization created:', newOrg);
            // Create endpoint returns org directly (same as getMine when org exists)
            userOrg = newOrg;
          } catch (createErr: any) {
            console.error('Failed to create organization:', createErr);
            console.log('Error details:', {
              status: createErr?.status,
              message: createErr?.message,
              errors: createErr?.errors
            });

            // If creation failed due to duplicate (422 or 500 with unique constraint error)
            const isDuplicateError = createErr?.status === 422 ||
              (createErr?.status === 500 && createErr?.message?.includes('duplicate key'));

            if (isDuplicateError) {
              console.log('Duplicate organization error - organization may already exist. Refetching...');
              const retryResponse = await organizationsApi.getMine();
              console.log('Retry response:', retryResponse);

              // Same logic: response IS the org unless it has organization: null
              if (retryResponse && !('organization' in retryResponse && retryResponse.organization === null)) {
                userOrg = retryResponse;
              } else {
                setError('Organization exists but could not be loaded. Please contact support or try logging out and back in.');
                setLoadingOrg(false);
                isFetchingOrgRef.current = false;
                return;
              }
            } else {
              setError(`Failed to create organization: ${createErr?.message || 'Unknown error'}`);
              setLoadingOrg(false);
              isFetchingOrgRef.current = false;
              return;
            }
          }
        }

        if (userOrg) {
          console.log('🏢 [ProducerDashboard] Setting organization:', userOrg);
          console.log('🏢 [ProducerDashboard] Organization ID:', userOrg.id);
          console.log('🏢 [ProducerDashboard] Organization slug:', userOrg.slug);
          setOrganization(userOrg);
          // Fetch events for this organization
          await fetchEvents(userOrg.slug);
        }
      } catch (err) {
        console.error('Failed to fetch organization:', err);
        setError('Failed to load organization data');
      } finally {
        setLoadingOrg(false);
        isFetchingOrgRef.current = false;
      }
    };

    if (userProfile) {
      fetchOrCreateOrganization();
    }
  }, [userProfile]);

  // Auto-trigger guidebook on first visit
  useEffect(() => {
    if (!loadingOrg && !loadingEvents && organization) {
      try {
        if (localStorage.getItem('voxxy_guidebook_seen') !== 'true') {
          const timer = setTimeout(() => {
            setGuidebookOpen(true);
            localStorage.setItem('voxxy_guidebook_seen', 'true');
          }, 500);
          return () => clearTimeout(timer);
        }
      } catch { /* localStorage not available */ }
    }
  }, [loadingOrg, loadingEvents, organization]);

  // Load admin data when admin tab is active
  useEffect(() => {
    if (activeNav === 'admin' && isAdmin) {
      loadAnalytics();
      loadUsers();
    }
  }, [activeNav, isAdmin]);

  // Fetch events for organization
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

  // Admin-specific functions
  const loadAnalytics = async () => {
    if (!isAdmin) return;
    setLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const data = await adminApi.getPresentsAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setAnalyticsError(err.message || 'Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserPaid = async (userId: number) => {
    if (!isAdmin) return;
    try {
      await adminApi.toggleUserPaid(userId);
      // Reload users to reflect the change
      await loadUsers();
    } catch (err) {
      console.error('Failed to toggle user paid status:', err);
    }
  };

  // Handle create event
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

      // Ensure we have an email template ID - fetch default if not set
      let templateId = wizardState.automaticMessages.email_campaign_template_id;
      if (!templateId) {
        try {
          const templates = await emailCampaignTemplatesApi.getAll();
          const defaultTemplate = templates.find((t) => t.is_default && t.template_type === 'generic');
          if (defaultTemplate) {
            templateId = defaultTemplate.id;
          }
        } catch (error) {
          console.error('Failed to fetch default email template:', error);
          // Continue without template - backend will use its default
        }
      }

      // Step 1: Create the event with all event fields including new ones
      const eventPayload = {
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
        email_campaign_template_id: templateId || undefined,
        use_category_templates: wizardState.automaticMessages.use_category_templates || false,
        use_universal_category_template: wizardState.automaticMessages.use_universal_category_template || false,
        universal_category_template_id: wizardState.automaticMessages.universal_category_template_id || undefined,
        status: 'draft' as const,
        published: false,
      };

      console.log('🔍 Event Creation Payload:', {
        use_universal_category_template: eventPayload.use_universal_category_template,
        universal_category_template_id: eventPayload.universal_category_template_id,
        use_category_templates: eventPayload.use_category_templates,
      });

      const newEvent = await eventsApi.create(organization.slug, eventPayload);

      // Step 2: Batch create vendor applications with all application fields
      if (wizardState.applicationDetails.applications.length > 0) {
        setCreationProgress('Setting up vendor applications...');

        const applicationPromises = wizardState.applicationDetails.applications.map((app) => {
          return vendorApplicationsApi.create(newEvent.slug, {
            name: app.name,
            description: app.description || undefined,
            booth_price: app.booth_price,
            category_id: app.category_id || undefined,
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

      // Step 3: Save invitation data for "Go Live" later (don't send yet)
      const hasInvites =
        wizardState.inviteList.selectedListIds.length > 0 ||
        wizardState.inviteList.invitedContactIds.length > 0;

      if (hasInvites) {
        setCreationProgress('Saving invitation selections...');

        try {
          await eventsApi.update(newEvent.slug, {
            invitation_list_ids: wizardState.inviteList.selectedListIds,
            invitation_contact_ids: wizardState.inviteList.invitedContactIds,
            invitation_excluded_ids: wizardState.inviteList.excludedContactIds,
          });
        } catch (error) {
          console.error('Failed to save invitation data:', error);
          // Don't throw - event creation succeeded, just log the error
        }
      }

      // Step 3.5: Generate scheduled emails (now that applications exist)
      // This creates category-specific emails based on vendor applications
      if (wizardState.applicationDetails.applications.length > 0) {
        setCreationProgress('Generating scheduled emails...');

        try {
          const emailResult = await eventsApi.generateEmails(newEvent.slug);
          console.log(`✅ Generated ${emailResult.emails_count} scheduled emails`);

          if (emailResult.warnings && emailResult.warnings.length > 0) {
            console.warn('Email generation warnings:', emailResult.warnings);
          }
        } catch (error) {
          console.error('Failed to generate emails:', error);
          // Don't throw - event creation succeeded, just log the error
          // Emails can be regenerated later from the Mail tab
        }
      }

      // Note: Scheduled emails are created in "paused" state
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

  // Handle update event
  const handleUpdateEvent = async (eventSlug: string, eventData: any) => {
    if (!organization) {
      console.error('No organization found');
      return;
    }

    try {
      console.log('Updating event:', eventSlug);
      const response = await eventsApi.update(eventSlug, eventData);
      console.log('Event updated successfully', response);

      // Check if backend is requesting email notification confirmation
      if (response?.email_notification) {
        console.log('Email notification required:', response.email_notification);
        handleEmailNotification(response.email_notification, eventSlug);
      }

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

  // Handle delete event
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

  // Refetch selected event (for Go Live and other status changes)
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    ...(isAdmin ? [{ id: 'admin' as NavItem, label: 'Admin', icon: Shield }] : []),
    { id: 'events' as NavItem, label: 'Events', icon: Calendar },
    { id: 'network' as NavItem, label: 'Network', icon: Users },
    { id: 'email-templates' as NavItem, label: 'Emails', icon: Mail },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ];

  // Get page title for header based on current navigation context
  const getPageTitle = (): string => {
    if (activeNav === 'admin') return 'Admin Panel';
    if (activeNav === 'network') return 'Network';
    if (activeNav === 'email-templates') return 'Email Templates';
    if (activeNav === 'settings') return 'Settings';

    if (activeNav === 'events') {
      if (eventsView === 'create') return 'Create Event';
      if (eventsView === 'edit') return 'Edit Event';
      if (eventsView === 'command-center' && selectedEvent) {
        return selectedEvent.title;
      }
      return 'Events';
    }

    return 'Dashboard';
  };

  // Render events content based on current view
  const renderEventsContent = () => {
    if (loadingOrg || loadingEvents) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-sm text-red-400 mb-3">{error}</p>
            <button
              onClick={() => organization && fetchEvents(organization.slug)}
              className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-smooth"
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
        // Create a wrapper function to ensure it's always defined
        const handleRefreshEvent = async () => {
          await refetchSelectedEvent();
        };

        return (
          <CommandCenter
            event={selectedEvent}
            organizationId={organization.id}
            activeTab={commandCenterTab}
            onTabChange={setCommandCenterTab}
            onBack={() => {
              setEventsView('list');
              setSelectedEvent(null);
              setCommandCenterTab('details'); // Reset to default tab when leaving
            }}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={async (eventSlug: string) => {
              await handleDeleteEvent(eventSlug);
              setEventsView('list');
              setSelectedEvent(null);
              setCommandCenterTab('details'); // Reset to default tab
            }}
            onRefreshEvent={handleRefreshEvent}
          />
        );
      }
    }

    return (
      <EventsList
        events={events}
        searchTerm={eventsSearchTerm}
        statusFilter={eventsStatusFilter}
        showPastEvents={eventsShowPast}
        sortBy={eventsSortBy}
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
        onDeleteEvent={handleDeleteEvent}
        isAdmin={isAdmin}
      />
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        w-[180px]
        bg-[#0f0820] flex flex-col transition-all duration-300
        fixed lg:relative inset-y-0 left-0 z-50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-3 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-lg font-bold text-white tracking-wider block mb-0.5">VOXXY</span>
              <p className="text-[10px] text-white/60">{isAdmin ? 'Admin Portal' : 'Event Producer'}</p>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-white/70 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5">
          {eventsView === 'command-center' ? (
            // Command Center Mode - Show Back button + Command Center tabs
            <>
              <button
                onClick={() => {
                  setEventsView('list');
                  setSelectedEvent(null);
                  setCommandCenterTab('details');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-smooth border border-white/30 text-white hover:bg-white/5 hover:border-white/50 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Events
              </button>

              {/* Command Center Tabs */}
              {[
                { id: 'details' as CommandCenterTab, label: 'Home', icon: Info },
                { id: 'applicants' as CommandCenterTab, label: 'Vendors', icon: ClipboardList },
                { id: 'emails' as CommandCenterTab, label: 'Mail', icon: Mail },
                { id: 'settings' as CommandCenterTab, label: 'Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = commandCenterTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCommandCenterTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                      text-xs font-medium transition-smooth
                      ${isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </>
          ) : (
            // Normal Navigation
            navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  data-onboarding={`nav-${item.id}`}
                  onClick={() => {
                    setActiveNav(item.id);
                    setIsMobileMenuOpen(false);
                    // Reset to appropriate events view when clicking Events nav
                    if (item.id === 'events' && eventsView !== 'list' && eventsView !== 'empty') {
                      setEventsView(events.length > 0 ? 'list' : 'empty');
                      setSelectedEvent(null);
                    }
                  }}
                  className={`
                    w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                    text-xs font-medium transition-smooth
                    ${isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })
          )}
        </nav>

        {/* Sidebar Footer - Organization & User Profile */}
        <div className="border-t border-white/10">
          {/* Organization Info */}
          {organization && (
            <div className="p-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {organization.name}
                  </p>
                  <p className="text-[10px] text-white/60">Organization</p>
                </div>
              </div>
            </div>
          )}

          {/* User Profile & Sign Out */}
          <div className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {userProfile?.name || userProfile?.email}
                </p>
                <p className="text-[10px] text-white/60">{isAdmin ? 'Admin' : 'Producer'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-smooth"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Top Navbar */}
        <header className="bg-[#0f0820] border-b border-white/10 pt-3">
          {/* Top row - Always visible */}
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-white/70 hover:text-white"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Title Section */}
              {eventsView === 'command-center' && selectedEvent ? (
                <div>
                  <h2 className="text-sm font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Command Center
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">{selectedEvent.title}</p>
                </div>
              ) : (
                <h2 className="text-sm text-white font-semibold">
                  {getPageTitle()}
                </h2>
              )}
            </div>

            {/* Action Buttons - Right Side */}
            <div className="flex items-center gap-2">
              {/* Events List - Create New Event Button */}
              {activeNav === 'events' && eventsView === 'list' && (
                <button
                  onClick={() => setEventsView('create')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-smooth text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Create New Event</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}

              {/* Help/Guide Button - Always visible */}
              <button
                onClick={() => setGuidebookOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-full shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
                title="Open guide"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Guide</span>
              </button>
            </div>
          </div>

          {/* Events List Controls - Search & Filters (shown only on events list view) */}
          {activeNav === 'events' && eventsView === 'list' && (
            <div className="px-3 pb-3 space-y-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={eventsSearchTerm}
                  onChange={(e) => setEventsSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Filter Pills & Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Filter Buttons */}
                {['Live', 'Draft', 'Past'].map(status => (
                  <button
                    key={status}
                    onClick={() => setEventsStatusFilter(eventsStatusFilter === status ? null : status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      eventsStatusFilter === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    {status}
                  </button>
                ))}

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-1" />

                {/* Sort Dropdown */}
                <select
                  value={eventsSortBy}
                  onChange={(e) => setEventsSortBy(e.target.value as 'date' | 'status' | 'name')}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                </select>

                {/* Show Past Toggle */}
                <button
                  onClick={() => setEventsShowPast(!eventsShowPast)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    eventsShowPast
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {eventsShowPast ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {eventsShowPast ? 'Hide Past' : 'Show Past'}
                </button>
              </div>
            </div>
          )}

          {/* Network Page Controls - Tabs (shown only on network page) */}
          {activeNav === 'network' && (
            <div className="flex items-center gap-2 border-b border-white/10 px-3">
              {([
                { id: 'contacts' as NetworkTab, label: 'All Contacts' },
                { id: 'lists' as NetworkTab, label: 'Lists', icon: Filter },
                { id: 'categories' as NetworkTab, label: 'Categories', icon: Tag },
              ]).map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setNetworkTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all relative ${
                      networkTab === tab.id ? 'text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {tab.label}
                    {networkTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pt-2" data-onboarding="events-content">
          {activeNav === 'settings' ? (
            <SettingsPage onBack={() => setActiveNav('events')} onStartGuide={() => setGuidebookOpen(true)} />
          ) : activeNav === 'events' ? (
            renderEventsContent()
          ) : activeNav === 'network' ? (
            <div className="px-3 md:px-4">
              {organization ? (
                <NetworkPage
                  organizationId={organization.id}
                  activeTab={networkTab}
                  showAddModal={networkShowAddModal}
                  setShowAddModal={setNetworkShowAddModal}
                  showCSVUploadModal={networkShowCSVModal}
                  setShowCSVUploadModal={setNetworkShowCSVModal}
                  onTabChange={setNetworkTab}
                />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-xs text-white/60">Loading organization...</p>
                </div>
              )}
            </div>
          ) : activeNav === 'email-templates' ? (
            <TemplateManager />
          ) : activeNav === 'admin' && isAdmin ? (
            <div className="p-3 md:p-4">
              <AdminPanel
                analytics={analytics}
                users={users}
                organization={organization}
                userProfile={userProfile}
                loading={loading}
                loadingOrg={loadingOrg}
                loadingAnalytics={loadingAnalytics}
                analyticsError={analyticsError}
                expandedUserId={expandedUserId}
                expandedAnalyticsSection={expandedAnalyticsSection}
                onLoadUsers={loadUsers}
                onLoadAnalytics={loadAnalytics}
                onExpandUser={setExpandedUserId}
                onExpandAnalyticsSection={setExpandedAnalyticsSection}
                onToggleUserPaid={handleToggleUserPaid}
              />
            </div>
          ) : (
            <div className="p-3 md:p-4">
              <div className="text-white/40 text-center mt-12">
                <p className="text-xs">{activeNav} content coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Email Notification Dialog */}
      <EmailConfirmationDialog
        open={dialogOpen}
        onOpenChange={closeDialog}
        onConfirm={handleConfirmSend}
        title={dialogProps.title}
        warning={dialogProps.warning}
        recipientCount={dialogProps.recipientCount}
        recipientEmail={dialogProps.recipientEmail}
        type={dialogProps.type}
        isLoading={dialogProps.isLoading}
      />

      {/* Guidebook Modal */}
      <GuidebookModal open={guidebookOpen} onClose={() => setGuidebookOpen(false)} />
    </div>
  );
}
