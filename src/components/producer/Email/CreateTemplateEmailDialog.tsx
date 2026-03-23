import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from './RichTextEditor';
import type { EmailCategory, TriggerType, CreateEmailTemplateItemRequest } from '@/types/email';
import { joinEmailBody, STANDARD_EMAIL_FOOTER } from '@/utils/emailFooter';
import { frontendToBackend } from '@/utils/emailVariables';

const createTemplateEmailSchema = z.object({
  name: z.string().min(1, 'Email name is required'),
  subject_template: z.string().min(1, 'Subject is required'),
  body_template: z.string().min(1, 'Email body is required'),
  email_type: z.string().min(1, 'Email category is required'),
  trigger_type: z.string().min(1, 'Trigger type is required'),
  trigger_value: z.number().min(0).optional(),
  position: z.number().min(1),
});

type CreateTemplateEmailFormData = z.infer<typeof createTemplateEmailSchema>;

// Only time-based triggers that can be manually created
const TIME_BASED_TRIGGERS = [
  { value: 'days_before_event', label: 'Days Before Event', requiresValue: true },
  { value: 'days_after_event', label: 'Days After Event', requiresValue: true },
  { value: 'on_event_date', label: 'On Event Date', requiresValue: false },
  { value: 'days_before_payment_deadline', label: 'Days Before Payment Due', requiresValue: true },
  { value: 'on_payment_deadline', label: 'On Payment Deadline', requiresValue: false },
  { value: 'days_after_payment_deadline', label: 'Days After Payment Due', requiresValue: true },
];

// Email categories for template emails (generic, not vendor-specific)
const EMAIL_CATEGORIES: { value: EmailCategory; label: string; description: string }[] = [
  {
    value: 'event_announcements',
    label: 'Event Announcements',
    description: 'General event info sent to all invitees (before they apply)'
  },
  {
    value: 'application_updates',
    label: 'Application Updates',
    description: 'Application status, approval, rejection, waitlist'
  },
  {
    value: 'payment_reminders',
    label: 'Payment Reminders',
    description: 'Payment due dates, confirmations, reminders'
  },
  {
    value: 'event_countdown',
    label: 'Event Countdown',
    description: 'Days before event, day-of reminders, setup info'
  },
  {
    value: 'event_updates',
    label: 'Event Updates',
    description: 'Post-event follow-ups, event changes, general updates'
  },
];

interface CreateTemplateEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmailTemplateItemRequest) => Promise<void>;
  nextPosition: number;  // Next available position in the sequence
}

export function CreateTemplateEmailDialog({
  isOpen,
  onClose,
  onSubmit,
  nextPosition
}: CreateTemplateEmailDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateTemplateEmailFormData>({
    resolver: zodResolver(createTemplateEmailSchema),
    defaultValues: {
      name: '',
      subject_template: '',
      body_template: '',
      email_type: 'event_announcements',
      trigger_type: 'days_before_event',
      trigger_value: 1,
      position: nextPosition,
    },
  });

  const triggerType = watch('trigger_type');
  const emailType = watch('email_type');
  const selectedTrigger = TIME_BASED_TRIGGERS.find(t => t.value === triggerType);
  const selectedCategory = EMAIL_CATEGORIES.find(c => c.value === emailType);

  const handleFormSubmit = async (data: CreateTemplateEmailFormData) => {
    setIsSubmitting(true);
    try {
      // Join content with footer and convert to backend format
      const fullBody = joinEmailBody(data.body_template, STANDARD_EMAIL_FOOTER);
      const convertedBody = frontendToBackend(fullBody);
      const convertedSubject = frontendToBackend(data.subject_template);

      await onSubmit({
        name: data.name,
        subject_template: convertedSubject,
        body_template: convertedBody,
        email_type: data.email_type as EmailCategory,
        category_id: null,  // Generic template emails don't target specific vendor categories
        position: data.position,
        trigger_type: data.trigger_type as TriggerType,
        trigger_value: selectedTrigger?.requiresValue ? data.trigger_value : undefined,
        trigger_time: '08:00',  // Default to 8:00 AM
        enabled_by_default: true,  // Default to enabled
      });

      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create template email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Add Email to Template</DialogTitle>
          <p className="text-white/60 text-sm">
            Create a generic email that will be copied to all vendor categories during event creation
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-4">
          {/* Email Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Email Name</label>
            <Input
              {...register('name')}
              placeholder="e.g., 3 Days Before Event Reminder"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email Category */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Email Category</label>
            <Select
              value={emailType}
              onValueChange={(value) => setValue('email_type', value)}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a0f2e] border-purple-500/20">
                {EMAIL_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} className="text-white">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && (
              <p className="text-xs text-white/50 mt-1">{selectedCategory.description}</p>
            )}
            {errors.email_type && <p className="text-red-400 text-xs mt-1">{errors.email_type.message}</p>}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Subject Line</label>
            <Input
              {...register('subject_template')}
              placeholder="e.g., Don't forget: [eventName] is in 3 days!"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
            {errors.subject_template && <p className="text-red-400 text-xs mt-1">{errors.subject_template.message}</p>}
            <p className="text-xs text-white/50 mt-1">
              Use variables like [eventName], [eventDate], [firstName]
            </p>
          </div>

          {/* Trigger Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">When to Send</label>
              <Select
                value={triggerType}
                onValueChange={(value) => {
                  setValue('trigger_type', value);
                  // Reset trigger_value when changing trigger type
                  const newTrigger = TIME_BASED_TRIGGERS.find(t => t.value === value);
                  if (newTrigger?.requiresValue) {
                    setValue('trigger_value', 1);
                  }
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2e] border-purple-500/20">
                  {TIME_BASED_TRIGGERS.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTrigger?.requiresValue && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Number of Days</label>
                <Input
                  type="number"
                  {...register('trigger_value', { valueAsNumber: true })}
                  min={0}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Position in Sequence</label>
            <Input
              type="number"
              {...register('position', { valueAsNumber: true })}
              min={1}
              max={40}
              className="bg-white/5 border-white/20 text-white"
            />
            <p className="text-xs text-white/50 mt-1">
              Order in the email sequence (1-40). Default: {nextPosition}
            </p>
            {errors.position && <p className="text-red-400 text-xs mt-1">{errors.position.message}</p>}
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Email Body</label>
            <RichTextEditor
              content={watch('body_template') || ''}
              onChange={(html) => setValue('body_template', html, { shouldValidate: true })}
              placeholder="Write your email message... The unsubscribe footer will be added automatically."
            />
            {errors.body_template && <p className="text-red-400 text-xs mt-1">{errors.body_template.message}</p>}
            <p className="text-xs text-white/50 mt-1">
              This is a generic template - it will be copied for each vendor category when an event is created
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add to Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
