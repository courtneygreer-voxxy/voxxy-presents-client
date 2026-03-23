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
  Globe,
  CheckCircle2,
  AlertCircle,
  Send,
  Lock
} from 'lucide-react';
import type { ScheduledEmail, UpdateEmailRequest, CreateScheduledEmailRequest, TriggerType } from '@/types/email';
import type { Category } from '@/types/category';
import {
  EMAIL_VARIABLES,
  backendToFrontend,
  frontendToBackend,
  validateEmailContent,
} from '@/utils/emailVariables';
import { splitEmailBody, joinEmailBody, STANDARD_EMAIL_FOOTER } from '@/utils/emailFooter';
import { getEightAmLocalAsUTC, getTimezoneInfo, formatDateWithTimezone } from '@/utils/timezone';
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
import { addDays, subDays, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { scheduledEmailsApi } from '@/services/api';
import { DebugPanel } from '../DebugPanel';

interface EmailEditorPageProps {
  email: ScheduledEmail | null;
  eventData: any | null;
  eventSlug: string;
  onBack: () => void;
  onSave: (emailId: number, data: UpdateEmailRequest) => Promise<void>;
  onCreate?: (data: CreateScheduledEmailRequest) => Promise<ScheduledEmail>;
  mode?: 'edit' | 'create';
  categories?: Category[];
  isAdmin?: boolean;
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
  { value: 'on_invitation_send', label: 'When Invitation Sent', requiresValue: false, description: 'Send when vendor is invited to event', requiredDateField: null },
  { value: 'days_before_event', label: 'Days Before Event', requiresValue: true, description: 'Send X days before the event date', requiredDateField: 'start_date' },
  { value: 'days_after_event', label: 'Days After Event', requiresValue: true, description: 'Send X days after the event date', requiredDateField: 'start_date' },
  { value: 'days_before_deadline', label: 'Days Before Application Deadline', requiresValue: true, description: 'Send X days before application deadline', requiredDateField: 'application_deadline' },
  { value: 'on_event_date', label: 'On Event Date', requiresValue: false, description: 'Send on the event date', requiredDateField: 'start_date' },
  { value: 'on_application_open', label: 'When Applications Open', requiresValue: false, description: 'Send when event is created', requiredDateField: null },
  { value: 'days_before_payment_deadline', label: 'Days Before Payment Due', requiresValue: true, description: 'Send X days before payment deadline', requiredDateField: 'payment_deadline' },
  { value: 'on_payment_deadline', label: 'On Payment Deadline', requiresValue: false, description: 'Send on payment deadline day', requiredDateField: 'payment_deadline' },
  { value: 'days_after_payment_deadline', label: 'Days After Payment Due', requiresValue: true, description: 'Send X days after payment deadline (for overdue reminders)', requiredDateField: 'payment_deadline' },
  { value: 'on_bulletin_post', label: 'On Bulletin Post', requiresValue: false, description: 'Send when producer posts a bulletin', requiredDateField: null },
] as const;

// Blast-type triggers: vendor isn't in the system yet, so category targeting doesn't apply
const BLAST_TRIGGER_TYPES = new Set([
  'on_invitation_send',
  'on_application_open',
  'days_before_deadline',
  'on_bulletin_post',
  'on_event_cancel',
  'on_event_update',
]);

export function EmailEditorPage({
  email: initialEmail,
  eventData,
  eventSlug,
  onBack,
  onSave,
  onCreate,
  mode: initialMode = 'edit',
  categories = [],
  isAdmin,
}: EmailEditorPageProps) {
  const [email, setEmail] = useState<ScheduledEmail | null>(initialEmail);
  const [mode, setMode] = useState<'edit' | 'create'>(initialMode);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialEmail?.category_id || null);
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
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [emailFooter, setEmailFooter] = useState<string>('');

  const subjectRef = useRef<HTMLInputElement>(null);
  const timezoneInfo = getTimezoneInfo();
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

  // Filter trigger types based on which date fields exist on the event
  const availableTriggerTypes = TRIGGER_TYPES.filter((type) => {
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
      setSelectedCategoryId(null);
      setEmailFooter(STANDARD_EMAIL_FOOTER);
      return;
    }

    if (!email) return;

    console.log('📧 Loading email into editor:', email.name);
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
      const eventDate = parseISO(eventData.start_date);
      let scheduledDate = eventDate;

      switch (triggerType) {
        case 'days_before_event':
        case 'days_before_deadline':
        case 'days_before_payment_deadline':
          scheduledDate = subDays(eventDate, triggerValue || 0);
          break;
        case 'days_after_event':
        case 'days_after_payment_deadline':
          scheduledDate = addDays(eventDate, triggerValue || 0);
          break;
        case 'on_event_date':
        case 'on_application_open':
        case 'on_payment_deadline':
        case 'on_bulletin_post':
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
        className: "bg-green-500/10 border-green-500/30 text-green-400",
      });

      setShowTestEmailDialog(false);
      setTestEmailAddress('');
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      toast({
        title: "Failed to Send Test Email",
        description: error?.message || 'An error occurred while sending the test email.',
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const onSubmit = async (data: EditEmailFormData) => {
    // Double-check validation before saving (extra safety)
    const plainSubject = data.subject_template || '';
    const plainBody = stripHtmlForValidation(data.body_template || '');
    const finalValidation = validateEmailContent(plainSubject, plainBody);

    if (!finalValidation.isValid || validationErrors.length > 0) {
      console.error('🚫 BLOCKED SAVE - Validation errors:', {
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

      const trigger_time = getEightAmLocalAsUTC();

      // Determine category_id: null if blast trigger type, otherwise use selection
      const effectiveCategoryId = BLAST_TRIGGER_TYPES.has(data.trigger_type) ? null : selectedCategoryId;

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
        };

        const newEmail = await onCreate(createData);

        // Transition to edit mode with the newly created email
        setEmail(newEmail);
        setMode('edit');

        toast({
          title: "Email Created Successfully",
          description: `"${data.name}" has been created. You can now send test emails.`,
          variant: "default",
          className: "bg-green-500/10 border-green-500/30 text-green-400",
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
        };

        await onSave(email.id, updateData);

        toast({
          title: "Email Saved Successfully",
          description: `"${data.name}" has been updated.`,
          variant: "default",
          className: "bg-green-500/10 border-green-500/30 text-green-400",
        });
      }

      // Success!
      setSaveSuccess(true);

      // Clear success state after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (error: any) {
      console.error('Failed to save email:', error);
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
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f0a1e] via-[#1a0f2e] to-[#0f0a1e] z-50 flex flex-col">
      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
      {/* Left Side - Main Content */}
      <div className={`${showPreview ? 'w-1/2' : 'flex-1'} flex flex-col border-r border-white/10 transition-all duration-300`}>
        {/* Top Bar */}
        <div className="border-b border-white/10 px-12 py-3 flex items-center justify-between backdrop-blur-sm bg-black/20 min-h-[60px]">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
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
              className={`border-white/20 text-white h-9 ${showPreview ? 'bg-purple-500/20 hover:bg-purple-500/30' : 'bg-white/5 hover:bg-white/10'}`}
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
            {!isCreateMode && (
              <Button
                onClick={() => setShowTestEmailDialog(true)}
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-9"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Send Test
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
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400'
              } text-white`}
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
        <div className="flex-1 overflow-y-auto px-12 py-6">
          <div className="max-w-3xl mx-auto">
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
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Email Name
              </label>
              <Input
                {...register('name')}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 text-sm h-9"
                placeholder="e.g., Day Before Event Reminder"
              />
            </div>

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
                onFocus={() => focusField('subject')}
                onBlur={() => blurField('subject')}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 text-sm h-9"
                placeholder="e.g., Reminder: [eventName] is Tomorrow!"
              />
            </div>

            {/* Email Body */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Email Body
              </label>
              <RichTextEditor
                content={body || ''}
                onChange={(html) => setValue('body_template', html, { shouldValidate: true })}
                onEditorReady={(editor) => setBodyEditor(editor)}
                onFocus={() => focusField('body')}
                onBlur={() => blurField('body')}
                placeholder="Write your email message here... Use the toolbar to format text and click variables on the right to insert."
              />
            </div>

            {/* Locked Footer Section */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Lock className="w-4 h-4 text-purple-400" />
                <label className="block text-xs font-medium text-white/70">
                  Email Footer (Locked)
                </label>
              </div>
              <div className="relative">
                <div className="p-4 rounded-lg bg-white/5 border border-purple-500/20 opacity-60 pointer-events-none min-h-[120px]">
                  <div
                    className="text-xs text-white/80"
                    dangerouslySetInnerHTML={{ __html: emailFooter }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-white/90">
                      Footer is locked to ensure unsubscribe link is always present
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-1.5 text-[10px] text-white/50 leading-relaxed">
                The footer contains the unsubscribe link required by email regulations (CAN-SPAM, GDPR) and cannot be edited.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Panel */}
      {showPreview && (
        <div className="w-1/2 flex flex-col bg-gradient-to-b from-black/40 to-black/20">
          {/* Preview Header */}
          <div className="border-b border-white/10 px-12 py-3 flex items-center backdrop-blur-sm bg-black/20 min-h-[60px]">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              Live Preview
            </h3>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Preview Subject */}
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                  Subject
                </label>
                <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                  <div
                    className="text-white font-medium text-sm"
                    dangerouslySetInnerHTML={{
                      __html: resolvePreviewVariables(subject || '<span style="color: rgba(255, 255, 255, 0.4); font-style: italic;">Subject will appear here...</span>')
                    }}
                  />
                </div>
              </div>

              {/* Preview Body */}
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
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
                <div className="bg-white/5 rounded-lg p-6 border border-purple-500/20">
                  {body ? (
                    <div
                      className="email-preview-content"
                      dangerouslySetInnerHTML={{
                        __html: resolvePreviewVariables(body)
                      }}
                    />
                  ) : (
                    <p className="text-white/40 text-sm italic">
                      Email body will appear here as you type...
                    </p>
                  )}
                </div>
              </div>

              {/* Preview Footer (Locked) */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lock className="w-3 h-3 text-purple-400" />
                  <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wide">
                    Email Footer (Locked)
                  </p>
                </div>
                <div
                  className="email-preview-content text-xs"
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
                      {availableTriggerTypes.map((type) => (
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

            {recipientsOpen && (() => {
              const isCategoryDisabled = BLAST_TRIGGER_TYPES.has(triggerType);
              return (
                <div className="space-y-2">
                  <label className="block text-[10px] font-medium text-white/60 uppercase tracking-wide">
                    Category
                  </label>
                  <Select
                    value={selectedCategoryId?.toString() || 'all'}
                    onValueChange={(value) => setSelectedCategoryId(value === 'all' ? null : Number(value))}
                    disabled={isCategoryDisabled}
                  >
                    <SelectTrigger className={`bg-white/5 border-white/20 text-white text-sm h-8 ${isCategoryDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a0f2e] border-purple-500/20">
                      <SelectItem value="all" className="text-white text-sm">
                        All Vendors
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()} className="text-white text-sm">
                          {category.icon ? `${category.icon} ${category.name}` : category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isCategoryDisabled && (
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Category targeting is not available for this email type — recipients may not be vendors yet.
                    </p>
                  )}
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
                  {email?.email_template_item?.category === 'event_announcements' && (
                    <span className="block mt-1 text-yellow-400/80">
                      Note: Some variables are disabled for announcement emails (greyed out) — recipients haven't applied yet
                    </span>
                  )}
                </p>
                <div className="space-y-0.5">
                  {EMAIL_VARIABLES.map((variable) => {
                    // Only gray out category-specific variables for event_announcements
                    // (recipients haven't applied/chosen a category yet)
                    const isAnnouncementEmail = email?.email_template_item?.category === 'event_announcements';
                    const isDisabled = isAnnouncementEmail && !variable.worksInInvitations;

                    return (
                      <button
                        key={variable.frontendVar}
                        type="button"
                        onClick={() => !isDisabled && handleInsertVariable(variable.frontendVar)}
                        onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                        disabled={isDisabled}
                        className={`flex items-center gap-1.5 w-full px-2 py-1.5 text-xs rounded transition-all border ${
                          isDisabled
                            ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/5 text-white/40'
                            : 'text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-500/40 border-white/10 bg-white/5 group'
                        }`}
                        title={
                          isDisabled
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
      </div>
      {/* End Main Editor Area */}

      {/* Test Email Dialog */}
      <Dialog open={showTestEmailDialog} onOpenChange={setShowTestEmailDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" />
              Send Test Email
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Send a test version of this email to see how it will look when delivered.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendTestEmail();
                  }
                }}
              />
              <p className="text-xs text-white/50 mt-2">
                The email will be sent with "[TEST]" in the subject line and will include resolved variables.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTestEmailDialog(false)}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              disabled={isSendingTest}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendTestEmail}
              disabled={isSendingTest || !testEmailAddress}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white"
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
    </div>
  );
}
