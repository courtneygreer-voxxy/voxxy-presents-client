/**
 * Centralized Error Monitoring Utility
 *
 * Provides Sentry integration for tracking form submissions, email deliveries,
 * and API errors across all Voxxy Presents forms. Supports event-level tracking
 * since each event can have 1-N vendor applications with different failure patterns.
 *
 * @module errorMonitoring
 */

import * as Sentry from '@sentry/react';

/**
 * Error severity levels matching Sentry's SeverityLevel type
 */
export enum ErrorSeverity {
  FATAL = 'fatal',        // Critical system failures
  ERROR = 'error',        // Payment forms, data loss
  WARNING = 'warning',    // Application forms, user-blocking issues
  INFO = 'info',          // Contact forms, non-blocking issues
  DEBUG = 'debug',        // Analytics, tracking failures
  LOG = 'log'             // Informational events
}

/**
 * Form types for categorizing errors
 */
export enum FormType {
  VENDOR_APPLICATION = 'vendor_application',
  CONTACT_FORM = 'contact_form',
  BUG_REPORT = 'bug_report',
  LOGIN = 'login',
  SIGNUP = 'signup',
  PASSWORD_RESET = 'password_reset',
  EVENT_CREATION = 'event_creation',
  EMAIL_CAMPAIGN = 'email_campaign'
}

/**
 * Email delivery status types
 */
export enum EmailDeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  SPAM = 'spam'
}

/**
 * Context data for form submission errors
 */
export interface FormErrorContext {
  formType: FormType;
  eventSlug?: string;
  eventId?: number;
  eventTitle?: string;
  applicationId?: number;
  applicationName?: string;
  userId?: string;
  userEmail?: string;

  // Form state
  formData?: Record<string, any>;
  validationErrors?: string[];

  // Submission details
  attemptNumber?: number;
  totalAttempts?: number;
  timeSinceFormStart?: number;

  // Error details
  httpStatus?: number;
  apiEndpoint?: string;
  errorMessage?: string;
  errorCode?: string;

  // Browser context
  userAgent?: string;
  viewport?: string;
  url?: string;
}

/**
 * Context data for email delivery errors
 */
export interface EmailErrorContext {
  emailId?: string;
  templateId?: string;
  templateName?: string;
  recipientEmail: string;
  recipientCount?: number;

  eventSlug?: string;
  eventId?: number;
  eventTitle?: string;
  applicationId?: number;
  registrationId?: number;

  // Email details
  emailType: 'registration_confirmation' | 'payment_confirmation' | 'event_update' | 'cancellation' | 'scheduled' | 'custom';
  subject?: string;

  // Delivery details
  status: EmailDeliveryStatus;
  provider: 'sendgrid' | 'internal';
  providerId?: string;
  bounceReason?: string;
  failureReason?: string;

  // Timing
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
}

/**
 * Initialize Sentry with Voxxy-specific configuration
 * Call this once in main.tsx before rendering the app
 */
export function initializeErrorMonitoring(): void {
  const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    console.warn('[Error Monitoring] Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,

    // Set sample rates based on environment
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Configure integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text and input content by default
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filter out expected errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed', // Too noisy, we track these separately
    ],

    // Add custom context to all events
    beforeSend(event, hint) {
      // Add Voxxy-specific context
      event.contexts = {
        ...event.contexts,
        voxxy: {
          version: '2.0',
          platform: 'web',
        },
      };
      return event;
    },
  });

  console.log(`[Error Monitoring] Initialized for environment: ${environment}`);
}

/**
 * Track form submission error with rich context
 * Use this in form onSubmit handlers when submission fails
 */
export function trackFormError(
  error: Error | string,
  context: FormErrorContext,
  severity: ErrorSeverity = ErrorSeverity.ERROR
): void {
  const errorMessage = typeof error === 'string' ? error : error.message;

  console.error(`[Form Error] ${context.formType}:`, errorMessage, context);

  Sentry.captureException(
    typeof error === 'string' ? new Error(error) : error,
    {
      level: severity as Sentry.SeverityLevel,
      tags: {
        form_type: context.formType,
        event_slug: context.eventSlug,
        application_id: context.applicationId?.toString(),
        http_status: context.httpStatus?.toString(),
      },
      contexts: {
        form_submission: {
          ...context,
          // Sanitize sensitive data
          formData: sanitizeFormData(context.formData),
        } as Record<string, any>,
      },
      fingerprint: [
        context.formType,
        context.eventSlug || 'no-event',
        context.applicationId?.toString() || 'no-app',
        context.httpStatus?.toString() || 'unknown-status',
      ],
    }
  );
}

