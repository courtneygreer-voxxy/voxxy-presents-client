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
  CheckCircle2,
  AlertCircle,
  Send,
  Lock,
  Search,
  X,
  Trash2,
  Mail,
} from 'lucide-react';
import type { ScheduledEmail, UpdateEmailRequest, CreateScheduledEmailRequest, TriggerType } from '@/types/email';
import type { Category } from '@/types/category';
import {
  EMAIL_VARIABLES,
  backendToFrontend,
  frontendToBackend,
  validateEmailContent,
  getGroupedVariablesForUI,
} from '@/utils/emailVariables';
import { splitEmailBody, joinEmailBody, STANDARD_EMAIL_FOOTER } from '@/utils/emailFooter';
import { formatDateWithTimezone } from '@/utils/timezone';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from './RichTextEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DateTime } from 'luxon';
import { useToast } from '@/hooks/use-toast';
import { scheduledEmailsApi } from '@/services/api';
import { DebugPanel } from '../DebugPanel';
import { EmailHtmlPreviewModal } from './EmailHtmlPreviewModal';

interface EmailEditorPageProps {
  email: ScheduledEmail | null;
  eventData: any | null;
  eventSlug: string;
  onBack: () => void;
  onSave: (emailId: number, data: UpdateEmailRequest) => Promise<void>;
  onCreate?: (data: CreateScheduledEmailRequest) => Promise<ScheduledEmail>;
  onDelete?: (emailId: number) => Promise<void>;
  mode?: 'edit' | 'create';
  categories?: Category[];
  isAdmin?: boolean;
  sequenceContext?: { categoryId: number | null };
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
  { value: 'on_invitation_send', label: 'When Invitation Sent', requiresValue: false, description: 'Send when vendor is invited to event', requiredDateField: null, emailType: 'event_announcements' },
  { value: 'days_before_event', label: 'Days Before Event', requiresValue: true, description: 'Send X days before the event date', requiredDateField: 'start_date', emailType: 'event_countdown' },
  { value: 'days_after_event', label: 'Days After Event', requiresValue: true, description: 'Send X days after the event date', requiredDateField: 'start_date', emailType: 'event_countdown' },
  { value: 'days_before_deadline', label: 'Days Before Application Deadline', requiresValue: true, description: 'Send X days before application deadline', requiredDateField: 'application_deadline', emailType: 'application_updates' },
  { value: 'on_event_date', label: 'On Event Date', requiresValue: false, description: 'Send on the event date', requiredDateField: 'start_date', emailType: 'event_countdown' },
  { value: 'on_application_open', label: 'When Applications Open', requiresValue: false, description: 'Send when event is created', requiredDateField: null, emailType: 'event_announcements' },
  { value: 'days_before_payment_deadline', label: 'Days Before Payment Due', requiresValue: true, description: 'Send X days before payment deadline', requiredDateField: 'payment_deadline', emailType: 'payment_reminders' },
  { value: 'on_payment_deadline', label: 'On Payment Deadline', requiresValue: false, description: 'Send on payment deadline day', requiredDateField: 'payment_deadline', emailType: 'payment_reminders' },
  { value: 'days_after_payment_deadline', label: 'Days After Payment Due', requiresValue: true, description: 'Send X days after payment deadline (for overdue reminders)', requiredDateField: 'payment_deadline', emailType: 'payment_reminders' },
  { value: 'on_bulletin_post', label: 'On Bulletin Post', requiresValue: false, description: 'Send when producer posts a bulletin', requiredDateField: null, emailType: 'event_announcements' },
] as const;

const EMAIL_TYPE_LABELS: Record<string, string> = {
  event_announcements: 'Event Announcements',
  application_updates: 'Application Updates',
  payment_reminders: 'Payment Reminders',
  event_countdown: 'Event Countdown',
  event_updates: 'Event Updates',
};

// Blast-type triggers: vendor isn't in the system yet, so category targeting doesn't apply
const BLAST_TRIGGER_TYPES = new Set([
  'on_invitation_send',
  'on_application_open',
  'days_before_deadline',
  'on_bulletin_post',
  'on_event_cancel',
  'on_event_update',
]);

// System triggers: event-triggered emails that are core to the workflow
// These can be edited (subject/body) but cannot be deleted, and their name cannot be changed
const SYSTEM_TRIGGERS = [
  'on_application_open',
  'on_invitation_send',
  'on_application_submit',
  'on_approval',
  'on_rejection',
  'on_waitlist',
  'on_payment_received',
  'on_category_change',
  'on_event_update',
  'on_event_cancel',
  'on_bulletin_post',
];

// Value-based triggers: custom countdown emails that users CAN create (vs system emails they cannot)
// These are time-based reminders (not event-triggered) that can be edited/deleted
const VALUE_BASED_TRIGGERS = [
  'days_before_event',
  'on_event_date',  // Time-based, not event-triggered
  'days_after_event',
  'days_before_deadline',
  'days_after_deadline',
  'days_before_payment_deadline',
  'on_payment_deadline',  // Time-based, not event-triggered
  'days_after_payment_deadline',
];

