/**
 * EmailPreviewModal - Wrapper for Command Center Mail Tab
 *
 * This component now uses the shared EventEmailPreviewModal for consistency
 * across all event email previews in the application.
 */

import EventEmailPreviewModal from '@/components/shared/EventEmailPreviewModal';
import type { ScheduledEmail } from '@/types/email';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: ScheduledEmail | null;
  eventSlug: string;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  email,
  eventSlug,
}: EmailPreviewModalProps) {
  return (
    <EventEmailPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      email={email}
      eventSlug={eventSlug}
      hasCategorySpecificContent={false} // Can be enhanced to detect category-specific variables
    />
  );
}
