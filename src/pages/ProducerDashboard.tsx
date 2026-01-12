import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Settings, Building2, Menu, X, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { eventsApi, organizationsApi, vendorApplicationsApi, eventInvitationsApi } from '@/services/api';
import SettingsPage from './SettingsPage';
import MailTemplatesPage from './MailTemplatesPage';
import EventsEmptyState from '@/components/producer/EventsEmptyState';
import { CreateEventWizard, WizardState } from '@/components/producer/CreateEventWizard';
import EditEventForm from '@/components/producer/EditEventForm';
import EventsList from '@/components/producer/EventsList';
import LoadingCommandCenter from '@/components/producer/LoadingCommandCenter';
import CommandCenter from '@/components/producer/CommandCenter';
import { NetworkPage } from '@/components/producer/Network';

type NavItem = 'events' | 'network' | 'mail' | 'settings';
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
  const [error, setError] = useState<string | null>(null);

  const { userProfile, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

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

      // Step 3: Handle invited contacts (if any)
      if (wizardState.inviteList.invitedContactIds.length > 0) {
        console.log(`Inviting ${wizardState.inviteList.invitedContactIds.length} contacts to event`);
        try {
          const result = await eventInvitationsApi.createBatch(
            newEvent.slug,
            wizardState.inviteList.invitedContactIds
          );
          console.log(`✅ ${result.created_count} invitations sent successfully`);
          if (result.errors.length > 0) {
            console.warn('Some invitations failed:', result.errors);
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

  // Handle update event
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
    { id: 'mail' as NavItem, label: 'Mail', icon: Mail },
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

    if (error) {
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
              <p className="text-sm text-white/60">Event Producer</p>
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
                <p className="text-xs text-white/60">Producer</p>
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
            {userProfile?.name || 'Producer Dashboard'}
          </h2>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {activeNav === 'settings' ? (
            <SettingsPage onBack={() => setActiveNav('events')} />
          ) : activeNav === 'mail' ? (
            <MailTemplatesPage />
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
