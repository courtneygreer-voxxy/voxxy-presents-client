import { ArrowLeft, ArrowRight } from 'lucide-react';
import { WizardNavigationProps } from './types';

export default function WizardNavigation({
  currentStep,
  canGoBack,
  canGoNext,
  canSubmit,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  onCancel,
}: WizardNavigationProps) {
  return (
    <div className="flex gap-4 mt-8">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-6 py-3 rounded-lg border border-border text-foreground hover:bg-background/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>

      <div className="flex-1" />

      {/* Back Button */}
      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground hover:bg-background/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Next Button */}
      {canGoNext && !canSubmit && (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 rounded-lg voxxy-btn-cta font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* Submit Button (Only on Step 4) */}
      {canSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-lg voxxy-btn-cta font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
              Creating Event...
            </span>
          ) : (
            'Create Event'
          )}
        </button>
      )}
    </div>
  );
}
