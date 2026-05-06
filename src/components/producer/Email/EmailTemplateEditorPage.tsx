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
  CheckCircle2,
  AlertCircle,
  Lock,
  Search,
} from 'lucide-react';
import type { EmailTemplateItem } from '@/types/email';
import {
  EMAIL_VARIABLES,
  insertVariableAtCursor,
  validateEmailContent,
  getGroupedVariablesForUI,
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
  templateType: 'generic' | 'category'; // Template type to filter available triggers
  existingItems?: EmailTemplateItem[]; // All existing emails in the sequence for validation
  nextPosition?: number; // Position for new email (create mode)
  onBack: () => void;
  onSave?: (item: EmailTemplateItem) => Promise<void>; // Edit mode
  onCreate?: (data: {
    name: string;
    description?: string;
    position: number;
    subject_template: string;
    body_template: string;
    trigger_type: string;
    trigger_value?: number;
    trigger_time?: string;
    filter_criteria?: Record<string, any>;
    enabled_by_default?: boolean;
  }) => Promise<void>; // Create mode
}

const TRIGGER_TYPES = [
  { value: 'on_invitation_send', label: 'When Invitation Sent', requiresValue: false, emailType: 'event_announcements', templateType: 'generic' },
  { value: 'on_bulletin_post', label: 'On Bulletin Post', requiresValue: false, emailType: 'event_announcements', templateType: 'generic' },
  { value: 'on_event_update', label: 'On Event Update', requiresValue: false, emailType: 'event_updates', templateType: 'generic' },
  { value: 'on_event_cancel', label: 'On Event Cancel', requiresValue: false, emailType: 'event_updates', templateType: 'generic' },
  { value: 'days_before_deadline', label: 'Days Before Application Deadline', requiresValue: true, emailType: 'application_updates', templateType: 'generic' },
  { value: 'days_after_deadline', label: 'Days After Application Deadline', requiresValue: true, emailType: 'application_updates', templateType: 'generic' },
  { value: 'on_application_submit', label: 'On Application Submit', requiresValue: false, emailType: 'application_updates', templateType: 'category' },
  { value: 'on_approval', label: 'On Approval', requiresValue: false, emailType: 'application_updates', templateType: 'category' },
  { value: 'on_waitlist', label: 'On Waitlist', requiresValue: false, emailType: 'application_updates', templateType: 'category' },
  { value: 'on_rejection', label: 'On Rejection', requiresValue: false, emailType: 'application_updates', templateType: 'category' },
  { value: 'days_before_payment_deadline', label: 'Days Before Payment Due', requiresValue: true, emailType: 'payment_reminders', templateType: 'category' },
  { value: 'on_payment_deadline', label: 'On Payment Deadline', requiresValue: false, emailType: 'payment_reminders', templateType: 'category' },
  { value: 'days_after_payment_deadline', label: 'Days After Payment Due', requiresValue: true, emailType: 'payment_reminders', templateType: 'category' },
  { value: 'on_payment_received', label: 'On Payment Received', requiresValue: false, emailType: 'payment_reminders', templateType: 'category' },
  { value: 'days_before_event', label: 'Days Before Event', requiresValue: true, emailType: 'event_countdown', templateType: 'category' },
  { value: 'on_event_date', label: 'On Event Date', requiresValue: false, emailType: 'event_countdown', templateType: 'category' },
  { value: 'days_after_event', label: 'Days After Event', requiresValue: true, emailType: 'event_countdown', templateType: 'category' },
  { value: 'on_category_change', label: 'On Category Change', requiresValue: false, emailType: 'event_updates', templateType: 'category' },
] as const;

const EMAIL_TYPE_LABELS: Record<string, string> = {
  event_announcements: 'Event Announcements',
  application_updates: 'Application Updates',
  payment_reminders: 'Payment Reminders',
  event_countdown: 'Event Countdown',
  event_updates: 'Event Updates',
};

