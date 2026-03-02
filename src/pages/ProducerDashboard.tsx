import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Settings, Building2, Menu, X, LogOut, Mail, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { eventsApi, organizationsApi, vendorApplicationsApi, eventInvitationsApi, contactListsApi } from '@/services/api';
import SettingsPage from './SettingsPage';
import EventsEmptyState from '@/components/producer/EventsEmptyState';
import { CreateEventWizard, WizardState } from '@/components/producer/CreateEventWizard';
import EditEventForm from '@/components/producer/EditEventForm';
import EventsList from '@/components/producer/EventsList';
import LoadingCommandCenter from '@/components/producer/LoadingCommandCenter';
import CommandCenter from '@/components/producer/CommandCenter';
import { NetworkPage } from '@/components/producer/Network';
import EmailTemplatesPage from './EmailTemplatesPage';
import EmailTestingPage from './EmailTestingPage';
import { EmailConfirmationDialog } from '@/components/producer/EmailConfirmationDialog';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';

type NavItem = 'events' | 'network' | 'email-templates' | 'email-testing' | 'settings';
type EventsView = 'list' | 'create' | 'edit' | 'command-center' | 'empty';

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

export default function ProducerDashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>('events');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [eventsView, setEventsView] = useState<EventsView>('empty');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingCommandCenter, setLoadingCommandCenter] = useState(false);
  const [creationProgress, setCreationProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { userProfile, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { dialogOpen, dialogProps, handleEmailNotification, handleConfirmSend, closeDialog } = useEmailNotifications();

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

      try {
        setLoadingOrg(true);
        setError(null);

        // Get current user's organization directly
        console.log('Fetching organization for current user...');
        const response = await organizationsApi.getMine();
        console.log('My organization response:', response);

        let userOrg = response?.organization !== null ? response : null;

        // Handle case where response is { organization: null }
        if (response?.organization === null) {
          userOrg = null;
        }

        // If no organization exists, create one automatically
        if (!userOrg) {
          console.log('No organization found, creating one for user...');
          try {
            const newOrg = await organizationsApi.create({
              name: userProfile.name || 'My Organization',
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
        email_campaign_template_id: wizardState.automaticMessages.email_campaign_template_id || undefined,
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
      console.warn('No selected event to refetch');
      return;
    }

    try {
      console.log('Refetching event:', selectedEvent.slug);
      const updatedEvent = await eventsApi.getById(selectedEvent.slug);
      console.log('Event refetched successfully:', updatedEvent);
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
    { id: 'events' as NavItem, label: 'Events', icon: Calendar },
    { id: 'network' as NavItem, label: 'Network', icon: Users },
    { id: 'email-templates' as NavItem, label: 'Emails', icon: Mail },
    { id: 'email-testing' as NavItem, label: 'Test Emails', icon: Send },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ];

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
              <p className="text-[10px] text-white/60">Event Producer</p>
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
          })}
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
                <p className="text-[10px] text-white/60">Producer</p>
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
        <header className="h-10 bg-[#0f0820] border-b border-white/10 flex items-center px-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-white/70 hover:text-white mr-2"
          >
            <Menu className="w-4 h-4" />
          </button>

          <h2 className="text-xs text-white font-medium">
            {userProfile?.name || 'Producer Dashboard'}
          </h2>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {activeNav === 'settings' ? (
            <SettingsPage onBack={() => setActiveNav('events')} />
          ) : activeNav === 'events' ? (
            renderEventsContent()
          ) : activeNav === 'network' ? (
            <div className="p-3 md:p-4">
              {organization ? (
                <NetworkPage organizationId={organization.id} />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-xs text-white/60">Loading organization...</p>
                </div>
              )}
            </div>
          ) : activeNav === 'email-templates' ? (
            <div className="p-3 md:p-4">
              {organization ? (
                <EmailTemplatesPage organizationId={organization.id} />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-xs text-white/60">Loading organization...</p>
                </div>
              )}
            </div>
          ) : activeNav === 'email-testing' ? (
            <EmailTestingPage onBack={() => setActiveNav('events')} />
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
    </div>
  );
}
