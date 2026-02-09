/**
 * EmailEditorPage - Full-screen email editor
 *
 * Replaces the modal popup with a clean full-screen editing experience.
 * Layout: Subject/Body on left, Settings/Variables sidebar on right
 */

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Eye,
  Save,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
  Tag,
  Users,
  Globe
} from 'lucide-react';
import type { ScheduledEmail, UpdateEmailRequest, TriggerType } from '@/types/email';
import {
  EMAIL_VARIABLES,
  backendToFrontend,
  frontendToBackend,
  insertVariableAtCursor,
  validateEmailContent,
} from '@/utils/emailVariables';
import { getEightAmLocalAsUTC, getTimezoneInfo, formatDateWithTimezone } from '@/utils/timezone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addDays, subDays, parseISO } from 'date-fns';

interface EmailEditorPageProps {
  email: ScheduledEmail | null;
  eventData: any | null;
  onBack: () => void;
  onSave: (emailId: number, data: UpdateEmailRequest) => Promise<void>;
  onPreview: () => void;
}

const editEmailSchema = z.object({
  name: z.string().min(1, 'Email name is required'),
  subject_template: z.string().min(1, 'Subject is required'),
  body_template: z.string().min(1, 'Email body is required'),
  trigger_type: z.string().min(1, 'Trigger type is required'),
  trigger_value: z.number().min(0, 'Must be 0 or greater').optional(),
});

type EditEmailFormData = z.infer<typeof editEmailSchema>;

const TRIGGER_TYPES = [
  { value: 'days_before_event', label: 'Days Before Event', requiresValue: true, description: 'Send X days before the event date' },
  { value: 'days_after_event', label: 'Days After Event', requiresValue: true, description: 'Send X days after the event date' },
  { value: 'days_before_deadline', label: 'Days Before Application Deadline', requiresValue: true, description: 'Send X days before application deadline' },
  { value: 'on_event_date', label: 'On Event Date', requiresValue: false, description: 'Send on the event date' },
  { value: 'on_application_open', label: 'When Applications Open', requiresValue: false, description: 'Send when event is created' },
  { value: 'days_before_payment_deadline', label: 'Days Before Payment Due', requiresValue: true, description: 'Send X days before payment deadline' },
  { value: 'on_payment_deadline', label: 'On Payment Deadline', requiresValue: false, description: 'Send on payment deadline day' },
];

