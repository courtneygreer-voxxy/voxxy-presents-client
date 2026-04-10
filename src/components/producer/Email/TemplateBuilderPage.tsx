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
  ChevronUp,
  CheckCircle2,
  XCircle,
  Send,
  HelpCircle
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Button } from '@/components/ui/button';
import { emailCampaignTemplatesApi, emailTemplateItemsApi } from '@/services/api';
import type { EmailCampaignTemplate, EmailTemplateItem, EmailCategory, TriggerType } from '@/types/email';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EmailTemplateEditorPage } from './EmailTemplateEditorPage';
import { STANDARD_EMAIL_FOOTER } from '@/utils/emailFooter';
import { getEmailTypeInfo } from '@/utils/emailTypeHelper';
import { logger } from '@/utils/logger';

interface TemplateBuilderPageProps {
  templateId?: number;
  createFromDefault?: boolean;
  onBack?: () => void;
}

export default function TemplateBuilderPage({ templateId, createFromDefault, onBack }: TemplateBuilderPageProps) {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

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

  // Selected email for preview
  const [selectedEmail, setSelectedEmail] = useState<EmailTemplateItem | null>(null);

  // Delete confirmation modal state (for individual emails)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<EmailTemplateItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete template confirmation modal state
  const [deleteTemplateModalOpen, setDeleteTemplateModalOpen] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);

  // Track locally modified emails (before template is saved)
  const [modifiedEmails, setModifiedEmails] = useState<Map<number, EmailTemplateItem>>(new Map());

  // Test email dialog state
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

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
      const sortedItems = items.sort((a, b) => a.position - b.position);
      setEmailItems(sortedItems);

      // Auto-select first email for preview
      if (sortedItems.length > 0 && !selectedEmail) {
        setSelectedEmail(sortedItems[0]);
      }
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
      // Fetch all templates and find the default GENERIC template
      // (We have two defaults now: generic and category)
      const allTemplates = await emailCampaignTemplatesApi.getAll();
      const defaultTemplate = allTemplates.find(t => t.is_default && t.template_type === 'generic');

      if (!defaultTemplate) {
        setError('No default event sequence found');
        setIsLoading(false);
        return;
      }

      // Load the default template's emails (should only be event-wide triggers)
      const items = await emailTemplateItemsApi.getByTemplate(defaultTemplate.id);

      // Generate a unique default name by checking existing templates of the same type
      const generateUniqueName = (baseName: string, existingTemplates: EmailCampaignTemplate[], templateType: string): string => {
        // Filter to only templates of the same type
        const sameTypeTemplates = existingTemplates.filter(t => t.template_type === templateType);

        let counter = 1;
        let proposedName = baseName;

        while (sameTypeTemplates.some(t => t.name === proposedName)) {
          counter++;
          proposedName = `${baseName} ${counter}`;
        }

        return proposedName;
      };

      const uniqueName = generateUniqueName('My Event Sequence', allTemplates, 'generic');

      // Set up for creating new sequence based on default
      setName(uniqueName);
      setDescription('Based on default event sequence');
      setInitialName(uniqueName);
      setInitialDescription('Based on default event sequence');
      setEmailItems(items.sort((a, b) => a.position - b.position));
      setHasChanges(false); // Start with no changes
    } catch (err: any) {
      setError(err.message || 'Failed to load default sequence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // For non-category templates, validate name
    if (!isCategoryTemplate) {
      if (!name.trim()) {
        setError('Sequence name is required');
        return;
      }

      // Check for duplicate name within the same template type
      // (Event sequences and Category sequences can have the same name)
      const allTemplates = await emailCampaignTemplatesApi.getAll();

      // Determine what template type we're working with
      const currentTemplateType = createFromDefault ? 'generic' : (template?.template_type || 'generic');

      const duplicateName = allTemplates.some(t =>
        t.name.toLowerCase() === name.trim().toLowerCase() &&
        t.template_type === currentTemplateType && // Only check within same type
        t.id !== template?.id
      );

      if (duplicateName) {
        const typeLabel = currentTemplateType === 'generic' ? 'event' : 'category';
        setError(`A ${typeLabel} sequence named "${name.trim()}" already exists. Please choose a different name.`);
        return;
      }
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
        // For category templates, don't update name/description (they're system-managed)
        if (isCategoryTemplate) {
          // Category templates: name and description are read-only
          // Nothing to update at template level (only emails are editable)
          setSuccessMessage('Sequence saved successfully');
        } else {
          // Generic/event and universal templates: can update name and description
          await emailCampaignTemplatesApi.update(template.id, {
            name: name.trim(),
            description: description.trim() || undefined
          });
          setSuccessMessage('Sequence updated successfully');
        }
      } else if (createFromDefault) {
        // Create new sequence by cloning default GENERIC template
        const allTemplates = await emailCampaignTemplatesApi.getAll();
        const defaultTemplate = allTemplates.find(t => t.is_default && t.template_type === 'generic');

        if (!defaultTemplate) {
          setError('Default event sequence not found');
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
          logger.info('Persisting locally modified emails to cloned template', { count: modifiedEmails.size });

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
      // Check if error has validation errors array (from ApiError)
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        setError(err.errors.join(', '));
      } else {
        setError(err.message || 'Failed to save sequence');
      }
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

  const handleDeleteEmail = (item: EmailTemplateItem) => {
    setEmailToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!template || !emailToDelete) return;

    setIsDeleting(true);

    try {
      await emailTemplateItemsApi.delete(template.id, emailToDelete.id);
      setEmailItems(emailItems.filter(item => item.id !== emailToDelete.id));

      // Clear selected email if it's the one being deleted
      if (selectedEmail?.id === emailToDelete.id) {
        setSelectedEmail(null);
      }

      setDeleteModalOpen(false);
      setEmailToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete email');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!template) return;

    setIsDeletingTemplate(true);

    try {
      await emailCampaignTemplatesApi.delete(template.id);
      setDeleteTemplateModalOpen(false);
      toast.success('Sequence deleted', {
        description: `"${template.name}" has been removed`,
      });
      setTimeout(() => {
        if (onBack) onBack();
      }, 500);
    } catch (err: any) {
      toast.error('Failed to delete sequence', {
        description: err.message || 'An error occurred while deleting',
      });
      setDeleteTemplateModalOpen(false);
    } finally {
      setIsDeletingTemplate(false);
    }
  };

  const handleEditEmail = (item: EmailTemplateItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleSendTest = async () => {
    if (!template || !selectedEmail || !testEmailAddress) return;

    setIsSendingTest(true);

    try {
      const result = await emailTemplateItemsApi.sendTest(template.id, selectedEmail.id, testEmailAddress);

      setSuccessMessage(`Test email sent to ${result.recipient}`);
      setTimeout(() => setSuccessMessage(null), 5000);

      setShowTestEmailDialog(false);
      setTestEmailAddress('');
    } catch (error: any) {
      logger.error('Failed to send test email', { templateId: template?.id, error });
      setError(error?.message || 'Failed to send test email');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSendingTest(false);
    }
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


  const isSystemDefault = template?.organization_id === null && template?.is_default;
  const isCategoryTemplate = template?.template_type === 'category' && !template?.is_universal;
  const canEdit = !isSystemDefault;
  const canEditNameAndDescription = canEdit && !isCategoryTemplate;
  const canDelete = template && !template.is_default && (template.organization_id !== null || isAdmin);

  // Helper to check if email is a reminder (value-based trigger)
  const isCustomReminder = (triggerType: string) => {
    const customReminderTriggers = [
      'days_before_deadline',
      'days_after_deadline',
      'days_before_payment_deadline',
      'days_after_payment_deadline',
      'days_before_event',
      'days_after_event'
    ];
    return customReminderTriggers.includes(triggerType);
  };

  // Group emails by system vs reminders for sidebar
  const groupedEmails = emailItems.reduce((groups, item) => {
    const groupKey = isCustomReminder(item.trigger_type) ? 'reminders' : 'system';
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<'system' | 'reminders', EmailTemplateItem[]>);

  // Group labels
  const groupLabels: Record<'system' | 'reminders', string> = {
    system: 'System',
    reminders: 'Reminders',
  };

  // If editor is open (create or edit mode), show full-screen editor
  if (isEditorOpen) {
    return (
      <EmailTemplateEditorPage
        item={editingItem} // null in create mode, EmailTemplateItem in edit mode
        templateId={template?.id || 0}
        templateType={template?.template_type || 'generic'}
        existingItems={emailItems} // Pass all existing items for duplicate validation
        nextPosition={emailItems.length + 1}
        onBack={handleCloseEditor}
        onSave={isCreateMode ? undefined : handleSaveEmail}
        onCreate={isCreateMode ? handleCreateEmailFromEditor : undefined}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f0a1e] via-[#1a0f2e] to-[#0f0a1e] z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0f0a1e]/80 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                <div>
                  <h1 className="text-base font-semibold">
                    {template ? (isSystemDefault ? 'View Sequence' : 'Edit Sequence') : 'New Sequence'}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {isSystemDefault
                      ? 'System sequences are read-only. Clone to customize.'
                      : isCategoryTemplate
                      ? 'Customize email content for this vendor category'
                      : 'Create a reusable email sequence'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              {canEdit && template && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenCreateEditor()}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Reminder
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTemplateModalOpen(true)}
                  className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Sequence
                </Button>
              )}
              {canEdit && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || (!isCategoryTemplate && !name.trim()) || (createFromDefault && !hasChanges)}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white gap-2"
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
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {/* System Sequence Info */}
        {isSystemDefault && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 text-xs">
                This is a read-only system sequence. Clone it from the Email Sequences page to create a customizable copy.
              </p>
            </div>
          </div>
        )}

        {/* Creating New Sequence Info */}
        {createFromDefault && !template && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
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
            {/* Sequence Details - Compact */}
            <div className={`p-3 rounded-lg border ${isCategoryTemplate || isSystemDefault ? 'border-blue-500/20 bg-blue-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
              {isCategoryTemplate ? (
                // Information card for category templates
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wide">Category</span>
                    <p className="text-base font-semibold text-white">{name}</p>
                  </div>
                  {description && (
                    <div>
                      <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wide">About</span>
                      <p className="text-sm text-white/70">{description}</p>
                    </div>
                  )}
                </div>
              ) : isSystemDefault ? (
                // Information card for system default templates
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wide">Sequence Name</span>
                    <p className="text-base font-semibold text-white">{name}</p>
                  </div>
                  {description && (
                    <div>
                      <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wide">Description</span>
                      <p className="text-sm text-white/70">{description}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Editable fields for generic/event and universal templates
                <div className="grid grid-cols-2 gap-3">
                  {/* Name */}
                  <div>
                    <label htmlFor="template-name" className="block text-[10px] font-medium text-white/50 uppercase tracking-wide mb-1">
                      Sequence Name *
                    </label>
                    <input
                      id="template-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Summer Festival Campaign"
                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50"
                      disabled={!canEdit}
                      maxLength={100}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="template-description" className="block text-[10px] font-medium text-white/50 uppercase tracking-wide mb-1">
                      Description <span className="text-white/40 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="template-description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe when to use this template..."
                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50"
                      disabled={!canEdit}
                      maxLength={500}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Email Sequence - Main View */}
            <div>

              {emailItems.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
                  <Mail className="w-12 h-12 text-white/40 mx-auto mb-3" />
                  <p className="text-white/60 text-sm mb-4">No emails in this sequence yet</p>
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
                /* Sidebar + Preview Layout */
                <div className="flex gap-4 h-[calc(100vh-300px)] min-h-[600px]">
                  {/* Left Sidebar - Email Navigation */}
                  <div className="w-80 flex-shrink-0 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03]">
                    <div className="p-3 border-b border-white/10 sticky top-0 bg-black/40 backdrop-blur-sm z-10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                          {emailItems.length} Email{emailItems.length !== 1 ? 's' : ''}
                        </h3>
                        {canEdit && (
                          <button
                            onClick={() => handleOpenCreateEditor()}
                            className="p-1 rounded text-purple-400 hover:bg-purple-500/20 transition-all"
                            title="Add reminder email"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Grouped Email List - System then Reminders */}
                    <div className="p-2 space-y-3">
                      {(['system', 'reminders'] as const).map((groupKey) => {
                        const items = groupedEmails[groupKey];
                        if (!items || items.length === 0) return null;

                        return (
                          <div key={groupKey}>
                            <div className="px-2 py-1">
                              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                                {groupLabels[groupKey]}
                              </h4>
                            </div>
                            <div className="space-y-0.5">
                              {items.map((item) => {
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => setSelectedEmail(item)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                                      selectedEmail?.id === item.id
                                        ? 'bg-purple-500/20 border border-purple-500/40'
                                        : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <div className="text-sm text-white font-medium truncate">
                                        {item.name}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getEmailTypeInfo(item.trigger_type).color}`}>
                                        {getEmailTypeInfo(item.trigger_type).label}
                                      </span>
                                      {item.trigger_value !== null && item.trigger_value > 0 && (
                                        <span className="text-[9px] text-white/50">
                                          {item.trigger_value}d
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Preview Pane */}
                  <div className="flex-1 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03]">
                    {selectedEmail ? (
                      <div>
                        {/* Preview Header */}
                        <div className="p-4 border-b border-white/10 bg-black/20 sticky top-0 z-10 backdrop-blur-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <h3 className="text-base font-semibold text-white truncate">
                                  {selectedEmail.name}
                                </h3>
                                {(() => {
                                  const isReminder = isCustomReminder(selectedEmail.trigger_type);
                                  return isReminder ? (
                                    <div className="flex items-center gap-1">
                                      <span className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 uppercase tracking-wide">
                                        Reminder
                                      </span>
                                      <Tooltip.Provider delayDuration={200}>
                                        <Tooltip.Root>
                                          <Tooltip.Trigger asChild>
                                            <button className="text-purple-300 hover:text-purple-200 transition-colors">
                                              <HelpCircle className="w-3.5 h-3.5" />
                                            </button>
                                          </Tooltip.Trigger>
                                          <Tooltip.Portal>
                                            <Tooltip.Content
                                              className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg border border-purple-400/30 shadow-xl max-w-xs z-50"
                                              sideOffset={5}
                                            >
                                              This is a time-based reminder that was added to this event's sequence.
                                              <Tooltip.Arrow className="fill-gray-900" />
                                            </Tooltip.Content>
                                          </Tooltip.Portal>
                                        </Tooltip.Root>
                                      </Tooltip.Provider>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <span className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 uppercase tracking-wide">
                                        System
                                      </span>
                                      <Tooltip.Provider delayDuration={200}>
                                        <Tooltip.Root>
                                          <Tooltip.Trigger asChild>
                                            <button className="text-emerald-300 hover:text-emerald-200 transition-colors">
                                              <HelpCircle className="w-3.5 h-3.5" />
                                            </button>
                                          </Tooltip.Trigger>
                                          <Tooltip.Portal>
                                            <Tooltip.Content
                                              className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg border border-emerald-400/30 shadow-xl max-w-xs z-50"
                                              sideOffset={5}
                                            >
                                              This is a core system email that's automatically triggered by vendor actions or event milestones.
                                              <Tooltip.Arrow className="fill-gray-900" />
                                            </Tooltip.Content>
                                          </Tooltip.Portal>
                                        </Tooltip.Root>
                                      </Tooltip.Provider>
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getEmailTypeInfo(selectedEmail.trigger_type).color}`}>
                                  {getEmailTypeInfo(selectedEmail.trigger_type).label}
                                </span>
                                <span className="text-xs text-white/60">
                                  {selectedEmail.trigger_type.replace(/_/g, ' ')}
                                </span>
                                {selectedEmail.trigger_value !== null && selectedEmail.trigger_value > 0 && (
                                  <span className="text-xs text-white/60">
                                    ({selectedEmail.trigger_value} days)
                                  </span>
                                )}
                              </div>
                            </div>
                            {canEdit && (() => {
                              const isReminderEmail = isCustomReminder(selectedEmail.trigger_type);

                              return (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setShowTestEmailDialog(true)}
                                    className="px-3 py-1.5 rounded-lg border border-green-500/40 bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-all text-sm flex items-center gap-1.5"
                                    title="Send test email"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    Send Test
                                  </button>
                                  <button
                                    onClick={() => handleEditEmail(selectedEmail)}
                                    className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all text-sm flex items-center gap-1.5"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    Edit
                                  </button>
                                  {isReminderEmail && (
                                    <button
                                      onClick={() => handleDeleteEmail(selectedEmail)}
                                      className="p-1.5 rounded text-white/50 hover:text-red-400 hover:bg-white/10 transition-all"
                                      title="Delete email"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Email Preview Content */}
                        <div className="p-6">
                          {/* Subject */}
                          <div className="mb-6">
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                              Subject
                            </label>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                              <p className="text-sm text-white font-medium">
                                {selectedEmail.subject_template || '(No subject)'}
                              </p>
                            </div>
                          </div>

                          {/* Body */}
                          <div>
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                              Email Body
                            </label>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                              <div
                                className="prose prose-sm prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedEmail.body_template || '<p class="text-white/40">(No content)</p>' }}
                              />
                            </div>
                          </div>

                          {/* Trigger Details */}
                          <div className="mt-6 pt-6 border-t border-white/10">
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">
                              Trigger Settings
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Type</div>
                                <div className="text-sm text-white">{selectedEmail.trigger_type.replace(/_/g, ' ')}</div>
                              </div>
                              {selectedEmail.trigger_value !== null && selectedEmail.trigger_value > 0 && (
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                  <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Days</div>
                                  <div className="text-sm text-white">{selectedEmail.trigger_value}</div>
                                </div>
                              )}
                              {selectedEmail.trigger_time && (
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                  <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Time</div>
                                  <div className="text-sm text-white">
                                    {selectedEmail.trigger_time.substring(11, 16)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center p-8">
                        <div className="text-center">
                          <Mail className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p className="text-white/40 text-sm">Select an email to preview</p>
                        </div>
                      </div>
                    )}
                  </div>
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && emailToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a0f2e] to-[#0f0a1e] border border-red-500/30 rounded-xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Delete Email?</h3>
                <p className="text-sm text-white/60 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/80">
                You are about to delete:
              </p>
              <p className="text-base font-semibold text-white mt-2">
                "{emailToDelete.name}"
              </p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Type:</span>
                  <span className="text-white/80">
                    {emailToDelete.trigger_type.replace(/_/g, ' ')}
                  </span>
                </div>
                {emailToDelete.trigger_value !== null && emailToDelete.trigger_value > 0 && (
                  <div className="flex items-center justify-between text-xs mt-1.5">
                    <span className="text-white/50">Timing:</span>
                    <span className="text-white/80">{emailToDelete.trigger_value} day(s)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setEmailToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Template Confirmation Modal */}
      {deleteTemplateModalOpen && template && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a0f2e] to-[#0f0a1e] border border-red-500/30 rounded-xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Delete Sequence?</h3>
                <p className="text-sm text-white/60 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/80">
                You are about to delete this email sequence:
              </p>
              <p className="text-base font-semibold text-white mt-2">
                "{template.name}"
              </p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Type:</span>
                  <span className="text-white/80 capitalize">
                    {template.template_type === 'generic' ? 'Event Sequence' : 'Category Sequence'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1.5">
                  <span className="text-white/50">Emails:</span>
                  <span className="text-white/80">{emailItems.length}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteTemplateModalOpen(false)}
                disabled={isDeletingTemplate}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                disabled={isDeletingTemplate}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeletingTemplate ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Sequence
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Dialog */}
      {showTestEmailDialog && selectedEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a0f2e] to-[#0f0a1e] border border-purple-500/30 rounded-xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <Send className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Send Test Email</h3>
                <p className="text-sm text-white/60 mt-0.5">
                  Preview how this email will look
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="mb-6">
              <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-white/50 mb-1">Sending test for:</p>
                <p className="text-sm font-semibold text-white">{selectedEmail.name}</p>
              </div>

              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                autoFocus
              />
              <p className="text-xs text-white/50 mt-2">
                Test emails use sample data for variables like vendor name, event details, etc.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowTestEmailDialog(false);
                  setTestEmailAddress('');
                }}
                disabled={isSendingTest}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTest}
                disabled={isSendingTest || !testEmailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium hover:from-green-700 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