/**
 * Track email delivery failure with rich context
 * Use this when emails fail to send or bounce
 */
export function trackEmailError(
  error: Error | string,
  context: EmailErrorContext,
  severity: ErrorSeverity = ErrorSeverity.ERROR
): void {
  const errorMessage = typeof error === 'string' ? error : error.message;

  console.error(`[Email Error] ${context.emailType}:`, errorMessage, context);

  Sentry.captureException(
    typeof error === 'string' ? new Error(error) : error,
    {
      level: severity as Sentry.SeverityLevel,
      tags: {
        email_type: context.emailType,
        email_status: context.status,
        event_slug: context.eventSlug,
        provider: context.provider,
      },
      contexts: {
        email_delivery: context as Record<string, any>,
      },
      fingerprint: [
        'email_failure',
        context.emailType,
        context.status,
        context.eventSlug || 'no-event',
      ],
    }
  );
}

/**
 * Track successful form submission for analytics
 * Use this to monitor form success rates
 */
export function trackFormSuccess(context: Omit<FormErrorContext, 'errorMessage' | 'errorCode'>): void {
  console.log(`[Form Success] ${context.formType}:`, context);

  Sentry.captureMessage(`Form submission successful: ${context.formType}`, {
    level: 'info',
    tags: {
      form_type: context.formType,
      event_slug: context.eventSlug,
      application_id: context.applicationId?.toString(),
    },
    contexts: {
      form_submission: {
        ...context,
        formData: sanitizeFormData(context.formData),
      },
    },
  });
}

/**
 * Track email delivery success for monitoring
 */
export function trackEmailSuccess(context: Omit<EmailErrorContext, 'failureReason' | 'bounceReason'>): void {
  console.log(`[Email Success] ${context.emailType}:`, context);

  Sentry.captureMessage(`Email delivered successfully: ${context.emailType}`, {
    level: 'info',
    tags: {
      email_type: context.emailType,
      event_slug: context.eventSlug,
    },
    contexts: {
      email_delivery: context,
    },
  });
}

/**
 * Set user context for error tracking
 * Call this after user login/authentication
 */
export function setUserContext(userId: string, email?: string, organizationId?: number): void {
  console.log('[Error Monitoring] User context set:', { userId, email, organizationId });

  Sentry.setUser({
    id: userId,
    email,
    organization_id: organizationId?.toString(),
  });
}

/**
 * Clear user context on logout
 */
export function clearUserContext(): void {
  console.log('[Error Monitoring] User context cleared');

  Sentry.setUser(null);
}

/**
 * Sanitize form data to remove sensitive fields before logging
 */
function sanitizeFormData(formData?: Record<string, any>): Record<string, any> | undefined {
  if (!formData) return undefined;

  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'ssn', 'creditCard', 'agreed_to_terms'];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(formData)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (key.toLowerCase().includes('email')) {
      // Mask email addresses
      sanitized[key] = typeof value === 'string' ? value.replace(/(.{2}).*(@.*)/, '$1***$2') : value;
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Helper to determine error severity based on form type
 */
export function getFormErrorSeverity(formType: FormType, httpStatus?: number): ErrorSeverity {
  // Fatal: Payment-related or data loss
  if (formType === FormType.EVENT_CREATION) {
    return ErrorSeverity.FATAL;
  }

  // Error: User-blocking issues
  if (formType === FormType.VENDOR_APPLICATION || formType === FormType.SIGNUP) {
    return httpStatus && httpStatus >= 500 ? ErrorSeverity.FATAL : ErrorSeverity.ERROR;
  }

  // Warning: Non-blocking issues
  if (formType === FormType.CONTACT_FORM || formType === FormType.BUG_REPORT) {
    return ErrorSeverity.WARNING;
  }

  // Info: Everything else
  return ErrorSeverity.INFO;
}

/**
 * Helper to determine email error severity based on type
 */
export function getEmailErrorSeverity(
  emailType: EmailErrorContext['emailType'],
  status: EmailDeliveryStatus
): ErrorSeverity {
  // Fatal: Payment confirmations must be delivered
  if (emailType === 'payment_confirmation') {
    return ErrorSeverity.FATAL;
  }

  // Error: Registration confirmations and cancellations are important
  if (emailType === 'registration_confirmation' || emailType === 'cancellation') {
    return status === EmailDeliveryStatus.BOUNCED ? ErrorSeverity.FATAL : ErrorSeverity.ERROR;
  }

  // Warning: Event updates and scheduled emails
  if (emailType === 'event_update' || emailType === 'scheduled') {
    return ErrorSeverity.WARNING;
  }

  // Info: Custom emails
  return ErrorSeverity.INFO;
}