export function EmailEditorPage({
  email,
  eventData,
  onBack,
  onSave,
  onPreview,
}: EmailEditorPageProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<'subject' | 'body' | null>(null);
  const [triggerSettingsOpen, setTriggerSettingsOpen] = useState(true);
  const [recipientsOpen, setRecipientsOpen] = useState(false);
  const [availableTagsOpen, setAvailableTagsOpen] = useState(true);

  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const timezoneInfo = getTimezoneInfo();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditEmailFormData>({
    resolver: zodResolver(editEmailSchema),
  });

  const subject = watch('subject_template');
  const body = watch('body_template');
  const triggerType = watch('trigger_type');
  const triggerValue = watch('trigger_value');

  const selectedTriggerConfig = TRIGGER_TYPES.find(t => t.value === triggerType);

  // Initialize form with email data - CONVERT backend format to frontend
  useEffect(() => {
    if (!email) return;

    console.log('📧 Loading email into editor:', email.name);
    const convertedSubject = backendToFrontend(email.subject_template || '');
    const convertedBody = backendToFrontend(email.body_template || '');

    reset({
      name: email.name || '',
      subject_template: convertedSubject,
      body_template: convertedBody,
      trigger_type: email.trigger_type || 'on_event_date',
      trigger_value: email.trigger_value || 0,
    });
  }, [email, reset]);

  // Validate content when it changes
  useEffect(() => {
    if (!subject && !body) return;

    const validation = validateEmailContent(subject || '', body || '');

    const errors: string[] = [];
    if (validation.unknownVariables.length > 0) {
      errors.push(`Unknown variables: ${validation.unknownVariables.join(', ')}`);
    }
    if (validation.unclosedBrackets.length > 0) {
      errors.push(`Unclosed brackets: ${validation.unclosedBrackets.join(', ')}`);
    }

    setValidationErrors(errors);
  }, [subject, body]);

  // Calculate preview date
  const calculatePreviewDate = () => {
    if (!eventData?.start_date || !triggerType) return null;

    try {
      const eventDate = parseISO(eventData.start_date);
      let scheduledDate = eventDate;

      switch (triggerType) {
        case 'days_before_event':
        case 'days_before_deadline':
        case 'days_before_payment_deadline':
          scheduledDate = subDays(eventDate, triggerValue || 0);
          break;
        case 'days_after_event':
          scheduledDate = addDays(eventDate, triggerValue || 0);
          break;
        case 'on_event_date':
        case 'on_application_open':
        case 'on_payment_deadline':
          scheduledDate = eventDate;
          break;
      }

      return formatDateWithTimezone(scheduledDate);
    } catch (error) {
      return null;
    }
  };

  const handleInsertVariable = (variable: string) => {
    if (activeField === 'subject' && subjectRef.current) {
      const newValue = insertVariableAtCursor(subjectRef.current, variable);
      setValue('subject_template', newValue, { shouldValidate: true });
    } else if (activeField === 'body' && bodyRef.current) {
      const newValue = insertVariableAtCursor(bodyRef.current, variable);
      setValue('body_template', newValue, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: EditEmailFormData) => {
    if (!email) return;
    if (validationErrors.length > 0) return;

    setIsSaving(true);
    try {
      const convertedSubject = frontendToBackend(data.subject_template);
      const convertedBody = frontendToBackend(data.body_template);
      const trigger_time = getEightAmLocalAsUTC();

      const updateData: UpdateEmailRequest = {
        name: data.name,
        subject_template: convertedSubject,
        body_template: convertedBody,
        trigger_type: data.trigger_type as TriggerType,
        trigger_value: data.trigger_value,
        trigger_time,
      };

      await onSave(email.id, updateData);
    } catch (error) {
      console.error('Failed to save email:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!email) return null;

  const previewDate = calculatePreviewDate();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f0a1e] via-[#1a0f2e] to-[#0f0a1e] z-50 flex">
      {/* Left Side - Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-white/10 px-12 py-3 flex items-center justify-between backdrop-blur-sm bg-black/20">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <Input
              {...register('name')}
              className="bg-white/5 border-white/20 text-white text-base font-medium max-w-md h-9"
              placeholder="Email name"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onPreview}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-9"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Preview
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving || validationErrors.length > 0}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white h-9"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Email
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-12 py-6">
          <div className="max-w-3xl mx-auto">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 font-medium text-sm mb-1">Validation Errors:</p>
                <ul className="text-red-400/80 text-xs space-y-0.5">
                  {validationErrors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Errors */}
            {(errors.name || errors.subject_template || errors.body_template) && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 font-medium text-sm mb-1">Please fix the following:</p>
                <ul className="text-red-400/80 text-xs space-y-0.5">
                  {errors.name && <li>• {errors.name.message}</li>}
                  {errors.subject_template && <li>• {errors.subject_template.message}</li>}
                  {errors.body_template && <li>• {errors.body_template.message}</li>}
                </ul>
              </div>
            )}

            {/* Subject Line */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Subject Line
              </label>
              <Input
                {...register('subject_template', {
                  onChange: (e) => {
                    if (subjectRef.current) {
                      subjectRef.current.value = e.target.value;
                    }
                  }
                })}
                ref={(e) => {
                  register('subject_template').ref(e);
                  if (e) (subjectRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
                }}
                onFocus={() => setActiveField('subject')}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 text-sm h-9"
                placeholder="e.g., Reminder: [eventName] is Tomorrow!"
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Email Body
              </label>
              <Textarea
                {...register('body_template', {
                  onChange: (e) => {
                    if (bodyRef.current) {
                      bodyRef.current.value = e.target.value;
                    }
                  }
                })}
                ref={(e) => {
                  register('body_template').ref(e);
                  if (e) (bodyRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = e;
                }}
                onFocus={() => setActiveField('body')}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[400px] font-mono text-sm leading-relaxed resize-none"
                placeholder="Write your email message here... Click variables on the right to insert."
              />
              <div className="mt-2 p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-[10px] text-purple-400 font-semibold mb-2 uppercase tracking-wide">Email Footer (auto-included)</p>
                <p className="text-[10px] text-white/60 leading-relaxed">
                  <span className="block mb-1.5">Please do not reply to this email.</span>
                  <span className="block mb-1.5">
                    For questions, contact{' '}
                    <span className="text-purple-300 font-medium">[organizationEmail]</span>
                  </span>
                  <span className="block mb-1.5">
                    <span className="text-purple-300 underline">Unsubscribe from these emails</span>
                  </span>
                  <span className="block text-white/40 text-[9px] mt-2">
                    Powered by Voxxy
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
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
                <div>
                  <label className="block text-[10px] font-medium text-white/60 mb-1.5 uppercase tracking-wide">
                    When to Send
                  </label>
                  <Select
                    value={triggerType}
                    onValueChange={(value) => setValue('trigger_type', value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white text-sm h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a0f2e] border-purple-500/20">
                      {TRIGGER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white text-sm">
                          <div>
                            <div className="font-medium text-xs">{type.label}</div>
                            <div className="text-[10px] text-white/50">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTriggerConfig?.requiresValue && (
                  <div>
                    <label className="block text-[10px] font-medium text-white/60 mb-1.5 uppercase tracking-wide">
                      Number of Days
                    </label>
                    <Input
                      type="number"
                      {...register('trigger_value', { valueAsNumber: true })}
                      className="bg-white/5 border-white/20 text-white text-sm h-8"
                      min={0}
                      placeholder="e.g., 1"
                    />
                  </div>
                )}

                {/* Send Time Info */}
                <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-1.5">
                    <Globe className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-300 text-xs font-medium">
                        Send Time: {timezoneInfo.eightAmLocal}
                      </p>
                      <p className="text-blue-300/60 text-[10px] mt-0.5">
                        All emails send at 8:00 AM ({timezoneInfo.timezone})
                      </p>
                    </div>
                  </div>
                </div>

                {previewDate && (
                  <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-[10px] text-purple-400/80 mb-0.5 uppercase tracking-wide font-semibold">Scheduled for:</p>
                    <p className="text-xs text-white font-medium">{previewDate}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recipients */}
          <div>
            <button
              onClick={() => setRecipientsOpen(!recipientsOpen)}
              className="flex items-center justify-between w-full mb-2"
            >
              <div className="flex items-center gap-1.5 text-white font-medium text-sm">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Recipients</span>
              </div>
              {recipientsOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-white/60" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-white/60" />
              )}
            </button>

            {recipientsOpen && (
              <div className="space-y-1.5">
                <p className="text-xs text-white">By Category</p>
                <p className="text-[10px] text-white/60 leading-relaxed">
                  Category targeting is configured when this template is applied to a specific event.
                </p>
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
                </p>
                <div className="space-y-0.5">
                  {EMAIL_VARIABLES.map((variable) => (
                    <button
                      key={variable.frontendVar}
                      type="button"
                      onClick={() => handleInsertVariable(variable.frontendVar)}
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                      className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-500/40 rounded transition-all border border-white/10 bg-white/5 group"
                      title={variable.description}
                    >
                      <Tag className="w-3 h-3 text-purple-400 group-hover:text-purple-300 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{variable.label}</span>
                      <span className="text-[9px] text-purple-400 font-mono px-1.5 py-0.5 bg-purple-500/10 rounded">
                        {variable.frontendVar.replace('[', '').replace(']', '')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
