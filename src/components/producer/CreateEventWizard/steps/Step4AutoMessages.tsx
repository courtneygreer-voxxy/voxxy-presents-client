import { useState, useEffect } from 'react';
import { Mail, ChevronDown, ChevronUp, Eye, Users, Plus } from 'lucide-react';
import { emailCampaignTemplatesApi } from '@/services/api';
import type { EmailCampaignTemplate, EmailTemplateItem, EmailCategory } from '@/types/email';
import ImportTemplateModal from '../ImportTemplateModal';
import TemplatePreviewModal from '@/components/shared/TemplatePreviewModal';

interface Step4AutoMessagesProps {
  selectedTemplateId?: number | null;
  onTemplateSelect?: (templateId: number | null) => void;
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
      return `${triggerValue} Days Before Event`;
    case 'days_after_event':
      return `${triggerValue} Days After Event`;
    case 'days_before_deadline':
      return `${triggerValue} Days Before Deadline`;
    case 'on_application_open':
      return 'Immediate Announcement';
    case 'on_application_submit':
      return 'Application Received';
    case 'on_approval':
      return 'Application Accepted';
    case 'on_payment_deadline':
      return 'Payment Confirmed';
    case 'on_event_date':
      return 'Day of Event';
    default:
      return 'Auto';
  }
};

export default function Step4AutoMessages({
  selectedTemplateId = null,
  onTemplateSelect
}: Step4AutoMessagesProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailTemplateItem | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [emailItems, setEmailItems] = useState<EmailTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<EmailCategory>>(
    new Set(['pre_application', 'application', 'payment', 'pre_event'])
  );

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

  const toggleCategory = (category: EmailCategory) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handlePreviewEmail = (email: EmailTemplateItem) => {
    setPreviewEmail(email);
    setIsPreviewModalOpen(true);
  };

  // Group emails by category
  const emailsByCategory = emailItems.reduce((acc, email) => {
    if (!acc[email.category]) {
      acc[email.category] = [];
    }
    acc[email.category].push(email);
    return acc;
  }, {} as Record<EmailCategory, EmailTemplateItem[]>);

  // Sort categories by order
  const sortedCategories = Object.keys(emailsByCategory)
    .sort((a, b) => {
      const orderA = CATEGORY_CONFIG[a as EmailCategory]?.order || 999;
      const orderB = CATEGORY_CONFIG[b as EmailCategory]?.order || 999;
      return orderA - orderB;
    }) as EmailCategory[];

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
          /* Email List by Category */
          <div className="space-y-4">
            {sortedCategories.map((category: EmailCategory) => {
              const categoryEmails = emailsByCategory[category] || [];
              const enabledCount = categoryEmails.filter((e: EmailTemplateItem) => e.enabled_by_default).length;
              const isExpanded = expandedCategories.has(category);

              return (
                <div key={category} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-purple-400" />
                      <div className="text-left">
                        <h3 className="text-base font-semibold text-white">
                          {CATEGORY_CONFIG[category]?.label || category}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {enabledCount}/{categoryEmails.length} enabled
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white/60" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/60" />
                      )}
                    </div>
                  </button>

                  {/* Email Items */}
                  {isExpanded && (
                    <div className="border-t border-white/10">
                      {categoryEmails.map((email: EmailTemplateItem, index: number) => (
                        <div
                          key={email.id}
                          className={`px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors ${
                            index < categoryEmails.length - 1 ? 'border-b border-white/5' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-white">{email.name}</h4>
                              {!email.enabled_by_default && (
                                <span className="text-xs px-2 py-0.5 bg-white/10 text-white/50 rounded">
                                  Auto
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/60 truncate">{email.subject_template}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {/* Recipient Filter */}
                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs text-white rounded border border-white/10 flex items-center gap-1.5 transition-colors">
                              <Users className="w-3.5 h-3.5" />
                              <span>All Vendors</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {/* Preview Button */}
                            <button
                              onClick={() => handlePreviewEmail(email)}
                              className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors"
                              title="Preview email"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
