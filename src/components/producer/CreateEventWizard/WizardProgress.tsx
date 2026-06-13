import { Check } from 'lucide-react'
import { WizardProgressProps } from './types'

const STEP_LABELS = [
  'Event Details',
  'Applicant Categories',
  'Payment Config',
  'Email Customization',
  'Invite List',
  'Review Details',
]

const STEP_SHORT = ['Details', 'Categories', 'Payment', 'Email', 'Invites', 'Review']

export default function WizardProgress({
  currentStep,
  completedSteps,
  onStepClick,
}: WizardProgressProps) {
  const isStepCompleted = (step: number) => completedSteps.includes(step)
  const isStepCurrent = (step: number) => currentStep === step
  const isStepClickable = (step: number) => isStepCompleted(step) || isStepCurrent(step)
  const totalSteps = STEP_LABELS.length
  const fillRatio =
    totalSteps <= 1 ? 0 : Math.min(1, Math.max(0, (currentStep - 1) / (totalSteps - 1)))

  return (
    <div className="mb-3 max-w-5xl mx-auto">
      <div className="md:hidden text-center mb-2">
        <p className="text-foreground/60 text-xs">
          Step {currentStep} of {totalSteps}: {STEP_LABELS[currentStep - 1]}
        </p>
      </div>

      <div className="hidden md:block">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <p className="text-[10px] font-medium text-foreground/60">
            Step {currentStep} of {totalSteps}
          </p>
          <p className="text-[10px] text-foreground/45 truncate max-w-[55%] text-right">
            {STEP_LABELS[currentStep - 1]}
          </p>
        </div>

        {/* Track — uses muted in light mode so the unfilled portion is visible; dark gets the translucent body bg */}
        <div
          className="relative h-1.5 rounded-full overflow-hidden border bg-muted/60 border-border dark:bg-background/25 dark:border-white/10"
          aria-hidden
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full motion-safe:transition-[width] motion-safe:duration-500 ease-out shadow-sm shadow-primary/35"
            style={{
              width: `${fillRatio * 100}%`,
              backgroundImage: 'var(--voxxy-grad-brand)',
            }}
          />
        </div>

        <div className="mt-2 flex justify-between gap-1">
          {[1, 2, 3, 4, 5, 6].map((step) => {
            const completed = isStepCompleted(step)
            const current = isStepCurrent(step)
            const clickable = isStepClickable(step)
            const idx = step - 1

            return (
              <button
                key={step}
                type="button"
                onClick={() => clickable && onStepClick(step)}
                disabled={!clickable}
                title={STEP_LABELS[idx]}
                className={`
                  flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-md px-0.5 py-0.5 transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                  ${clickable ? 'cursor-pointer hover:bg-muted/50 dark:hover:bg-background/10' : 'cursor-not-allowed opacity-50'}
                `}
              >
                <span
                  className={`
                    flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all
                    ${
                      current
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/40 ring-offset-1 ring-offset-background scale-105'
                        : completed
                          ? 'bg-primary/20 text-primary dark:bg-primary/25 dark:text-foreground'
                          : 'bg-muted text-muted-foreground dark:bg-background/15 dark:text-foreground/35'
                    }
                  `}
                >
                  {completed && !current ? <Check className="w-3 h-3" /> : step}
                </span>
                <span
                  className={`hidden lg:block text-[9px] font-medium leading-tight text-center truncate w-full max-w-[5rem] ${
                    current
                      ? 'text-foreground'
                      : completed
                        ? 'text-foreground/80 dark:text-foreground/75'
                        : 'text-muted-foreground dark:text-foreground/40'
                  }`}
                >
                  {STEP_SHORT[idx]}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
