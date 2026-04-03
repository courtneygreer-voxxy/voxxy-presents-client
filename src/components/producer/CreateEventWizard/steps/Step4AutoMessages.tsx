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
  useUniversalCategoryTemplate?: boolean;
  onUseUniversalCategoryTemplateChange?: (value: boolean) => void;
  universalCategoryTemplateId?: number | null;
  onUniversalCategoryTemplateIdChange?: (templateId: number | null) => void;
  eventCategories?: Array<{ id: number; name: string; icon?: string; color?: string; email_campaign_template_id?: number }>; // Categories from Step 2 applications
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

// Event-wide trigger types that apply to all vendors (not category-specific)
const EVENT_WIDE_TRIGGERS = [
  'on_invitation_send',
  'on_application_submitted',
  'on_application_approved',
  'on_application_rejected',
  'on_payment_received',
  'on_vendor_assigned_space',
  'on_category_change'
];

// Count category-specific emails (excluding event-wide emails)
const getCategorySpecificEmailCount = (template: EmailCampaignTemplate | null) => {
  if (!template?.email_template_items) return 0;

  return template.email_template_items.filter(item => {
    // Exclude event announcements
    if (item.category === 'event_announcements') return false;

    // Exclude event-wide trigger types
    if (EVENT_WIDE_TRIGGERS.includes(item.trigger_type)) return false;

    return true;
  }).length;
};

/**
 * Step4AutoMessages - Email sequence configuration
 *
 * Fourth and final step of the event creation wizard. Configures automated
 * email sequences for both event-wide communications and vendor category emails.
 *
 * Features:
 * - **Event-Wide Sequence**: Configure emails sent to ALL vendors (invitations, updates, cancellations)
 * - **Vendor Category Emails**: Choose between two strategies:
 *   - **Universal Sequence (DEFAULT)**: Same content for all vendor categories (simpler)
 *   - **Category-Specific Sequences**: Custom templates per category (advanced)
 * - **Template Preview**: View complete email sequences with send dates
 * - **Email Count Display**: Shows accurate count per template/category
 * - **Send Date Calculations**: Dynamic dates based on event/deadline dates
 * - **Category Color Coding**: Visual indicators with category colors
 *
 * Email Template Types:
 * 1. Event-Wide (generic template_type):
 *    - Event invitations
 *    - Event updates/changes
 *    - Event cancellation
 *    - Application deadline reminders
 *
 * 2. Vendor Category (category template_type):
 *    - Application confirmation
 *    - Approval/rejection notifications
 *    - Payment reminders
 *    - Event countdown emails (3 days before, 1 day before, day-of)
 *
 * Category Email Strategy Options:
 * - **Universal Sequence (DEFAULT)**: All categories use same template (use_universal_category_template: true)
 *   - Simpler management
 *   - Consistent messaging
 *   - Recommended for most events
 *   - Pre-selected by default
 *
 * - **Category-Specific**: Each category uses assigned template (use_category_templates: true)
 *   - Maximum customization
 *   - Different content per vendor type
 *   - More complex to manage
 *
 * Template Precedence:
 * 1. If use_universal_category_template → Use universal_category_template_id for ALL categories
 * 2. If use_category_templates → Use each category's email_campaign_template_id
 * 3. Else → Fall back to event's default email_campaign_template_id
 *
 * Validation:
 * - No validation required (emails are optional)
 * - Can create event without configuring sequences
 * - Sequences can be configured after event creation
 *
 * @param {Step4AutoMessagesProps} props - Email configuration props
 * @param {number | null} props.selectedTemplateId - Currently selected event-wide template ID
 * @param {Function} props.onTemplateSelect - Callback when event-wide template selected
 * @param {boolean} props.useCategoryTemplates - Use per-category templates flag
 * @param {Function} props.onUseCategoryTemplatesChange - Callback for category templates mode
 * @param {boolean} props.useUniversalCategoryTemplate - Use universal template flag (DEFAULT)
 * @param {Function} props.onUseUniversalCategoryTemplateChange - Callback for universal mode
 * @param {number | null} props.universalCategoryTemplateId - Universal template ID
 * @param {Function} props.onUniversalCategoryTemplateIdChange - Callback for universal template
 * @param {Array} props.eventCategories - Categories from Step 2 with email template assignments
 * @param {string} props.eventDate - Event date for send date calculations
 * @param {string} props.applicationDeadline - Application deadline for reminder calculations
 * @param {string} props.paymentDeadline - Payment deadline for reminder calculations
 * @param {boolean} props.isAdmin - Whether user is admin (shows debug panel)
 *
 * @returns {JSX.Element} Step 4 email sequence configuration UI
 */
