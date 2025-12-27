// TypeScript interfaces for the 4-Step Event Creation Wizard

export interface ApplicationRow {
  id: string; // Temporary client-side ID (UUID)
  name: string; // Application title (e.g., "Artist Booth")
  booth_price: number; // Price for this booth type
  description: string; // Optional description
  categories?: string[]; // Optional vendor categories (future use)
}

export interface WizardState {
  currentStep: 1 | 2 | 3 | 4;

  // Step 1: Event Details
  eventDetails: {
    title: string;
    description: string;
    event_date: string;
    application_deadline: string; // ISO date string - REQUIRED by backend
    location: string;
  };

  // Step 2: Application Details
  applicationDetails: {
    applications: ApplicationRow[];
  };

  // Step 3: Invite List
  inviteList: {
    invitedContactIds: number[]; // Vendor contact IDs to invite
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
