/**
 * EditScheduledEmailModal - Edit scheduled email content and settings
 *
 * KEY FEATURES IMPLEMENTED:
 * ========================
 *
 * 1. Plain Text Editing with [bracket] Variables
 *    - Users edit in plain text format (not HTML)
 *    - Variables use [bracket] format: [eventName], [firstName], etc.
 *    - Clickable variable buttons insert variables at cursor position
 *    - Content is converted to HTML on save for backend storage
 *
 * 2. Real-time Validation
 *    - Unknown variable detection (e.g., [customField] that doesn't exist)
 *    - Unclosed bracket detection (e.g., [eventDate without closing ])
 *    - Past date validation (prevents scheduling emails in the past)
 *    - Save button disabled when validation errors exist
 *
 * 3. Timezone-Aware Scheduling
 *    - Emails always send at 8:00 AM in user's local timezone
 *    - Automatic UTC conversion for backend storage
 *    - Preview shows "New scheduled time if saved" based on trigger settings
 *    - Recalculates preview date when trigger type/value changes
 *
 * 4. Variable Format System
 *    - Frontend: Plain text with [bracket] variables
 *    - Backend: HTML with [bracket] variables (NOT {{mustache}})
 *    - Backend EmailVariableResolver expects [bracket] format
 *    - backendToFrontend() converts {{old}} → [new] for backwards compatibility
 *    - frontendToBackend() keeps [bracket] format and wraps in HTML
 *
 * 5. Supported Variables (28 total)
 *    - Event: [eventName], [eventDate], [eventTime], [eventLocation], [eventVenue],
 *             [eventDescription], [applicationDeadline], [boothPrice], [categoryPrice], [paymentDueDate]
 *    - Organization: [organizationName], [organizationEmail]
 *    - Vendor: [firstName], [lastName], [fullName], [businessName], [email],
 *              [vendorCategory], [boothNumber], [applicationDate]
 *    - Install: [installDate], [installTime], [installStartTime], [installEndTime]
 *    - Links: [paymentLink], [eventLink], [bulletinLink], [dashboardLink], [unsubscribeLink]
 *
 * IMPORTANT NOTES:
 * ================
 * - [categoryPrice] is an alias for [boothPrice] (backwards compatibility)
 * - Old emails in database may have {{mustache}} format - system converts on load
 * - Preview requires at least one vendor application to show resolved variables
 * - Trigger time is always set to 8:00 AM local (auto-converted to UTC)
 */

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { logger } from '@/utils/logger';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, Loader2, Calendar, Clock, Type, AlignLeft, Sparkles, Globe, Lock } from 'lucide-react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import type { ScheduledEmail, UpdateEmailRequest, TriggerType } from '@/types/email';
import {
  EMAIL_VARIABLES,
  backendToFrontend,
  frontendToBackend,
  htmlToPlainText,
  plainTextToHtml,
  insertVariableAtCursor,
  getGroupedVariablesForUI,
  validateEmailContent,
  type ValidationResult,
} from '@/utils/emailVariables';
import { getEightAmLocalAsUTC, getTimezoneInfo, formatDateWithTimezone } from '@/utils/timezone';
import { splitEmailBody, joinEmailBody, htmlFooterToPlain, STANDARD_EMAIL_FOOTER } from '@/utils/emailFooter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface EditScheduledEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: ScheduledEmail | null;
  eventData: any | null; // Event data for preview calculations
  onSave: (emailId: number, data: UpdateEmailRequest) => Promise<void>;
}

const editEmailSchema = z.object({
  name: z.string().min(1, 'Email name is required'),
  subject_template: z.string().min(1, 'Subject is required'),
  body_template: z.string().min(1, 'Email body is required'),
  trigger_type: z.string().min(1, 'Trigger type is required'),
  trigger_value: z.number().min(0, 'Must be 0 or greater').optional(),
  // trigger_time is now automatic (8:00 AM local), no longer in form
});

