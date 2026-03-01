/**
 * Email Automation System - TypeScript Interfaces
 *
 * These interfaces match the Rails backend models for the email automation system.
 * See EMAIL_AUTOMATION_PLAN.md for complete system architecture.
 */

// ============================================================================
// Email Campaign Templates (Collections of up to 40 emails)
// ============================================================================

export interface EmailCampaignTemplate {
  id: number;
  template_type: 'system' | 'user';
  organization_id: number | null;
  name: string;
  description: string | null;
  is_default: boolean;
  email_count: number;
  events_count: number;
  created_at: string;
  updated_at: string;

  // Optional: Included when fetching full template with items
  email_template_items?: EmailTemplateItem[];
}

// ============================================================================
// Email Template Items (Individual emails within a template)
// ============================================================================

export interface EmailTemplateItem {
  id: number;
  email_campaign_template_id: number;
  name: string;
  description: string | null;
  category: EmailCategory;
  position: number; // 1-40

  // Email content (with variables like {{event_title}})
  subject_template: string;
  body_template: string; // HTML with variables

  // Scheduling logic
  trigger_type: TriggerType;
  trigger_value: number | null; // Number of days offset
  trigger_time: string | null; // HH:MM format (e.g., "09:00")

  // Recipient filtering
  filter_criteria: FilterCriteria;

  // Defaults
  enabled_by_default: boolean;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// Scheduled Emails (Event-specific email instances)
// ============================================================================

export interface ScheduledEmail {
  id: number;
  event_id: number;

  // Template tracking (where this email came from)
  email_campaign_template_id: number | null;
  email_template_item_id: number | null;

  // Email details (customizable per event)
  name: string;
  subject_template: string;
  body_template: string; // HTML

  // Scheduling (customizable per event)
  trigger_type: TriggerType;
  trigger_value: number | null;
  trigger_time: string | null;
  scheduled_for: string; // ISO datetime (UTC)

  // Recipient filtering (customizable per event)
  filter_criteria: FilterCriteria;

  // Status tracking
  status: ScheduledEmailStatus;
  sent_at: string | null;
  recipient_count: number;
  error_message: string | null;

  created_at: string;
  updated_at: string;

  // Optional: Delivery tracking (included when requested)
  latest_delivery?: EmailDelivery;
  email_deliveries?: EmailDelivery[];

  // Aggregated delivery counts (for sent emails)
  delivery_counts?: {
    total_sent: number;
    delivered: number;
    bounced: number;
    dropped: number;
    unsubscribed: number;
    pending: number;
  };

  // Individual delivery metrics
  undelivered_count?: number;
  unsubscribed_count?: number;
  delivered_count?: number;
  delivery_rate?: number; // Percentage (0-100)

  // Overdue detection (for scheduled emails that are late)
  overdue?: boolean;
  minutes_overdue?: number;
  overdue_message?: string | null; // e.g., "45 minutes late"

  // Removed fields (Feb 28, 2026):
  // - isInvitationAnnouncement: Position 1 is now a real scheduled email (not virtual)
  // - isPreviewOnly: No longer needed with unified invitation system
}

// ============================================================================
// Email Delivery Tracking (SendGrid webhook integration)
// ============================================================================

export interface EmailDelivery {
  id: number;
  scheduled_email_id: number;
  event_id: number;
  registration_id: number;

  // Email identifiers
  sendgrid_message_id: string;
  recipient_email: string;

  // Delivery tracking (updated via SendGrid webhook)
  status: DeliveryStatus;
  bounce_type: 'soft' | 'hard' | null;
  bounce_reason: string | null;
  drop_reason: string | null;

  // Event timestamps (from SendGrid webhook)
  sent_at: string | null;
  delivered_at: string | null;
  bounced_at: string | null;
  dropped_at: string | null;
  unsubscribed_at: string | null;

  // Auto-retry logic for soft bounces
  retry_count: number;
  next_retry_at: string | null;
  max_retries: number;

  created_at: string;
  updated_at: string;

