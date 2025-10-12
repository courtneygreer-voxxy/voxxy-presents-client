import { useCallback, useRef } from 'react';
import { analytics, FormProperties } from '@/lib/analytics';

export const useFormTracking = (formType: 'beta_access' | 'beta_request' | 'contact', pageName: string) => {
  const startTimeRef = useRef<number>();
  const fieldTimesRef = useRef<Record<string, number>>({});

  const trackFormStart = useCallback((formLocation?: string) => {
    startTimeRef.current = Date.now();

    analytics.trackFormStart({
      form_type: formType,
      page_name: pageName,
      form_location: formLocation,
    });
  }, [formType, pageName]);

  const trackFieldStart = useCallback((fieldName: string) => {
    fieldTimesRef.current[fieldName] = Date.now();
  }, []);

  const trackFieldComplete = useCallback((fieldName: string, fieldOrder: number) => {
    const startTime = fieldTimesRef.current[fieldName];
    const timeToComplete = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    analytics.trackFormFieldCompleted({
      form_type: formType,
      page_name: pageName,
      field_name: fieldName,
      field_order: fieldOrder,
      time_to_complete: timeToComplete,
    });
  }, [formType, pageName]);

  const trackFormSubmit = useCallback((formData?: FormProperties['form_data']) => {
    const completionTime = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0;

    analytics.trackFormSubmit({
      form_type: formType,
      page_name: pageName,
      form_data: formData,
      completion_time: completionTime,
    });
  }, [formType, pageName]);

  const trackFormError = useCallback((errorField: string, errorMessage: string, attemptNumber: number = 1) => {
    analytics.trackFormError({
      form_type: formType,
      page_name: pageName,
      error_field: errorField,
      error_message: errorMessage,
      attempt_number: attemptNumber,
    });
  }, [formType, pageName]);

  return {
    trackFormStart,
    trackFieldStart,
    trackFieldComplete,
    trackFormSubmit,
    trackFormError,
  };
};