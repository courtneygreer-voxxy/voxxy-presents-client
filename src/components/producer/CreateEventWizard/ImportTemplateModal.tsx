import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { emailCampaignTemplatesApi } from '@/services/api';
import type { EmailCampaignTemplate } from '@/types/email';

interface ImportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: EmailCampaignTemplate) => void;
  currentTemplateId?: number | null;
}

export default function ImportTemplateModal({
  isOpen,
  onClose,
  onSelect,
  currentTemplateId,
}: ImportTemplateModalProps) {
  const [templates, setTemplates] = useState<EmailCampaignTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await emailCampaignTemplatesApi.getAll();
      setTemplates(response || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: EmailCampaignTemplate) => {
    onSelect(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground rounded-2xl border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Import Template</h2>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Create New Template Button (disabled for now) */}
              <button
                disabled
                className="w-full p-4 rounded-lg border-2 border-dashed border-border bg-background/5 text-foreground/40 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="text-2xl">+</span>
                <span className="font-medium">Create New Template</span>
              </button>

              {/* System Templates */}
              {templates
                .filter((t) => t.template_type === 'generic' && t.organization_id === null)
                .map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      currentTemplateId === template.id
                        ? 'bg-primary/20 border-primary/40'
                        : 'bg-background/5 border-border hover:bg-background/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-foreground">
                            {template.name}
                          </h3>
                          {template.is_default && (
                            <span className="px-2 py-0.5 bg-primary/30 text-violet-950 dark:text-primary text-xs font-medium rounded border border-primary/50">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/70">
                          {template.description || 'Recommended email workflow with all standard triggers'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

              {/* User Custom Templates */}
              {templates.filter((t) => t.organization_id !== null).length > 0 && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground dark:text-foreground/70 uppercase tracking-wide mb-3">
                      Custom Templates
                    </h3>
                  </div>
                  {templates
                    .filter((t) => t.organization_id !== null)
                    .map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          currentTemplateId === template.id
                            ? 'bg-primary/20 border-primary/40'
                            : 'bg-background/5 border-border hover:bg-background/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-foreground mb-1">
                              {template.name}
                            </h3>
                            <p className="text-sm text-foreground/70">
                              {template.description || `${template.email_count} emails`}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </>
              )}

              {templates.filter((t) => t.organization_id !== null).length === 0 && (
                <p className="text-center text-sm text-foreground/50 py-4">
                  No custom templates yet. Create one in the Mail tab!
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-background/10 hover:bg-background/20 text-foreground rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