  // ✅ Phase 1-3: Backend now includes registration data for audit log
  recipient_name?: string | null;
  vendor_category?: string | null;
}

// ============================================================================
// Filter Criteria (JSONB for recipient filtering)
// ============================================================================

export interface FilterCriteria {
  // Status filters
  status?: RegistrationStatus[];
  exclude_status?: RegistrationStatus[];

  // Vendor attribute filters
  vendor_category?: string[];
  location_city?: string[];
  location_state?: string[];
  tags?: string[];

  // Payment filters (future)
  payment_status?: PaymentStatus[];
}

// ============================================================================
// Enums and Types
// ============================================================================

export type EmailCategory =
  | 'pre_application'
  | 'application'
  | 'payment'
  | 'pre_event'
  | 'event_day'
  | 'post_event'
  | 'system';

export type TriggerType =
  // Time-based triggers (scheduled by worker)
  | 'days_before_event'
  | 'days_after_event'
  | 'days_before_deadline'
  | 'days_after_deadline'
  | 'on_application_open'
  | 'on_event_date'
  | 'days_before_payment_deadline'
  | 'on_payment_deadline'
  // Event-based triggers (sent immediately on action)
  | 'on_application_submit'
  | 'on_approval'
  | 'on_rejection'
  | 'on_waitlist'
  | 'on_payment_received'
  | 'on_category_change'
  | 'on_event_update'
  | 'on_event_cancel'
  | 'on_invitation_send';

export type ScheduledEmailStatus =
  | 'scheduled'
  | 'paused'
  | 'sent'
  | 'failed'
  | 'cancelled';

export type DeliveryStatus =
  | 'scheduled'
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'dropped'
  | 'unsubscribed';

export type RegistrationStatus =
  | 'pending'
  | 'approved'
  | 'confirmed'
  | 'waitlist'
  | 'rejected'
  | 'cancelled';

export type PaymentStatus =
  | 'paid'
  | 'unpaid'
  | 'partial'
  | 'refunded';

// ============================================================================
// API Request/Response Types
// ============================================================================

// Create custom template (clone from existing)
export interface CreateTemplateRequest {
  source_template_id: number;
  name: string;
  description?: string;
}

// Update template
export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
}

// Create email in template
export interface CreateEmailTemplateItemRequest {
  name: string;
  description?: string;
  category: EmailCategory;
  position: number;
  subject_template: string;
  body_template: string;
  trigger_type: TriggerType;
  trigger_value?: number;
  trigger_time?: string;
  filter_criteria?: FilterCriteria;
  enabled_by_default?: boolean;
}

// Update email in template or scheduled email
export interface UpdateEmailRequest {
  name?: string;
  description?: string;
  subject_template?: string;
  body_template?: string;
  trigger_type?: TriggerType;
  trigger_value?: number;
  trigger_time?: string;
  filter_criteria?: FilterCriteria;
  scheduled_for?: string;
  status?: ScheduledEmailStatus;
}

// Save event's emails as new template
export interface SaveAsTemplateRequest {
  name: string;
  description?: string;
}

// Preview email with resolved variables
export interface EmailPreviewRequest {
  registration_id: number;
}

export interface EmailPreviewResponse {
  subject: string;
  body: string; // HTML with variables resolved
  recipient_email: string;
  recipient_name: string;
}

// Send now action
export interface SendNowResponse {
  message: string;
  sent_count: number;
  failed_count: number;
}

// Generate scheduled emails
export interface GenerateScheduledEmailsRequest {
  category?: EmailCategory;
  position?: number;
  regenerate?: boolean; // If true, delete existing and regenerate
}

export interface GenerateScheduledEmailsResponse {
  message: string;
  generated_count: number;
  skipped_count: number;
  scheduled_emails: ScheduledEmail[];
}

// ============================================================================
// UI Helper Types
// ============================================================================

// Delivery status badge configuration
export interface DeliveryStatusConfig {
  label: string;
  color: 'gray' | 'blue' | 'green' | 'red' | 'yellow';
  icon: string;
  description: string;
}

