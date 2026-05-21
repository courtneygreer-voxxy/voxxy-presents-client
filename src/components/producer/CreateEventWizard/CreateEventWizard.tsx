import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { WizardState, WizardStep } from './types';
import WizardProgress from './WizardProgress';
import WizardNavigation from './WizardNavigation';
import Step1EventDetails from './steps/Step1EventDetails';
import Step2ApplicationDetails from './steps/Step2ApplicationDetails';
import Step3PaymentConfig from './steps/Step3PaymentConfig';
import Step4AutoMessages from './steps/Step4AutoMessages';
import Step3InviteList from './steps/Step3InviteList';
import Step6ReviewDetails from './steps/Step6ReviewDetails';
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
    },
    applicationDetails: {
      applications: [],
    },
    paymentConfiguration: {
      currency: 'USD',
    },
    automaticMessages: {
      messages: [],
      email_campaign_template_id: undefined,
      use_category_templates: false,
      use_universal_category_template: true,
      universal_category_template_id: undefined,
    },
    inviteList: {
      selectedListIds: [],
      invitedContactIds: [],
      excludedContactIds: [],
    },
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateWizardState = (updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
  };

  // ─── Validation Functions ──────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { eventDetails } = wizardState;

    if (!eventDetails.title.trim()) {
      newErrors.title = 'Event name is required';
    } else if (eventDetails.title.trim().length < 3) {
      newErrors.title = 'Event name must be at least 3 characters';
    } else {
      const alphanumericCount = (eventDetails.title.match(/[a-zA-Z0-9]/g) || []).length;
      if (alphanumericCount < 3) {
        newErrors.title = 'Event name must contain at least 3 letters or numbers';
      }
    }

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

    if (eventDetails.event_end_date && eventDetails.event_date) {
      const startDate = new Date(eventDetails.event_date);
      const endDate = new Date(eventDetails.event_end_date);
      if (endDate < startDate) {
        newErrors.event_end_date = 'End date must be on or after the start date';
      }
    }

    if (!eventDetails.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!eventDetails.application_deadline) {
      newErrors.application_deadline = 'Application deadline is required';
    } else if (eventDetails.event_date) {
      const deadline = new Date(eventDetails.application_deadline);
      const eventDate = new Date(eventDetails.event_date);
      if (deadline > eventDate) {
        newErrors.application_deadline = 'Application deadline must be on or before the event date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { applicationDetails } = wizardState;

    if (applicationDetails.applications.length === 0) {
      newErrors.applications = 'At least one applicant category is required';
    } else {
      const titles = new Set<string>();
      applicationDetails.applications.forEach((app) => {
        if (!app.name.trim()) {
          newErrors[`application_${app.id}_name`] = 'Title is required';
        } else if (titles.has(app.name.trim().toLowerCase())) {
          newErrors[`application_${app.id}_name`] = 'Duplicate title - each must be unique';
        } else {
          titles.add(app.name.trim().toLowerCase());
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { applicationDetails, paymentConfiguration } = wizardState;

    // Payment deadline is required for scheduled payment emails
    if (!paymentConfiguration.payment_deadline) {
      newErrors.payment_deadline = 'Payment deadline is required';
    }

    // Validate each category has at least one payment type with amount > 0
    applicationDetails.applications.forEach((app) => {
      if (app.payment_prices.length === 0) {
        newErrors[`payment_category_${app.id}`] = 'At least one fee type is required';
      } else {
        app.payment_prices.forEach((entry, index) => {
          if (!entry.amount || entry.amount <= 0) {
            newErrors[`payment_${app.id}_${index}`] = `${entry.is_percentage ? 'Percentage' : 'Amount'} must be greater than 0`;
          }
          if (entry.is_percentage && entry.amount > 100) {
            newErrors[`payment_${app.id}_${index}`] = 'Percentage cannot exceed 100%';
          }
          if (entry.type === 'early_bird_price') {
            if (!entry.early_bird_deadline) {
              newErrors[`payment_${app.id}_${index}_deadline`] = 'Early bird deadline is required';
            } else if (paymentConfiguration.payment_deadline) {
              const ebDeadline = new Date(entry.early_bird_deadline);
              const payDeadline = new Date(paymentConfiguration.payment_deadline);
              if (ebDeadline > payDeadline) {
                newErrors[`payment_${app.id}_${index}_deadline`] = 'Early bird deadline must be before payment deadline';
              }
            }
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    // Email customization is optional
    return true;
  };

  const validateStep5 = (): boolean => {
    // Invite list is optional
    return true;
  };

  const validateStep6 = (): boolean => {
    // Review is always valid
    return true;
  };

  const validateCurrentStep = (): boolean => {
    switch (wizardState.currentStep) {
      case 1: return validateStep1();
      case 2: return validateStep2();
      case 3: return validateStep3();
      case 4: return validateStep4();
      case 5: return validateStep5();
      case 6: return validateStep6();
      default: return false;
    }
  };

  // ─── Navigation ────────────────────────────────────────────────────

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (!completedSteps.includes(wizardState.currentStep)) {
      setCompletedSteps([...completedSteps, wizardState.currentStep]);
    }

    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.min(6, prev.currentStep + 1) as WizardStep,
    }));
    setErrors({});
  };

  const handleBack = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1) as WizardStep,
    }));
    setErrors({});
  };

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step) || step === wizardState.currentStep) {
      setWizardState((prev) => ({
        ...prev,
        currentStep: step as WizardStep,
      }));
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    // Validate each step once, capturing the results to avoid double side-effects
    const step1Valid = validateStep1();
    const step2Valid = validateStep2();
    const step3Valid = validateStep3();

    if (!step1Valid || !step2Valid || !step3Valid) {
      // Jump to first failing step (errors already set by the validate call above)
      if (!step1Valid) {
        setWizardState((prev) => ({ ...prev, currentStep: 1 }));
      } else if (!step2Valid) {
        setWizardState((prev) => ({ ...prev, currentStep: 2 }));
      } else {
        setWizardState((prev) => ({ ...prev, currentStep: 3 }));
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(wizardState);
    } catch (error: any) {
      console.error('Failed to create event:', error);

      const errorMessage = error?.response?.data?.errors?.[0]
        || error?.message
        || 'Failed to create event. Please try again.';

      setErrors({
        submit: errorMessage.includes('taken') || errorMessage.includes('duplicate')
          ? 'An event with this name already exists. Please choose a different name.'
          : errorMessage
      });

      setWizardState((prev) => ({ ...prev, currentStep: 1 }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Step Rendering ────────────────────────────────────────────────

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
        return <Step3PaymentConfig {...stepProps} organizationId={organizationId} />;
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
              Array.from(
                new Map(
                  wizardState.applicationDetails.applications
                    .filter(app => app.category_id && app.category_name)
                    .map(app => [app.category_id, {
                      id: app.category_id!,
                      name: app.category_name!,
                      icon: app.category_icon,
                      color: app.category_color,
                      email_campaign_template_id: app.category_email_campaign_template_id
                    }])
                ).values()
              )
            }
            eventDate={wizardState.eventDetails.event_date}
            applicationDeadline={wizardState.eventDetails.application_deadline}
            paymentDeadline={wizardState.paymentConfiguration.payment_deadline}
            isAdmin={isAdmin}
          />
        );
      case 5:
        return <Step3InviteList {...stepProps} organizationId={organizationId} />;
      case 6:
        return <Step6ReviewDetails {...stepProps} onStepClick={handleStepClick} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-2 pb-8">
      {/* Back Button */}
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-foreground/60 hover:text-foreground mb-2 transition-colors text-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Events
      </button>

      {/* Header */}
      <div className="mb-2 flex items-baseline gap-3">
        <h1 className="text-xl font-bold text-foreground">Create New Event</h1>
        <p className="text-foreground/50 text-xs">
          Follow the steps to set up your event and applicant categories
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
        <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-xs">{errors.submit}</p>
        </div>
      )}

      {/* Current Step Content */}
      <div className="glass-card p-4 md:p-5">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      <WizardNavigation
        currentStep={wizardState.currentStep}
        canGoBack={wizardState.currentStep > 1}
        canGoNext={wizardState.currentStep < 6}
        canSubmit={wizardState.currentStep === 6}
        isSubmitting={isSubmitting}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  );
}
