import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, Loader2, Calendar, Clock, Type, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';
import type { ScheduledEmail, UpdateEmailRequest, TriggerType } from '@/types/email';
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
  onSave: (emailId: number, data: UpdateEmailRequest) => Promise<void>;
}

const editEmailSchema = z.object({
  name: z.string().min(1, 'Email name is required'),
  subject_template: z.string().min(1, 'Subject is required'),
  body_template: z.string().min(1, 'Email body is required'),
  trigger_type: z.string().min(1, 'Trigger type is required'),
  trigger_value: z.number().min(0, 'Must be 0 or greater').optional(),
  trigger_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
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
];

export default function EditScheduledEmailModal({
  isOpen,
  onClose,
  email,
  onSave,
}: EditScheduledEmailModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EditEmailFormData>({
    resolver: zodResolver(editEmailSchema),
  });

  const selectedTriggerType = watch('trigger_type');
  const selectedTriggerConfig = TRIGGER_TYPES.find(t => t.value === selectedTriggerType);

  // Reset form when email changes
  useEffect(() => {
    if (email && isOpen) {
      // Parse trigger_time - it might be a Time object or HH:MM string
      let triggerTime = '09:00'; // default
      if (email.trigger_time) {
        if (typeof email.trigger_time === 'string' && email.trigger_time.includes(':')) {
          // Already in HH:MM format
          triggerTime = email.trigger_time.substring(0, 5); // Take first 5 chars (HH:MM)
        } else {
          // It's a Time object, extract HH:MM
          const timeObj = new Date(email.trigger_time);
          const hours = timeObj.getUTCHours().toString().padStart(2, '0');
          const minutes = timeObj.getUTCMinutes().toString().padStart(2, '0');
          triggerTime = `${hours}:${minutes}`;
        }
      }

      reset({
        name: email.name,
        subject_template: email.subject_template,
        body_template: email.body_template,
        trigger_type: email.trigger_type,
        trigger_value: email.trigger_value || 0,
        trigger_time: triggerTime,
      });
      setError(null);
    }
  }, [email, isOpen, reset]);

  const onSubmit = async (data: EditEmailFormData) => {
    if (!email) return;

    setIsSaving(true);
    setError(null);

    try {
      // Build update request
      const updateData: UpdateEmailRequest = {
        name: data.name,
        subject_template: data.subject_template,
        body_template: data.body_template,
        trigger_type: data.trigger_type as TriggerType,
        trigger_value: data.trigger_value,
        trigger_time: data.trigger_time,
      };

      await onSave(email.id, updateData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update email');
    } finally {
      setIsSaving(false);
    }
  };

  if (!email) return null;

  const isSent = email.status === 'sent';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0f0a1e] border-purple-500/20">
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

            {/* Trigger Value (Days) - Show only for types that require it */}
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

            {/* Trigger Time */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Send Time (UTC)
              </label>
              <Input
                type="time"
                {...register('trigger_time')}
                disabled={isSent || isSaving}
                className="bg-white/5 border-white/10 text-white"
              />
              {errors.trigger_time && (
                <p className="text-red-400 text-sm mt-1">{errors.trigger_time.message}</p>
              )}
              <p className="text-white/40 text-xs mt-1">
                Time is in UTC. The system will calculate the exact send datetime based on your event dates.
              </p>
            </div>

            {/* Calculated Send Time Preview */}
            {email.scheduled_for && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-300 text-sm">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  <strong>Current scheduled time:</strong>{' '}
                  {format(new Date(email.scheduled_for), 'MMM d, yyyy h:mm a')} UTC
                </p>
                <p className="text-blue-300/60 text-xs mt-1">
                  This will be recalculated when you save if you've changed the timing settings.
                </p>
              </div>
            )}
          </div>

          {/* Subject Template */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Subject Line
            </label>
            <Input
              {...register('subject_template')}
              disabled={isSent || isSaving}
              className="bg-white/5 border-white/10 text-white"
              placeholder="e.g., Tomorrow: [eventName] Final Details"
            />
            {errors.subject_template && (
              <p className="text-red-400 text-sm mt-1">{errors.subject_template.message}</p>
            )}
            <p className="text-white/40 text-xs mt-1">
              Use variables: [eventName], [firstName], [businessName], [vendorCategory], [boothPrice]
            </p>
          </div>

          {/* Body Template */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email Body (HTML)
            </label>
            <Textarea
              {...register('body_template')}
              disabled={isSent || isSaving}
              className="bg-white/5 border-white/10 text-white min-h-[300px] font-mono text-sm"
              placeholder="Enter HTML content..."
            />
            {errors.body_template && (
              <p className="text-red-400 text-sm mt-1">{errors.body_template.message}</p>
            )}
            <p className="text-white/40 text-xs mt-1">
              You can use HTML tags and the same variables as the subject line.
            </p>
          </div>

          {/* Error Message */}
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
              disabled={isSent || isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
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