export function EmailTemplateEditorPage({
  item,
  templateId,
  templateType,
  existingItems = [],
  nextPosition = 1,
  onBack,
  onSave,
  onCreate,
}: EmailTemplateEditorPageProps) {
  const isCreateMode = item === null;
  const [isSaving, setIsSaving] = useState(false);

  // Value-based triggers that users can create (multiple allowed with different values)
  // These are time-based reminders (not event-triggered) that can be edited/deleted
  const VALUE_BASED_TRIGGER_TYPES = [
    'days_before_deadline',
    'days_after_deadline',
    'days_before_event',
    'on_event_date',  // Time-based, not event-triggered
    'days_after_event',
    'days_before_payment_deadline',
    'on_payment_deadline',  // Time-based, not event-triggered
    'days_after_payment_deadline',
  ];

  // Filter trigger types based on template type
  let availableTriggerTypes = TRIGGER_TYPES.filter(trigger => trigger.templateType === templateType);

  // In CREATE mode, only allow value-based triggers (users can't create system emails)
  // In EDIT mode, allow all triggers (so users can edit existing system emails)
  if (isCreateMode) {
    availableTriggerTypes = availableTriggerTypes.filter(trigger =>
      VALUE_BASED_TRIGGER_TYPES.includes(trigger.value)
    );
  }
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [duplicateTriggerWarning, setDuplicateTriggerWarning] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<'subject' | 'body' | null>(null);
  const [triggerSettingsOpen, setTriggerSettingsOpen] = useState(true);
  const [availableTagsOpen, setAvailableTagsOpen] = useState(true);
  const [tagSearch, setTagSearch] = useState('');
  const [bodyEditor, setBodyEditor] = useState<Editor | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [emailFooter, setEmailFooter] = useState<string>(''); // Locked footer content

  const subjectRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'application_updates',
    subject_template: '',
    body_template: '', // This will now contain only editable content (without footer)
    trigger_type: 'on_application_submit',
    trigger_value: 0,
    trigger_time: '09:00:00',
    filter_criteria: {} as Record<string, any>,
  });


  // Initialize form with item data (edit mode) or defaults (create mode)
  useEffect(() => {
    if (item) {
      // Edit mode: Load existing item data
      const { content, footer } = splitEmailBody(item.body_template || '');

      setFormData({
        name: item.name || '',
        category: item.category || 'application_updates',
        subject_template: item.subject_template || '',
        body_template: content,
        trigger_type: item.trigger_type || 'on_application_submit',
        trigger_value: item.trigger_value || 0,
        trigger_time: item.trigger_time?.substring(11, 19) || '09:00:00',
        filter_criteria: item.filter_criteria || {},
      });

      setEmailFooter(footer);
    } else {
      // Create mode: Set defaults based on template type
      // Use value-based triggers so users can create reminder emails
      const defaultTrigger = templateType === 'generic' ? 'days_before_deadline' : 'days_before_event';
      const defaultCategory = templateType === 'generic' ? 'application_updates' : 'event_countdown';

      setFormData({
        name: '',
        category: defaultCategory,
        subject_template: '',
        body_template: '<p>Hi [firstName],</p><p></p><p>Best regards,</p><p>[organizationName]</p>',
        trigger_type: defaultTrigger,
        trigger_value: 3, // Default to 3 days
        trigger_time: '09:00:00',
        filter_criteria: {},
      });

      // No footer for new emails (will be added on save)
      setEmailFooter('');
    }
  }, [item]);

  const selectedTriggerConfig = TRIGGER_TYPES.find(t => t.value === formData.trigger_type);

  // Check if the selected trigger already exists in the sequence
  const checkDuplicateTrigger = (triggerType: string): string | null => {
    const triggerConfig = TRIGGER_TYPES.find(t => t.value === triggerType);

    // Only check for duplicates if this trigger doesn't require a value
    // (value-based triggers like "days_before_event" can have multiples with different values)
    if (!triggerConfig?.requiresValue) {
      const duplicate = existingItems.find(
        existingItem => existingItem.trigger_type === triggerType && existingItem.id !== item?.id
      );

      if (duplicate) {
        return `This trigger type already exists in the sequence: "${duplicate.name}". Each event-based trigger can only be used once per sequence.`;
      }
    }

    return null;
  };

  // Auto-update email type when trigger changes and check for duplicates
  useEffect(() => {
    if (selectedTriggerConfig) {
      setFormData(prev => ({
        ...prev,
        category: selectedTriggerConfig.emailType
      }));
    }

    // Check for duplicate triggers and show warning
    const duplicateError = checkDuplicateTrigger(formData.trigger_type);
    setDuplicateTriggerWarning(duplicateError);
  }, [formData.trigger_type]);

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
    // Validate
    if (!formData.name || !formData.subject_template || !formData.body_template) {
      setSaveError('Name, subject, and body are required');
      return;
    }

    if (validationErrors.length > 0) {
      setSaveError('Please fix validation errors before saving');
      return;
    }

    // Check for duplicate triggers
    const duplicateError = checkDuplicateTrigger(formData.trigger_type);
    if (duplicateError) {
      setSaveError(duplicateError);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Join content and footer back together for backend storage
      const fullBodyTemplate = joinEmailBody(formData.body_template, emailFooter);

      if (isCreateMode && onCreate) {
        // Create mode: Create new template item
        const newItemData = {
          name: formData.name,
          position: nextPosition,
          subject_template: formData.subject_template,
          body_template: fullBodyTemplate,
          trigger_type: formData.trigger_type,
          trigger_value: formData.trigger_value,
          trigger_time: `2000-01-01T${formData.trigger_time}.000Z`,
          filter_criteria: formData.filter_criteria,
          enabled_by_default: true, // Always enabled - manage per-event in Command Center
        };

        await onCreate(newItemData);
      } else if (!isCreateMode && item && onSave) {
        // Edit mode: Update existing item
        const updatedItem: EmailTemplateItem = {
          ...item,
          name: formData.name,
          category: formData.category as any,
          subject_template: formData.subject_template,
          body_template: fullBodyTemplate, // Content + footer rejoined
          trigger_type: formData.trigger_type as any,
          trigger_value: formData.trigger_value,
          trigger_time: `2000-01-01T${formData.trigger_time}.000Z`,
          enabled_by_default: true, // Always enabled - manage per-event in Command Center
        };

        await onSave(updatedItem);
      }
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

  return (
    <div className="fixed inset-0 voxxy-gradient-editor z-50 flex flex-col">
      {/* Header */}
      <div className="voxxy-editor-chrome flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="rounded-lg p-1.5 text-foreground/70 transition-all hover:bg-background/40 hover:text-foreground dark:hover:bg-background/5"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-base font-bold text-foreground">
                  {isCreateMode ? 'Create New Email' : 'Edit Email Template'}
                </h1>
                {!isCreateMode && item && (
                  <p className="text-xs text-foreground/60 mt-0.5">{item.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-2 rounded-lg border border-border text-foreground/70 hover:text-foreground hover:border-border transition-all flex items-center gap-2"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
              <Button
                onClick={handleSave}
                disabled={isSaving || validationErrors.length > 0 || !!duplicateTriggerWarning}
                className="voxxy-btn-cta"
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
              <label className="block text-xs font-medium text-foreground dark:text-foreground/60 mb-1">
                Template Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Application Received"
                className="border-border bg-card/80 text-foreground dark:bg-background/5"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-foreground dark:text-foreground/60 mb-1">
                Subject Line
              </label>
              <Input
                ref={subjectRef}
                value={formData.subject_template}
                onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
                onFocus={() => setActiveField('subject')}
                placeholder="Email subject..."
                className="border-border bg-card/80 text-foreground dark:bg-background/5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Click a variable in the sidebar to insert it
              </p>
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-medium text-foreground dark:text-foreground/60 mb-1">
                Email Body
              </label>
              <div onFocus={() => setActiveField('body')}>
                <RichTextEditor
                  content={formData.body_template}
                  onChange={(html) => setFormData(prev => ({ ...prev, body_template: html }))}
                  onEditorReady={setBodyEditor}
                  placeholder="Write your email content here..."
                  isBlastEmail={formData.category === 'event_announcements'}
                />
              </div>
            </div>

            {/* Locked Footer Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-primary" />
                <label className="block text-xs font-medium text-foreground dark:text-foreground/60">
                  Email Footer (Locked)
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none rounded-lg border border-primary/20 bg-card/80 p-4 opacity-60 dark:bg-background/5">
                  <div
                    className="email-footer-preview prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: emailFooter }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="rounded-full border border-primary/30 bg-card/95 px-3 py-1.5 backdrop-blur-sm dark:bg-background/80">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary font-medium">
                        Footer is locked to ensure unsubscribe link is always present
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                The footer contains the unsubscribe link required by email regulations and cannot be edited.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Settings & Variables */}
        <div className="voxxy-editor-sidebar w-80 overflow-y-auto border-l border-border">
          <div className="p-4 space-y-4">
            {/* Trigger Settings */}
            <div>
              <button
                onClick={() => setTriggerSettingsOpen(!triggerSettingsOpen)}
                className="flex items-center justify-between w-full mb-2"
              >
                <div className="flex items-center gap-1.5 text-foreground font-medium text-sm">
                  <Clock className="h-3.5 w-3.5 text-violet-700 dark:text-primary" />
                  <span>Trigger Settings</span>
                </div>
                {triggerSettingsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-foreground/60" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-foreground/60" />
                )}
              </button>

              {triggerSettingsOpen && (
                <div className="space-y-3">
                  {/* Trigger Type */}
                  <div>
                    <label className="block text-[10px] font-medium text-foreground dark:text-foreground/60 mb-1.5 uppercase tracking-wide">
                      When to Send
                    </label>
                    <Select
                      value={formData.trigger_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_type: value }))}
                      disabled={!isCreateMode && !VALUE_BASED_TRIGGER_TYPES.includes(formData.trigger_type)}
                    >
                      <SelectTrigger className={`h-8 bg-card/80 text-foreground text-sm dark:bg-background/5 ${duplicateTriggerWarning ? 'border-red-500/50' : 'border-border'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="voxxy-select-surface">
                        {availableTriggerTypes.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-foreground text-sm">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isCreateMode && (
                      <p className="mt-1 text-[9px] text-muted-foreground">
                        Create custom reminder emails. System emails (invitations, approvals, etc.) come from the default template.
                      </p>
                    )}
                    {!isCreateMode && !VALUE_BASED_TRIGGER_TYPES.includes(formData.trigger_type) && (
                      <p className="mt-1 flex items-center gap-1 text-[9px] text-amber-700 dark:text-yellow-400/80">
                        <AlertCircle className="w-3 h-3" />
                        System email - trigger type cannot be changed
                      </p>
                    )}
                    {duplicateTriggerWarning && (
                      <div className="mt-1.5 flex items-start gap-1.5">
                        <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[9px] text-red-400 leading-tight">{duplicateTriggerWarning}</p>
                      </div>
                    )}
                  </div>

                  {/* Email Type (Auto-determined, Read-only) */}
                  <div>
                    <label className="block text-[10px] font-medium text-foreground dark:text-foreground/60 mb-1.5 uppercase tracking-wide">
                      Email Type
                    </label>
                    <div className="flex h-8 items-center rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-foreground/70 dark:bg-background/10">
                      {EMAIL_TYPE_LABELS[formData.category] || formData.category}
                    </div>
                    <p className="mt-1 text-[9px] text-muted-foreground">
                      Auto-set based on trigger selection
                    </p>
                  </div>

                  {/* Trigger Value */}
                  {selectedTriggerConfig?.requiresValue && (
                    <div>
                      <label className="block text-[10px] font-medium text-foreground dark:text-foreground/60 mb-1.5 uppercase tracking-wide">
                        Number of Days
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.trigger_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, trigger_value: parseInt(e.target.value) || 0 }))}
                        className="h-8 border-border bg-card/80 text-foreground text-sm dark:bg-background/5"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Available Tags */}
            <div>
              <button
                onClick={() => setAvailableTagsOpen(!availableTagsOpen)}
                className="flex items-center justify-between w-full mb-2"
              >
                <div className="flex items-center gap-1.5 text-foreground font-medium text-sm">
                  <Tag className="h-3.5 w-3.5 text-violet-700 dark:text-primary" />
                  <span>Available tags</span>
                </div>
                {availableTagsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-foreground/60" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-foreground/60" />
                )}
              </button>

              {availableTagsOpen && (
                <div className="space-y-3">
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search tags..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-card/80 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                    />
                  </div>
                  <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">
                    Click a tag to insert it at your cursor position
                    {formData.category === 'event_announcements' && (
                      <span className="mt-1 block text-amber-700 dark:text-yellow-400/80">
                        Note: Some variables are disabled for announcement emails (greyed out) — recipients haven't applied yet
                      </span>
                    )}
                  </p>
                  <div className="space-y-3">
                    {getGroupedVariablesForUI().map((group) => {
                      const filteredVars = tagSearch
                        ? group.variables.filter(v =>
                            v.label.toLowerCase().includes(tagSearch.toLowerCase()) ||
                            v.frontendVar.toLowerCase().includes(tagSearch.toLowerCase()) ||
                            v.description.toLowerCase().includes(tagSearch.toLowerCase())
                          )
                        : group.variables;
                      if (filteredVars.length === 0) return null;
                      return (
                      <div key={group.label}>
                        <h4 className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-primary">
                          {group.label}
                        </h4>
                        <div className="space-y-0.5">
                          {filteredVars.map((variable) => {
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
                                    ? 'cursor-not-allowed border-border bg-background/20 text-foreground/55 opacity-70 dark:bg-background/5 dark:text-foreground/40 dark:opacity-40'
                                    : 'text-foreground hover:bg-gradient-to-r hover:from-primary/20 hover:to-blue-500/20 hover:border-primary/40 border-border bg-background/5 group'
                                }`}
                                title={
                                  isAnnouncementEmail && !variable.worksInInvitations
                                    ? `${variable.description} (Not available in announcement emails — recipients haven't applied yet)`
                                    : variable.description
                                }
                              >
                                <Tag className={`w-3 h-3 flex-shrink-0 ${isDisabled ? 'text-foreground/45 dark:text-foreground/30' : 'text-violet-700 group-hover:text-violet-800 dark:text-primary dark:group-hover:text-primary'}`} />
                                <span className="flex-1 text-left truncate">{variable.label}</span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  isDisabled
                                    ? 'bg-background/20 text-foreground/45 dark:bg-background/5 dark:text-foreground/30'
                                    : 'bg-violet-100 text-violet-700 dark:bg-primary/10 dark:text-primary'
                                }`}>
                                  {variable.frontendVar.replace('[', '').replace(']', '')}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
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
          <div className="voxxy-editor-sidebar w-96 overflow-y-auto border-l border-border">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-violet-700 dark:text-primary" />
                <h3 className="text-sm font-medium text-foreground">Live Preview</h3>
              </div>

              {/* Preview Subject */}
              <div className="mb-3">
                <p className="mb-1 text-xs text-muted-foreground">Subject:</p>
                <div className="rounded-lg border border-border bg-card/80 p-3 dark:bg-background/5">
                  <p className="text-sm text-foreground">{formData.subject_template || '(No subject)'}</p>
                </div>
              </div>

              {/* Preview Body */}
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Body:</p>
                <div className="rounded-lg border border-primary/20 bg-card/80 p-4 dark:bg-background/5">
                  <div
                          className="email-preview-content voxxy-rich-text-base prose prose-sm max-w-none dark:prose-invert"
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
