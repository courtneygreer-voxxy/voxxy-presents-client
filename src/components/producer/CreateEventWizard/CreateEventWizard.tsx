import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { WizardState } from './types';
import WizardProgress from './WizardProgress';
import WizardNavigation from './WizardNavigation';
import Step1EventDetails from './steps/Step1EventDetails';
import Step2ApplicationDetails from './steps/Step2ApplicationDetails';
import Step3InviteList from './steps/Step3InviteList';
import Step4AutoMessages from './steps/Step4AutoMessages';
import { useAuth } from '@/contexts/AuthContext';

interface CreateEventWizardProps {
  onCancel: () => void;
  onSubmit: (wizardState: WizardState) => Promise<void>;
  organizationId: number;
}

export default function CreateEventWizard({ onCancel, onSubmit, organizationId }: CreateEventWizardProps) {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 1,
    eventDetails: {
      title: '',
      description: '',
      event_date: '',
      event_end_date: '',
      start_time: '',
      end_time: '',
      venue: '',
      location: '',
      age_restriction: '',
      ticket_link: '',
      application_deadline: '',
      payment_deadline: '',
    },
    applicationDetails: {
      applications: [],
    },
    inviteList: {
      selectedListIds: [],
      invitedContactIds: [],
      excludedContactIds: [],
    },
    automaticMessages: {
      messages: [],
      email_campaign_template_id: undefined,
      use_category_templates: false,
      use_universal_category_template: false,
      universal_category_template_id: undefined,
    },
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateWizardState = (updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
  };

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { eventDetails } = wizardState;

    // Event name (required)
    if (!eventDetails.title.trim()) {
      newErrors.title = 'Event name is required';
    } else if (eventDetails.title.trim().length < 3) {
      newErrors.title = 'Event name must be at least 3 characters';
    }

    // Event date (required)
    if (!eventDetails.event_date) {
      newErrors.event_date = 'Event date is required';
    } else {
      const eventDate = new Date(eventDetails.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        newErrors.event_date = 'Event date must be in the future';
      }
    }

    // End date validation (if provided, must be after start date)
    if (eventDetails.event_end_date && eventDetails.event_date) {
      const startDate = new Date(eventDetails.event_date);
      const endDate = new Date(eventDetails.event_end_date);
      if (endDate < startDate) {
        newErrors.event_end_date = 'End date must be on or after the start date';
      }
    }

    // Location (required)
    if (!eventDetails.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Description is now optional - no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { applicationDetails, eventDetails } = wizardState;

    // Application deadline (required)
    if (!eventDetails.application_deadline) {
      newErrors.application_deadline = 'Application deadline is required';
    } else if (eventDetails.event_date) {
      const deadline = new Date(eventDetails.application_deadline);
      const eventDate = new Date(eventDetails.event_date);
      if (deadline > eventDate) {
        newErrors.application_deadline = 'Application deadline must be on or before the event date';
      }
    }

    // Validate at least 1 application
    if (applicationDetails.applications.length === 0) {
      newErrors.applications = 'At least one application type is required';
    } else {
      // Validate each application
      const titles = new Set<string>();

      applicationDetails.applications.forEach((app) => {
        // Validate title
        if (!app.name.trim()) {
          newErrors[`application_${app.id}_name`] = 'Title is required';
        } else if (titles.has(app.name.trim().toLowerCase())) {
          newErrors[`application_${app.id}_name`] = 'Duplicate title - each must be unique';
        } else {
          titles.add(app.name.trim().toLowerCase());
        }

        // Validate booth price
        if (!app.booth_price || app.booth_price <= 0) {
          newErrors[`application_${app.id}_booth_price`] = 'Price must be greater than $0';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    // Placeholder step - always valid
    return true;
  };

  const validateStep4 = (): boolean => {
    // Placeholder step - always valid
    return true;
  };

  const validateCurrentStep = (): boolean => {
    switch (wizardState.currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      case 4:
        return validateStep4();
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(wizardState.currentStep)) {
      setCompletedSteps([...completedSteps, wizardState.currentStep]);
    }

    // Move to next step
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.min(4, prev.currentStep + 1) as 1 | 2 | 3 | 4,
    }));

    // Clear errors
    setErrors({});
  };

  const handleBack = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1) as 1 | 2 | 3 | 4,
    }));
    setErrors({});
  };

  const handleStepClick = (step: number) => {
    // Only allow clicking on completed steps or current step
    if (completedSteps.includes(step) || step === wizardState.currentStep) {
      setWizardState((prev) => ({
        ...prev,
        currentStep: step as 1 | 2 | 3 | 4,
      }));
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submission
    if (!validateStep1() || !validateStep2()) {
      setWizardState((prev) => ({ ...prev, currentStep: 1 }));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(wizardState);
    } catch (error: any) {
      console.error('Failed to create event:', error);

      // Display error message to user
      const errorMessage = error?.response?.data?.errors?.[0]
        || error?.message
        || 'Failed to create event. Please try again.';

      setErrors({
        submit: errorMessage.includes('taken') || errorMessage.includes('duplicate')
          ? 'An event with this name already exists. Please choose a different name.'
          : errorMessage
      });

      // Go back to step 1 so user can fix the title
      setWizardState((prev) => ({ ...prev, currentStep: 1 }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      wizardState,
      updateWizardState,
      errors,
      setErrors,
      isAdmin,
    };

    switch (wizardState.currentStep) {
      case 1:
        return <Step1EventDetails {...stepProps} />;
      case 2:
        return <Step2ApplicationDetails {...stepProps} organizationId={organizationId} />;
      case 3:
        return <Step3InviteList {...stepProps} organizationId={organizationId} />;
      case 4:
        return (
          <Step4AutoMessages
            selectedTemplateId={wizardState.automaticMessages.email_campaign_template_id}
            onTemplateSelect={(templateId) => {
              setWizardState((prev) => ({
                ...prev,
                automaticMessages: {
                  ...prev.automaticMessages,
                  email_campaign_template_id: templateId || undefined,
                },
              }));
            }}
            useCategoryTemplates={wizardState.automaticMessages.use_category_templates}
            onUseCategoryTemplatesChange={(value) => {
              setWizardState((prev) => ({
                ...prev,
                automaticMessages: {
                  ...prev.automaticMessages,
                  use_category_templates: value,
                },
              }));
            }}
            useUniversalCategoryTemplate={wizardState.automaticMessages.use_universal_category_template}
            onUseUniversalCategoryTemplateChange={(value) => {
              setWizardState((prev) => ({
                ...prev,
                automaticMessages: {
                  ...prev.automaticMessages,
                  use_universal_category_template: value,
                },
              }));
            }}
            universalCategoryTemplateId={wizardState.automaticMessages.universal_category_template_id}
            onUniversalCategoryTemplateIdChange={(templateId) => {
              setWizardState((prev) => ({
                ...prev,
                automaticMessages: {
                  ...prev.automaticMessages,
                  universal_category_template_id: templateId,
                },
              }));
            }}
            eventCategories={
              // Extract unique categories from applications
              Array.from(
                new Map(
                  wizardState.applicationDetails.applications
                    .filter(app => app.category_id && app.category_name)
                    .map(app => [app.category_id, {
                      id: app.category_id!,
                      name: app.category_name!,
                      icon: undefined // Icon not available in ApplicationRow
                    }])
                ).values()
              )
            }
            eventDate={wizardState.eventDetails.event_date}
            applicationDeadline={wizardState.eventDetails.application_deadline}
            paymentDeadline={wizardState.eventDetails.payment_deadline}
            isAdmin={isAdmin}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Create New Event</h1>
        <p className="text-white/60">
          Follow the steps to set up your event and vendor applications
        </p>
      </div>

      {/* Progress Indicator */}
      <WizardProgress
        currentStep={wizardState.currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Submit Error Display */}
      {errors.submit && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Current Step Content */}
      {renderCurrentStep()}

      {/* Navigation Buttons */}
      <WizardNavigation
        currentStep={wizardState.currentStep}
        canGoBack={wizardState.currentStep > 1}
        canGoNext={wizardState.currentStep < 4}
        canSubmit={wizardState.currentStep === 4}
        isSubmitting={isSubmitting}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  );
}
