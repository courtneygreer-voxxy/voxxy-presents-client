import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'voxxy_onboarding_';

function getCompletedKey(guideId: string) {
  return `${STORAGE_PREFIX}${guideId}_completed`;
}

export interface OnboardingStep {
  title: string;
  description: string;
  targetSelector: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface UseOnboardingReturn {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  step: OnboardingStep | null;
  start: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  complete: () => void;
  reset: () => void;
  isCompleted: boolean;
}

export function useOnboarding(guideId: string, steps: OnboardingStep[]): UseOnboardingReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isCompleted = (() => {
    try {
      return localStorage.getItem(getCompletedKey(guideId)) === 'true';
    } catch {
      return false;
    }
  })();

  const markCompleted = useCallback(() => {
    try {
      localStorage.setItem(getCompletedKey(guideId), 'true');
    } catch {
      // localStorage not available
    }
  }, [guideId]);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Last step — complete
      setIsActive(false);
      markCompleted();
    }
  }, [currentStep, steps.length, markCompleted]);

  const back = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsActive(false);
    markCompleted();
  }, [markCompleted]);

  const complete = useCallback(() => {
    setIsActive(false);
    markCompleted();
  }, [markCompleted]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(getCompletedKey(guideId));
    } catch {
      // localStorage not available
    }
    setCurrentStep(0);
    setIsActive(false);
  }, [guideId]);

  return {
    isActive,
    currentStep,
    totalSteps: steps.length,
    step: isActive ? steps[currentStep] || null : null,
    start,
    next,
    back,
    skip,
    complete,
    reset,
    isCompleted,
  };
}
