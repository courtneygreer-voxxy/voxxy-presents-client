import { useState } from 'react';
import { ArrowLeft, ClipboardList, Settings, Info, Mail } from 'lucide-react';
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
  onUpdateEvent?: (eventSlug: string, updates: any) => Promise<void>;
  onDeleteEvent?: (eventSlug: string) => Promise<void>;
  onRefreshEvent?: () => Promise<void>;
  organizationId?: number;
}

type Tab = 'details' | 'applicants' | 'emails' | 'settings';

export default function CommandCenter({ event, onBack, onUpdateEvent, onDeleteEvent, onRefreshEvent, organizationId }: CommandCenterProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const tabs = [
    { id: 'details' as Tab, label: 'Home', icon: Info },
    { id: 'applicants' as Tab, label: 'Vendors', icon: ClipboardList },
    { id: 'emails' as Tab, label: 'Mail', icon: Mail },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <EventDetailsTab
            event={event}
            onUpdate={onUpdateEvent}
            onNavigateToTab={(tab) => setActiveTab(tab as Tab)}
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0f0820] px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold gradient-text mb-1">
              Command Center
            </h1>
            <p className="text-sm text-white/70">{event.title}</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/30 text-white hover:bg-white/5 hover:border-white/50 transition-smooth text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Events</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}
