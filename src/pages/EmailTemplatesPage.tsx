import { useState, useEffect } from 'react';
import { Mail, ChevronDown, ChevronUp, ArrowLeft, Plus, Eye, Trash2, HelpCircle } from 'lucide-react';
import { emailCampaignTemplatesApi, adminApi } from '@/services/api';
import type { EmailCampaignTemplate, EmailTemplateItem, EmailCategory } from '@/types/email';
import EmailPreviewModal from '@/components/admin/EmailPreviewModal';

interface EmailTemplatesPageProps {
  organizationId: number;
}

type ViewMode = 'library' | 'detail';

// Category display names and order
const CATEGORY_CONFIG: Record<EmailCategory, { label: string; order: number }> = {
  pre_application: { label: 'Event Announcements', order: 1 },
  application: { label: 'Application Updates', order: 2 },
  payment: { label: 'Payment Reminders', order: 3 },
  pre_event: { label: 'Event Countdown', order: 4 },
  event_day: { label: 'Event Day', order: 5 },
  post_event: { label: 'Post Event', order: 6 },
  system: { label: 'System Notifications', order: 7 },
};

export default function EmailTemplatesPage({ organizationId }: EmailTemplatesPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [templates, setTemplates] = useState<EmailCampaignTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<EmailCategory>>(
    new Set(['pre_application', 'application', 'payment', 'pre_event'])
  );

  // Email preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewEmailName, setPreviewEmailName] = useState('');
  const [previewEmailHtml, setPreviewEmailHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [organizationId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await emailCampaignTemplatesApi.getAll();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTemplate = async (template: EmailCampaignTemplate) => {
    try {
      setLoading(true);
      const fullTemplate = await emailCampaignTemplatesApi.getById(template.id);
      setSelectedTemplate(fullTemplate);
      setViewMode('detail');
    } catch (err: any) {
      setError(err.message || 'Failed to load template details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLibrary = () => {
    setViewMode('library');
    setSelectedTemplate(null);
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

  const handlePreviewEmail = async (email: EmailTemplateItem) => {
    try {
      setPreviewLoading(true);
      setPreviewEmailName(email.name);
      setPreviewModalOpen(true);
      setError(null);

      // Map email template item to backend email_type
      const emailType = getEmailTypeFromTemplate(email);
      const result = await adminApi.previewEmail(emailType);
      setPreviewEmailHtml(result.html);
    } catch (err) {
      console.error('❌ Failed to preview email:', err);
      setError(err instanceof Error ? err.message : 'Failed to preview email');
      setPreviewModalOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const getEmailTypeFromTemplate = (email: EmailTemplateItem): string => {
    // Map template email names/triggers to backend email types
    // This is a simplified mapping - adjust based on your backend
    if (email.name.includes('Immediate Announcement')) return 'scheduled_1';
    if (email.name.includes('1 Day Before Deadline')) return 'scheduled_2';
    if (email.name.includes('Day of Deadline')) return 'scheduled_3';
    if (email.name.includes('Application Accepted')) return 'application_approved';
    if (email.name.includes('Payment Details')) return 'scheduled_4';
    if (email.name.includes('1 Day Before Payment Due')) return 'scheduled_5';
    if (email.name.includes('7 Days Before Event')) return 'scheduled_6';
    if (email.name.includes('Day of Event')) return 'scheduled_7';

    // Default fallback
    return 'scheduled_1';
  };

  const getTemplateTypeBadge = (template: EmailCampaignTemplate) => {
    if (template.template_type === 'system') {
      if (template.is_default) {
        return { label: 'Default', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      }
      return { label: 'System', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
    return { label: 'Custom', color: 'bg-white/10 text-white/70 border-white/20' };
  };

  const getTriggerBadge = (item: EmailTemplateItem): { text: string; color: string } => {
    const { trigger_type, trigger_value } = item;
    const days = trigger_value ?? 0;

    switch (trigger_type) {
      case 'on_application_open':
        return { text: 'Sent when event is created', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'days_before_deadline':
        return {
          text: days === 0 ? 'Sent on application deadline day' : `Sent ${days} day${days > 1 ? 's' : ''} before applications close`,
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
      case 'on_application_submit':
        return { text: 'Sent when application is submitted', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
      case 'on_approval':
        return { text: 'Sent when application is approved', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
      case 'days_before_payment_deadline':
        return { text: `Sent ${days} day${days > 1 ? 's' : ''} before payment deadline (if unpaid)`, color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      case 'on_payment_deadline':
        return { text: 'Sent with acceptance (payment info)', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      case 'days_before_event':
        return { text: `Sent ${days} day${days > 1 ? 's' : ''} before event`, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'on_event_date':
        return { text: 'Sent on event date', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      case 'days_after_event':
        return { text: `Sent ${days} day${days > 1 ? 's' : ''} after event`, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      default:
        return { text: 'Automatic', color: 'bg-white/10 text-white/60 border-white/20' };
    }
  };

  // Loading state
  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading email templates...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchTemplates}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // LIBRARY VIEW
  // ==========================================
  if (viewMode === 'library') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Mail Sequences</h2>
            <p className="text-sm text-white/60">
              Create and manage your email automation sequences
            </p>
          </div>
          <button
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-lg transition-all flex items-center gap-2 opacity-50 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <Plus className="w-4 h-4" />
            Create New Sequence
          </button>
        </div>

        {/* Sequences Section */}
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-base font-semibold text-white">Sequences</h3>
            <button className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              How it works
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[2fr,1fr,1fr,1fr,140px] gap-4 px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-medium text-white/60">
            <div>Name</div>
            <div>Type</div>
            <div>Emails</div>
            <div>Updated</div>
            <div></div>
          </div>

          {/* Template Rows */}
          {templates.map((template) => {
            const badge = getTemplateTypeBadge(template);
            return (
              <div
                key={template.id}
                className="grid grid-cols-[2fr,1fr,1fr,1fr,140px] gap-4 px-4 py-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors items-center"
              >
                <div className="text-white font-medium">{template.name}</div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="text-white/70">{template.email_count || 0}</div>
                <div className="text-white/40 text-sm">—</div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleViewTemplate(template)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Notifications Section */}
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-amber-500/10">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Mail className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">System Notifications</h3>
              <p className="text-xs text-white/60">These automatic emails are sent across all events and templates</p>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {[
              { name: 'Application Received', description: 'Automatically sent when an application is submitted' },
              { name: 'Payment Confirmed', description: 'Automatically sent when payment is received' },
              { name: 'Moved to Waitlist (Non-Payment)', description: 'Automatically sent when vendor is moved to waitlist due to missed payment' },
              { name: 'Category Changed', description: "Automatically sent when vendor's category is changed" },
              { name: 'Event Details Changed', description: 'Sent when event date, venue, or time changes' },
            ].map((notification) => (
              <div
                key={notification.name}
                className="px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-medium text-white">{notification.name}</div>
                    <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                      System
                    </span>
                  </div>
                  <div className="text-xs text-white/60">{notification.description}</div>
                </div>
                <button className="text-white/40 hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DETAIL VIEW
  // ==========================================
  if (viewMode === 'detail' && selectedTemplate) {
    const emailItems = selectedTemplate.email_template_items || [];

    // Group emails by category
    const emailsByCategory = emailItems.reduce((acc, email) => {
      if (!acc[email.category]) {
        acc[email.category] = [];
      }
      acc[email.category].push(email);
      return acc;
    }, {} as Record<EmailCategory, EmailTemplateItem[]>);

    // Sort categories by order
    const sortedCategories = Object.keys(emailsByCategory).sort((a, b) => {
      const orderA = CATEGORY_CONFIG[a as EmailCategory]?.order || 999;
      const orderB = CATEGORY_CONFIG[b as EmailCategory]?.order || 999;
      return orderA - orderB;
    }) as EmailCategory[];

    const enabledCount = emailItems.filter(e => e.enabled_by_default).length;
    const totalCount = emailItems.length;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={handleBackToLibrary}
              className="p-2 hover:bg-white/10 text-white rounded-lg transition-colors mt-1"
              title="Back to library"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{selectedTemplate.name}</h2>
              <p className="text-sm text-white/60">
                {selectedTemplate.description || 'Email automation sequence'}
              </p>
              <p className="text-xs text-white/40 mt-2">
                {enabledCount}/{totalCount} emails (excludes system notifications)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
              disabled
              title="Coming soon"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-lg transition-all flex items-center gap-2 opacity-50 cursor-not-allowed"
              disabled
              title="Coming soon"
            >
              <Mail className="w-4 h-4" />
              Save as Template
            </button>
          </div>
        </div>

        {/* Email Categories */}
        <div className="space-y-4">
          {sortedCategories.map((category) => {
            const categoryEmails = emailsByCategory[category] || [];
            const enabledInCategory = categoryEmails.filter(e => e.enabled_by_default).length;
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
                      <p className="text-xs text-white/60">
                        {CATEGORY_CONFIG[category]?.label === 'Event Announcements'
                          ? 'Promote your event and drive applications'
                          : CATEGORY_CONFIG[category]?.label === 'Application Updates'
                          ? 'Notify applicants of their status'
                          : CATEGORY_CONFIG[category]?.label === 'Payment Reminders'
                          ? 'Payment deadline countdown and follow-ups'
                          : 'Automated email notifications'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                      {enabledInCategory}/{categoryEmails.length} enabled
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
                    {categoryEmails.map((email, index) => {
                      const triggerBadge = getTriggerBadge(email);

                      return (
                        <div
                          key={email.id}
                          className={`px-4 py-3 hover:bg-white/5 transition-colors ${
                            index < categoryEmails.length - 1 ? 'border-b border-white/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-sm font-medium text-white">{email.name}</h4>
                                {!email.enabled_by_default && (
                                  <span className="text-xs px-2 py-0.5 bg-white/10 text-white/50 rounded">
                                    Auto
                                  </span>
                                )}
                              </div>
                              <div className="mb-2">
                                <span className={`text-xs px-2 py-1 rounded border ${triggerBadge.color}`}>
                                  {triggerBadge.text}
                                </span>
                              </div>
                              <p className="text-xs text-white/60 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {email.subject_template}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePreviewEmail(email)}
                                className="p-1.5 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded transition-colors"
                                title="Preview email"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors opacity-50 cursor-not-allowed"
                                disabled
                                title="Coming soon"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Email Button */}
                    <button
                      className="w-full px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm opacity-50 cursor-not-allowed"
                      disabled
                      title="Coming soon"
                    >
                      <Plus className="w-4 h-4" />
                      Add Email to {CATEGORY_CONFIG[category]?.label}
                    </button>
                  </div>
                )}

                {/* Category Actions */}
                {isExpanded && (
                  <div className="border-t border-white/10 px-4 py-2 bg-white/5 flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors flex items-center gap-1.5 opacity-50 cursor-not-allowed"
                      disabled
                      title="Coming soon"
                    >
                      <Eye className="w-3 h-3" />
                      Rename
                    </button>
                    <button
                      className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors flex items-center gap-1.5 opacity-50 cursor-not-allowed"
                      disabled
                      title="Coming soon"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Email Preview Modal */}
        <EmailPreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          emailName={previewEmailName}
          emailHtml={previewEmailHtml}
          loading={previewLoading}
        />
      </div>
    );
  }

  return null;
}
