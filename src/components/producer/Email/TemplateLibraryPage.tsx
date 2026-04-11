import { useState, useEffect } from 'react';
import { Mail, Plus, Copy, Trash2, Edit, Loader2, ArrowLeft, Eye, Send, CheckCircle2, XCircle, AlertCircle, Tag } from 'lucide-react';
import { emailCampaignTemplatesApi, emailTemplateItemsApi, categoriesApi } from '@/services/api';
import type { EmailCampaignTemplate, EmailTemplateItem } from '@/types/email';
import type { Category } from '@/types/category';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CreateCategoryTemplateDialog } from './CreateCategoryTemplateDialog';
import { getEmailTypeInfo } from '@/utils/emailTypeHelper';
import { logger } from '@/utils/logger';

interface TemplateLibraryPageProps {
  onNavigateToBuilder?: (templateId?: number) => void;
  onBack?: () => void;
}

export default function TemplateLibraryPage({ onNavigateToBuilder, onBack }: TemplateLibraryPageProps) {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const [templates, setTemplates] = useState<EmailCampaignTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailCampaignTemplate | null>(null);

  // Category-specific templates
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryTemplateDialogOpen, setCategoryTemplateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Clone modal state
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [cloneTemplate, setCloneTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await emailCampaignTemplatesApi.getAll();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!userProfile?.organization_id) return;

    setLoadingCategories(true);
    try {
      const data = await categoriesApi.getAll(userProfile.organization_id);
      setCategories(data.categories || []);
    } catch (err: any) {
      logger.error('Failed to load categories', { organizationId: userProfile.organization_id, error: err });
      // Don't show error toast, just log it
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleClone = (template: EmailCampaignTemplate) => {
    setCloneTemplate(template);
    setCloneName(`${template.name} (Copy)`);
    setCloneDescription(template.description || '');
    setCloneError(null); // Clear any previous errors
    setCloneModalOpen(true);
  };

  const handleCloneConfirm = async () => {
    if (!cloneTemplate || !cloneName.trim()) return;

    // Client-side validation: Check for duplicate names within the same template type
    const trimmedName = cloneName.trim();
    const nameExists = templates.some(
      t => t.name.toLowerCase() === trimmedName.toLowerCase() &&
           t.template_type === cloneTemplate.template_type // Only check within same type
    );

    if (nameExists) {
      const typeLabel = cloneTemplate.template_type === 'generic' ? 'event' : 'category';
      setCloneError(`A ${typeLabel} sequence named "${trimmedName}" already exists. Please choose a different name.`);
      toast.error('Duplicate sequence name', {
        description: `A ${typeLabel} sequence named "${trimmedName}" already exists. Please choose a different name.`,
        duration: 5000,
      });
      return;
    }

    setIsCloning(true);
    setCloneError(null); // Clear previous errors
    try {
      await emailCampaignTemplatesApi.clone(
        cloneTemplate.id,
        cloneName.trim(),
        cloneDescription.trim() || undefined
      );
      await loadTemplates();
      setCloneModalOpen(false);
      setCloneName('');
      setCloneDescription('');
      toast.success('Sequence cloned successfully', {
        description: `Created "${cloneName.trim()}"`,
      });
    } catch (err: any) {
      // Extract error message from various possible error formats
      const errorMessage = err.response?.data?.error ||
                          err.response?.data?.message ||
                          err.message ||
                          'An error occurred while cloning';

      // Check for unique constraint violation
      const isDuplicateName = errorMessage.toLowerCase().includes('already exists') ||
                             errorMessage.toLowerCase().includes('unique') ||
                             errorMessage.toLowerCase().includes('duplicate');

      const displayError = isDuplicateName
        ? `A sequence named "${cloneName.trim()}" already exists. Please choose a different name.`
        : errorMessage;

      // Set error in modal
      setCloneError(displayError);

      // Also show toast
      toast.error(isDuplicateName ? 'Duplicate sequence name' : 'Failed to clone sequence', {
        description: displayError,
        duration: 5000, // Show error longer
      });

      // Don't close modal on error - let user fix the name
    } finally {
      setIsCloning(false);
    }
  };


  const handleCreateCategoryTemplate = (category: Category) => {
    setSelectedCategory(category);
    setCategoryTemplateDialogOpen(true);
  };

  const handleConfirmCreateCategoryTemplate = async (categoryId: number, sourceTemplateId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    try {
      // Clone the source template with the category assigned
      await emailCampaignTemplatesApi.clone(
        sourceTemplateId,
        category.name,  // Name it after the category
        undefined,      // No description
        categoryId      // Assign to this category
      );

      // Reload templates to show the new category template
      await loadTemplates();

      toast.success('Category template created', {
        description: `Created template for ${category.name}`,
      });
    } catch (err: any) {
      logger.error('Failed to create category template', { categoryId: category.id, error: err });
      throw err; // Re-throw so dialog can handle it
    }
  };

  return (
    <div className="px-3 md:px-4">
      <div className="max-w-7xl mx-auto">

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
            <p className="text-white/60 text-sm">Loading sequences...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={loadTemplates}
              className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Generic Sequences (event-wide emails only) */}
        {!isLoading && !error && templates.length > 0 && (() => {
          // Show only generic templates (event-wide emails)
          // Category templates are shown in the category section below
          const genericTemplates = templates.filter(t => t.template_type === 'generic');
          const visibleTemplates = isAdmin
            ? genericTemplates
            : genericTemplates.filter(t => t.is_default || t.organization_id !== null);

          if (visibleTemplates.length === 0) return (
            <div className="text-center py-8 px-4">
              <Mail className="w-8 h-8 text-white/30 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-white mb-1">Using Default Event Sequence</h3>
              <p className="text-white/60 text-xs mb-4 max-w-sm mx-auto">
                The default sequence handles invitations, reminders, and event communications. Create additional sequences for different messaging approaches.
              </p>
              <button
                onClick={() => onNavigateToBuilder?.()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-500 hover:to-blue-500 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Event Sequence
              </button>
            </div>
          );

          return (
          <div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    Event Sequences
                  </h2>
                </div>
                <button
                  onClick={() => onNavigateToBuilder?.()}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium hover:from-purple-500 hover:to-blue-500 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Event Sequence
                </button>
              </div>
              <p className="text-white/60 text-xs">
                Sent to contacts (invitations, application reminders) and all vendors across all categories (bulletins, updates, cancellations).
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] divide-y divide-white/5">
              {visibleTemplates.map(template => {
                const isDefault = template.is_default;
                const isSystem = template.organization_id === null;

                return (
                  <div
                    key={template.id}
                    className="flex items-center gap-3 py-3 px-4"
                  >
                    <Mail className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium truncate">{template.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/60 mt-0.5">
                        <span>{template.email_count || 0} emails</span>
                        {template.events_count > 0 && (
                          <>
                            <span className="text-white/20">·</span>
                            <span>{template.events_count} events</span>
                          </>
                        )}
                        {template.description && (
                          <>
                            <span className="text-white/20">·</span>
                            <span className="truncate">{template.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onNavigateToBuilder?.(template.id)}
                        className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        title={isDefault ? "View sequence" : "Edit sequence"}
                      >
                        {isDefault ? <Eye className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleClone(template)}
                        className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        title="Clone sequence"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          );
        })()}

        {/* Category Templates Section */}
        {!isLoading && !error && categories.length > 0 && (
          <div className="mt-8">
            <div className="mb-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
                <Tag className="w-4 h-4 text-blue-400" />
                Category Sequences
              </h2>
              <p className="text-white/60 text-xs">
                Sent to vendors in each specific category. Applications, payments, and event countdowns personalized per vendor type.
              </p>
            </div>

            {loadingCategories ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                {categories.map(category => {
                  // Find template by email_campaign_template_id on category
                  const categoryTemplate = category.email_campaign_template_id
                    ? templates.find(t => t.id === category.email_campaign_template_id)
                    : null;

                  return (
                    <div key={category.id} className="flex items-center gap-3 py-3 px-4">
                      <Tag className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-semibold text-white"
                            style={{
                              backgroundColor: category.color || '#8B5CF6',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.4)'
                            }}
                          >
                            {category.icon && <span>{category.icon}</span>}
                            {category.name}
                          </span>
                        </div>
                        {categoryTemplate ? (
                          <div className="flex items-center gap-2 text-[10px] text-white/60 mt-0.5">
                            <span>{categoryTemplate.email_count || 0} emails</span>
                            <span className="text-white/20">·</span>
                            <span className="text-green-400">
                              Editable sequence
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-yellow-400 mt-0.5">
                            Setting up sequence...
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {categoryTemplate ? (
                          <button
                            onClick={() => onNavigateToBuilder?.(categoryTemplate.id)}
                            className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-all"
                            title="Edit sequence"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCreateCategoryTemplate(category)}
                            className="px-3 py-1.5 rounded text-xs bg-purple-500/20 border border-purple-500/40 text-purple-400 hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
                          >
                            <Plus className="w-3 h-3" />
                            Create
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Universal Category Sequence Section */}
        {!isLoading && !error && templates.length > 0 && (() => {
          // Find the universal template (each organization has exactly one)
          const universalTemplate = templates.find(t =>
            t.template_type === 'category' && t.is_universal === true
          );

          if (!universalTemplate) return null;

          return (
            <div className="mt-8">
              <div className="mb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Universal Category Sequence
                </h2>
                <p className="text-white/60 text-xs">
                  Single sequence used across all vendor categories. Simplifies management when content doesn't need to vary by vendor type.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-3 py-3 px-4">
                  <Mail className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium">{universalTemplate.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-500/20 text-purple-300">
                        UNIVERSAL
                      </span>
                    </div>
                    <div className="text-[10px] text-white/60 mt-0.5">
                      <span>{universalTemplate.email_count || 0} emails</span>
                      <span className="text-white/20 mx-1">·</span>
                      <span>Applied to all categories</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onNavigateToBuilder?.(universalTemplate.id)}
                      className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-all"
                      title="Edit sequence"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Empty State */}
        {!isLoading && !error && templates.length === 0 && (
          <div className="text-center py-8">
            <Mail className="w-10 h-10 text-white/30 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-white mb-1">Default Sequences Active</h3>
            <p className="text-white/60 text-xs mb-4 max-w-sm mx-auto">
              Default event sequence handles invitations, reminders, and event communications. Create custom sequences for different messaging approaches.
            </p>
            <button
              onClick={() => onNavigateToBuilder?.()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-500 hover:to-blue-500 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Event Sequence
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {/* Clone Modal */}
      {cloneModalOpen && cloneTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-lg border border-white/20 shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white">Clone Sequence</h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Create a copy of "{cloneTemplate.name}"
                </p>
              </div>
              <button
                onClick={() => setCloneModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Error Message */}
              {cloneError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 text-sm font-medium">Error</p>
                    <p className="text-red-400/80 text-xs mt-0.5">{cloneError}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Sequence Name *
                </label>
                <input
                  type="text"
                  value={cloneName}
                  onChange={(e) => {
                    setCloneName(e.target.value);
                    setCloneError(null); // Clear error when user types
                  }}
                  placeholder="Enter sequence name"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={cloneDescription}
                  onChange={(e) => setCloneDescription(e.target.value)}
                  placeholder="Enter sequence description"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
              <button
                onClick={() => setCloneModalOpen(false)}
                disabled={isCloning}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCloneConfirm}
                disabled={isCloning || !cloneName.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCloning && <Loader2 className="w-4 h-4 animate-spin" />}
                Clone Sequence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Template Dialog */}
      {categoryTemplateDialogOpen && selectedCategory && (
        <CreateCategoryTemplateDialog
          isOpen={categoryTemplateDialogOpen}
          onClose={() => {
            setCategoryTemplateDialogOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
          genericTemplates={templates}
          onCreateTemplate={handleConfirmCreateCategoryTemplate}
        />
      )}

    </div>
  );
}

