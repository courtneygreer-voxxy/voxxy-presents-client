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
  Lock,
} from 'lucide-react';
import type { EmailTemplateItem } from '@/types/email';
import {
  EMAIL_VARIABLES,
  insertVariableAtCursor,
  validateEmailContent,
} from '@/utils/emailVariables';
import { splitEmailBody, joinEmailBody } from '@/utils/emailFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [emailFooter, setEmailFooter] = useState<string>(''); // Locked footer content

  const subjectRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'application_updates',
    subject_template: '',
    body_template: '', // This will now contain only editable content (without footer)
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

    // Split body into content and footer
    const { content, footer } = splitEmailBody(item.body_template || '');

    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'application_updates',
      subject_template: item.subject_template || '',
      body_template: content, // Only editable content, footer separated
      trigger_type: item.trigger_type || 'on_application_submit',
      trigger_value: item.trigger_value || 0,
      trigger_time: item.trigger_time?.substring(11, 19) || '09:00:00',
      enabled_by_default: item.enabled_by_default !== false,
      filter_criteria: item.filter_criteria || {},
    });

    // Store footer separately (locked from editing)
    setEmailFooter(footer);

    // Parse filter criteria
    if (item.filter_criteria) {
      setFilterStatus(item.filter_criteria.status || []);
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
      // Insert variable at current cursor position in TipTap editor
      bodyEditor.chain().focus().insertContent(variable).run();
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

      // Join content and footer back together for backend storage
      const fullBodyTemplate = joinEmailBody(formData.body_template, emailFooter);

      const updatedItem: EmailTemplateItem = {
        ...item,
        name: formData.name,
        description: formData.description,
        category: formData.category as any,
        subject_template: formData.subject_template,
        body_template: fullBodyTemplate, // Content + footer rejoined
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
    // Join content and footer for preview
    let previewHtml = joinEmailBody(formData.body_template, emailFooter);

    // Replace variables with sample values for preview
    EMAIL_VARIABLES.forEach(v => {
      const regex = new RegExp(v.frontendVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
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
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-base font-bold text-white">Edit Email Template</h1>
                <p className="text-xs text-white/60 mt-0.5">{item.name}</p>
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
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm font-medium">Validation Errors</p>
                  <ul className="text-red-400/80 text-xs mt-0.5 space-y-0.5">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Save Error */}
            {saveError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{saveError}</p>
              </div>
            )}

            {/* Template Name */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">
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
              <label className="block text-xs font-medium text-white/60 mb-1">
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
              <label className="block text-xs font-medium text-white/60 mb-1">
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
              <label className="block text-xs font-medium text-white/60 mb-1">
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

            {/* Locked Footer Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <label className="block text-xs font-medium text-white/60">
                  Email Footer (Locked)
                </label>
              </div>
              <div className="relative">
                <div className="p-4 rounded-lg bg-white/5 border border-purple-500/20 opacity-60 pointer-events-none">
                  <div
                    className="email-footer-preview prose prose-sm max-w-none prose-invert"
                    dangerouslySetInnerHTML={{ __html: emailFooter }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple-500/30">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-purple-300" />
                      <span className="text-xs text-purple-300 font-medium">
                        Footer is locked to ensure unsubscribe link is always present
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-white/40">
                The footer contains the unsubscribe link required by email regulations and cannot be edited.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Settings & Variables */}
        <div className="w-80 border-l border-white/10 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-sm overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Trigger Settings */}
            <div>
              <button
                onClick={() => setTriggerSettingsOpen(!triggerSettingsOpen)}
                className="flex items-center justify-between w-full mb-2"
              >
                <div className="flex items-center gap-1.5 text-white font-medium text-sm">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Trigger Settings</span>
                </div>
                {triggerSettingsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                )}
              </button>

              {triggerSettingsOpen && (
                <div className="space-y-3">
                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-medium text-white/60 mb-1.5 uppercase tracking-wide">
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a0f2e] border-purple-500/20">
                        {CATEGORY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-white text-sm">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trigger Type */}
                  <div>
                    <label className="block text-[10px] font-medium text-white/60 mb-1.5 uppercase tracking-wide">
                      When to Send
                    </label>
                    <Select
                      value={formData.trigger_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_type: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a0f2e] border-purple-500/20">
                        {TRIGGER_TYPES.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-white text-sm">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trigger Value */}
                  {selectedTriggerConfig?.requiresValue && (
                    <div>
                      <label className="block text-[10px] font-medium text-white/60 mb-1.5 uppercase tracking-wide">
                        Number of Days
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.trigger_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, trigger_value: parseInt(e.target.value) || 0 }))}
                        className="bg-white/5 border-white/20 text-white text-sm h-8"
                      />
                    </div>
                  )}

                  {/* Send Time */}
                  <div>
                    <label className="block text-[10px] font-medium text-white/60 mb-1.5 uppercase tracking-wide">
                      Send Time
                    </label>
                    <Input
                      type="time"
                      value={formData.trigger_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, trigger_time: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white text-sm h-8"
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
                className="flex items-center justify-between w-full mb-2"
              >
                <div className="flex items-center gap-1.5 text-white font-medium text-sm">
                  <Filter className="w-3.5 h-3.5 text-purple-400" />
                  <span>Recipient Filters</span>
                </div>
                {filtersOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                )}
              </button>

              {filtersOpen && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-medium text-white/60 mb-1.5 uppercase tracking-wide">
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
                    <label className="block text-[10px] font-medium text-white/60 mb-1.5 uppercase tracking-wide">
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

            {/* Available Tags */}
            <div>
              <button
                onClick={() => setAvailableTagsOpen(!availableTagsOpen)}
                className="flex items-center justify-between w-full mb-2"
              >
                <div className="flex items-center gap-1.5 text-white font-medium text-sm">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Available tags</span>
                </div>
                {availableTagsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                )}
              </button>

              {availableTagsOpen && (
                <div className="space-y-1">
                  <p className="text-[10px] text-white/60 mb-2 leading-relaxed">
                    Click a tag to insert it at your cursor position
                    {formData.category === 'event_announcements' && (
                      <span className="block mt-1 text-yellow-400/80">
                        Note: Some variables are disabled for announcement emails (greyed out) — recipients haven't applied yet
                      </span>
                    )}
                  </p>
                  <div className="space-y-0.5">
                    {EMAIL_VARIABLES.map((variable) => {
                      const isAnnouncementEmail = formData.category === 'event_announcements';
                      const isDisabled = (isAnnouncementEmail && !variable.worksInInvitations) || !activeField;

                      return (
                        <button
                          key={variable.frontendVar}
                          onClick={() => !isDisabled && handleVariableClick(variable.frontendVar)}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={isDisabled}
                          className={`flex items-center gap-1.5 w-full px-2 py-1.5 text-xs rounded transition-all border ${
                            isDisabled
                              ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/5 text-white/40'
                              : 'text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-500/40 border-white/10 bg-white/5 group'
                          }`}
                          title={
                            isAnnouncementEmail && !variable.worksInInvitations
                              ? `${variable.description} (Not available in announcement emails — recipients haven't applied yet)`
                              : variable.description
                          }
                        >
                          <Tag className={`w-3 h-3 flex-shrink-0 ${isDisabled ? 'text-white/30' : 'text-purple-400 group-hover:text-purple-300'}`} />
                          <span className="flex-1 text-left truncate">{variable.label}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            isDisabled
                              ? 'text-white/30 bg-white/5'
                              : 'text-purple-400 bg-purple-500/10'
                          }`}>
                            {variable.frontendVar.replace('[', '').replace(']', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel (Conditional) */}
        {showPreview && (
          <div className="w-96 border-l border-white/10 overflow-y-auto bg-black/30 backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-medium text-white">Live Preview</h3>
              </div>

              {/* Preview Subject */}
              <div className="mb-3">
                <p className="text-xs text-white/40 mb-1">Subject:</p>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white">{formData.subject_template || '(No subject)'}</p>
                </div>
              </div>

              {/* Preview Body */}
              <div>
                <p className="text-xs text-white/40 mb-1">Body:</p>
                <div className="p-4 rounded-lg bg-white/5 border border-purple-500/20">
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
