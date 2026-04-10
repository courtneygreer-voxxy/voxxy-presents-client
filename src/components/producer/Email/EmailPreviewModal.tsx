/**
 * EmailPreviewModal - Wrapper for Command Center Mail Tab
 *
 * This component now uses the shared EventEmailPreviewModal for consistency
 * across all event email previews in the application.
 */

import { useState, useEffect } from 'react';
import EventEmailPreviewModal from '@/components/shared/EventEmailPreviewModal';
import type { ScheduledEmail } from '@/types/email';
import { eventsApi } from '@/services/api';
import { logger } from '@/utils/logger';

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
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);

  // Fetch event data to get vendor application categories
  useEffect(() => {
    if (isOpen && eventSlug) {
      loadEventCategories();
    }
  }, [isOpen, eventSlug]);

  const loadEventCategories = async () => {
    try {
      const eventData = await eventsApi.getById(eventSlug);

      // Extract unique categories from vendor applications
      const uniqueCategories = new Set<string>();
      if (eventData.vendor_applications) {
        eventData.vendor_applications.forEach((app: any) => {
          if (app.categories && Array.isArray(app.categories)) {
            app.categories.forEach((cat: string) => uniqueCategories.add(cat));
          }
        });
      }

      // Convert to dropdown format
      const categoryOptions = Array.from(uniqueCategories)
        .sort()
        .map((cat) => ({
          value: cat,
          label: cat.split('_').map((word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
        }));

      setCategories(categoryOptions);
    } catch (err) {
      logger.error('Failed to load event categories', { eventSlug, error: err });
      // Fallback to empty array - will use default categories in EventEmailPreviewModal
      setCategories([]);
    }
  };

  // Detect if email has category-specific variables
  const hasCategorySpecificContent = email?.body_template?.includes('[category') ||
                                      email?.subject_template?.includes('[category');

  return (
    <EventEmailPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      email={email}
      eventSlug={eventSlug}
      hasCategorySpecificContent={hasCategorySpecificContent}
      availableCategories={categories.length > 0 ? categories : undefined}
    />
  );
}
