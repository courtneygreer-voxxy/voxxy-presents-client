import { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { OnboardingStep } from '@/hooks/useOnboarding'

interface OnboardingGuideProps {
  step: OnboardingStep
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

export function OnboardingGuide({
  step,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: OnboardingGuideProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)

  const updateTargetRect = useCallback(() => {
    const el = document.querySelector(step.targetSelector)
    if (el) {
      const rect = el.getBoundingClientRect()
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
    } else {
      console.warn(`[OnboardingGuide] Target not found: ${step.targetSelector}`)
      setTargetRect(null)
    }
  }, [step.targetSelector])

  useEffect(() => {
    const timer = setTimeout(updateTargetRect, 200)
    window.addEventListener('resize', updateTargetRect)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateTargetRect)
    }
  }, [updateTargetRect])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip()
      if (e.key === 'ArrowRight' || e.key === 'Enter') onNext()
      if (e.key === 'ArrowLeft') onBack()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNext, onBack, onSkip])

  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0
  const placement = step.placement || 'bottom'

  // Calculate tooltip position, clamped to viewport
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' }
    }

    const padding = 16
    const tooltipWidth = 320
    const tooltipHeight = 200 // approximate
    const vw = window.innerWidth
    const vh = window.innerHeight

    let top: number
    let left: number

    switch (placement) {
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
        left = targetRect.left + targetRect.width + padding
        break
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
        left = targetRect.left - tooltipWidth - padding
        break
      case 'top':
        top = targetRect.top - tooltipHeight - padding
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        break
      case 'bottom':
      default:
        top = targetRect.top + targetRect.height + padding
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        break
    }

    // Clamp to viewport
    top = Math.max(16, Math.min(top, vh - tooltipHeight - 16))
    left = Math.max(16, Math.min(left, vw - tooltipWidth - 16))

    return { position: 'fixed', top, left }
  }

  return (
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-label="Onboarding guide">
      {/* Dark overlay backdrop - no click-to-dismiss */}
      <div className="voxxy-overlay-scrim absolute inset-0 pointer-events-none" />

      {/* Spotlight ring on target */}
      {targetRect && (
        <div
          className="fixed border-2 border-primary rounded-lg pointer-events-none animate-pulse"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            zIndex: 2,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5), 0 0 20px rgba(168, 85, 247, 0.4)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="w-[320px] bg-muted border border-primary/30 rounded-xl shadow-2xl shadow-primary/10"
        style={{ ...getTooltipStyle(), zIndex: 10 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-xs text-slate-800 dark:text-primary font-medium">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="p-1 rounded-lg text-foreground/40 hover:text-foreground hover:bg-background/10 transition-colors"
            aria-label="Skip guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
          <p className="text-xs text-foreground/60 leading-relaxed">{step.description}</p>
        </div>

        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentStep ? 'bg-primary dark:bg-primary' : 'bg-background/20'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 pb-4">
          <button
            onClick={onBack}
            disabled={isFirstStep}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-background/5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium voxxy-btn-solid rounded-lg transition-colors"
          >
            {isLastStep ? 'Done' : 'Next'}
            {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
