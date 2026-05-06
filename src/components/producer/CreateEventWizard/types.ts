// TypeScript interfaces for the 6-Step Event Creation Wizard

// ─── Payment Price Types ─────────────────────────────────────────────────────

/** What artists/applicants pay the producer */
export type PaymentPriceType =
  | 'booth_price'          // Fixed booth fee (existing)
  | 'early_bird_price'     // Discounted rate before early bird deadline
  | 'percentage_of_sales'  // Commission on sales (art shows)
  | 'price_per_piece'      // Per-artwork or per-item fee
  | 'jury_fee'             // Non-refundable application/jury fee
  | 'custom';              // Producer-defined custom fee label

export interface PaymentPriceEntry {
  type: PaymentPriceType;
  label: string;               // Display label (auto-generated or custom)
  amount: number;              // Dollar amount or percentage value
  is_percentage: boolean;      // true for percentage_of_sales
  description?: string;        // Optional note (e.g., "10% commission on all sales")
  early_bird_deadline?: string; // ISO date, only for early_bird_price type
}

/** How producers collect money */
export type PaymentEngine =
  | 'eventbrite'
  | 'venmo'
  | 'paypal'
  | 'stripe'
  | 'zelle'
  | 'cash_check'
  | 'other';

export interface PaymentEngineConfig {
  engine: PaymentEngine;
  label: string;
  payment_link?: string;       // URL for online payment
  instructions?: string;       // Free-text instructions (e.g., "Mail check to...")
  collect_app_code: boolean;   // Whether to prompt artists to include app code in payment
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

// ─── Payment Constants ───────────────────────────────────────────────────────

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
];

export const PAYMENT_PRICE_TYPES: { value: PaymentPriceType; label: string; description: string; isPercentage: boolean }[] = [
  { value: 'booth_price', label: 'Booth Fee', description: 'Standard fixed-price booth rental', isPercentage: false },
  { value: 'early_bird_price', label: 'Early Bird Rate', description: 'Discounted rate for early registrants', isPercentage: false },
  { value: 'jury_fee', label: 'Jury / Application Fee', description: 'Non-refundable fee to review application', isPercentage: false },
  { value: 'percentage_of_sales', label: 'Commission on Sales', description: 'Percentage of artist sales paid to producer', isPercentage: true },
  { value: 'price_per_piece', label: 'Per Piece Fee', description: 'Fee charged per artwork or item displayed', isPercentage: false },
];

export const PAYMENT_ENGINES: { value: PaymentEngine; label: string; icon: string; collectsEmail: boolean }[] = [
  { value: 'eventbrite', label: 'Eventbrite', icon: 'ticket', collectsEmail: true },
  { value: 'stripe', label: 'Stripe', icon: 'credit-card', collectsEmail: false },
  { value: 'paypal', label: 'PayPal', icon: 'dollar-sign', collectsEmail: true },
  { value: 'venmo', label: 'Venmo', icon: 'smartphone', collectsEmail: false },
  { value: 'zelle', label: 'Zelle', icon: 'zap', collectsEmail: false },
  { value: 'cash_check', label: 'Cash / Check', icon: 'banknote', collectsEmail: false },
  { value: 'other', label: 'Other', icon: 'circle', collectsEmail: false },
];

// ─── Wizard Step Type ────────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

// ─── Application Row ─────────────────────────────────────────────────────────

export interface ApplicationRow {
  id: string; // Temporary client-side ID (UUID)
  category_id?: number; // Category ID (linked to organization's categories)
  category_name?: string; // Category name for display
  category_color?: string; // Category color for display
  category_icon?: string; // Category icon for display
  category_email_campaign_template_id?: number; // Category's email template ID
  name: string; // Application title (e.g., "Artist Booth") - kept for backward compatibility
  booth_price: number; // Price for this booth type (kept for backward compat with backend)
  description: string; // Optional description
  categories?: string[]; // Optional vendor categories (legacy - will be deprecated)
  install_date?: string; // Install date (ISO date string)
  install_start_time?: string; // Install start time (HH:MM format)
  install_end_time?: string; // Install end time (HH:MM format)
  payment_link?: string; // Payment link for this application (legacy, now per-engine)
  application_tags?: string[]; // Tags for this application (stored as array in frontend, comma-separated in backend)
  prefilled_from_event?: string; // Event name this data was pre-filled from (for UI indicator)
  prefilled_from_event_id?: number; // Event ID this data was pre-filled from (for reference)

  // Payment configuration (Step 3)
  payment_prices: PaymentPriceEntry[]; // Multiple payment types per category
  payment_engines: PaymentEngineConfig[]; // Payment collection methods per category
}

// ─── Wizard State ────────────────────────────────────────────────────────────

export interface WizardState {
  currentStep: WizardStep;

  // Step 1: Event Details
  eventDetails: {
    title: string;
    description: string;
    event_date: string;
    event_end_date?: string; // Optional end date for multi-day events
    start_time?: string; // Event start time (HH:MM format)
    end_time?: string; // Event end time (HH:MM format)
    venue?: string; // Venue name from Google Places
    location: string; // City/location (auto-filled from venue)
    age_restriction?: string; // Age restriction (e.g., "18+", "21+", "All Ages")
    ticket_link?: string; // Ticket purchase link
    application_deadline: string; // ISO date string - REQUIRED by backend
  };

  // Step 2: Applicant Categories
  applicationDetails: {
    applications: ApplicationRow[];
  };

  // Step 3: Payment Configuration
  paymentConfiguration: {
    currency: CurrencyCode; // Event-level currency (default 'USD')
    payment_deadline?: string; // ISO date string - Payment deadline for approved applicants
    payment_engines?: PaymentEngineConfig[]; // Event-level payment methods
    // Per-category pricing is stored on ApplicationRow.payment_prices
  };

  // Step 4: Email Customization (was Step 4 "Email Sequences")
  automaticMessages: {
    messages: unknown[]; // Future email template structure
    email_campaign_template_id?: number; // Selected event sequence template (for event-wide emails)
    use_category_templates?: boolean; // DEPRECATED - Use category-specific templates where available
    use_universal_category_template?: boolean; // Use universal template for all categories (simpler option)
    universal_category_template_id?: number | null; // Selected universal category template ID
  };

  // Step 5: Invite List
  inviteList: {
    selectedListIds: number[]; // Contact list IDs to use
    invitedContactIds: number[]; // Manually selected vendor contact IDs
    excludedContactIds: number[]; // Contact IDs to exclude from lists
  };

  // Step 6: Review Details (read-only, no stored data)
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface WizardStepProps {
  wizardState: WizardState;
  updateWizardState: (updates: Partial<WizardState>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isAdmin?: boolean;
}

export interface WizardNavigationProps {
  currentStep: WizardStep;
  canGoBack: boolean;
  canGoNext: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface WizardProgressProps {
  currentStep: WizardStep;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}
