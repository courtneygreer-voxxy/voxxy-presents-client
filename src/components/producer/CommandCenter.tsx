import { useState } from 'react';
import { ArrowLeft, MessageSquare, Users, Building2, Settings } from 'lucide-react';
import MessageBoard from './MessageBoard';
import EventSettings from './EventSettings';
import ApplicationsTab from './ApplicationsTab';
import VendorsTab from './VendorsTab';

interface Event {
  id: number;
  slug: string;
  title: string;
  description?: string;
  event_date?: string;
  event_end_date?: string;
  location?: string;
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

type Tab = 'messages' | 'applications' | 'vendors' | 'settings';

export default function CommandCenter({ event, onBack, onUpdateEvent, onDeleteEvent }: CommandCenterProps) {
  const [activeTab, setActiveTab] = useState<Tab>('messages');

  const tabs = [
    { id: 'messages' as Tab, label: 'Message Board', icon: MessageSquare },
    { id: 'applications' as Tab, label: 'Applications', icon: Users },
    { id: 'vendors' as Tab, label: 'Vendors', icon: Building2 },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'messages':
        return <MessageBoard />;
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
      <div className="border-b border-white/10 bg-[#0f0820] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              Command Center
            </h1>
            <p className="text-white/60">{event.title}</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Events</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white/10 text-white'
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
