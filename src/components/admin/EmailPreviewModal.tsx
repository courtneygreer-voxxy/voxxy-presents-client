/**
 * EmailPreviewModal - Admin Panel
 *
 * This component now uses the shared TemplatePreviewModal for consistency.
 * Shows raw templates with [variables] since admin previews don't have event context.
 */

import TemplatePreviewModal from '@/components/shared/TemplatePreviewModal';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailName: string;
  emailHtml: string;
  loading: boolean;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  emailName,
  emailHtml,
  loading,
}: EmailPreviewModalProps) {
  // If still loading, show a simple loading state
  if (loading) {
    return (
      <TemplatePreviewModal
        isOpen={isOpen}
        onClose={onClose}
        template={{
          name: 'Loading...',
          subject_template: 'Loading preview...',
          body_template: 'Please wait while we load the email template.',
        }}
      />
    );
  }

  return (
    <TemplatePreviewModal
      isOpen={isOpen}
      onClose={onClose}
      template={{
        name: emailName,
        subject_template: emailHtml || 'No subject available',
        body_template: emailHtml || 'No content available',
      }}
    />
  );
}
