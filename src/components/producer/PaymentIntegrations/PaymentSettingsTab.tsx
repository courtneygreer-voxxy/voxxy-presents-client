import { useState } from 'react';
import { DollarSign, Receipt } from 'lucide-react';
import EventPaymentSettings from './EventPaymentSettings';
import PaymentTransactionsList from './PaymentTransactionsList';
import { DebugPanel } from '../DebugPanel';

interface PaymentSettingsTabProps {
  eventSlug: string;
  organizationId: number;
  event?: any;
  isAdmin?: boolean;
}

type TabView = 'settings' | 'transactions';

export default function PaymentSettingsTab({ eventSlug, organizationId, event, isAdmin }: PaymentSettingsTabProps) {
  const [activeTab, setActiveTab] = useState<TabView>('settings');

  const tabs = [
    { id: 'settings' as TabView, label: 'Payment Sync', icon: DollarSign },
    { id: 'transactions' as TabView, label: 'Transactions', icon: Receipt },
  ];

  return (
    <div className="p-3 md:p-4 space-y-6">
      {/* Tabs */}
      <div className="border-b border-purple-500/20">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'settings' && (
          <EventPaymentSettings
            eventSlug={eventSlug}
            organizationId={organizationId}
            onIntegrationChange={() => {
              // Could trigger a refresh of transactions list if needed
            }}
          />
        )}

        {activeTab === 'transactions' && (
          <PaymentTransactionsList
            eventSlug={eventSlug}
            onTransactionUpdate={() => {
              // Handle transaction updates if needed
            }}
          />
        )}
      </div>

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Payment Settings Tab"
        data={{
          event,
          eventSlug,
          organizationId,
          activeTab,
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
