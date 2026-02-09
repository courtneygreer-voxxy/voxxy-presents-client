/**
 * EmailPreviewModal - Event Creation Wizard
 *
 * This component now uses the shared EventEmailPreviewModal for consistency.
 * Includes category selector for emails with category-specific content.
 */

import EventEmailPreviewModal from '@/components/shared/EventEmailPreviewModal';
import type { ScheduledEmail, EmailTemplateItem } from '@/types/email';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: (ScheduledEmail | EmailTemplateItem) | null;
  eventSlug?: string;

  // Event wizard-specific: preview emails with real event data being created
  // Categories from the wizard's event configuration
  availableCategories?: Array<{ value: string; label: string }>;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  email,
  eventSlug,
  availableCategories,
}: EmailPreviewModalProps) {
  // Detect if email has category-specific variables
  const hasCategorySpecificContent = email
    ? (email.subject_template?.includes('[categoryPrice]') ||
       email.subject_template?.includes('[installTime]') ||
       email.body_template?.includes('[categoryPrice]') ||
       email.body_template?.includes('[installTime]'))
    : false;

  return (
    <EventEmailPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      email={email}
      eventSlug={eventSlug || ''}
      hasCategorySpecificContent={hasCategorySpecificContent}
      availableCategories={availableCategories}
    />
  );
}
