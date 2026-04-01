import { useState, useEffect } from 'react';
import { Mail, Eye } from 'lucide-react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { emailCampaignTemplatesApi } from '@/services/api';
import type { EmailCampaignTemplate, EmailTemplateItem, EmailCategory } from '@/types/email';
import TemplatePreviewModal from '@/components/shared/TemplatePreviewModal';
import { DebugPanel } from '../../DebugPanel';

interface Step4AutoMessagesProps {
  selectedTemplateId?: number | null;
  onTemplateSelect?: (templateId: number | null) => void;
  useCategoryTemplates?: boolean;
  onUseCategoryTemplatesChange?: (value: boolean) => void;
  eventCategories?: Array<{ id: number; name: string; icon?: string }>; // Categories from Step 2 applications
  eventDate?: string;
  applicationDeadline?: string;
  paymentDeadline?: string;
  isAdmin?: boolean;
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
  event_announcements: { label: 'Event Announcements', order: 1 },
  application_updates: { label: 'Application Updates', order: 2 },
  payment_reminders: { label: 'Payment Reminders', order: 3 },
  event_countdown: { label: 'Event Countdown', order: 4 },
  event_updates: { label: 'Event Updates', order: 8 },
};

// Map trigger types to readable labels
const getTriggerLabel = (triggerType: string, triggerValue: number | null): string => {
  switch (triggerType) {
    case 'days_before_event':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} before event`;
    case 'days_after_event':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} after event`;
    case 'days_before_deadline':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} before application deadline`;
    case 'days_before_payment_deadline':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} before payment deadline`;
    case 'days_after_payment_deadline':
      return `${triggerValue} ${triggerValue === 1 ? 'day' : 'days'} after payment deadline`;
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
    const eventDateObj = parseISO(eventDate);

    switch (triggerType) {
      case 'days_before_event':
        if (triggerValue === null) return null;
        return format(subDays(eventDateObj, triggerValue), 'MMM d, yyyy');
      case 'days_after_event':
        if (triggerValue === null) return null;
        return format(addDays(eventDateObj, triggerValue), 'MMM d, yyyy');
      case 'days_before_deadline':
        if (triggerValue === null || !applicationDeadline) return null;
        return format(subDays(parseISO(applicationDeadline), triggerValue), 'MMM d, yyyy');
      case 'days_before_payment_deadline':
        if (triggerValue === null || !paymentDeadline) return null;
        return format(subDays(parseISO(paymentDeadline), triggerValue), 'MMM d, yyyy');
      case 'days_after_payment_deadline':
        if (triggerValue === null || !paymentDeadline) return null;
        return format(addDays(parseISO(paymentDeadline), triggerValue), 'MMM d, yyyy');
      case 'on_application_open':
        return applicationDeadline ? format(parseISO(applicationDeadline), 'MMM d, yyyy') : null;
      case 'on_event_date':
        return format(eventDateObj, 'MMM d, yyyy');
      case 'on_payment_deadline':
        return paymentDeadline ? format(parseISO(paymentDeadline), 'MMM d, yyyy') : null;
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
  useCategoryTemplates = false,
  onUseCategoryTemplatesChange,
  eventCategories = [],
  eventDate,
  applicationDeadline,
  paymentDeadline,
  isAdmin
}: Step4AutoMessagesProps) {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailTemplateItem | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [allTemplates, setAllTemplates] = useState<EmailCampaignTemplate[]>([]);
  const [emailItems, setEmailItems] = useState<EmailTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Check which categories have category-specific templates
  // In new architecture, categories have email_campaign_template_id pointing to their template
  const categoryTemplatesAvailable = eventCategories.map(cat => {
    const template = cat.email_campaign_template_id
      ? allTemplates.find(t => t.id === cat.email_campaign_template_id)
      : null;
    return {
      category: cat,
      hasTemplate: !!template,
      template
    };
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const templates = await emailCampaignTemplatesApi.getAll();
      setAllTemplates(templates);

      const defaultTemplate = templates.find((t) => t.is_default && t.template_type === 'generic');
      if (defaultTemplate) {
        const fullTemplate = await emailCampaignTemplatesApi.getById(defaultTemplate.id);
        setSelectedTemplate(fullTemplate);
        setEmailItems(fullTemplate.email_template_items || []);

        if (onTemplateSelect && !selectedTemplateId) {
          onTemplateSelect(fullTemplate.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = async (templateId: number) => {
    const template = allTemplates.find((t) => t.id === templateId);
    if (!template) return;

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
            Review and select automated email sequence for your event
          </p>

          {/* Email Sequence Selector */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-white/50 flex-shrink-0">Email Sequence</p>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) handleTemplateChange(id);
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 hover:bg-white/15 transition-all"
            >
              <option value="" disabled>Select a sequence...</option>
              {allTemplates.filter(t => !t.category_id).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.is_default ? ' (Default)' : ''}
                </option>
              ))}
            </select>
            {selectedTemplate && (
              <span className="text-[10px] text-white/40 flex-shrink-0 tabular-nums">
                {emailItems.length} {emailItems.length === 1 ? 'email' : 'emails'}
              </span>
            )}
          </div>

          {/* Category Template Option - Only show if event has categories */}
          {eventCategories.length > 0 && selectedTemplate && (
            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="use-category-templates"
                    checked={useCategoryTemplates}
                    onChange={(e) => onUseCategoryTemplatesChange?.(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <label htmlFor="use-category-templates" className="text-sm font-medium text-white cursor-pointer">
                      Use category-specific email sequences where available
                    </label>
                    <p className="text-xs text-white/50 mt-1">
                      {categoryTemplatesAvailable.filter(c => c.hasTemplate).length > 0 ? (
                        <>
                          Use customized email sequences for specific categories. Categories without templates will use "{selectedTemplate.name}".
                        </>
                      ) : (
                        <>
                          No category-specific templates available yet. Create them in Email Sequence Library first.
                        </>
                      )}
                    </p>

                    {/* Show which categories have templates */}
                    {categoryTemplatesAvailable.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {categoryTemplatesAvailable.map(({ category, hasTemplate, template }) => (
                          <div key={category.id} className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${hasTemplate ? 'bg-green-400' : 'bg-white/20'}`} />
                            <span className="text-white/70">
                              {category.icon && `${category.icon} `}{category.name}
                            </span>
                            <span className="text-white/40">
                              {hasTemplate ? `→ "${template?.name}"` : '→ Will use default'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
          /* Email List - Grouped by Category */
          <div className="space-y-4">
            {Object.entries(
              [...emailItems]
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .reduce((groups, item) => {
                  const cat = item.category || 'system';
                  if (!groups[cat]) groups[cat] = [];
                  groups[cat].push(item);
                  return groups;
                }, {} as Record<string, EmailTemplateItem[]>)
            )
              .sort(([a], [b]) => (CATEGORY_CONFIG[a as EmailCategory]?.order ?? 99) - (CATEGORY_CONFIG[b as EmailCategory]?.order ?? 99))
              .map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                      {CATEGORY_CONFIG[category as EmailCategory]?.label || category}
                    </h3>
                    <span className="text-[10px] text-white/30 tabular-nums">{items.length}</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                    {items.map((email) => {
                      const sendDate = calculateSendDate(
                        email.trigger_type,
                        email.trigger_value ?? null,
                        eventDate,
                        applicationDeadline,
                        paymentDeadline
                      );
                      return (
                        <div key={email.id} className="flex items-center gap-3 py-2.5 px-3">
                          <Mail className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                          <span className="text-sm text-white truncate flex-1">{email.name}</span>
                          <span className="text-[10px] text-white/40 flex-shrink-0 hidden sm:inline">
                            {getTriggerLabel(email.trigger_type, email.trigger_value ?? null)}
                          </span>
                          {sendDate && (
                            <span className="text-[10px] text-white/40 tabular-nums flex-shrink-0 hidden md:inline">
                              {sendDate}
                            </span>
                          )}
                          <button
                            onClick={() => handlePreviewEmail(email)}
                            className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                            title="Preview email"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

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

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Step 4: Auto Messages"
        data={{
          selectedTemplateId,
          selectedTemplate,
          eventDate,
          applicationDeadline,
          paymentDeadline,
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