// Email variable for insertion in editor
export interface EmailVariable {
  category: 'event' | 'organization' | 'vendor' | 'computed';
  label: string;
  variable: string; // e.g., "{{event_title}}"
  description: string;
  example: string;
}

// Template statistics (for UI display)
export interface TemplateStats {
  total_emails: number;
  by_category: Record<EmailCategory, number>;
  enabled_count: number;
  disabled_count: number;
}

// Scheduled email statistics (for event dashboard)
export interface ScheduledEmailStats {
  total: number;
  scheduled: number;
  paused: number;
  sent: number;
  failed: number;
  cancelled: number;

  // Delivery stats (if included)
  delivery_rate?: number; // Percentage
  delivered_count?: number;
  bounced_count?: number;
  dropped_count?: number;
}

// ============================================================================
// Form Types for React Hook Form
// ============================================================================

export interface TemplateFormData {
  name: string;
  description: string;
}

export interface EmailItemFormData {
  name: string;
  description: string;
  category: EmailCategory;
  position: number;
  subject_template: string;
  body_template: string;
  trigger_type: TriggerType;
  trigger_value: number | '';
  trigger_time: string;
  enabled_by_default: boolean;
}

export interface FilterCriteriaFormData {
  status: RegistrationStatus[];
  exclude_status: RegistrationStatus[];
  vendor_category: string[];
  location_city: string[];
  location_state: string[];
}

// ============================================================================
// Constants
// ============================================================================

export const EMAIL_CATEGORIES: { value: EmailCategory; label: string }[] = [
  { value: 'pre_application', label: 'Pre-Application' },
  { value: 'application', label: 'Application' },
  { value: 'payment', label: 'Payment' },
  { value: 'pre_event', label: 'Pre-Event' },
  { value: 'event_day', label: 'Event Day' },
  { value: 'post_event', label: 'Post-Event' },
  { value: 'system', label: 'System' }
];

export const TRIGGER_TYPES: { value: TriggerType; label: string }[] = [
  // Time-based triggers
  { value: 'days_before_event', label: 'Days Before Event' },
  { value: 'days_after_event', label: 'Days After Event' },
  { value: 'days_before_deadline', label: 'Days Before Application Deadline' },
  { value: 'days_after_deadline', label: 'Days After Application Deadline' },
  { value: 'on_application_open', label: 'When Applications Open' },
  { value: 'on_event_date', label: 'On Event Date' },
  { value: 'days_before_payment_deadline', label: 'Days Before Payment Deadline' },
  { value: 'on_payment_deadline', label: 'On Payment Deadline' },
  // Event-based triggers (immediate)
  { value: 'on_application_submit', label: 'When Application Submitted' },
  { value: 'on_approval', label: 'When Application Approved' },
  { value: 'on_rejection', label: 'When Application Rejected' },
  { value: 'on_waitlist', label: 'When Moved to Waitlist' },
  { value: 'on_payment_received', label: 'When Payment Received' },
  { value: 'on_category_change', label: 'When Category Changed' },
  { value: 'on_event_update', label: 'When Event Details Updated' },
  { value: 'on_event_cancel', label: 'When Event Canceled' },
  { value: 'on_invitation_send', label: 'When Invitation Sent' }
];

export const DELIVERY_STATUS_CONFIGS: Record<DeliveryStatus, DeliveryStatusConfig> = {
  scheduled: {
    label: 'Scheduled',
    color: 'blue',
    icon: '◷',
    description: 'Email is scheduled to be sent'
  },
  pending: {
    label: 'Not Sent',
    color: 'gray',
    icon: '○',
    description: 'Email has not been sent yet'
  },
  queued: {
    label: 'Queued',
    color: 'gray',
    icon: '⋯',
    description: 'Email is queued for sending'
  },
  sent: {
    label: 'Sent',
    color: 'blue',
    icon: '↗',
    description: 'Email has been sent to SendGrid'
  },
  delivered: {
    label: 'Delivered',
    color: 'green',
    icon: '✓',
    description: 'Email successfully delivered to recipient'
  },
  bounced: {
    label: 'Bounced',
    color: 'red',
    icon: '✕',
    description: 'Email bounced (hard or soft bounce)'
  },
  dropped: {
    label: 'Dropped',
    color: 'red',
    icon: '⊘',
    description: 'Email was dropped (e.g., previously unsubscribed)'
  },
  unsubscribed: {
    label: 'Unsubscribed',
    color: 'gray',
    icon: '⊗',
    description: 'Recipient unsubscribed from emails'
  }
};