export function EmailEditorPage({
  email: initialEmail,
  eventData,
  eventSlug,
  onBack,
  onSave,
  onCreate,
  onDelete,
  mode: initialMode = 'edit',
  categories = [],
  isAdmin,
  sequenceContext,
}: EmailEditorPageProps) {
  const [email, setEmail] = useState<ScheduledEmail | null>(initialEmail);
  const [mode, setMode] = useState<'edit' | 'create'>(initialMode);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialEmail?.category_id ?? sequenceContext?.categoryId ?? null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<'subject' | 'body' | null>(null);
  const activeFieldRef = useRef<'subject' | 'body' | null>(null);
  const [triggerSettingsOpen, setTriggerSettingsOpen] = useState(true);
  const [recipientsOpen, setRecipientsOpen] = useState(false);
  const [availableTagsOpen, setAvailableTagsOpen] = useState(true);
  const [bodyEditor, setBodyEditor] = useState<Editor | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [emailFooter, setEmailFooter] = useState<string>('');

  const subjectRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Safe field tracking: ref ensures onBlur timeouts don't clobber a newer focus
  const focusField = (field: 'subject' | 'body') => {
    activeFieldRef.current = field;
    setActiveField(field);
  };
  const blurField = (field: 'subject' | 'body') => {
    // Only clear if the active field hasn't been changed to something else
    setTimeout(() => {
      if (activeFieldRef.current === field) {
        activeFieldRef.current = null;
        setActiveField(null);
      }
    }, 200);
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState,
  } = useForm<EditEmailFormData>({
    resolver: zodResolver(editEmailSchema),
    defaultValues: {
      name: '',
      subject_template: '',
      body_template: '',
      trigger_type: 'on_event_date',
      trigger_value: 0,
    },
  });

  const subject = watch('subject_template');
  const body = watch('body_template');
  const triggerType = watch('trigger_type');
  const triggerValue = watch('trigger_value');

  const selectedTriggerConfig = TRIGGER_TYPES.find(t => t.value === triggerType);

  // Check if this is a system email (name cannot be edited for system emails)
  const isSystemEmail = triggerType ? SYSTEM_TRIGGERS.includes(triggerType as string) : false;

  // Filter trigger types based on mode and available event date fields
  const availableTriggerTypes = TRIGGER_TYPES.filter((type) => {
    // In CREATE mode: only show custom countdown triggers (value-based)
    // System emails (event-based triggers) should NOT be creatable by users
    if (mode === 'create' && !VALUE_BASED_TRIGGERS.includes(type.value)) {
      return false;
    }

    // Filter by required date fields (ensure event has the needed dates)
    if (!type.requiredDateField) return true; // Always available
    if (!eventData) return true; // No event data, show all (can't filter)

    const dateFieldMap: Record<string, string[]> = {
      start_date: ['start_date', 'event_date'],
      application_deadline: ['application_deadline'],
      payment_deadline: ['payment_deadline', 'payment_due_date'],
    };
    const fields = dateFieldMap[type.requiredDateField] || [type.requiredDateField];
    return fields.some((field) => eventData[field]);
  });

  // Computed: Check if save should be allowed (extra safety check)
  const canSave = () => {
    // Must have subject and body
    if (!subject || !body) return false;

    // Must have no validation errors
    if (validationErrors.length > 0) return false;

    // Double-check by running validation on current values
    const plainSubject = subject || '';
    const plainBody = stripHtmlForValidation(body || '');
    const check = validateEmailContent(plainSubject, plainBody);

    return check.isValid;
  };

  // Sync email state when prop changes (e.g., parent passes a different email)
  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  // Initialize form with email data - CONVERT backend format to frontend
  useEffect(() => {
    if (mode === 'create') {
      // Create mode: start with sensible defaults
      reset({
        name: '',
        subject_template: '',
        body_template: '',
        trigger_type: 'days_before_event',
        trigger_value: 1,
      });
      // Initialize category from sequence context (if creating from a sequence)
      setSelectedCategoryId(sequenceContext?.categoryId ?? null);
      setEmailFooter(STANDARD_EMAIL_FOOTER);
      return;
    }

    if (!email) return;

    setSelectedCategoryId(email.category_id || null);
    const convertedSubject = backendToFrontend(email.subject_template || '');
    const convertedBody = backendToFrontend(email.body_template || '');

    // Split body into content and footer
    const { content, footer } = splitEmailBody(convertedBody);

    reset({
      name: email.name || '',
      subject_template: convertedSubject,
      body_template: content, // Only the content part, not the footer
      trigger_type: email.trigger_type || 'on_event_date',
      trigger_value: email.trigger_value || 0,
    });

    // Store footer separately
    setEmailFooter(footer);
  }, [email, reset, mode]);

  // Strip HTML tags for validation (TipTap editor produces HTML)
  const stripHtmlForValidation = (html: string): string => {
    if (!html) return '';
    // Create a temporary div to parse HTML
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Validate content when it changes
  useEffect(() => {
    if (!subject && !body) return;

    // Strip HTML from body before validating (editor produces HTML)
    const plainSubject = subject || '';
    const plainBody = stripHtmlForValidation(body || '');

    const validation = validateEmailContent(plainSubject, plainBody);

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
      // Parse as UTC to match backend behavior for date-only fields
      // This prevents timezone shifting and ensures consistent calculations
      const eventDate = DateTime.fromISO(eventData.start_date, { zone: 'utc' });

      if (!eventDate.isValid) {
        logger.error('Invalid event date', { startDate: eventData.start_date, reason: eventDate.invalidReason });
        return null;
      }

      let scheduledDate = eventDate;

      switch (triggerType) {
        case 'days_before_event':
        case 'days_before_deadline':
        case 'days_before_payment_deadline':
          // Use Luxon's minus() for timezone-safe date arithmetic
          scheduledDate = eventDate.minus({ days: triggerValue || 0 });
          break;
        case 'days_after_event':
        case 'days_after_payment_deadline':
          // Use Luxon's plus() for timezone-safe date arithmetic
          scheduledDate = eventDate.plus({ days: triggerValue || 0 });
          break;
        case 'on_event_date':
        case 'on_application_open':
        case 'on_payment_deadline':
        case 'on_bulletin_post':
          scheduledDate = eventDate;
          break;
      }

      // Convert Luxon DateTime to JavaScript Date for formatDateWithTimezone
      return formatDateWithTimezone(scheduledDate.toJSDate());
    } catch (error) {
      logger.error('Error calculating preview date', { error });
      return null;
    }
  };

  const handleInsertVariable = (variable: string) => {
    if (activeField === 'subject' && subjectRef.current) {
      const cursorPos = subjectRef.current.selectionStart || 0;
      const currentValue = getValues('subject_template') || '';
      const before = currentValue.substring(0, cursorPos);
      const after = currentValue.substring(cursorPos);
      const newValue = before + variable + after;
      // Update both react-hook-form state and DOM value
      setValue('subject_template', newValue, { shouldValidate: true, shouldDirty: true });
      subjectRef.current.value = newValue;
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

  const handleSendTestEmail = async () => {
    if (!email || !testEmailAddress) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmailAddress)) {
      toast({
        title: "Invalid Email Address",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);

    try {
      const result = await scheduledEmailsApi.sendTest(eventSlug, email.id, testEmailAddress);

      toast({
        title: "Test Email Sent!",
        description: `Test email sent to ${result.recipient}. Check your inbox!`,
        variant: "default",
        className: "bg-green-500/10 border-green-500/30 text-emerald-900 dark:text-green-400",
      });

      setShowTestEmailDialog(false);
      setTestEmailAddress('');
    } catch (error: any) {
      logger.error('Failed to send test email', { emailId: email?.id, error });
      toast({
        title: "Failed to Send Test Email",
        description: error?.message || 'An error occurred while sending the test email.',
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Build filter_criteria based on category and trigger type (matches ScheduledEmailGenerator pattern)
  const buildFilterCriteria = (
    triggerType: string,
    categoryId: number | null,
    categories: Category[]
  ): Record<string, any> => {
    const filter_criteria: Record<string, any> = {};

    // Add category filter if category-specific (matches template email pattern)
    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        filter_criteria["vendor_categories"] = [category.name];
      }
    }

    // Determine if this is an event-wide announcement (sent to all regardless of status)
    const isEventAnnouncement = [
      'on_event_update',
      'on_event_cancel',
      'on_bulletin_post',
      'on_category_change',
      'on_invitation_send'
    ].includes(triggerType);

    // Determine if this is an application-stage email (targets applicants, not just approved)
    const isApplicationStage = [
      'on_application_submit',
      'on_approval',
      'on_rejection'
    ].includes(triggerType);

    // Add trigger-specific filters (targets specific vendor statuses)
    if (triggerType.includes('payment')) {
      // Payment triggers: target approved vendors with pending/overdue payments
      filter_criteria["statuses"] = ["approved"];
      filter_criteria["payment_statuses"] = ["pending", "overdue"];
    }
    else if (['days_before_event', 'on_event_date', 'days_after_event'].includes(triggerType)) {
      // Event countdown triggers: target approved/confirmed vendors who have paid
      filter_criteria["statuses"] = ["approved", "confirmed"];
      filter_criteria["payment_statuses"] = ["paid", "confirmed"];
    }
    else if (isApplicationStage) {
      // Application/approval triggers: no status filters needed (system handles per-application)
      // These are sent individually when status changes occur
    }
    else if (isEventAnnouncement) {
      // Event announcements: sent to all registrations regardless of status
      // No status filter needed
    }
    else {
      // DEFAULT for all other trigger types (custom reminders, deadlines, etc.):
      // Target approved/confirmed vendors only (exclude pending, rejected, cancelled)
      filter_criteria["statuses"] = ["approved", "confirmed"];
    }

    return filter_criteria;
  };

  const onSubmit = async (data: EditEmailFormData) => {
    // Double-check validation before saving (extra safety)
    const plainSubject = data.subject_template || '';
    const plainBody = stripHtmlForValidation(data.body_template || '');
    const finalValidation = validateEmailContent(plainSubject, plainBody);

    if (!finalValidation.isValid || validationErrors.length > 0) {
      logger.error('Email validation failed - blocked save', {
        unknownVariables: finalValidation.unknownVariables,
        unclosedBrackets: finalValidation.unclosedBrackets,
        validationErrors
      });

      toast({
        title: "Cannot Save Email",
        description: "Please fix all variable errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const convertedSubject = frontendToBackend(data.subject_template);

      // Rejoin content with footer before converting to backend format
      const fullBodyTemplate = joinEmailBody(data.body_template, emailFooter);
      const convertedBody = frontendToBackend(fullBodyTemplate);

      // Send plain "08:00" to backend - backend handles timezone conversion
      const trigger_time = "08:00";

      // Determine category_id: null if blast trigger type, otherwise use selection
      const effectiveCategoryId = BLAST_TRIGGER_TYPES.has(data.trigger_type) ? null : selectedCategoryId;

      // Build filter_criteria based on category and trigger type (ensures correct recipient count)
      const filter_criteria = buildFilterCriteria(data.trigger_type, effectiveCategoryId, categories);

      if (mode === 'create' && onCreate) {
        // CREATE mode: call onCreate, then transition to edit mode
        const createData: CreateScheduledEmailRequest = {
          name: data.name,
          subject_template: convertedSubject,
          body_template: convertedBody,
          trigger_type: data.trigger_type as TriggerType,
          trigger_value: data.trigger_value,
          trigger_time,
          category_id: effectiveCategoryId,
          status: 'scheduled',
          filter_criteria,
        };

        const newEmail = await onCreate(createData);

        // Transition to edit mode with the newly created email
        setEmail(newEmail);
        setMode('edit');

        toast({
          title: "Email Created Successfully",
          description: `"${data.name}" has been created. You can now send test emails.`,
          variant: "default",
          className: "bg-green-500/10 border-green-500/30 text-emerald-900 dark:text-green-400",
        });
      } else if (email) {
        // EDIT mode: call onSave with existing email ID
        const updateData: UpdateEmailRequest = {
          name: data.name,
          subject_template: convertedSubject,
          body_template: convertedBody,
          trigger_type: data.trigger_type as TriggerType,
          trigger_value: data.trigger_value,
          trigger_time,
          category_id: effectiveCategoryId,
          filter_criteria,
        };

        await onSave(email.id, updateData);

        toast({
          title: "Email Saved Successfully",
          description: `"${data.name}" has been updated.`,
          variant: "default",
          className: "bg-green-500/10 border-green-500/30 text-emerald-900 dark:text-green-400",
        });
      }

      // Success!
      setSaveSuccess(true);

      // Clear success state after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (error: any) {
      logger.error('Failed to save email', { emailId: email?.id, mode, error });
      const errorMessage = error?.message || 'An unexpected error occurred while saving.';
      setSaveError(errorMessage);

      toast({
        title: "Failed to Save Email",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // In edit mode, we need an email to work with
  if (mode === 'edit' && !email) return null;

  const isCreateMode = mode === 'create';
  const previewDate = calculatePreviewDate();
  const canSendNow = !isCreateMode && email?.status === 'scheduled' && email?.scheduled_for && new Date(email.scheduled_for) <= new Date();

  // HTML-aware variable resolver for live preview
  // Properly handles variables in HTML content without breaking structure
  const resolvePreviewVariables = (html: string): string => {
    if (!html) return html;

    // Parse HTML using DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Get list of valid variables
    const validVars = EMAIL_VARIABLES.map(v => v.frontendVar);

    // Function to resolve a single variable
    const resolveVariable = (varName: string): string => {
      if (!eventData && !varName.match(/\[firstName\]|\[lastName\]|\[fullName\]|\[greetingName\]|\[businessName\]|\[email\]|\[vendorCategory\]|\[boothNumber\]|\[applicationDate\]|\[installDate\]|\[installTime\]|\[installStartTime\]|\[installEndTime\]/)) {
        return varName; // No event data, return as-is
      }

      // Event variables
      if (varName === '[eventName]') return eventData?.title || 'Event Name';
      if (varName === '[eventDate]') return eventData?.start_date ? new Date(eventData.start_date).toLocaleDateString() : 'Event Date';
      if (varName === '[eventLocation]') return eventData?.location || 'Event Location';
      if (varName === '[eventVenue]') return eventData?.venue || 'Event Venue';
      if (varName === '[eventTime]') return eventData?.start_time || 'Event Time';
      if (varName === '[eventDescription]') return eventData?.description || 'Event Description';
      if (varName === '[organizationName]') return eventData?.organization?.name || 'Organization Name';
      if (varName === '[organizationEmail]') return eventData?.organization?.email || 'team@voxxypresents.com';
      if (varName === '[applicationDeadline]') return eventData?.application_deadline ? new Date(eventData.application_deadline).toLocaleDateString() : 'Application Deadline';
      if (varName === '[paymentDueDate]') return eventData?.payment_due_date ? new Date(eventData.payment_due_date).toLocaleDateString() : 'Payment Due Date';
      if (varName === '[boothPrice]') return eventData?.booth_price ? `$${eventData.booth_price}` : '$150.00';
      if (varName === '[categoryPrice]') return eventData?.booth_price ? `$${eventData.booth_price}` : '$150.00';
      if (varName === '[ageRestriction]') return eventData?.age_restriction || '21+';
      if (varName === '[dateRange]') return eventData?.start_date ? new Date(eventData.start_date).toLocaleDateString() : 'Event Date';

      // Vendor placeholders
      if (varName === '[firstName]') return 'John';
      if (varName === '[lastName]') return 'Doe';
      if (varName === '[fullName]') return 'John Doe';
      if (varName === '[greetingName]') return 'John';
      if (varName === '[businessName]') return 'Sample Business';
      if (varName === '[email]') return 'vendor@example.com';
      if (varName === '[vendorCategory]') return 'Food Vendor';
      if (varName === '[boothNumber]') return 'A-12';
      if (varName === '[applicationDate]') return new Date().toLocaleDateString();
      if (varName === '[installDate]') return new Date().toLocaleDateString();
      if (varName === '[installTime]') return '8:00 AM - 10:00 AM';
      if (varName === '[installStartTime]') return '8:00 AM';
      if (varName === '[installEndTime]') return '10:00 AM';

      // Link variables - just return placeholder text, don't inject HTML
      if (varName === '[paymentLink]') return 'https://payment.link';
      if (varName === '[eventLink]') return 'https://event.link';
      if (varName === '[invitationLink]') return 'https://invitation.link';
      if (varName === '[bulletinLink]') return 'https://bulletin.link';
      if (varName === '[dashboardLink]') return 'https://dashboard.link';
      if (varName === '[unsubscribeLink]') return 'https://unsubscribe.link';
      if (varName === '[categoryPaymentLink]') return 'https://payment.link';
      if (varName === '[categoryList]') return '• Art Vendor\n• Food Vendor\n• Table Vendor';

      return varName; // Return as-is if not recognized
    };

    // Walk through all text nodes in the document
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // This is a text node - check for variables
        let text = node.textContent || '';

        // Find all variables in the text
        const matches = text.match(/\[[^\]]*\]?/g) || [];

        matches.forEach(match => {
          if (match.endsWith(']')) {
            // Complete variable
            if (validVars.includes(match)) {
              // Valid variable - resolve it
              text = text.replace(match, resolveVariable(match));
            } else {
              // Invalid variable - highlight in red (using span with data attribute)
              const span = doc.createElement('span');
              span.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              span.style.color = '#fca5a5';
              span.style.padding = '2px 4px';
              span.style.borderRadius = '3px';
              span.style.border = '1px solid rgba(239, 68, 68, 0.4)';
              span.title = `Unknown variable: ${match}`;
              span.textContent = match;
              text = text.replace(match, span.outerHTML);
            }
          } else {
            // Unclosed bracket - highlight in red
            const span = doc.createElement('span');
            span.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            span.style.color = '#fca5a5';
            span.style.padding = '2px 4px';
            span.style.borderRadius = '3px';
            span.style.border = '1px solid rgba(239, 68, 68, 0.4)';
            span.title = 'Unclosed bracket';
            span.textContent = match;
            text = text.replace(match, span.outerHTML);
          }
        });

        // Update the text node
        if (node.textContent !== text) {
          const temp = doc.createElement('div');
          temp.innerHTML = text;
          const parent = node.parentNode;
          if (parent) {
            while (temp.firstChild) {
              parent.insertBefore(temp.firstChild, node);
            }
            parent.removeChild(node);
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Walk through child nodes
        const children = Array.from(node.childNodes);
        children.forEach(child => walk(child));
      }
    };

    // Walk the body
    walk(doc.body);

    // Return the processed HTML
    return doc.body.innerHTML;
  };

  return (
    <div className="fixed inset-0 voxxy-gradient-editor z-50 flex flex-col">
      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
      {/* Left Side - Main Content */}
      <div className={`${showPreview ? 'w-1/2' : 'flex-1'} flex flex-col border-r border-border transition-all duration-300`}>
        {/* Top Bar */}
        <div className="voxxy-editor-chrome flex min-h-[52px] items-center justify-between px-8 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              size="sm"
              className={`h-9 border-border ${showPreview ? 'bg-violet-100 text-foreground hover:bg-violet-200 dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/30' : 'bg-card/80 text-foreground hover:bg-muted/70 dark:bg-background/5 dark:hover:bg-background/10'}`}
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Show Preview
                </>
              )}
            </Button>
            {!isCreateMode && email?.id && (
              <Button
                onClick={() => setShowHtmlPreview(true)}
                variant="default"
                size="sm"
                className="h-9 bg-primary/90 hover:bg-primary text-primary-foreground"
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Preview Email
              </Button>
            )}
            {!isCreateMode && (
              <Button
                onClick={() => setShowTestEmailDialog(true)}
                variant="outline"
                size="sm"
                className="h-9 border-border bg-card/80 text-foreground hover:bg-muted/70 dark:bg-background/5 dark:hover:bg-background/10"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Send Test
              </Button>
            )}
            {!isCreateMode && email && onDelete && VALUE_BASED_TRIGGERS.includes(triggerType as any) && (
              <Button
                onClick={async () => {
                  if (confirm('Delete this email? This cannot be undone.')) {
                    await onDelete(email.id);
                    onBack();
                  }
                }}
                variant="outline"
                size="sm"
                className="h-9 border-red-500/30 bg-card/80 text-red-700 hover:bg-red-500/10 hover:border-red-500/50 dark:bg-background/5 dark:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            )}
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving || !canSave()}
              size="sm"
              className={`h-9 transition-all ${
                saveSuccess
                  ? 'bg-green-600 hover:bg-green-700'
                  : !canSave()
                  ? 'bg-red-600/50 cursor-not-allowed'
                  : 'voxxy-btn-cta'
              }`}
              title={!canSave() ? 'Fix variable errors before saving' : ''}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Saved!
                </>
              ) : !canSave() ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                  Fix Errors to Save
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {isCreateMode ? 'Create Email' : 'Save Email'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="max-w-4xl mx-auto">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium text-sm mb-1">Cannot Save - Variable Errors:</p>
                    <ul className="text-red-400/80 text-xs space-y-0.5">
                      {validationErrors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                    <p className="text-red-400/60 text-xs mt-2 italic">
                      Fix these errors to enable saving. Invalid variables are highlighted in red in the preview.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {saveSuccess && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg animate-in fade-in duration-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-medium text-sm">Email saved successfully!</p>
                    <p className="text-green-400/60 text-xs mt-1">
                      Your changes have been saved and will be sent according to the schedule.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {saveError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium text-sm mb-1">Failed to save email</p>
                    <p className="text-red-400/80 text-xs">{saveError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Errors */}
            {(formState.errors.name || formState.errors.subject_template || formState.errors.body_template) && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 font-medium text-sm mb-1">Please fix the following:</p>
                <ul className="text-red-400/80 text-xs space-y-0.5">
                  {formState.errors.name && <li>• {formState.errors.name.message}</li>}
                  {formState.errors.subject_template && <li>• {formState.errors.subject_template.message}</li>}
                  {formState.errors.body_template && <li>• {formState.errors.body_template.message}</li>}
                </ul>
              </div>
            )}

            {/* Email Name */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-foreground dark:text-foreground/70 mb-1.5 flex items-center gap-2">
                Email Name
                {isSystemEmail && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Locked for system emails
                  </span>
                )}
              </label>
              <Input
                {...register('name')}
                disabled={isSystemEmail}
                className={`h-9 border-border bg-card/80 text-sm text-foreground placeholder:text-muted-foreground dark:bg-background/5 ${
                  isSystemEmail ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="e.g., Day Before Event Reminder"
                title={isSystemEmail ? 'Email name cannot be changed for system emails (used to associate with trigger)' : ''}
              />
            </div>

            {/* Subject Line */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-foreground dark:text-foreground/70 mb-1.5">
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
                onFocus={() => focusField('subject')}
                onBlur={() => blurField('subject')}
                className="h-9 border-border bg-card/80 text-sm text-foreground placeholder:text-muted-foreground dark:bg-background/5"
                placeholder="e.g., Reminder: [eventName] is Tomorrow!"
              />
            </div>

            {/* Email Body */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-foreground dark:text-foreground/70 mb-1.5">
                Email Body
              </label>
              <RichTextEditor
                content={body || ''}
                onChange={(html) => setValue('body_template', html, { shouldValidate: true })}
                onEditorReady={(editor) => setBodyEditor(editor)}
                onFocus={() => focusField('body')}
                onBlur={() => blurField('body')}
                placeholder="Write your email message here... Use the toolbar to format text and click variables on the right to insert."
                isBlastEmail={BLAST_TRIGGER_TYPES.has(triggerType)}
              />
            </div>

            {/* Locked Footer Section */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Lock className="w-4 h-4 text-primary" />
                <label className="block text-xs font-medium text-foreground/70">
                  Email Footer (Locked)
                </label>
              </div>
              <div className="relative">
                <div className="min-h-[120px] rounded-lg border border-primary/20 bg-card/80 p-4 opacity-60 pointer-events-none dark:bg-background/5">
                  <div
                    className="text-xs text-foreground/80"
                    dangerouslySetInnerHTML={{ __html: emailFooter }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-card/95 px-3 py-1.5 backdrop-blur-sm dark:border-primary/30 dark:bg-background/80">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-foreground/90">
                      Footer is locked to ensure unsubscribe link is always present
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-1.5 text-[10px] text-foreground/50 leading-relaxed">
                The footer contains the unsubscribe link required by email regulations (CAN-SPAM, GDPR) and cannot be edited.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Panel */}
      {showPreview && (
        <div className="voxxy-editor-sidebar flex w-1/2 flex-col">
          {/* Preview Header */}
          <div className="voxxy-editor-chrome flex min-h-[60px] items-center px-12 py-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Live Preview
            </h3>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Preview Subject */}
              <div>
                <label className="block text-xs font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide mb-2">
                  Subject
                </label>
                <div className="rounded-lg border border-primary/20 bg-card/85 p-4 dark:bg-background/10">
                  <div
                    className="text-foreground font-medium text-sm"
                    dangerouslySetInnerHTML={{
                      __html: resolvePreviewVariables(subject || '<span style="color: rgba(255, 255, 255, 0.4); font-style: italic;">Subject will appear here...</span>')
                    }}
                  />
                </div>
              </div>

              {/* Preview Body */}
              <div>
                <label className="block text-xs font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide mb-2">
                  Message Body
                </label>
                {validationErrors.length > 0 && (
                  <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-xs font-semibold mb-1">⚠️ Variable Errors:</p>
                    <ul className="text-red-400/80 text-[10px] space-y-0.5">
                      {validationErrors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="rounded-lg border border-primary/20 bg-card/85 p-6 dark:bg-background/10">
                  {body ? (
                    <div
                      className="email-preview-content voxxy-rich-text-base"
                      dangerouslySetInnerHTML={{
                        __html: resolvePreviewVariables(body)
                      }}
                    />
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      Email body will appear here as you type...
                    </p>
                  )}
                </div>
              </div>

              {/* Preview Footer (Locked) */}
              <div className="bg-gradient-to-br from-primary/10 to-pink-500/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lock className="w-3 h-3 text-primary" />
                  <p className="text-[10px] text-primary font-semibold uppercase tracking-wide">
                    Email Footer (Locked)
                  </p>
                </div>
                <div
                  className="email-preview-content voxxy-rich-text-base text-xs"
                  dangerouslySetInnerHTML={{
                    __html: resolvePreviewVariables(emailFooter)
                  }}
                />
              </div>

              {/* Preview Info */}
              {previewDate && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <p className="text-xs text-blue-400 font-medium">
                        Scheduled to send: {previewDate}
                      </p>
                      <p className="text-[10px] text-blue-300/60 mt-0.5">
                        {email?.recipient_count || 0} recipients
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Right Sidebar */}
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
                <div>
                  <label className="block text-[10px] font-medium text-foreground dark:text-foreground/60 mb-1.5 uppercase tracking-wide">
                    When to Send
                  </label>
                  <Select
                    value={triggerType}
                    onValueChange={(value) => setValue('trigger_type', value)}
                    disabled={mode === 'edit'}
                  >
                    <SelectTrigger className="h-8 border-border bg-card/80 text-foreground text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:bg-background/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="voxxy-select-surface">
                      {availableTriggerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-foreground text-sm">
                          <div>
                            <div className="font-medium text-xs">{type.label}</div>
                            <div className="text-[10px] text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mode === 'edit' && (
                    <p className="mt-1 text-[9px] text-muted-foreground">
                      Trigger type cannot be changed after creation
                    </p>
                  )}
                </div>

                {/* Email Type (Auto-determined, Read-only) */}
                <div>
                  <label className="block text-[10px] font-medium text-foreground dark:text-foreground/60 mb-1.5 uppercase tracking-wide">
                    Email Type
                  </label>
                  <div className="flex h-8 items-center rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-foreground/70 dark:bg-background/10">
                    {EMAIL_TYPE_LABELS[selectedTriggerConfig?.emailType || 'event_announcements'] || 'Event Announcements'}
                  </div>
                  <p className="mt-1 text-[9px] text-muted-foreground">
                    Auto-set based on trigger selection
                  </p>
                </div>

                {selectedTriggerConfig?.requiresValue && (
                  <div>
                    <label className="block text-[10px] font-medium text-foreground dark:text-foreground/60 mb-1.5 uppercase tracking-wide">
                      Number of Days
                    </label>
                    <Input
                      type="number"
                      {...register('trigger_value', { valueAsNumber: true })}
                      className="h-8 border-border bg-card/80 text-foreground text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:bg-background/5"
                      min={0}
                      placeholder="e.g., 1"
                      disabled={mode === 'edit'}
                    />
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      {mode === 'edit' ? 'Trigger timing cannot be changed after creation' : 'Sends at 8:00 AM Eastern'}
                    </p>
                  </div>
                )}

                {previewDate && (
                  <div className="p-2.5 bg-gradient-to-br from-primary/10 to-pink-500/10 border border-primary/20 rounded-lg">
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-primary/80">Scheduled for:</p>
                    <p className="text-xs text-foreground font-medium">{previewDate}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audience (Read-Only) */}
          <div>
            <button
              onClick={() => setRecipientsOpen(!recipientsOpen)}
              className="flex items-center justify-between w-full mb-2"
            >
              <div className="flex items-center gap-1.5 text-foreground font-medium text-sm">
                <Users className="h-3.5 w-3.5 text-violet-700 dark:text-primary" />
                <span>Audience</span>
              </div>
              {recipientsOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-foreground/60" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-foreground/60" />
              )}
            </button>

            {recipientsOpen && (() => {
              const isCategoryDisabled = BLAST_TRIGGER_TYPES.has(triggerType);

              // Determine audience label
              let audienceLabel = 'All Vendors';
              let audienceDescription = 'This email will be sent to all approved vendors.';

              if (isCategoryDisabled) {
                // Blast emails go to invitations/contacts
                const emailType = selectedTriggerConfig?.emailType;
                if (emailType === 'application_updates') {
                  audienceLabel = 'All Invitations';
                  audienceDescription = 'This email will be sent to all vendors who have applied.';
                } else {
                  audienceLabel = 'All Vendors';
                  audienceDescription = 'This email will be sent to all invited contacts and approved vendors.';
                }
              } else if (selectedCategoryId) {
                // Specific category
                const selectedCategory = categories.find(c => c.id === selectedCategoryId);
                if (selectedCategory) {
                  audienceLabel = selectedCategory.icon
                    ? `${selectedCategory.icon} ${selectedCategory.name}`
                    : selectedCategory.name;
                  audienceDescription = `This email will be sent to all vendors in the ${selectedCategory.name} category.`;
                }
              }

              return (
                <div className="space-y-2">
                  <label className="block text-[10px] font-medium text-foreground dark:text-foreground/60 uppercase tracking-wide">
                    Email Recipients
                  </label>

                  {/* Read-only audience display */}
                  <div className="px-3 py-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="text-sm text-foreground font-medium">{audienceLabel}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-blue-800 dark:text-blue-300/70">
                      {audienceDescription}
                    </p>
                  </div>

                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    The audience is automatically determined by the email's trigger type and cannot be changed.
                  </p>
                </div>
              );
            })()}
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

            {availableTagsOpen && (() => {
              const filteredVariables = tagSearch
                ? EMAIL_VARIABLES.filter((v) =>
                    v.label.toLowerCase().includes(tagSearch.toLowerCase()) ||
                    v.frontendVar.toLowerCase().includes(tagSearch.toLowerCase())
                  )
                : null;

              return (
              <div className="space-y-1">
                <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">
                  Click a tag to insert it at your cursor position
                  {BLAST_TRIGGER_TYPES.has(triggerType) && (
                    <span className="mt-1 block text-amber-700 dark:text-yellow-400/80">
                      Note: Some variables are disabled for announcement emails (greyed out) — recipients haven't applied yet
                    </span>
                  )}
                </p>
                {/* Tag Search */}
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="w-full rounded border border-border bg-background/5 py-1.5 pl-7 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  {tagSearch && (
                    <button
                      onClick={() => setTagSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {tagSearch && filteredVariables && (
                  <p className="mb-1 text-[10px] text-muted-foreground">{filteredVariables.length} of {EMAIL_VARIABLES.length} tags</p>
                )}

                {/* Show flat filtered results when searching */}
                {filteredVariables ? (
                  <div className="space-y-0.5">
                    {filteredVariables.map((variable) => {
                      const isBlastEmail = BLAST_TRIGGER_TYPES.has(triggerType);
                      const isDisabled = isBlastEmail && !variable.worksInInvitations;

                      return (
                        <button
                          key={variable.frontendVar}
                          type="button"
                          onClick={() => !isDisabled && handleInsertVariable(variable.frontendVar)}
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={isDisabled}
                          className={`flex items-center gap-1.5 w-full px-2 py-1.5 text-xs rounded transition-all border ${
                            isDisabled
                              ? 'cursor-not-allowed border-border bg-background/20 text-foreground/55 opacity-70 dark:bg-background/5 dark:text-foreground/40 dark:opacity-40'
                              : 'text-foreground hover:bg-gradient-to-r hover:from-primary/20 hover:to-blue-500/20 hover:border-primary/40 border-border bg-background/5 group'
                          }`}
                          title={
                            isDisabled
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
                ) : (
                  /* Show grouped results when not searching */
                  <div className="space-y-3">
                    {getGroupedVariablesForUI().map((group) => (
                      <div key={group.label}>
                        <h4 className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-primary">
                          {group.label}
                        </h4>
                        <div className="space-y-0.5">
                          {group.variables.map((variable) => {
                            const isBlastEmail = BLAST_TRIGGER_TYPES.has(triggerType);
                            const isDisabled = isBlastEmail && !variable.worksInInvitations;

                            return (
                              <button
                                key={variable.frontendVar}
                                type="button"
                                onClick={() => !isDisabled && handleInsertVariable(variable.frontendVar)}
                                onMouseDown={(e) => e.preventDefault()}
                                disabled={isDisabled}
                                className={`flex items-center gap-1.5 w-full px-2 py-1.5 text-xs rounded transition-all border ${
                                  isDisabled
                                    ? 'cursor-not-allowed border-border bg-background/20 text-foreground/55 opacity-70 dark:bg-background/5 dark:text-foreground/40 dark:opacity-40'
                                    : 'text-foreground hover:bg-gradient-to-r hover:from-primary/20 hover:to-blue-500/20 hover:border-primary/40 border-border bg-background/5 group'
                                }`}
                                title={
                                  isDisabled
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
                    ))}
                  </div>
                )}
              </div>
              );
            })()}
          </div>
        </div>
      </div>
      </div>
      {/* End Main Editor Area */}

      {/* Test Email Dialog */}
      <Dialog open={showTestEmailDialog} onOpenChange={setShowTestEmailDialog}>
        <DialogContent className="sm:max-w-md voxxy-gradient-page-cool border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Send Test Email
            </DialogTitle>
            <DialogDescription className="text-foreground/60">
              Send a test version of this email to see how it will look when delivered.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="bg-background/5 border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendTestEmail();
                  }
                }}
              />
              <p className="text-xs text-foreground/50 mt-2">
                The email will be sent with "[TEST]" in the subject line and will include resolved variables.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTestEmailDialog(false)}
              className="bg-background/5 border-border text-foreground hover:bg-background/10"
              disabled={isSendingTest}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendTestEmail}
              disabled={isSendingTest || !testEmailAddress}
              className="voxxy-btn-cta"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Debug Panel */}
      <div className="overflow-y-auto max-h-96">
        <DebugPanel
          title="Email Editor"
          data={{
            mode,
            email,
            eventData,
            eventSlug,
            formValues: getValues(),
            previewDate,
            canSendNow,
            triggerType,
            triggerValue,
            validationErrors,
            errors: formState.errors,
          }}
          isAdmin={isAdmin}
        />
      </div>

      {/* HTML Preview Modal */}
      {!isCreateMode && email?.id && (
        <EmailHtmlPreviewModal
          open={showHtmlPreview}
          onClose={() => setShowHtmlPreview(false)}
          previewUrl={`/v1/presents/events/${eventSlug}/scheduled_emails/${email.id}/preview.html`}
          subject={subject}
          title={`Preview: ${email.name || 'Email'}`}
          apiMethod="POST"
        />
      )}
    </div>
  );
}
