// Payment integration types for Eventbrite sync

export interface Organization {
  id: number;
  name: string;
  eventbrite_connected: boolean;
  eventbrite_connected_at?: string;
}

export interface PaymentIntegration {
  id: number;
  event_id: number;
  organization_id: number;
  provider: 'eventbrite' | 'stripe' | 'venmo';
  provider_event_id?: string;
  provider_url?: string;
  auto_sync_enabled: boolean;
  auto_update_payment_status: boolean;
  auto_send_confirmations: boolean;
  sync_status: 'active' | 'paused' | 'error' | 'inactive';
  last_synced_at?: string;
  sync_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  latest_sync_log?: PaymentSyncLog;
}

export interface PaymentTransaction {
  id: number;
  payment_integration_id: number;
  event_id: number;
  vendor_contact_id?: number;
  registration_id?: number;
  provider_transaction_id: string;
  provider: string;
  payer_email: string;
  payer_first_name?: string;
  payer_last_name?: string;
  provider_status?: string;
  payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  amount: string;
  currency: string;
  transaction_created_at?: string;
  transaction_updated_at?: string;
  last_synced_at?: string;
  payment_confirmation_sent_at?: string;
  raw_provider_data?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
  vendor_contact?: {
    id: number;
    name: string;
    email: string;
    business_name?: string;
  };
  registration?: {
    id: number;
    email: string;
    vendor_fee_paid: boolean;
  };
}

export interface PaymentSyncLog {
  id: number;
  payment_integration_id: number;
  sync_type: 'full' | 'incremental';
  started_at: string;
  completed_at?: string;
  transactions_fetched: number;
  transactions_inserted: number;
  transactions_updated: number;
  contacts_matched: number;
  contacts_updated: number;
  registrations_updated: number;
  error_messages?: string;
  created_at: string;
  updated_at: string;
}

export interface EventbriteEvent {
  id: string;
  name: {
    text: string;
  };
  status: string;
  start: {
    local: string;
    utc: string;
  };
  url: string;
}

export interface EventbriteConnectionRequest {
  api_token: string;
}

export interface EventbriteConnectionResponse {
  message: string;
  connected_at?: string;
}

export interface EventbriteStatusResponse {
  connected: boolean;
  connected_at?: string;
}

export interface EventbriteEventsResponse {
  events: EventbriteEvent[];
}

export interface CreatePaymentIntegrationRequest {
  provider: 'eventbrite';
  provider_event_id?: string;
  provider_url?: string;
  auto_sync_enabled?: boolean;
  auto_update_payment_status?: boolean;
  auto_send_confirmations?: boolean;
}

export interface UpdatePaymentIntegrationRequest {
  provider_event_id?: string;
  provider_url?: string;
  auto_sync_enabled?: boolean;
  auto_update_payment_status?: boolean;
  auto_send_confirmations?: boolean;
  sync_status?: 'active' | 'paused' | 'error' | 'inactive';
}

export interface SyncPaymentIntegrationResponse {
  message: string;
  sync_log: PaymentSyncLog;
}

export interface MatchTransactionRequest {
  vendor_contact_id?: number;
  registration_id?: number;
}