// ============================================================================
// Email Audit Log Types
// ============================================================================

export interface AuditEntry {
  id: string; // Composite key: `${scheduled_email_id}-${registration_id}`
  sent_at: string | null;
  scheduled_for?: string | null; // For scheduled emails (not yet sent)
  recipient_name: string | null;
  recipient_email: string;
  email_name: string; // From scheduled_email.name
  email_subject: string; // From scheduled_email.subject_template
  trigger_type: TriggerType;
  category: string; // From registration.vendor_category (NOT inferred from trigger)
  status: DeliveryStatus;
  bounce_reason?: string | null;
  drop_reason?: string | null;
  unsubscribed_at?: string | null;
  scheduled_email_id: number;
  registration_id: number;
}

export interface AuditFilters {
  email_name?: string;
  status?: DeliveryStatus | 'undelivered'; // 'undelivered' = bounced + dropped
  category?: string;
  search?: string; // Search recipient name or email
}

// ============================================================================
// Constants
// ============================================================================

// Available email variables for template editor
export const EMAIL_VARIABLES: EmailVariable[] = [
  // Event variables
  {
    category: 'event',
    label: 'Event Title',
    variable: '{{event_title}}',
    description: 'Name of the event',
    example: 'Summer Market 2025'
  },
  {
    category: 'event',
    label: 'Event Date',
    variable: '{{event_date}}',
    description: 'Event date (formatted)',
    example: 'June 15, 2025'
  },
  {
    category: 'event',
    label: 'Event Time',
    variable: '{{event_time}}',
    description: 'Event time range',
    example: '10:00 AM - 6:00 PM'
  },
  {
    category: 'event',
    label: 'Event Location',
    variable: '{{event_location}}',
    description: 'Event venue and address',
    example: 'Piedmont Park, Atlanta, GA'
  },
  {
    category: 'event',
    label: 'Application Deadline',
    variable: '{{application_deadline}}',
    description: 'Last day to apply',
    example: 'May 30, 2025'
  },
  {
    category: 'event',
    label: 'Booth Price',
    variable: '{{booth_price}}',
    description: 'Cost per booth',
    example: '$150.00'
  },

  // Organization variables
  {
    category: 'organization',
    label: 'Organization Name',
    variable: '{{organization_name}}',
    description: 'Event producer organization',
    example: 'Voxxy Presents'
  },
  {
    category: 'organization',
    label: 'Organization Email',
    variable: '{{organization_email}}',
    description: 'Contact email',
    example: 'hello@voxxypresents.com'
  },

  // Vendor-specific variables
  {
    category: 'vendor',
    label: 'Vendor Name',
    variable: '{{vendor_name}}',
    description: 'Vendor contact name',
    example: 'John Doe'
  },
  {
    category: 'vendor',
    label: 'Business Name',
    variable: '{{business_name}}',
    description: 'Vendor business name',
    example: "John's Tacos"
  },
  {
    category: 'vendor',
    label: 'Vendor Category',
    variable: '{{vendor_category}}',
    description: 'Type of vendor',
    example: 'Food'
  },
  {
    category: 'vendor',
    label: 'Booth Number',
    variable: '{{booth_number}}',
    description: 'Assigned booth location',
    example: 'A-12'
  },

  // Computed variables
  {
    category: 'computed',
    label: 'Event URL',
    variable: '{{event_url}}',
    description: 'Link to event page',
    example: 'https://voxxypresents.com/events/summer-market-2025'
  },
  {
    category: 'computed',
    label: 'Unsubscribe Link',
    variable: '{{unsubscribe_link}}',
    description: 'Link to unsubscribe from emails',
    example: 'https://voxxypresents.com/unsubscribe/abc123'
  }
];
