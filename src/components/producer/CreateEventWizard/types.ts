// TypeScript interfaces for the 4-Step Event Creation Wizard

export interface ApplicationRow {
  id: string; // Temporary client-side ID (UUID)
  name: string; // Application title (e.g., "Artist Booth")
  booth_price: number; // Price for this booth type
  description: string; // Optional description
  categories?: string[]; // Optional vendor categories (future use)
  install_date?: string; // Install date (ISO date string)
  install_start_time?: string; // Install start time (HH:MM format)
  install_end_time?: string; // Install end time (HH:MM format)
  payment_link?: string; // Payment link for this application
  application_tags?: string[]; // Tags for this application (stored as array in frontend, comma-separated in backend)
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

  // Step 4: Automatic Messages (placeholder for future)
  automaticMessages: {
    messages: unknown[]; // Future email template structure
  };
}

export interface WizardStepProps {
  wizardState: WizardState;
  updateWizardState: (updates: Partial<WizardState>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
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
