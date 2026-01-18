import { useState, useEffect } from 'react';
import { Mail, Clock, Users, ChevronDown, ChevronUp, ChevronRight, Plus } from 'lucide-react';
import { emailCampaignTemplatesApi } from '@/services/api';
import type { EmailCampaignTemplate, EmailTemplateItem } from '@/types/email';

interface EmailTemplatesPageProps {
  organizationId: number;
}

export default function EmailTemplatesPage({ organizationId }: EmailTemplatesPageProps) {
  const [templates, setTemplates] = useState<EmailCampaignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<number | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [organizationId]);

  // Auto-select default template on first load
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      const defaultTemplate = templates.find(t => t.template_type === 'system' && t.is_default);
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
      }
    }
  }, [templates, selectedTemplateId]);

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

  const getTriggerDescription = (item: EmailTemplateItem): string => {
    const { trigger_type, trigger_value, trigger_time } = item;

    switch (trigger_type) {
      case 'days_before_deadline':
        return trigger_value === 0
          ? `On application deadline at ${trigger_time}`
          : `${trigger_value} day${trigger_value > 1 ? 's' : ''} before application deadline at ${trigger_time}`;
      case 'days_before_payment_deadline':
        return `${trigger_value} day${trigger_value! > 1 ? 's' : ''} before payment deadline at ${trigger_time}`;
      case 'on_payment_deadline':
        return `On payment deadline at ${trigger_time}`;
      case 'days_before_event':
        return `${trigger_value} day${trigger_value! > 1 ? 's' : ''} before event at ${trigger_time}`;
      case 'on_event_date':
        return `On event date at ${trigger_time}`;
      case 'days_after_event':
        return `${trigger_value} day${trigger_value! > 1 ? 's' : ''} after event at ${trigger_time}`;
      case 'on_application_open':
        return `When event is published`;
      case 'on_application_submit':
        return `When vendor submits application`;
      case 'on_approval':
        return `When application is approved`;
      default:
        return 'Unknown trigger';
    }
  };

  const getRecipientDescription = (item: EmailTemplateItem): string => {
    const criteria = item.filter_criteria;

    if (!criteria || Object.keys(criteria).length === 0) {
      return 'All vendors';
    }

    if (criteria.status && criteria.status.length > 0) {
      return `Vendors with status: ${criteria.status.join(', ')}`;
    }

    return 'Filtered recipients';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'event_announcements': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'payment_reminders': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'event_countdown': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'pre_application': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'application': 'bg-green-500/20 text-green-300 border-green-500/30',
      'payment': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'pre_event': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'event_day': 'bg-red-500/20 text-red-300 border-red-500/30',
      'post_event': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    };
    return colors[category] || 'bg-white/10 text-white/70 border-white/20';
  };

  // Loading state
  if (loading) {
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
  if (error) {
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

  // Get selected template
  const selectedTemplate = selectedTemplateId
    ? templates.find(t => t.id === selectedTemplateId)
    : null;

  const emailItems = selectedTemplate?.email_template_items || [];
  const sortedEmails = [...emailItems].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Email Templates</h2>
          <p className="text-sm text-white/60">
            Manage email templates for your events
          </p>
        </div>
        <button
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
          disabled
          title="Coming soon"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Templates List */}
      <div className="grid gap-3">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          const isDefault = template.template_type === 'system' && template.is_default;

          return (
            <button
              key={template.id}
              onClick={() => setSelectedTemplateId(template.id)}
              className={`w-full text-left p-5 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-white/10 border-white/30 shadow-lg'
                  : 'bg-white/5 border-white/10 hover:bg-white/[0.07] hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-purple-400' : 'text-white/40'}`} />
                    <h3 className="text-lg font-semibold text-white truncate">{template.name}</h3>
                    {isDefault && (
                      <span className="px-2.5 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 flex-shrink-0">
                        Default
                      </span>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-white/60 text-sm mb-3 line-clamp-2">{template.description}</p>
                  )}

                  {/* Template Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">Emails:</span>
                      <span className="text-white font-medium">{template.email_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">Events:</span>
                      <span className="text-white font-medium">{template.events_count || 0}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${
                    isSelected ? 'rotate-90 text-purple-400' : 'text-white/40'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Email List - Only show if template is selected */}
      {selectedTemplate && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-md font-semibold text-white">
              Emails in {selectedTemplate.name} ({sortedEmails.length})
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/40">
                {emailItems.filter(e => e.enabled_by_default).length} enabled by default
              </span>
            </div>
          </div>

          {sortedEmails.map((item) => {
            const isExpanded = expandedEmailId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white/5 rounded-lg border border-white/10 overflow-hidden hover:bg-white/[0.07] transition-colors"
              >
                {/* Email Card Header */}
                <button
                  onClick={() => setExpandedEmailId(isExpanded ? null : item.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white/40 text-sm font-mono">#{item.position}</span>
                        <h4 className="text-white font-medium truncate">{item.name}</h4>
                        {!item.enabled_by_default && (
                          <span className="px-2 py-0.5 text-[10px] bg-white/10 text-white/50 rounded">
                            Disabled
                          </span>
                        )}
                      </div>

                      {/* Subject Preview */}
                      <p className="text-white/60 text-sm mb-3 line-clamp-1">
                        Subject: {item.subject_template}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Category Badge */}
                        <span
                          className={`px-2 py-1 text-xs rounded border ${getCategoryColor(item.category)}`}
                        >
                          {item.category.replace('_', ' ')}
                        </span>

                        {/* Trigger */}
                        <div className="flex items-center gap-1.5 text-white/50 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{getTriggerDescription(item)}</span>
                        </div>

                        {/* Recipients */}
                        <div className="flex items-center gap-1.5 text-white/50 text-xs">
                          <Users className="w-3.5 h-3.5" />
                          <span>{getRecipientDescription(item)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0 text-white/40">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/10">
                    {/* Body Preview */}
                    <div className="mb-4">
                      <p className="text-white/40 text-xs mb-2 uppercase tracking-wide">Email Body</p>
                      <div className="bg-white/5 rounded p-3 max-h-60 overflow-auto">
                        <div
                          className="text-white/70 text-sm prose prose-invert prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.body_template }}
                        />
                      </div>
                    </div>

                    {/* Trigger Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Trigger Type</p>
                        <p className="text-white/70 text-sm">{item.trigger_type.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Send Time (EST)</p>
                        <p className="text-white/70 text-sm">{item.trigger_time || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Filter Criteria */}
                    {item.filter_criteria && Object.keys(item.filter_criteria).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-white/40 text-xs mb-2 uppercase tracking-wide">
                          Recipient Filters
                        </p>
                        <div className="bg-white/5 rounded p-3">
                          <pre className="text-white/70 text-xs">
                            {JSON.stringify(item.filter_criteria, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Footer - Only show if template is selected */}
      {selectedTemplate && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white/90 text-sm font-medium mb-1">
                How templates work
              </p>
              <p className="text-white/60 text-xs">
                When you create a new event, scheduled emails are generated from the selected template. You can
                customize individual emails for each event in the Command Center.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state - Show if no template selected */}
      {!selectedTemplate && templates.length > 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Mail className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-2">Select a template to view its emails</p>
            <p className="text-white/40 text-sm">Click on a template above to see details</p>
          </div>
        </div>
      )}
    </div>
  );
}
