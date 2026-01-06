import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { scheduledEmailsApi } from '@/services/api';

interface SaveAsTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventSlug: string;
  emailCount: number;
  onSuccess?: (templateId: number) => void;
}

export default function SaveAsTemplateDialog({
  isOpen,
  onClose,
  eventSlug,
  emailCount,
  onSuccess
}: SaveAsTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a template name');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const template = await scheduledEmailsApi.saveAsTemplate(eventSlug, {
        name: name.trim(),
        description: description.trim() || undefined
      });

      // Reset form
      setName('');
      setDescription('');

      // Call success callback
      if (onSuccess && template.id) {
        onSuccess(template.id);
      }

      // Close dialog
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setName('');
      setDescription('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-purple-400" />
            Save as Reusable Template
          </DialogTitle>
          <DialogDescription>
            Save these {emailCount} customized emails as a reusable template for future events.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Name */}
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-white mb-2">
              Template Name *
            </label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer Festival Campaign"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              disabled={isSaving}
              maxLength={100}
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label htmlFor="template-description" className="block text-sm font-medium text-white mb-2">
              Description <span className="text-white/40 font-normal">(Optional)</span>
            </label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when to use this template..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              disabled={isSaving}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-white/40">
              {description.length}/500 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> This will create a copy of your current email setup that you can reuse for other events. Your current event emails won't be affected.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Template
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
