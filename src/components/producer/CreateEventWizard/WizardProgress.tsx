import { Check } from 'lucide-react';
import { WizardProgressProps } from './types';

const STEP_LABELS = [
  'Event Details',
  'Application Details',
  'Invite List',
  'Email Sequences',
];

export default function WizardProgress({
  currentStep,
  completedSteps,
  onStepClick,
}: WizardProgressProps) {
  const isStepCompleted = (step: number) => completedSteps.includes(step);
  const isStepCurrent = (step: number) => currentStep === step;
  const isStepClickable = (step: number) => isStepCompleted(step) || isStepCurrent(step);

  return (
    <div className="mb-8">
      {/* Mobile: Simple text indicator */}
      <div className="md:hidden text-center mb-4">
        <p className="text-foreground/60 text-sm">
          Step {currentStep} of 4: {STEP_LABELS[currentStep - 1]}
        </p>
      </div>

      {/* Desktop: Visual progress indicator */}
      <div className="hidden md:flex items-center justify-between max-w-4xl mx-auto">
        {[1, 2, 3, 4].map((step, index) => {
          const completed = isStepCompleted(step);
          const current = isStepCurrent(step);
          const clickable = isStepClickable(step);

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => clickable && onStepClick(step)}
                disabled={!clickable}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full
                  transition-all duration-300
                  ${
                    current
                      ? 'voxxy-btn-cta shadow-lg scale-110'
                      : completed
                      ? 'bg-background/20 text-foreground hover:bg-background/30'
                      : 'bg-background/5 text-foreground/40'
                  }
                  ${clickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                {completed && !current ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{step}</span>
                )}
              </button>

              {/* Step Label */}
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium transition-colors ${
                    current ? 'text-foreground' : completed ? 'text-foreground/80' : 'text-foreground/40'
                  }`}
                >
                  {STEP_LABELS[index]}
                </p>
              </div>

              {/* Connector Line */}
              {index < 3 && (
                <div className="flex-1 h-0.5 mx-4">
                  <div
                    className={`h-full transition-all duration-300 ${
                      completed ? 'bg-background/30' : 'bg-background/10'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
