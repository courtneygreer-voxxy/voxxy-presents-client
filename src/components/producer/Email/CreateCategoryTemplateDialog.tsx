import { useState } from 'react';
import { Loader2, AlertCircle, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types/category';
import type { EmailCampaignTemplate } from '@/types/email';
import { getCategorySequenceBadgeStyle } from '@/lib/categoryBadgeStyles';

interface CreateCategoryTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  genericTemplates: EmailCampaignTemplate[];  // Available templates to clone from
  onCreateTemplate: (categoryId: number, sourceTemplateId: number) => Promise<void>;
}

export function CreateCategoryTemplateDialog({
  isOpen,
  onClose,
  category,
  genericTemplates,
  onCreateTemplate,
}: CreateCategoryTemplateDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedTemplateId) {
      setError('Please select a template to clone');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreateTemplate(category.id, selectedTemplateId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create category template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplateId(null);
    setError(null);
    onClose();
  };

  // Only show generic templates
  const availableTemplates = genericTemplates.filter(t => t.template_type === 'generic');
  const defaultTemplate = availableTemplates.find(t => t.is_default);

  // Auto-select default template if available
  if (!selectedTemplateId && defaultTemplate) {
    setSelectedTemplateId(defaultTemplate.id);
  }

  // Event-wide triggers that will be excluded from category templates
  const EVENT_WIDE_TRIGGERS = [
    'on_event_update',
    'on_event_cancel',
    'on_bulletin_post',
    'on_category_change',
    'on_invitation_send'
  ];

  // Count category-specific emails (excluding event-wide emails)
  const getCategorySpecificEmailCount = (template: EmailCampaignTemplate) => {
    if (!template.email_template_items) return 0;

    return template.email_template_items.filter(item => {
      // Exclude event announcements
      if (item.category === 'event_announcements') return false;

      // Exclude event-wide trigger types
      if (EVENT_WIDE_TRIGGERS.includes(item.trigger_type)) return false;

      return true;
    }).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg voxxy-gradient-page-cool border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-400" />
            Create Template for{' '}
            <span
              className="category-sequence-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-base font-semibold"
              style={getCategorySequenceBadgeStyle(category.color)}
            >
              {category.icon && <span>{category.icon}</span>}
              {category.name}
            </span>
          </DialogTitle>
          <p className="text-foreground/60 text-sm mt-2">
            Clone an existing template and customize it for this vendor category
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium">Error</p>
                <p className="text-red-400/80 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              Choose Template to Clone
            </label>
            <div className="space-y-2">
              {availableTemplates.length === 0 ? (
                <div className="p-4 rounded-lg bg-background/5 border border-border text-center">
                  <p className="text-foreground/60 text-sm">No generic templates available</p>
                  <p className="text-foreground/40 text-xs mt-1">Create a generic template first</p>
                </div>
              ) : (
                availableTemplates.map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      selectedTemplateId === template.id
                        ? 'bg-purple-500/20 border-purple-500/50'
                        : 'bg-background/5 border-border hover:bg-background/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                        selectedTemplateId === template.id
                          ? 'border-purple-400 bg-purple-400'
                          : 'border-border'
                      }`}>
                        {selectedTemplateId === template.id && (
                          <div className="w-full h-full rounded-full bg-background scale-50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{template.name}</span>
                          {template.is_default && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide bg-yellow-500/20 text-yellow-950 dark:text-yellow-300 border border-yellow-500/30">
                              Default
                            </span>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-xs text-foreground/60 mt-1">{template.description}</p>
                        )}
                        <p className="text-xs text-foreground/40 mt-1">
                          {getCategorySpecificEmailCount(template)} category-specific emails
                          {template.email_count && template.email_count > getCategorySpecificEmailCount(template) && (
                            <span className="text-foreground/30"> ({template.email_count - getCategorySpecificEmailCount(template)} event-wide emails excluded)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-400 mb-2 flex items-center gap-1.5 flex-wrap">
              The template will be cloned and automatically named "
              <span
                className="category-sequence-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold"
                style={getCategorySequenceBadgeStyle(category.color)}
              >
                {category.icon && <span className="text-[10px]">{category.icon}</span>}
                {category.name}
              </span>
              ".
            </p>
            <p className="text-xs text-blue-300/80">
              <strong>Note:</strong> Event-wide emails (announcements, invitations, bulletins) will be excluded from this category template, as they are sent to all vendors regardless of category.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-background/5 border-border text-foreground hover:bg-background/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedTemplateId || availableTemplates.length === 0}
              className="voxxy-btn-cta"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Template'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