type EditEmailFormData = z.infer<typeof editEmailSchema>;

const TRIGGER_TYPES: { value: TriggerType; label: string; requiresValue: boolean; description: string }[] = [
  { value: 'days_before_event', label: 'Days Before Event', requiresValue: true, description: 'Send X days before the event date' },
  { value: 'days_after_event', label: 'Days After Event', requiresValue: true, description: 'Send X days after the event date' },
  { value: 'days_before_deadline', label: 'Days Before Application Deadline', requiresValue: true, description: 'Send X days before application deadline' },
  { value: 'on_event_date', label: 'On Event Date', requiresValue: false, description: 'Send on the event date' },
  { value: 'on_application_open', label: 'When Applications Open', requiresValue: false, description: 'Send when event is created' },
  { value: 'days_before_payment_deadline', label: 'Days Before Payment Due', requiresValue: true, description: 'Send X days before payment deadline' },
  { value: 'on_payment_deadline', label: 'On Payment Deadline', requiresValue: false, description: 'Send on payment deadline day' },
  { value: 'days_after_payment_deadline', label: 'Days After Payment Due', requiresValue: true, description: 'Send X days after payment deadline (for overdue reminders)' },
  { value: 'on_bulletin_post', label: 'On Bulletin Post', requiresValue: false, description: 'Send when producer posts a bulletin' },
];

