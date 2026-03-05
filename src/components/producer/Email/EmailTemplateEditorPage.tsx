/**
 * EmailTemplateEditorPage - Full-screen template editor
 *
 * Based on EmailEditorPage design but adapted for editing EmailTemplateItem objects
 * Layout: Subject/Body on left, Settings/Variables sidebar on right
 */

import { useEffect, useState, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
  Tag,
  Users,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { EmailTemplateItem } from '@/types/email';
import {
  EMAIL_VARIABLES,
  insertVariableAtCursor,
  validateEmailContent,
} from '@/utils/emailVariables';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from './RichTextEditor';

interface EmailTemplateEditorPageProps {
  item: EmailTemplateItem | null;
  templateId: number;
  onBack: () => void;
  onSave: (item: EmailTemplateItem) => Promise<void>;
}

const TRIGGER_TYPES = [
  { value: 'on_invitation_send', label: 'When Invitation Sent', requiresValue: false },
  { value: 'on_application_submit', label: 'On Application Submit', requiresValue: false },
  { value: 'on_approval', label: 'On Approval', requiresValue: false },
  { value: 'on_waitlist', label: 'On Waitlist', requiresValue: false },
  { value: 'on_rejection', label: 'On Rejection', requiresValue: false },
  { value: 'days_before_deadline', label: 'Days Before Application Deadline', requiresValue: true },
  { value: 'days_before_payment_deadline', label: 'Days Before Payment Due', requiresValue: true },
  { value: 'on_payment_deadline', label: 'On Payment Deadline', requiresValue: false },
  { value: 'days_after_payment_deadline', label: 'Days After Payment Due', requiresValue: true },
  { value: 'on_payment_received', label: 'On Payment Received', requiresValue: false },
  { value: 'days_before_event', label: 'Days Before Event', requiresValue: true },
  { value: 'on_event_date', label: 'On Event Date', requiresValue: false },
  { value: 'days_after_event', label: 'Days After Event', requiresValue: true },
  { value: 'on_bulletin_post', label: 'On Bulletin Post', requiresValue: false },
  { value: 'on_category_change', label: 'On Category Change', requiresValue: false },
  { value: 'on_event_update', label: 'On Event Update', requiresValue: false },
  { value: 'on_event_cancel', label: 'On Event Cancel', requiresValue: false },
];

const CATEGORY_OPTIONS = [
  { value: 'event_announcements', label: 'Event Announcements' },
  { value: 'application_updates', label: 'Application Updates' },
  { value: 'payment_reminders', label: 'Payment Reminders' },
  { value: 'event_countdown', label: 'Event Countdown' },
  { value: 'event_updates', label: 'Event Updates' },
];

export function EmailTemplateEditorPage({
  item,
  templateId,
  onBack,
  onSave,
}: EmailTemplateEditorPageProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<'subject' | 'body' | null>(null);
  const [triggerSettingsOpen, setTriggerSettingsOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [availableTagsOpen, setAvailableTagsOpen] = useState(true);
  const [bodyEditor, setBodyEditor] = useState<Editor | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const subjectRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'application_updates',
    subject_template: '',
    body_template: '',
    trigger_type: 'on_application_submit',
    trigger_value: 0,
    trigger_time: '09:00:00',
    enabled_by_default: true,
    filter_criteria: {} as Record<string, any>,
  });

  // Filter criteria state
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string[]>([]);

  // Initialize form with item data
  useEffect(() => {
    if (!item) return;

    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'application_updates',
      subject_template: item.subject_template || '',
      body_template: item.body_template || '',
      trigger_type: item.trigger_type || 'on_application_submit',
      trigger_value: item.trigger_value || 0,
      trigger_time: item.trigger_time?.substring(11, 19) || '09:00:00',
      enabled_by_default: item.enabled_by_default !== false,
      filter_criteria: item.filter_criteria || {},
    });

    // Parse filter criteria
    if (item.filter_criteria) {
      setFilterStatus(item.filter_criteria.statuses || []);
      setFilterPaymentStatus(item.filter_criteria.payment_status || []);
    }
  }, [item]);

  const selectedTriggerConfig = TRIGGER_TYPES.find(t => t.value === formData.trigger_type);

  // Strip HTML tags for validation
  const stripHtmlForValidation = (html: string): string => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Validate content when it changes
  useEffect(() => {
    if (!formData.subject_template && !formData.body_template) return;

    const plainSubject = formData.subject_template || '';
    const plainBody = stripHtmlForValidation(formData.body_template || '');

    const validation = validateEmailContent(plainSubject, plainBody);

    const errors: string[] = [];
    if (validation.unknownVariables.length > 0) {
      errors.push(`Unknown variables: ${validation.unknownVariables.join(', ')}`);
    }
    if (validation.unclosedBrackets.length > 0) {
      errors.push(`Unclosed brackets: ${validation.unclosedBrackets.join(', ')}`);
    }

    setValidationErrors(errors);
  }, [formData.subject_template, formData.body_template]);

  const handleVariableClick = (variable: string) => {
    if (activeField === 'subject' && subjectRef.current) {
      const cursorPos = subjectRef.current.selectionStart || 0;
      const before = formData.subject_template.substring(0, cursorPos);
      const after = formData.subject_template.substring(cursorPos);
      setFormData(prev => ({
        ...prev,
        subject_template: before + variable + after
      }));
      setTimeout(() => {
        if (subjectRef.current) {
          const newPos = cursorPos + variable.length;
          subjectRef.current.focus();
          subjectRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    } else if (activeField === 'body' && bodyEditor) {
      insertVariableAtCursor(bodyEditor, variable);
    }
  };

  const handleSave = async () => {
    if (!item) return;

    // Validate
    if (!formData.name || !formData.subject_template || !formData.body_template) {
      setSaveError('Name, subject, and body are required');
      return;
    }

    if (validationErrors.length > 0) {
      setSaveError('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Build filter criteria
      const filter_criteria: Record<string, any> = {};
      if (filterStatus.length > 0) filter_criteria.statuses = filterStatus;
      if (filterPaymentStatus.length > 0) filter_criteria.payment_status = filterPaymentStatus;

      const updatedItem: EmailTemplateItem = {
        ...item,
        name: formData.name,
        description: formData.description,
        category: formData.category as any,
        subject_template: formData.subject_template,
        body_template: formData.body_template,
        trigger_type: formData.trigger_type as any,
        trigger_value: formData.trigger_value,
        trigger_time: `2000-01-01T${formData.trigger_time}.000Z`,
        enabled_by_default: formData.enabled_by_default,
        filter_criteria,
      };

      await onSave(updatedItem);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  // Render preview HTML
  const renderPreview = () => {
    let previewHtml = formData.body_template;

    // Replace variables with sample values for preview
    EMAIL_VARIABLES.forEach(v => {
      const regex = new RegExp(`\\[${v.variable}\\]`, 'g');
      previewHtml = previewHtml.replace(regex, v.example);
    });

    return previewHtml;
  };

  if (!item) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f0a1e] via-[#1a0f2e] to-[#0f0a1e] z-50 flex items-center justify-center">
        <p className="text-white/60">No template selected</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f0a1e] via-[#1a0f2e] to-[#0f0a1e] z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Edit Email Template</h1>
                <p className="text-sm text-white/60 mt-0.5">{item.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
              <Button
                onClick={handleSave}
                disabled={isSaving || validationErrors.length > 0}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Validation Errors</p>
                  <ul className="text-red-400/80 text-sm mt-1 space-y-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Save Error */}
            {saveError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400">{saveError}</p>
              </div>
            )}

            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Template Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Application Received"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description (Optional)
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this email"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Subject Line
              </label>
              <Input
                ref={subjectRef}
                value={formData.subject_template}
                onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
                onFocus={() => setActiveField('subject')}
                placeholder="Email subject..."
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="mt-1 text-xs text-white/40">
                Click a variable in the sidebar to insert it
              </p>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Body
              </label>
              <div onFocus={() => setActiveField('body')}>
                <RichTextEditor
                  content={formData.body_template}
                  onChange={(html) => setFormData(prev => ({ ...prev, body_template: html }))}
                  onEditorReady={setBodyEditor}
                  placeholder="Write your email content here..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Settings & Variables */}
        <div className="w-96 border-l border-white/10 overflow-y-auto bg-black/20 backdrop-blur-sm">
          <div className="p-6 space-y-6">
            {/* Trigger Settings */}
            <div>
              <button
                onClick={() => setTriggerSettingsOpen(!triggerSettingsOpen)}
                className="w-full flex items-center justify-between text-white hover:text-white/80 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Trigger Settings</span>
                </div>
                {triggerSettingsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {triggerSettingsOpen && (
                <div className="mt-4 space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Trigger Type */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      When to Send
                    </label>
                    <select
                      value={formData.trigger_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, trigger_type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      {TRIGGER_TYPES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Trigger Value */}
                  {selectedTriggerConfig?.requiresValue && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Days
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.trigger_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, trigger_value: parseInt(e.target.value) || 0 }))}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  )}

                  {/* Send Time */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Send Time
                    </label>
                    <Input
                      type="time"
                      value={formData.trigger_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, trigger_time: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  {/* Enabled by Default */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={formData.enabled_by_default}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled_by_default: e.target.checked }))}
                      className="rounded border-white/20"
                    />
                    <label htmlFor="enabled" className="text-sm text-white/70">
                      Enabled by default
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="w-full flex items-center justify-between text-white hover:text-white/80 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Recipient Filters</span>
                </div>
                {filtersOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {filtersOpen && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Application Status
                    </label>
                    <div className="space-y-2">
                      {['pending', 'approved', 'waitlisted', 'rejected', 'confirmed'].map(status => (
                        <div key={status} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`status-${status}`}
                            checked={filterStatus.includes(status)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilterStatus([...filterStatus, status]);
                              } else {
                                setFilterStatus(filterStatus.filter(s => s !== status));
                              }
                            }}
                            className="rounded border-white/20"
                          />
                          <label htmlFor={`status-${status}`} className="text-sm text-white/70 capitalize">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Payment Status
                    </label>
                    <div className="space-y-2">
                      {['pending', 'paid', 'overdue'].map(status => (
                        <div key={status} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`payment-${status}`}
                            checked={filterPaymentStatus.includes(status)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilterPaymentStatus([...filterPaymentStatus, status]);
                              } else {
                                setFilterPaymentStatus(filterPaymentStatus.filter(s => s !== status));
                              }
                            }}
                            className="rounded border-white/20"
                          />
                          <label htmlFor={`payment-${status}`} className="text-sm text-white/70 capitalize">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Available Variables */}
            <div>
              <button
                onClick={() => setAvailableTagsOpen(!availableTagsOpen)}
                className="w-full flex items-center justify-between text-white hover:text-white/80 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">Available Variables</span>
                </div>
                {availableTagsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {availableTagsOpen && (
                <div className="mt-4">
                  <p className="text-xs text-white/40 mb-3">
                    Click to insert into {activeField === 'subject' ? 'subject' : activeField === 'body' ? 'body' : 'email'}
                  </p>
                  <div className="space-y-1">
                    {EMAIL_VARIABLES.filter(v => v.enabled).map((variable) => (
                      <button
                        key={variable.variable}
                        onClick={() => handleVariableClick(`[${variable.variable}]`)}
                        disabled={!activeField}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <code className="text-xs text-purple-400 font-mono">
                            [{variable.variable}]
                          </code>
                        </div>
                        <p className="text-xs text-white/50 mt-1">{variable.description}</p>
                        <p className="text-xs text-white/30 mt-0.5 italic">Example: {variable.example}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel (Conditional) */}
        {showPreview && (
          <div className="w-96 border-l border-white/10 overflow-y-auto bg-black/30 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-purple-400" />
                <h3 className="font-medium text-white">Live Preview</h3>
              </div>

              {/* Preview Subject */}
              <div className="mb-4">
                <p className="text-xs text-white/40 mb-1">Subject:</p>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white">{formData.subject_template || '(No subject)'}</p>
                </div>
              </div>

              {/* Preview Body */}
              <div>
                <p className="text-xs text-white/40 mb-1">Body:</p>
                <div className="p-6 rounded-lg bg-white/5 border border-purple-500/20">
                  <div
                    className="email-preview-content prose prose-sm max-w-none prose-invert"
                    dangerouslySetInnerHTML={{ __html: renderPreview() }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
