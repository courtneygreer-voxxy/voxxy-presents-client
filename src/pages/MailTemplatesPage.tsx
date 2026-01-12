import { useState, useEffect } from 'react';
import { Mail, Plus, Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { emailCampaignTemplatesApi, emailTemplateItemsApi } from '@/services/api';
import type { EmailCampaignTemplate, EmailTemplateItem } from '@/types/email';

export default function MailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailCampaignTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [templateItems, setTemplateItems] = useState<EmailTemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<number | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('='.repeat(80));
      console.log('📧 MAIL TEMPLATES PAGE - LOADING EMAIL TEMPLATES');
      console.log('='.repeat(80));

      const templatesData = await emailCampaignTemplatesApi.getAll();
      console.log(`✅ Fetched ${templatesData.length} email campaign templates`);
      console.log('');

      setTemplates(templatesData);

      // Log detailed information to console
      console.log('📊 EMAIL CAMPAIGN TEMPLATES:');
      console.log('-'.repeat(80));
      templatesData.forEach((template, index) => {
        console.log(`${index + 1}. ${template.name}`);
        console.log(`   ID: ${template.id}`);
        console.log(`   Type: ${template.template_type} (${template.is_default ? 'Default' : 'Custom'})`);
        console.log(`   Description: ${template.description || 'N/A'}`);
        console.log(`   Email Count: ${template.email_count} emails`);
        console.log(`   Events Using: ${template.events_count} events`);
        console.log(`   Created: ${new Date(template.created_at).toLocaleDateString()}`);
        console.log('');
      });

      console.log('='.repeat(80));
      console.log('📧 SUMMARY:');
      console.log(`   Total Templates: ${templatesData.length}`);
      console.log(`   System Templates: ${templatesData.filter(t => t.template_type === 'system').length}`);
      console.log(`   Custom Templates: ${templatesData.filter(t => t.template_type === 'user').length}`);
      console.log('='.repeat(80));

      // Auto-select the default template
      const defaultTemplate = templatesData.find(t => t.is_default);
      if (defaultTemplate) {
        handleSelectTemplate(defaultTemplate);
      }

    } catch (err: any) {
      console.error('❌ Failed to load email templates:', err);
      setError(err.message || 'Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = async (template: EmailCampaignTemplate) => {
    setSelectedTemplate(template);
    setIsLoadingItems(true);
    setExpandedEmailId(null);

    try {
      console.log('');
      console.log('📧 LOADING EMAIL ITEMS FOR TEMPLATE:', template.name);
      console.log('-'.repeat(80));

      const items = await emailTemplateItemsApi.getByTemplate(template.id);
      console.log(`✅ Fetched ${items.length} email items`);
      console.log('');

      setTemplateItems(items);

      // Log email items details
      console.log('📋 EMAIL ITEMS IN TEMPLATE:');
      console.log('-'.repeat(80));
      items.forEach((item: EmailTemplateItem, index: number) => {
        console.log(`${index + 1}. ${item.name}`);
        console.log(`   Position: ${item.position}`);
        console.log(`   Category: ${item.category}`);
        console.log(`   Trigger: ${item.trigger_type}${item.trigger_value ? ` (${item.trigger_value} days)` : ''}`);
        console.log(`   Trigger Time: ${item.trigger_time || 'N/A'}`);
        console.log(`   Enabled by Default: ${item.enabled_by_default ? 'Yes' : 'No'}`);
        console.log(`   Subject: ${item.subject_template}`);
        console.log(`   Description: ${item.description || 'N/A'}`);

        // Show filter criteria if any
        if (item.filter_criteria && Object.keys(item.filter_criteria).length > 0) {
          console.log(`   Filters: ${JSON.stringify(item.filter_criteria)}`);
        }

        console.log('');
      });

      console.log('-'.repeat(80));

    } catch (err: any) {
      console.error('❌ Failed to load email items:', err);
      setError(err.message || 'Failed to load email items');
    } finally {
      setIsLoadingItems(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pre_application: { label: 'Pre-Application', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      application: { label: 'Application', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      payment: { label: 'Payment', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
      pre_event: { label: 'Pre-Event', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
      event_day: { label: 'Event Day', className: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
      post_event: { label: 'Post-Event', className: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
      system: { label: 'System', className: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
    };

    return badges[category] || { label: category, className: 'bg-white/10 text-white/70 border-white/20' };
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0515]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading email templates...</p>
        </div>
      </div>
    );
  }

  // Show coming soon banner instead of error - backend not deployed yet
  if (error) {
    console.log('⚠️ API error (expected until backend deployed):', error);
  }

  return (
    <div className="h-full bg-[#0a0515] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0f0820] px-6 py-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Email Templates</h1>
            <p className="text-white/60">Manage email automation sequences for your events</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Create New Template
          </button>
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-white font-semibold mb-1">Coming Soon</h3>
              <p className="text-white/70 text-sm">
                Email templates feature is currently in development. You'll be able to create and manage email automation sequences that can be imported during event creation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Template List */}
        <div className="w-80 border-r border-white/10 bg-[#0f0820] overflow-y-auto">
          <div className="p-4 space-y-2">
            {templates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              const isSystem = template.template_type === 'system';

              return (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-[#1e1536] border-purple-500/20 hover:bg-purple-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold">{template.name}</h3>
                    {isSystem && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">
                    {template.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span>{template.email_count} emails</span>
                    <span>•</span>
                    <span>{template.events_count} events</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content - Email Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedTemplate ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Mail className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">Select a template to view emails</p>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Template Header */}
              <div className="bg-[#1e1536] rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedTemplate.name}</h2>
                    <p className="text-white/60">{selectedTemplate.description}</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all">
                    Edit Template
                  </button>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    <span className="text-white/70">{selectedTemplate.email_count} emails</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-white/70">Used by {selectedTemplate.events_count} events</span>
                  </div>
                </div>
              </div>

              {/* Email Items Loading */}
              {isLoadingItems ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Email Sequence ({templateItems.length})
                    </h3>
                  </div>

                  {templateItems.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-white/40">No emails in this template</p>
                    </div>
                  ) : (
                    templateItems.map((item) => {
                      const isExpanded = expandedEmailId === item.id;
                      const categoryBadge = getCategoryBadge(item.category);

                      return (
                        <div
                          key={item.id}
                          className="bg-[#1e1536] rounded-xl border border-purple-500/20 overflow-hidden"
                        >
                          {/* Email Item Header */}
                          <div
                            className="p-5 cursor-pointer hover:bg-purple-500/5 transition-colors"
                            onClick={() => setExpandedEmailId(isExpanded ? null : item.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-white/40 text-sm">#{item.position}</span>
                                  <h4 className="text-white font-semibold">{item.name}</h4>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${categoryBadge.className}`}
                                  >
                                    {categoryBadge.label}
                                  </span>
                                  {item.enabled_by_default && (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                                      Enabled
                                    </span>
                                  )}
                                </div>
                                <p className="text-white/60 text-sm mb-2">{item.subject_template}</p>
                                <div className="flex items-center gap-4 text-xs text-white/50">
                                  <span>Trigger: {item.trigger_type.replace(/_/g, ' ')}</span>
                                  {item.trigger_value && <span>• {item.trigger_value} days</span>}
                                  {item.trigger_time && <span>• {item.trigger_time}</span>}
                                </div>
                              </div>
                              <button className="text-white/40 hover:text-white transition-colors">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Email Body */}
                          {isExpanded && (
                            <div className="border-t border-purple-500/10 bg-[#0f0a1f] p-5 space-y-4">
                              {item.description && (
                                <div>
                                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
                                    Description
                                  </label>
                                  <p className="text-white/70 text-sm">{item.description}</p>
                                </div>
                              )}

                              <div>
                                <label className="block text-xs text-white/50 mb-2 uppercase tracking-wide">
                                  Email Body (HTML)
                                </label>
                                <div
                                  className="bg-[#1e1536] rounded-lg p-4 border border-white/10 text-sm text-white/70 max-h-64 overflow-y-auto"
                                  dangerouslySetInnerHTML={{ __html: item.body_template }}
                                />
                              </div>

                              {item.filter_criteria && Object.keys(item.filter_criteria).length > 0 && (
                                <div>
                                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wide">
                                    Recipient Filters
                                  </label>
                                  <pre className="bg-[#1e1536] rounded-lg p-3 border border-white/10 text-xs text-white/60 overflow-x-auto">
                                    {JSON.stringify(item.filter_criteria, null, 2)}
                                  </pre>
                                </div>
                              )}

                              <div className="flex items-center gap-3 pt-2">
                                <button className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all text-sm flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Preview
                                </button>
                                <button className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all text-sm">
                                  Edit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