export default function EditScheduledEmailModal({
  isOpen,
  onClose,
  email,
  eventData,
  onSave,
}: EditScheduledEmailModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<'subject' | 'body' | null>(null);
  const [previewScheduledDate, setPreviewScheduledDate] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);
  const [emailFooter, setEmailFooter] = useState<string>(''); // Locked footer content (plain text)

  // Get timezone info for display
  const timezoneInfo = getTimezoneInfo();

  // Refs for textareas to handle cursor position
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EditEmailFormData>({
    resolver: zodResolver(editEmailSchema),
    mode: 'onChange', // Enable validation on change
  });

  const selectedTriggerType = watch('trigger_type');
  const selectedTriggerValue = watch('trigger_value');
  const selectedTriggerConfig = TRIGGER_TYPES.find(t => t.value === selectedTriggerType);

  // Watch subject and body for validation
  const subjectValue = watch('subject_template');
  const bodyValue = watch('body_template');

  // Get variables grouped for UI display
  const variableGroups = getGroupedVariablesForUI();

  // Calculate preview scheduled date based on trigger settings
  const calculatePreviewDate = (triggerType: string, triggerValue: number | undefined): Date | null => {
    if (!eventData) return null;

    try {
      let baseDate: Date;
      const triggerTime = getEightAmLocalAsUTC(); // Always 8:00 AM local

      // Determine base date based on trigger type
      switch (triggerType) {
        case 'days_before_event':
        case 'days_after_event':
        case 'on_event_date':
          // Event date is nested in dates.start
          if (!eventData.dates?.start) {
            return null;
          }
          baseDate = parseISO(eventData.dates.start);
          break;

        case 'days_before_deadline':
        case 'on_application_open':
          if (!eventData.application_deadline) {
            return null;
          }
          baseDate = parseISO(eventData.application_deadline);
          break;

        case 'days_before_payment_deadline':
        case 'on_payment_deadline':
        case 'days_after_payment_deadline':
          if (!eventData.payment_deadline) {
            return null;
          }
          baseDate = parseISO(eventData.payment_deadline);
          break;

        case 'on_bulletin_post':
          // Event-triggered, no specific date needed for preview
          return null;

        default:
          return null;
      }

      // Calculate offset based on trigger type and value
      let scheduledDate: Date;
      const days = triggerValue || 0;

      switch (triggerType) {
        case 'days_before_event':
        case 'days_before_deadline':
        case 'days_before_payment_deadline':
          scheduledDate = subDays(baseDate, days);
          break;

        case 'days_after_event':
        case 'days_after_payment_deadline':
          scheduledDate = addDays(baseDate, days);
          break;

        case 'on_event_date':
        case 'on_application_open':
        case 'on_payment_deadline':
          scheduledDate = baseDate;
          break;

        default:
          return null;
      }

      // Set time to 8:00 AM local (already handled by timezone utils)
      return scheduledDate;
    } catch (error) {
      logger.error('Error calculating preview date', { error });
      return null;
    }
  };

  // Watch for trigger changes and update preview
  useEffect(() => {
    if (isOpen && selectedTriggerType) {
      const previewDate = calculatePreviewDate(selectedTriggerType, selectedTriggerValue);
      setPreviewScheduledDate(previewDate);

      // Check if preview date is in the past
      if (previewDate) {
        const now = new Date();
        if (previewDate < now) {
          setDateError('Cannot schedule email for a past date. Please adjust your trigger settings.');
        } else {
          setDateError(null);
        }
      }
    }
  }, [selectedTriggerType, selectedTriggerValue, eventData, isOpen]);

  // Watch for content changes and validate variables
  useEffect(() => {
    if (isOpen && (subjectValue || bodyValue)) {
      const validation = validateEmailContent(subjectValue || '', bodyValue || '');
      setValidationErrors(validation.errors);
    }
  }, [subjectValue, bodyValue, isOpen]);

  // Reset form when email changes - CONVERT backend format to frontend format
  useEffect(() => {
    if (email && isOpen) {
      // Step 1: Convert {{mustache}} → [bracket] variables (but keep HTML)
      const htmlWithBrackets = backendToFrontend(email.body_template || '');

      // Step 2: Split HTML into content and footer (at <hr> tag)
      const { content: htmlContent, footer: htmlFooter } = splitEmailBody(htmlWithBrackets);

      // Step 3: Convert HTML to plain text for editing in Textarea
      const plainContent = htmlToPlainText(htmlContent);
      const plainFooter = htmlToPlainText(htmlFooter);

      // Subject is just text, no HTML conversion needed
      const frontendSubject = backendToFrontend(email.subject_template || '');

      // Reset form with converted values (content only, footer separated)
      // Note: trigger_time is NOT in the form - it's set automatically on save
      reset({
        name: email.name || '',
        subject_template: frontendSubject, // Plain text with [eventName] format
        body_template: plainContent,       // Plain text with [eventName] format (footer removed)
        trigger_type: email.trigger_type || 'on_event_date',
        trigger_value: email.trigger_value || 0,
      });

      // Store footer separately (locked from editing)
      setEmailFooter(plainFooter);

      setError(null);
      setActiveField(null);
    }
  }, [email, isOpen, reset]);

  const onSubmit = async (data: EditEmailFormData) => {
    if (!email) return;

    // Check for validation errors before submitting
    if (validationErrors.length > 0) {
      setError('Please fix validation errors before saving.');
      return;
    }

    // Check for date errors
    if (dateError) {
      setError(dateError);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Step 1: Convert plain text content and footer to HTML
      const htmlContent = plainTextToHtml(data.body_template);
      const htmlFooter = plainTextToHtml(emailFooter);

      // Step 2: Join HTML content and footer back together
      // But we need to convert plain footer back to standard HTML footer format
      // Since plainTextToHtml wraps everything in <p> tags, we need the original HTML footer

      // Use the standard HTML footer instead of converting plain text
      const fullHtmlBody = joinEmailBody(htmlContent, STANDARD_EMAIL_FOOTER);

      // Subject stays as plain text
      const backendSubject = data.subject_template;

      // Automatically set trigger_time to 8:00 AM in user's local timezone (converted to UTC)
      const triggerTimeUtc = getEightAmLocalAsUTC();

      const updateData: UpdateEmailRequest = {
        name: data.name,
        subject_template: backendSubject,  // Plain text with [eventName] format
        body_template: fullHtmlBody,       // HTML with [eventName] format + footer
        trigger_type: data.trigger_type as TriggerType,
        trigger_value: data.trigger_value,
        trigger_time: triggerTimeUtc,      // Automatically set to 8:00 AM local (in UTC)
      };

      await onSave(email.id, updateData);
      logger.info('Email updated successfully', { emailId: email.id, name: data.name });
      onClose();
    } catch (err: any) {
      logger.error('Failed to save email', { emailId: email.id, error: err });
      setError(err.message || 'Failed to update email');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInsertVariable = (variable: string, field: 'subject' | 'body') => {
    const currentValue = watch(`${field}_template`);

    if (field === 'subject' && subjectRef.current) {
      const newValue = insertVariableAtCursor(subjectRef.current, variable);
      setValue('subject_template', newValue, { shouldValidate: true });
    } else if (field === 'body' && bodyRef.current) {
      const newValue = insertVariableAtCursor(bodyRef.current, variable);
      setValue('body_template', newValue, { shouldValidate: true });
    } else {
      // Fallback: append to end
      setValue(`${field}_template`, currentValue + variable, { shouldValidate: true });
    }
  };

  if (!email) return null;

  const isSent = email.status === 'sent';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0f0a1e] border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <Type className="w-5 h-5 text-purple-400" />
            <span>Edit Email</span>
          </DialogTitle>
        </DialogHeader>

        {isSent && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ This email has already been sent and cannot be edited.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email Name
            </label>
            <Input
              {...register('name')}
              disabled={isSent || isSaving}
              className="bg-white/5 border-white/10 text-white"
              placeholder="e.g., 1 Day Before Event"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Timing Configuration */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Email Timing
            </h3>

            {/* Trigger Type */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                When to Send
              </label>
              <Select
                value={selectedTriggerType}
                onValueChange={(value) => setValue('trigger_type', value)}
                disabled={isSent || isSaving}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1333] border-purple-500/20">
                  {TRIGGER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-white/60">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.trigger_type && (
                <p className="text-red-400 text-sm mt-1">{errors.trigger_type.message}</p>
              )}
            </div>

            {/* Trigger Value (Days) */}
            {selectedTriggerConfig?.requiresValue && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Number of Days
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register('trigger_value', { valueAsNumber: true })}
                  disabled={isSent || isSaving}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="e.g., 1"
                />
                {errors.trigger_value && (
                  <p className="text-red-400 text-sm mt-1">{errors.trigger_value.message}</p>
                )}
              </div>
            )}

            {/* Send Time Info (automatic, not editable) */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-300 text-sm font-medium">
                    Send Time: {timezoneInfo.eightAmLocal}
                  </p>
                  <p className="text-blue-300/60 text-xs mt-1">
                    All emails send at 8:00 AM in your timezone ({timezoneInfo.timezone})
                  </p>
                </div>
              </div>
            </div>

            {/* Current Scheduled Time */}
            {email.scheduled_for && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-300 text-sm">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  <strong>Current scheduled time:</strong>{' '}
                  {formatDateWithTimezone(email.scheduled_for)}
                </p>
              </div>
            )}

            {/* NEW Scheduled Time Preview */}
            {previewScheduledDate && !isSent && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-300 text-sm font-medium">
                  <Clock className="w-4 h-4 inline mr-1" />
                  New scheduled time if saved:
                </p>
                <p className="text-amber-200 text-base font-semibold mt-1">
                  {formatDateWithTimezone(previewScheduledDate)}
                </p>
                <p className="text-amber-300/60 text-xs mt-1">
                  This preview updates as you change the trigger settings above.
                </p>
              </div>
            )}
          </div>

          {/* Subject Template with Variable Buttons */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Subject Line
            </label>
            <Input
              {...register('subject_template', {
                onChange: (e) => {
                  // Update our ref when value changes
                  if (subjectRef.current) {
                    subjectRef.current.value = e.target.value;
                  }
                }
              })}
              ref={(e) => {
                // Merge refs: register's ref AND our custom ref
                register('subject_template').ref(e);
                // @ts-ignore - Assigning to ref in callback
                if (e) subjectRef.current = e;
              }}
              disabled={isSent || isSaving}
              onFocus={() => setActiveField('subject')}
              className="bg-white/5 border-white/10 text-white"
              placeholder="e.g., Reminder: [eventName] is Tomorrow!"
            />
            {errors.subject_template && (
              <p className="text-red-400 text-sm mt-1">{errors.subject_template.message}</p>
            )}

            {/* Variable Buttons for Subject */}
            {activeField === 'subject' && !isSent && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">Click to insert variables:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {EMAIL_VARIABLES.map((variable) => (
                    <button
                      key={variable.frontendVar}
                      type="button"
                      onClick={() => handleInsertVariable(variable.frontendVar, 'subject')}
                      className="px-2 py-1 text-xs rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-colors"
                      title={`${variable.description} (e.g., ${variable.example})`}
                    >
                      {variable.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Body Template with Variable Buttons */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email Message
            </label>
            <Textarea
              {...register('body_template', {
                onChange: (e) => {
                  // Update our ref when value changes
                  if (bodyRef.current) {
                    bodyRef.current.value = e.target.value;
                  }
                }
              })}
              ref={(e) => {
                // Merge refs: register's ref AND our custom ref
                register('body_template').ref(e);
                // @ts-ignore - Assigning to ref in callback
                if (e) bodyRef.current = e;
              }}
              disabled={isSent || isSaving}
              onFocus={() => setActiveField('body')}
              className="bg-white/5 border-white/10 text-white min-h-[300px]"
              placeholder="Write your email message here... Click variables below to insert."
            />
            {errors.body_template && (
              <p className="text-red-400 text-sm mt-1">{errors.body_template.message}</p>
            )}

            {/* Variable Buttons for Body - Organized by Category */}
            {activeField === 'body' && !isSent && (
              <div className="mt-3 p-4 bg-white/5 rounded-lg border border-purple-500/20 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">Click to insert variables:</span>
                </div>

                {/* Render grouped variables */}
                {variableGroups.map((group, index) => {
                  // Different color schemes for each group
                  const colorClasses = [
                    'bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border-pink-500/30', // Vendor Details
                    'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30', // Organization Details
                    'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30' // Event Details
                  ][index] || 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30';

                  return (
                    <div key={group.label}>
                      <h4 className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">{group.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.variables.map((variable) => (
                          <button
                            key={variable.frontendVar}
                            type="button"
                            onClick={() => handleInsertVariable(variable.frontendVar, 'body')}
                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${colorClasses}`}
                            title={`${variable.description} (e.g., ${variable.example})`}
                          >
                            {variable.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Locked Footer Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <label className="block text-sm font-medium text-white/80">
                Email Footer (Locked)
              </label>
            </div>
            <div className="relative">
              <Textarea
                value={emailFooter}
                disabled
                readOnly
                className="bg-white/5 border-purple-500/20 text-white/60 min-h-[120px] resize-none cursor-not-allowed opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-500/40">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-300" />
                    <span className="text-sm text-purple-300 font-medium">
                      Footer is locked to ensure unsubscribe link is always present
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-white/50">
              The footer contains the unsubscribe link required by email regulations and cannot be edited.
            </p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-amber-300 text-sm font-medium mb-2">⚠️ Validation Errors:</p>
              <ul className="text-amber-400 text-sm space-y-1 list-disc list-inside">
                {validationErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Date Error */}
          {dateError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">🚫 {dateError}</p>
            </div>
          )}

          {/* General Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSent || isSaving || validationErrors.length > 0 || !!dateError}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
