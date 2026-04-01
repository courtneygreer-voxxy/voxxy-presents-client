import { useState, useEffect } from 'react';
import {
  Mail,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,

  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { emailCampaignTemplatesApi, emailTemplateItemsApi } from '@/services/api';
import type { EmailCampaignTemplate, EmailTemplateItem, EmailCategory, TriggerType } from '@/types/email';

import { EmailTemplateEditorPage } from './EmailTemplateEditorPage';
import { STANDARD_EMAIL_FOOTER } from '@/utils/emailFooter';

interface TemplateBuilderPageProps {
  templateId?: number;
  createFromDefault?: boolean;
  onBack?: () => void;
}

export default function TemplateBuilderPage({ templateId, createFromDefault, onBack }: TemplateBuilderPageProps) {
  const [template, setTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [emailItems, setEmailItems] = useState<EmailTemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(!!templateId || !!createFromDefault);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Change tracking
  const [hasChanges, setHasChanges] = useState(false);
  const [initialName, setInitialName] = useState('');
  const [initialDescription, setInitialDescription] = useState('');

  // Email editor state
  const [editingItem, setEditingItem] = useState<EmailTemplateItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Track locally modified emails (before template is saved)
  const [modifiedEmails, setModifiedEmails] = useState<Map<number, EmailTemplateItem>>(new Map());

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    } else if (createFromDefault) {
      loadDefaultSequence();
    }
  }, [templateId, createFromDefault]);

  // Track changes to name and description
  useEffect(() => {
    if (createFromDefault) {
      const nameChanged = name !== initialName;
      const descriptionChanged = description !== initialDescription;
      setHasChanges(nameChanged || descriptionChanged);
    }
  }, [name, description, initialName, initialDescription, createFromDefault]);

  const loadTemplate = async () => {
    if (!templateId) return;

    setIsLoading(true);
    setError(null);
    try {
      const [templateData, items] = await Promise.all([
        emailCampaignTemplatesApi.getById(templateId),
        emailTemplateItemsApi.getByTemplate(templateId)
      ]);

      setTemplate(templateData);
      setName(templateData.name);
      setDescription(templateData.description || '');
      setInitialName(templateData.name);
      setInitialDescription(templateData.description || '');
      setEmailItems(items.sort((a, b) => a.position - b.position));
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultSequence = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all templates and find the default one
      const allTemplates = await emailCampaignTemplatesApi.getAll();
      const defaultTemplate = allTemplates.find(t => t.is_default);

      if (!defaultTemplate) {
        setError('No default sequence found');
        setIsLoading(false);
        return;
      }

      // Load the default template's emails
      const items = await emailTemplateItemsApi.getByTemplate(defaultTemplate.id);

      // Set up for creating new sequence based on default
      setName('My Custom Sequence');
      setDescription('Based on default email sequence');
      setInitialName('My Custom Sequence');
      setInitialDescription('Based on default email sequence');
      setEmailItems(items.sort((a, b) => a.position - b.position));
      setHasChanges(false); // Start with no changes
    } catch (err: any) {
      setError(err.message || 'Failed to load default sequence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Sequence name is required');
      return;
    }

    if (createFromDefault && !hasChanges) {
      setError('Please make at least one change before saving');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (template) {
        // Update existing template
        await emailCampaignTemplatesApi.update(template.id, {
          name: name.trim(),
          description: description.trim() || undefined
        });
        setSuccessMessage('Sequence updated successfully');
      } else if (createFromDefault) {
        // Create new sequence by cloning default
        const allTemplates = await emailCampaignTemplatesApi.getAll();
        const defaultTemplate = allTemplates.find(t => t.is_default);

        if (!defaultTemplate) {
          setError('Default sequence not found');
          setIsSaving(false);
          return;
        }

        // Clone the default template with custom name and description
        const newTemplate = await emailCampaignTemplatesApi.clone(
          defaultTemplate.id,
          name.trim(),
          description.trim() || undefined
        );

        // Get the cloned template's emails
        const clonedItems = await emailTemplateItemsApi.getByTemplate(newTemplate.id);
        const sortedClonedItems = clonedItems.sort((a, b) => a.position - b.position);

        // If there are locally modified emails, apply those changes to the cloned items
        if (modifiedEmails.size > 0) {
          console.log(`Persisting ${modifiedEmails.size} locally modified emails...`);

          // Create a map of position -> modified email for quick lookup
          const modifiedByPosition = new Map<number, EmailTemplateItem>();
          emailItems.forEach((item, index) => {
            if (modifiedEmails.has(item.id)) {
              modifiedByPosition.set(item.position, modifiedEmails.get(item.id)!);
            }
          });

          // Update each cloned email that has local modifications
          for (const clonedItem of sortedClonedItems) {
            const modifiedVersion = modifiedByPosition.get(clonedItem.position);
            if (modifiedVersion) {
              console.log(`Updating email at position ${clonedItem.position}: ${clonedItem.name}`);
              await emailTemplateItemsApi.update(newTemplate.id, clonedItem.id, {
                name: modifiedVersion.name,
                description: modifiedVersion.description ?? undefined,
                subject_template: modifiedVersion.subject_template,
                body_template: modifiedVersion.body_template,
                trigger_type: modifiedVersion.trigger_type,
                trigger_value: modifiedVersion.trigger_value ?? undefined,
                trigger_time: modifiedVersion.trigger_time ?? undefined,
                enabled_by_default: modifiedVersion.enabled_by_default,
                filter_criteria: modifiedVersion.filter_criteria,
              });
            }
          }
        }

        setTemplate(newTemplate);
        setHasChanges(false);
        setModifiedEmails(new Map()); // Clear modified emails tracking
        setSuccessMessage('Sequence created successfully with your edits!');

        // Reload the final state
        const finalItems = await emailTemplateItemsApi.getByTemplate(newTemplate.id);
        setEmailItems(finalItems.sort((a, b) => a.position - b.position));
      } else {
        // Create new empty template
        const newTemplate = await emailCampaignTemplatesApi.create({
          name: name.trim(),
          description: description.trim() || undefined
        });
        setTemplate(newTemplate);
        setSuccessMessage('Sequence created successfully');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save sequence');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle creating email from editor
  const handleCreateEmailFromEditor = async (data: any) => {
    if (!template) {
      // If template doesn't exist yet, show error
      setError('Please save the template first before adding emails');
      throw new Error('Template must be saved first');
    }

    try {
      const newItem = await emailTemplateItemsApi.create(template.id, {
        name: data.name,
        description: data.description,
        position: data.position,
        subject_template: data.subject_template,
        body_template: data.body_template,
        trigger_type: data.trigger_type as TriggerType,
        trigger_value: data.trigger_value,
        trigger_time: data.trigger_time,
        filter_criteria: data.filter_criteria,
        enabled_by_default: data.enabled_by_default,
      });
      setEmailItems([...emailItems, newItem]);
      setSuccessMessage('Email added to template successfully!');
      setIsCreateMode(false);
      setIsEditorOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add email');
      throw err; // Re-throw so editor can handle it
    }
  };

  const handleOpenCreateEditor = (category?: string) => {
    if (!template) {
      setError('Please save the template first before adding emails');
      return;
    }
    setIsCreateMode(true);
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const handleDeleteEmail = async (itemId: number) => {
    if (!template) return;
    if (!confirm('Delete this email? This cannot be undone.')) return;

    try {
      await emailTemplateItemsApi.delete(template.id, itemId);
      setEmailItems(emailItems.filter(item => item.id !== itemId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete email');
    }
  };

  const handleEditEmail = (item: EmailTemplateItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleSaveEmail = async (updatedItem: EmailTemplateItem) => {
    if (!template) {
      // If no template yet (creating new from default), update local state and track modification
      setEmailItems(emailItems.map(item => item.id === updatedItem.id ? updatedItem : item));
      setModifiedEmails(prev => new Map(prev).set(updatedItem.id, updatedItem));
      setIsEditorOpen(false);
      setEditingItem(null);
      setHasChanges(true); // Mark that changes have been made
      setSuccessMessage('Email updated (will be saved when you save the sequence)');
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    try {
      const saved = await emailTemplateItemsApi.update(template.id, updatedItem.id, {
        name: updatedItem.name,
        description: updatedItem.description ?? undefined,
        subject_template: updatedItem.subject_template,
        body_template: updatedItem.body_template,
        trigger_type: updatedItem.trigger_type,
        trigger_value: updatedItem.trigger_value ?? undefined,
        trigger_time: updatedItem.trigger_time ?? undefined,
        enabled_by_default: updatedItem.enabled_by_default,
        filter_criteria: updatedItem.filter_criteria,
      });

      // Update in local state
      setEmailItems(emailItems.map(item => item.id === saved.id ? saved : item));
      setIsEditorOpen(false);
      setEditingItem(null);
      setSuccessMessage('Email updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update email');
    }
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingItem(null);
    setIsCreateMode(false);
  };


  const isSystem = template?.template_type === 'system';
  const canEdit = !isSystem;

  // If editor is open (create or edit mode), show full-screen editor
  if (isEditorOpen) {
    return (
      <EmailTemplateEditorPage
        item={editingItem} // null in create mode, EmailTemplateItem in edit mode
        templateId={template?.id || 0}
        nextPosition={emailItems.length + 1}
        onBack={handleCloseEditor}
        onSave={isCreateMode ? undefined : handleSaveEmail}
        onCreate={isCreateMode ? handleCreateEmailFromEditor : undefined}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                {template ? (isSystem ? 'View Sequence' : 'Edit Sequence') : 'New Sequence'}
              </h1>
              <p className="text-white/60 text-xs mt-0.5">
                {isSystem
                  ? 'System sequences are read-only. Clone to customize.'
                  : 'Create a reusable email sequence'}
              </p>
            </div>
            {canEdit && template && (
              <button
                onClick={() => handleOpenCreateEditor()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium hover:from-green-700 hover:to-emerald-600 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Email
              </button>
            )}
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={isSaving || !name.trim() || (createFromDefault && !hasChanges)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title={createFromDefault && !hasChanges ? 'Make at least one change to save' : ''}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Sequence
                  </>
                )}
              </button>
            )}
          </div>

          {/* System Sequence Warning */}
          {isSystem && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-sm font-medium">Read-Only Sequence</p>
                <p className="text-yellow-400/80 text-xs mt-0.5">
                  This is a system sequence and cannot be edited. Use the "Clone" button to create a customizable copy.
                </p>
              </div>
            </div>
          )}

          {/* Creating New Sequence Info */}
          {createFromDefault && !template && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-400 text-sm font-medium">Creating New Sequence</p>
                <p className="text-blue-400/80 text-xs mt-0.5">
                  You can edit emails now and your changes will be automatically saved when you save the sequence.
                  {modifiedEmails.size > 0 && (
                    <span className="font-medium"> ({modifiedEmails.size} email{modifiedEmails.size !== 1 ? 's' : ''} modified)</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
            <p className="text-white/60 text-sm">Loading sequence...</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        {!isLoading && (
          <div className="space-y-4">
            {/* Sequence Details */}
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <h2 className="text-base font-semibold text-white mb-3">Sequence Details</h2>

              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label htmlFor="template-name" className="block text-xs font-medium text-white/60 mb-1">
                    Sequence Name *
                  </label>
                  <input
                    id="template-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Summer Festival Campaign"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
                    disabled={!canEdit}
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="template-description" className="block text-xs font-medium text-white/60 mb-1">
                    Description <span className="text-white/40 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="template-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe when to use this template..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none disabled:opacity-50"
                    disabled={!canEdit}
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-white/40">
                    {description.length}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Email Items */}
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">
                  Email Sequence ({emailItems.length})
                </h2>
              </div>

              {emailItems.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-lg">
                  <Mail className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm mb-3">No emails in this template</p>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenCreateEditor()}
                      className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 hover:bg-purple-500/30 transition-all text-sm inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Email
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    emailItems.reduce((groups, item) => {
                      const cat = item.category || 'uncategorized';
                      if (!groups[cat]) groups[cat] = [];
                      groups[cat].push(item);
                      return groups;
                    }, {} as Record<string, EmailTemplateItem[]>)
                  ).map(([category, items]) => {
                    const categoryLabels: Record<string, string> = {
                      event_announcements: 'Event Announcements',
                      application_updates: 'Application Updates',
                      payment_reminders: 'Payment Reminders',
                      art_calls: 'Art Calls',
                      artist_payment: 'Artist Payment',
                      vendor_payment: 'Vendor Payment',
                      artist_countdown: 'Artist Countdown',
                      vendor_countdown: 'Vendor Countdown',
                      uncategorized: 'Other',
                    };
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                            {categoryLabels[category] || category}
                          </h3>
                          <span className="text-[10px] text-white/50 tabular-nums">{items.length}</span>
                          {canEdit && (
                            <button
                              onClick={() => handleOpenCreateEditor(category)}
                              className="p-1 rounded text-white/60 hover:text-purple-400 hover:bg-white/10 transition-all ml-auto"
                              title={template ? `Add email to ${categoryLabels[category] || category}` : 'Save sequence first to add emails'}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 py-2.5 px-3">
                              <Mail className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                              <span className="text-sm text-white truncate flex-1">{item.name}</span>
                              <span className="text-[10px] text-white/60 flex-shrink-0 hidden sm:inline">
                                {item.trigger_type}
                              </span>
                              {canEdit && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => handleEditEmail(item)}
                                    className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                    title="Edit email"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEmail(item.id)}
                                    className="p-1.5 rounded text-white/50 hover:text-red-400 hover:bg-white/10 transition-all"
                                    title="Delete email"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Help Text */}
            {!template && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-400">
                  <strong>Tip:</strong> Save the sequence first, then add emails to build your email campaign.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
