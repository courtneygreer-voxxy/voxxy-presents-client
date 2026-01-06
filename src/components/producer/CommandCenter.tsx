import { useState } from 'react';
import { ArrowLeft, Users, Building2, Settings, Info, Mail } from 'lucide-react';
import EventSettings from './EventSettings';
import ApplicationsTab from './ApplicationsTab';
import VendorsTab from './VendorsTab';
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
}

type Tab = 'details' | 'applications' | 'vendors' | 'emails' | 'settings';

export default function CommandCenter({ event, onBack, onUpdateEvent, onDeleteEvent }: CommandCenterProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details');

  const tabs = [
    { id: 'details' as Tab, label: 'Event Details', icon: Info },
    { id: 'applications' as Tab, label: 'Applications', icon: Users },
    { id: 'vendors' as Tab, label: 'Vendors', icon: Building2 },
    { id: 'emails' as Tab, label: 'Email Automation', icon: Mail },
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
          />
        );
      case 'applications':
        return (
          <ApplicationsTab
            eventSlug={event.slug}
            event={{
              slug: event.slug,
              title: event.title,
              event_date: event.event_date,
              location: event.location,
            }}
          />
        );
      case 'vendors':
        return <VendorsTab eventSlug={event.slug} />;
      case 'emails':
        return <EmailAutomationTab eventSlug={event.slug} />;
      case 'settings':
        return (
          <EventSettings
            event={event}
            onUpdate={onUpdateEvent}
            onDelete={onDeleteEvent}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0515]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0f0820] px-6 py-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Command Center
            </h1>
            <p className="text-base text-white/70">{event.title}</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/30 text-white hover:bg-white/5 hover:border-white/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Events</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
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
