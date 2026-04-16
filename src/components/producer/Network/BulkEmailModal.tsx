import { useState } from 'react';
import { X, Mail, Send, Users, CheckCircle2 } from 'lucide-react';
import { vendorContactsApi, VendorContact } from '@/services/api';

interface BulkEmailModalProps {
  contacts: VendorContact[];
  selectedContactIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkEmailModal({
  contacts,
  selectedContactIds,
  onClose,
  onSuccess,
}: BulkEmailModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  // Get selected contacts
  const selectedContacts = contacts.filter(c => selectedContactIds.includes(c.id));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (selectedContacts.length === 0) {
      newErrors.recipients = 'No recipients selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSending(true);
    try {
      await vendorContactsApi.bulkEmail(selectedContactIds, {
        subject: formData.subject,
        message: formData.message,
      });

      // Show success state
      setShowSuccess(true);

      // Close after 2 seconds
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to send emails' });
      setIsSending(false);
    }
  };

  // Success state
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-muted rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Emails Sent!</h3>
          <p className="text-foreground/60">
            Successfully sent email to {selectedContacts.length} {selectedContacts.length === 1 ? 'contact' : 'contacts'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-muted rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-muted border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Send Email</h2>
              <p className="text-foreground/60 text-sm mt-0.5">
                {selectedContacts.length} {selectedContacts.length === 1 ? 'recipient' : 'recipients'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="text-foreground/60 hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Recipients Section */}
          <div>
            <label className="block text-foreground/90 font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Recipients
            </label>
            <div className="bg-background/5 rounded-lg border border-border p-4 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {selectedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between py-2 px-3 bg-background/5 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {contact.contact_name}
                      </p>
                      <p className="text-xs text-foreground/60 truncate">
                        {contact.email}
                      </p>
                    </div>
                    {contact.business_name && (
                      <span className="text-xs text-foreground/40 ml-2">
                        {contact.business_name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {errors.recipients && (
              <p className="mt-2 text-sm text-red-400">{errors.recipients}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-foreground/90 font-medium mb-2">
              Subject *
            </label>
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Invitation: Summer Art Market"
              disabled={isSending}
              className={`w-full px-4 py-3 rounded-lg bg-background/5 border ${
                errors.subject ? 'border-red-500' : 'border-border'
              } text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50`}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-400">{errors.subject}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-foreground/90 font-medium mb-2">
              Message *
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Hi there,&#10;&#10;We're hosting our Summer Art Market on June 15th and would love to have you join us as a vendor!&#10;&#10;Please let me know if you're interested.&#10;&#10;Best regards"
              rows={10}
              disabled={isSending}
              className={`w-full px-4 py-3 rounded-lg bg-background/5 border ${
                errors.message ? 'border-red-500' : 'border-border'
              } text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none disabled:opacity-50`}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-400">{errors.message}</p>
            )}
            <p className="mt-2 text-xs text-foreground/40">
              Tip: Personalize your message to increase engagement
            </p>
          </div>

          {/* Email Preview Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Email will be sent from your organization</p>
                <p className="text-blue-300/80">
                  Recipients will receive this as a bulk email. Consider personalizing the message for better engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="flex-1 px-6 py-3 rounded-lg border border-border text-foreground hover:bg-background/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex-1 px-6 py-3 rounded-lg voxxy-btn-cta font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <span className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