export default function Step4AutoMessages({
  selectedTemplateId = null,
  onTemplateSelect,
  useCategoryTemplates = false,
  onUseCategoryTemplatesChange,
  useUniversalCategoryTemplate = false,
  onUseUniversalCategoryTemplateChange,
  universalCategoryTemplateId = null,
  onUniversalCategoryTemplateIdChange,
  eventCategories = [],
  eventDate,
  applicationDeadline,
  paymentDeadline,
  isAdmin
}: Step4AutoMessagesProps) {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailTemplateItem | null>(null);
  const [isSequenceListModalOpen, setIsSequenceListModalOpen] = useState(false);
  const [sequenceListType, setSequenceListType] = useState<'event' | 'category' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [allTemplates, setAllTemplates] = useState<EmailCampaignTemplate[]>([]);
  const [universalTemplate, setUniversalTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [emailItems, setEmailItems] = useState<EmailTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Check which categories have category-specific templates
  // In new architecture, categories have email_campaign_template_id pointing to their template
  // If no template assigned, fall back to universal template (default category template)
  const categoryTemplatesAvailable = eventCategories.map(cat => {
    const categoryTemplate = cat.email_campaign_template_id
      ? allTemplates.find(t => t.id === cat.email_campaign_template_id)
      : null;

    // Fall back to universal template if no category-specific template
    const template = categoryTemplate || universalTemplate;

    return {
      category: cat,
      hasTemplate: !!categoryTemplate, // True only if category has its own template
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

      // Find and set universal template
      const universal = templates.find((t) => t.template_type === 'category' && t.is_universal === true);
      if (universal) {
        setUniversalTemplate(universal);
        // Initialize universal template ID in parent if not set
        if (onUniversalCategoryTemplateIdChange && !universalCategoryTemplateId) {
          onUniversalCategoryTemplateIdChange(universal.id);
        }
      }

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

  const handleOpenSequenceList = (type: 'event' | 'category') => {
    setSequenceListType(type);
    setIsSequenceListModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-2xl p-5 lg:p-6 border border-white/10">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-1">
            Email Sequences
          </h2>
          <p className="text-sm text-white/60">
            Configure automated emails for your event and vendor communications.
          </p>
        </div>

        {/* Event Sequence Selector */}
        <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-2">Event-Wide Sequence</h3>
          <p className="text-xs text-white/50 mb-3">
            Emails sent to all vendors (invitations, updates, cancellations, deadlines)
          </p>

          <div className="space-y-2">
            {allTemplates
              .filter(t => t.template_type === 'generic')
              .map((template) => (
                <label
                  key={template.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="event-sequence"
                    checked={selectedTemplate?.id === template.id}
                    onChange={() => handleTemplateChange(template.id)}
                    className="mt-0.5 w-4 h-4 border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{template.name}</span>
                        {template.is_default && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/20 text-blue-300">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenSequenceList('event');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 transition-all border border-blue-500/30"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                    </div>
                    {template.description && (
                      <p className="text-xs text-white/50 mt-1">{template.description}</p>
                    )}

                    {selectedTemplate?.id === template.id && (
                      <div className="mt-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
                        <div className="text-xs text-blue-300">
                          {emailItems.length} emails • Sent to all vendors
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              ))}
          </div>
        </div>

        {/* Category Email Strategy - Only show if event has categories */}
        {eventCategories.length > 0 && selectedTemplate && universalTemplate && (
          <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2">Vendor Category Sequences</h3>
            <p className="text-xs text-white/50 mb-3">
              Vendor emails during application, payment, and countdown phases
            </p>

            <div className="space-y-2">
              {/* Option 1: Universal (DEFAULT) */}
              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  useUniversalCategoryTemplate
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <input
                  type="radio"
                  name="category-strategy"
                  checked={useUniversalCategoryTemplate}
                  onChange={() => {
                    onUseUniversalCategoryTemplateChange?.(true);
                    onUseCategoryTemplatesChange?.(false);
                  }}
                  className="mt-0.5 w-4 h-4 border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">Universal Sequence</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-500/20 text-purple-300">
                        DEFAULT
                      </span>
                      <span className="text-[10px] text-white/40">
                        ({universalTemplate?.email_count || 0} emails)
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenSequenceList('category');
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 transition-all border border-purple-500/30"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Same content for all vendors • Simplifies management when content doesn't need to vary by vendor type
                  </p>

                  {useUniversalCategoryTemplate && (
                    <div className="mt-2 p-2 rounded bg-purple-500/10 border border-purple-500/20">
                      <div className="text-xs text-purple-300 mb-1.5">
                        {universalTemplate.name}
                      </div>
                      <div className="text-[10px] text-purple-200/70">
                        {universalTemplate?.email_count || 0} emails • Shared by all {eventCategories.length} {eventCategories.length === 1 ? 'category' : 'categories'}
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Option 2: Category-Specific */}
              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  !useUniversalCategoryTemplate
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <input
                  type="radio"
                  name="category-strategy"
                  checked={!useUniversalCategoryTemplate}
                  onChange={() => {
                    onUseUniversalCategoryTemplateChange?.(false);
                    onUseCategoryTemplatesChange?.(true);
                  }}
                  className="mt-0.5 w-4 h-4 border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        Category-Specific Sequences
                      </span>
                      <span className="text-[10px] text-white/40">
                        ({(() => {
                          // Calculate total emails across all categories
                          const totalEmails = categoryTemplatesAvailable.reduce((sum, { template }) => {
                            return sum + (template?.email_count || 0);
                          }, 0);
                          return totalEmails;
                        })()} total emails)
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenSequenceList('category');
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 transition-all border border-purple-500/30"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Customize content per vendor type (each category uses its own template)
                  </p>

                  {!useUniversalCategoryTemplate && categoryTemplatesAvailable.length > 0 && (
                    <div className="mt-2 p-2 rounded bg-purple-500/10 border border-purple-500/20">
                      <div className="space-y-1">
                        {categoryTemplatesAvailable.map(({ category, hasTemplate, template }) => (
                          <div key={category.id} className="flex items-center gap-1.5 text-[11px]">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: category.color || '#8B5CF6' }}
                            />
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold text-white"
                              style={{
                                backgroundColor: category.color || '#8B5CF6',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.4)'
                              }}
                            >
                              {category.icon && <span>{category.icon}</span>}
                              {category.name}
                            </span>
                            <span className="text-white/30">→</span>
                            <span className="text-purple-300 truncate">
                              {hasTemplate ? template?.name : 'Default'}
                            </span>
                            <span className="text-white/40">
                              ({template?.email_count || 0} emails)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : !selectedTemplate ? (
          /* No Template Selected */
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/50 text-sm">No template selected. Select an Event Sequence above to continue.</p>
          </div>
        ) : null}
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

      {/* Sequence Email List Modal */}
      {isSequenceListModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a0f2e] to-[#0f0a1e] border border-white/10 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sequenceListType === 'event' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                  <h3 className="text-lg font-semibold text-white">
                    {sequenceListType === 'event' ? 'Event-Wide Emails' : 'Vendor Category Emails'}
                  </h3>
                  <span className="text-sm text-white/40">
                    ({sequenceListType === 'event'
                      ? emailItems.length
                      : useUniversalCategoryTemplate
                        ? (universalTemplate?.email_count || 0)
                        : (universalTemplate?.email_count || 0) * eventCategories.length} emails)
                  </span>
                </div>
                <button
                  onClick={() => setIsSequenceListModalOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {sequenceListType === 'event' ? (
                // Event-wide emails
                <div className="space-y-1">
                  {emailItems
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                    .map((email, index) => {
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
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                        >
                          <span className="text-xs text-white/40 font-mono w-6">{index + 1}.</span>
                          <Mail className="w-3.5 h-3.5 text-blue-400/60 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium">{email.name}</div>
                            <div className="text-xs text-white/50 mt-0.5">
                              {getTriggerLabel(email.trigger_type, email.trigger_value ?? null)}
                              {sendDate && ` • ${sendDate}`}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              handlePreviewEmail(email);
                              setIsSequenceListModalOpen(false);
                            }}
                            className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                            title="Preview email"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              ) : (
                // Category emails
                <div className="space-y-4">
                  {useUniversalCategoryTemplate ? (
                    // Universal template - show once
                    <div>
                      <div className="text-xs text-purple-300 font-medium mb-2 px-1">
                        {universalTemplate?.name} (sent to all {eventCategories.length} {eventCategories.length === 1 ? 'category' : 'categories'})
                      </div>
                      <div className="space-y-1">
                        {universalTemplate?.email_template_items
                          ?.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                          .map((email, index) => {
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
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                              >
                                <span className="text-xs text-white/40 font-mono w-6">{index + 1}.</span>
                                <Mail className="w-3.5 h-3.5 text-purple-400/60 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-white font-medium">{email.name}</div>
                                  <div className="text-xs text-white/50 mt-0.5">
                                    {getTriggerLabel(email.trigger_type, email.trigger_value ?? null)}
                                    {sendDate && ` • ${sendDate}`}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    handlePreviewEmail(email);
                                    setIsSequenceListModalOpen(false);
                                  }}
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
                  ) : (
                    // Category-specific - show per category
                    eventCategories.map(cat => {
                      const template = cat.email_campaign_template_id
                        ? allTemplates.find(t => t.id === cat.email_campaign_template_id)
                        : universalTemplate;

                      return (
                        <div key={cat.id}>
                          <div className="text-xs text-purple-300 font-medium mb-2 px-1 flex items-center gap-2">
                            <span>{cat.icon && `${cat.icon} `}{cat.name}</span>
                            <span className="text-white/30">→</span>
                            <span className="text-white/50">{template?.name || 'Default'}</span>
                          </div>
                          <div className="space-y-1">
                            {template?.email_template_items
                              ?.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                              .map((email, index) => {
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
                                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                                  >
                                    <span className="text-xs text-white/40 font-mono w-6">{index + 1}.</span>
                                    <Mail className="w-3.5 h-3.5 text-purple-400/60 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-white font-medium">{email.name}</div>
                                      <div className="text-xs text-white/50 mt-0.5">
                                        {getTriggerLabel(email.trigger_type, email.trigger_value ?? null)}
                                        {sendDate && ` • ${sendDate}`}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        handlePreviewEmail(email);
                                        setIsSequenceListModalOpen(false);
                                      }}
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
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => setIsSequenceListModalOpen(false)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Step 4: Email Sequences"
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
