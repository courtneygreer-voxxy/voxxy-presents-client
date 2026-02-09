import { useState, useEffect } from 'react';
import { Mail, ChevronDown, ChevronUp, Eye, Edit, Users, Plus, Calendar, Clock } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { emailCampaignTemplatesApi } from '@/services/api';
import type { EmailCampaignTemplate, EmailTemplateItem, EmailCategory } from '@/types/email';
import ImportTemplateModal from '../ImportTemplateModal';
import TemplatePreviewModal from '@/components/shared/TemplatePreviewModal';

interface Step4AutoMessagesProps {
  selectedTemplateId?: number | null;
  onTemplateSelect?: (templateId: number | null) => void;
  eventDate?: string;
  applicationDeadline?: string;
  paymentDeadline?: string;
}

// Category display names and order
const CATEGORY_CONFIG: Record<EmailCategory, { label: string; order: number }> = {
  pre_application: { label: 'Event Announcements', order: 1 },
  application: { label: 'Application Updates', order: 2 },
  payment: { label: 'Payment Reminders', order: 3 },
  pre_event: { label: 'Event Countdown', order: 4 },
  event_day: { label: 'Event Day', order: 5 },
  post_event: { label: 'Post Event', order: 6 },
  system: { label: 'Automatic System Emails', order: 7 },
};

// Map trigger types to readable labels
const getTriggerLabel = (triggerType: string, triggerValue: number | null): string => {
  switch (triggerType) {
    case 'days_before_event':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} before event`;
    case 'days_after_event':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} after event`;
    case 'days_before_deadline':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} before payment deadline`;
    case 'on_application_open':
      return 'When applications open';
    case 'on_application_submit':
      return 'On application submission';
    case 'on_approval':
      return 'On application approval';
    case 'on_payment_deadline':
      return 'On payment deadline';
    case 'on_event_date':
      return 'On event day';
    default:
      return 'Auto';
  }
};

// Calculate when an email will be sent based on trigger
const calculateSendDate = (
  triggerType: string,
  triggerValue: number | null,
  eventDate?: string,
  applicationDeadline?: string,
  paymentDeadline?: string
): string | null => {
  if (!eventDate) return null;

  try {
    const eventDateObj = new Date(eventDate);

    switch (triggerType) {
      case 'days_before_event':
        if (triggerValue === null) return null;
        return format(subDays(eventDateObj, triggerValue), 'MMM d, yyyy');
      case 'days_after_event':
        if (triggerValue === null) return null;
        return format(addDays(eventDateObj, triggerValue), 'MMM d, yyyy');
      case 'days_before_deadline':
        if (triggerValue === null || !paymentDeadline) return null;
        return format(subDays(new Date(paymentDeadline), triggerValue), 'MMM d, yyyy');
      case 'on_application_open':
        return applicationDeadline ? format(new Date(applicationDeadline), 'MMM d, yyyy') : null;
      case 'on_event_date':
        return format(eventDateObj, 'MMM d, yyyy');
      case 'on_payment_deadline':
        return paymentDeadline ? format(new Date(paymentDeadline), 'MMM d, yyyy') : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
};

export default function Step4AutoMessages({
  selectedTemplateId = null,
  onTemplateSelect,
  eventDate,
  applicationDeadline,
  paymentDeadline
}: Step4AutoMessagesProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailTemplateItem | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [emailItems, setEmailItems] = useState<EmailTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDefaultTemplate();
  }, []);

  const fetchDefaultTemplate = async () => {
    try {
      setLoading(true);
      const templates = await emailCampaignTemplatesApi.getAll();
      const defaultTemplate = templates.find((t) => t.is_default && t.template_type === 'system');

      if (defaultTemplate) {
        // Fetch full template with email items
        const fullTemplate = await emailCampaignTemplatesApi.getById(defaultTemplate.id);
        setSelectedTemplate(fullTemplate);
        setEmailItems(fullTemplate.email_template_items || []);

        if (onTemplateSelect && !selectedTemplateId) {
          onTemplateSelect(fullTemplate.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template: EmailCampaignTemplate) => {
    try {
      setLoading(true);
      const fullTemplate = await emailCampaignTemplatesApi.getById(template.id);
      setSelectedTemplate(fullTemplate);
      setEmailItems(fullTemplate.email_template_items || []);

      if (onTemplateSelect) {
        onTemplateSelect(fullTemplate.id);
      }
    } catch (err) {
      console.error('Failed to fetch template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewEmail = (email: EmailTemplateItem) => {
    setPreviewEmail(email);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-6 lg:p-8 border border-white/10">
        {/* Header */}
        <div className="mb-6">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-500/20 rounded-full blur-xl" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-500/30 flex items-center justify-center border border-white/10">
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-3">
            Automatic Messages
          </h2>

          <p className="text-white/60 text-base max-w-2xl leading-relaxed mb-6">
            Review automated emails for your event
          </p>

          {/* Template Selector Button */}
          {selectedTemplate && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Import Template
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : !selectedTemplate ? (
          /* No Template Selected */
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/50 text-sm">No template selected. Click "Select Template" to choose one.</p>
          </div>
        ) : (
          /* Email List - Table View */
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            {/* Table Header */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 grid grid-cols-12 gap-4 text-xs font-semibold text-white/70 uppercase tracking-wide">
              <div className="col-span-3">Trigger Type</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-3">Send Date</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/10">
              {emailItems.map((email: EmailTemplateItem) => {
                const sendDate = calculateSendDate(
                  email.trigger_type,
                  email.trigger_value ?? null,
                  eventDate,
                  applicationDeadline,
                  paymentDeadline
                );

                return (
                  <div
                    key={email.id}
                    className="px-4 py-3 hover:bg-white/5 transition-colors grid grid-cols-12 gap-4 items-center"
                  >
                    {/* Trigger Type */}
                    <div className="col-span-3 text-sm text-white/80">
                      {getTriggerLabel(email.trigger_type, email.trigger_value ?? null)}
                    </div>

                    {/* Email Name & Subject */}
                    <div className="col-span-4 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white truncate">{email.name}</h4>
                        {!email.enabled_by_default && (
                          <span className="text-xs px-2 py-0.5 bg-white/10 text-white/50 rounded flex-shrink-0">
                            Auto
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 truncate">{email.subject_template}</p>
                    </div>

                    {/* Send Date */}
                    <div className="col-span-3">
                      {sendDate ? (
                        <div className="flex items-center gap-1.5 text-sm text-white/80">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>{sendDate}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-white/40">Not calculated</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2">
                      <button
                        onClick={() => handlePreviewEmail(email)}
                        className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
                        title="Preview email"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert('Edit features coming soon')}
                        className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
                        title="Edit email"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Import Template Modal */}
      <ImportTemplateModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSelect={handleTemplateSelect}
        currentTemplateId={selectedTemplate?.id}
      />

      {/* Email Preview Modal */}
      {previewEmail && (
        <TemplatePreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setPreviewEmail(null);
          }}
          template={{
            name: previewEmail.name,
            subject_template: previewEmail.subject_template,
            body_template: previewEmail.body_template,
            description: previewEmail.description || undefined,
          }}
        />
      )}
    </div>
  );
}
