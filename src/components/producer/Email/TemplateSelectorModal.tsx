import { useState, useEffect } from 'react';
import { Mail, Check, Loader2, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { emailCampaignTemplatesApi } from '@/services/api';
import type { EmailCampaignTemplate } from '@/types/email';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (templateId: number | null) => void;
  selectedTemplateId?: number | null;
}

export default function TemplateSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedTemplateId = null
}: TemplateSelectorModalProps) {
  const [templates, setTemplates] = useState<EmailCampaignTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(selectedTemplateId);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await emailCampaignTemplatesApi.getAll();
      setTemplates(data);

      // Auto-select default template if nothing selected
      if (!selectedId) {
        const defaultTemplate = data.find(t => t.is_default);
        if (defaultTemplate) {
          setSelectedId(defaultTemplate.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (onSelect) {
      onSelect(selectedId);
    }
    onClose();
  };

  const handleSkip = () => {
    if (onSelect) {
      onSelect(null);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400" />
            Choose Email Campaign Template
          </DialogTitle>
          <DialogDescription>
            Select a template for automated emails, or skip to use the default campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
              <p className="text-white/60">Loading templates...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadTemplates}
                className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
              >
                Try again
              </button>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">No templates available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => {
                const isSelected = selectedId === template.id;
                const isSystem = template.organization_id === null;

                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedId(template.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">
                            {template.name}
                          </h3>
                          {template.is_default && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                              Default
                            </span>
                          )}
                          {!isSystem && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                              Custom
                            </span>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-white/60 mb-2 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-white/50">
                          <span>{template.email_count} emails</span>
                          {template.events_count > 0 && (
                            <span>Used in {template.events_count} events</span>
                          )}
                        </div>
                      </div>
                      <div className={`flex-shrink-0 ml-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-white/20'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
          >
            Skip for Now
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
