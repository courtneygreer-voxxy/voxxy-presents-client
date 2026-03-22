import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from './RichTextEditor';
import type { Category } from '@/types/category';
import type { TriggerType, CreateScheduledEmailRequest } from '@/types/email';
import { joinEmailBody, STANDARD_EMAIL_FOOTER } from '@/utils/emailFooter';
import { frontendToBackend } from '@/utils/emailVariables';

const createEmailSchema = z.object({
  name: z.string().min(1, 'Email name is required'),
  subject_template: z.string().min(1, 'Subject is required'),
  body_template: z.string().min(1, 'Email body is required'),
  trigger_type: z.string().min(1, 'Trigger type is required'),
  trigger_value: z.number().min(0).optional(),
  category_id: z.number().nullable().optional(),
});

type CreateEmailFormData = z.infer<typeof createEmailSchema>;

// Only time-based triggers that can be manually created
// System/event-triggered emails (on_approval, etc.) are NOT included
const TIME_BASED_TRIGGERS = [
  { value: 'days_before_event', label: 'Days Before Event', requiresValue: true },
  { value: 'days_after_event', label: 'Days After Event', requiresValue: true },
  { value: 'on_event_date', label: 'On Event Date', requiresValue: false },
  { value: 'days_before_payment_deadline', label: 'Days Before Payment Due', requiresValue: true },
  { value: 'on_payment_deadline', label: 'On Payment Deadline', requiresValue: false },
  { value: 'days_after_payment_deadline', label: 'Days After Payment Due', requiresValue: true },
];

interface CreateEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateScheduledEmailRequest) => Promise<void>;
  categories?: Category[];  // Optional - only shown if provided (Mail Tab)
  showCategorySelector?: boolean;  // Control whether to show category selector
}

export function CreateEmailDialog({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  showCategorySelector = true
}: CreateEmailDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bodyEditor, setBodyEditor] = useState<any | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateEmailFormData>({
    resolver: zodResolver(createEmailSchema),
    defaultValues: {
      name: '',
      subject_template: '',
      body_template: '',
      trigger_type: 'days_before_event',
      trigger_value: 1,
      category_id: null,
    },
  });

  const triggerType = watch('trigger_type');
  const selectedTrigger = TIME_BASED_TRIGGERS.find(t => t.value === triggerType);

  const handleFormSubmit = async (data: CreateEmailFormData) => {
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
        trigger_type: data.trigger_type as TriggerType,
        trigger_value: selectedTrigger?.requiresValue ? data.trigger_value : undefined,
        trigger_time: '08:00',  // Default to 8:00 AM
        category_id: showCategorySelector ? data.category_id : null,  // Only include if selector shown
        status: 'scheduled',
      });

      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create email:', error);
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
          <DialogTitle className="text-white text-xl">Create New Email</DialogTitle>
          <p className="text-white/60 text-sm">
            Add a new time-based email to your sequence
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
              Use variables like [eventName], [eventDate], [firstName] - click to insert from sidebar
            </p>
          </div>

          {/* Category Filter - Only shown in Mail Tab */}
          {showCategorySelector && categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Send To</label>
              <Select
                value={watch('category_id')?.toString() || 'all'}
                onValueChange={(value) => setValue('category_id', value === 'all' ? null : Number(value))}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2e] border-purple-500/20">
                  <SelectItem value="all" className="text-white">All Vendors</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="text-white">
                      {cat.icon ? `${cat.icon} ${cat.name}` : cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-white/50 mt-1">
                Choose "All Vendors" for event announcements, or select a specific category for targeted emails
              </p>
            </div>
          )}

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

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Email Body</label>
            <RichTextEditor
              content={watch('body_template') || ''}
              onChange={(html) => setValue('body_template', html, { shouldValidate: true })}
              onEditorReady={(editor) => setBodyEditor(editor)}
              placeholder="Write your email message... The unsubscribe footer will be added automatically."
            />
            {errors.body_template && <p className="text-red-400 text-xs mt-1">{errors.body_template.message}</p>}
            <p className="text-xs text-white/50 mt-1">
              The standard email footer with unsubscribe link will be added automatically
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
              {isSubmitting ? 'Creating...' : 'Create Email'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
