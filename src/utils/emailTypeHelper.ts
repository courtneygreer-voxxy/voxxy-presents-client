/**
 * Helper to get email type category from trigger type
 * Returns color-coded badge information matching the email type
 */
export const getEmailTypeInfo = (triggerType: string) => {
  // Map trigger types to their email type categories
  // Must match backend groupings in EmailTemplateItem::EVENT_WIDE_TRIGGERS and CATEGORY_SPECIFIC_TRIGGERS
  const TRIGGER_TO_EMAIL_TYPE: Record<string, { label: string; color: string }> = {
    // Event Announcements (purple) - Sent to invitations/contacts (people who haven't applied)
    'on_invitation_send': {
      label: 'Event Announcement',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    'days_before_deadline': {
      label: 'Event Announcement',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    'days_after_deadline': {
      label: 'Event Announcement',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    'on_bulletin_post': {
      label: 'Event Announcement',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    'on_event_update': {
      label: 'Event Announcement',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    'on_event_cancel': {
      label: 'Event Announcement',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },

    // Application Updates (pink) - Sent to registrations (people who already applied)
    'on_application_submit': {
      label: 'Application',
      color: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    },
    'on_application_open': {
      label: 'Application',
      color: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    },
    'on_approval': {
      label: 'Application',
      color: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    },
    'on_rejection': {
      label: 'Application',
      color: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    },
    'on_waitlist': {
      label: 'Application',
      color: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    },
    'on_category_change': {
      label: 'Application',
      color: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    },

    // Payment Reminders (blue)
    'days_before_payment_deadline': {
      label: 'Payment',
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    'on_payment_deadline': {
      label: 'Payment',
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    'days_after_payment_deadline': {
      label: 'Payment',
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    'on_payment_received': {
      label: 'Payment',
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },

    // Event Countdown (green)
    'days_before_event': {
      label: 'Event Countdown',
      color: 'bg-green-500/20 text-green-300 border-green-500/30'
    },
    'on_event_date': {
      label: 'Event Countdown',
      color: 'bg-green-500/20 text-green-300 border-green-500/30'
    },
    'days_after_event': {
      label: 'Event Countdown',
      color: 'bg-green-500/20 text-green-300 border-green-500/30'
    },
  };

  const emailTypeInfo = TRIGGER_TO_EMAIL_TYPE[triggerType];

  if (emailTypeInfo) {
    return emailTypeInfo;
  }

  // Default fallback
  return {
    label: 'Other',
    color: 'bg-white/10 text-white/60 border-white/20',
  };
};
