import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EventSettings from './EventSettings';
import ApplicantsTab from './ApplicantsTab';
import EventDetailsTab from './EventDetailsTab';
import { EmailAutomationTab } from './Email';

interface Event {
  id: number;
  slug: string;
  title: string;
  description?: string;
  event_date?: string;
  event_end_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  location?: string;
  age_restriction?: string;
  ticket_link?: string;
  application_deadline?: string;
  payment_deadline?: string;
  status?: {
    published?: boolean;
    registration_open?: boolean;
    status?: 'draft' | 'published' | 'cancelled' | 'completed';
  };
  published?: boolean;
  capacity?: {
    total?: number;
    registered?: number;
    remaining?: number;
    is_full?: boolean;
  };
}

interface CommandCenterProps {
  event: Event;
  onBack: () => void;
  activeTab: 'details' | 'applicants' | 'emails' | 'settings';
  onTabChange: (tab: 'details' | 'applicants' | 'emails' | 'settings') => void;
  onUpdateEvent?: (eventSlug: string, updates: any) => Promise<void>;
  onDeleteEvent?: (eventSlug: string) => Promise<void>;
  onRefreshEvent?: () => Promise<void>;
  organizationId?: number;
}

export default function CommandCenter({ event, onBack, activeTab, onTabChange, onUpdateEvent, onDeleteEvent, onRefreshEvent, organizationId }: CommandCenterProps) {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <EventDetailsTab
            event={event}
            onUpdate={onUpdateEvent}
            onNavigateToTab={(tab) => onTabChange(tab as 'details' | 'applicants' | 'emails' | 'settings')}
            onRefreshEvent={onRefreshEvent}
            organizationId={organizationId}
            isAdmin={isAdmin}
          />
        );
      case 'applicants':
        return <ApplicantsTab eventSlug={event.slug} event={event} isAdmin={isAdmin} />;
      case 'emails':
        return <EmailAutomationTab eventSlug={event.slug} event={event} isAdmin={isAdmin} />;
      case 'settings':
        return (
          <EventSettings
            event={event}
            onUpdate={onUpdateEvent}
            onDelete={onDeleteEvent}
            isAdmin={isAdmin}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-auto">
      {renderTabContent()}
    </div>
  );
}
