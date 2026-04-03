// TypeScript interfaces for the 4-Step Event Creation Wizard

export interface ApplicationRow {
  id: string; // Temporary client-side ID (UUID)
  category_id?: number; // Category ID (linked to organization's categories)
  category_name?: string; // Category name for display
  name: string; // Application title (e.g., "Artist Booth") - kept for backward compatibility
  booth_price: number; // Price for this booth type
  description: string; // Optional description
  categories?: string[]; // Optional vendor categories (legacy - will be deprecated)
  install_date?: string; // Install date (ISO date string)
  install_start_time?: string; // Install start time (HH:MM format)
  install_end_time?: string; // Install end time (HH:MM format)
  payment_link?: string; // Payment link for this application
  application_tags?: string[]; // Tags for this application (stored as array in frontend, comma-separated in backend)
  prefilled_from_event?: string; // Event name this data was pre-filled from (for UI indicator)
  prefilled_from_event_id?: number; // Event ID this data was pre-filled from (for reference)
}

export interface WizardState {
  currentStep: 1 | 2 | 3 | 4;

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
    payment_deadline?: string; // ISO date string - Payment deadline for approved vendors
  };

  // Step 2: Application Details
  applicationDetails: {
    applications: ApplicationRow[];
  };

  // Step 3: Invite List
  inviteList: {
    selectedListIds: number[]; // Contact list IDs to use
    invitedContactIds: number[]; // Manually selected vendor contact IDs
    excludedContactIds: number[]; // Contact IDs to exclude from lists
  };

  // Step 4: Email Sequences
  automaticMessages: {
    messages: unknown[]; // Future email template structure
    email_campaign_template_id?: number; // Selected event sequence template (for event-wide emails)
    use_category_templates?: boolean; // DEPRECATED - Use category-specific templates where available
    use_universal_category_template?: boolean; // Use universal template for all categories (simpler option)
    universal_category_template_id?: number | null; // Selected universal category template ID
  };
}

export interface WizardStepProps {
  wizardState: WizardState;
  updateWizardState: (updates: Partial<WizardState>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isAdmin?: boolean;
}

export interface WizardNavigationProps {
  currentStep: 1 | 2 | 3 | 4;
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
  currentStep: 1 | 2 | 3 | 4;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}
