import { useState, useEffect } from 'react';
import { Mail, Plus, Copy, Trash2, Edit, Loader2, ArrowLeft, FileText, Calendar, Eye, Send, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { emailCampaignTemplatesApi, emailTemplateItemsApi } from '@/services/api';
import type { EmailCampaignTemplate, EmailTemplateItem } from '@/types/email';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [previewEmails, setPreviewEmails] = useState<EmailTemplateItem[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Clone modal state
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [cloneTemplate, setCloneTemplate] = useState<EmailCampaignTemplate | null>(null);
  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Email testing state (admin-only)
  const [testingLoading, setTestingLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ name: string; status: 'sent' | 'failed'; error?: string }>>([]);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadTemplates();
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

  const handleClone = (template: EmailCampaignTemplate) => {
    setCloneTemplate(template);
    setCloneName(`${template.name} (Copy)`);
    setCloneDescription(template.description || '');
    setCloneError(null); // Clear any previous errors
    setCloneModalOpen(true);
  };

  const handleCloneConfirm = async () => {
    if (!cloneTemplate || !cloneName.trim()) return;

    // Client-side validation: Check for duplicate names
    const trimmedName = cloneName.trim();
    const nameExists = templates.some(
      t => t.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      setCloneError(`A sequence named "${trimmedName}" already exists. Please choose a different name.`);
      toast.error('Duplicate sequence name', {
        description: `A sequence named "${trimmedName}" already exists. Please choose a different name.`,
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

  const handleDelete = async (template: EmailCampaignTemplate) => {
    // Protect default template from deletion
    if (template.is_default) {
      toast.error('Cannot delete default sequence', {
        description: 'The default sequence is protected and cannot be deleted',
      });
      return;
    }

    // Non-admin users cannot delete system templates
    if (template.template_type === 'system' && !isAdmin) {
      toast.error('Cannot delete system sequence', {
        description: 'Only admins can delete system sequences',
      });
      return;
    }

    if (deleteConfirmId !== template.id) {
      setDeleteConfirmId(template.id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
      return;
    }

    try {
      await emailCampaignTemplatesApi.delete(template.id);
      await loadTemplates();
      setDeleteConfirmId(null);
      toast.success('Sequence deleted', {
        description: `"${template.name}" has been removed`,
      });
    } catch (err: any) {
      toast.error('Failed to delete sequence', {
        description: err.message || 'An error occurred while deleting',
      });
    }
  };

  const handlePreview = async (template: EmailCampaignTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
    setLoadingPreview(true);
    setTestResults([]); // Reset test results when opening preview

    try {
      const emails = await emailTemplateItemsApi.getByTemplate(template.id);
      setPreviewEmails(emails.sort((a, b) => a.position - b.position));
    } catch (err: any) {
      toast.error('Failed to load emails', {
        description: err.message || 'Could not load sequence emails',
      });
      setPreviewOpen(false);
    } finally {
      setLoadingPreview(false);
    }
  };

  const sendTestSequence = async () => {
    if (!previewTemplate) {
      toast.error('No template selected');
      return;
    }

    setTestingLoading(true);
    setTestResults([]);

    try {
      const data = await emailCampaignTemplatesApi.sendTestEmails(previewTemplate.id);
      // Transform results to match expected type (email_name -> name)
      const transformedResults = (data.results || []).map(r => ({
        name: r.email_name,
        status: r.status,
        error: r.error,
      }));
      setTestResults(transformedResults);
      setTestEmail(data.recipient || '');

      const successCount = data.success_count || 0;
      const failureCount = data.failure_count || 0;

      if (failureCount > 0) {
        toast.warning(`Sent ${successCount} test emails, ${failureCount} failed`);
      } else {
        toast.success(`Successfully sent ${successCount} test emails to ${data.recipient}`);
      }
    } catch (error: any) {
      console.error('Failed to send test emails:', error);
      toast.error(error.message || 'Failed to send test emails');
    } finally {
      setTestingLoading(false);
    }
  };

  const getStatusIcon = (status: 'sent' | 'failed') => {
    if (status === 'sent') {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Email Sequence Library
              </h1>
              <p className="text-white/60 text-xs mt-0.5">
                Create and manage reusable email sequences
              </p>
            </div>
            <button
              onClick={() => onNavigateToBuilder?.()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-500 hover:to-blue-500 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Sequence
            </button>
          </div>
        </div>

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

        {/* All Sequences */}
        {!isLoading && !error && templates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-semibold text-white">All Sequences</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                {templates.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => onNavigateToBuilder?.(template.id)}
                  onClone={() => handleClone(template)}
                  onDelete={() => handleDelete(template)}
                  onPreview={() => handlePreview(template)}
                  deleteConfirm={deleteConfirmId === template.id}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && templates.length === 0 && (
          <div className="text-center py-8">
            <Mail className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-base font-medium text-white mb-1">No Sequences Found</h3>
            <p className="text-white/60 text-sm mb-4">Create your first email sequence</p>
            <button
              onClick={() => onNavigateToBuilder?.()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-500 hover:to-blue-500 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Sequence
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewOpen && previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-lg border border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white">{previewTemplate.name}</h2>
                <p className="text-xs text-white/60 mt-0.5">
                  {previewTemplate.description || 'Preview all emails in this sequence'}
                </p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
                  <p className="text-white/60 text-sm">Loading emails...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {previewEmails.map((email, index) => (
                    <div
                      key={email.id}
                      className="p-4 rounded-lg border border-white/10 bg-white/5"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-purple-400">
                            {email.position}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">{email.name}</h3>
                          <p className="text-sm text-white/60 mb-2">{email.subject_template}</p>
                          <div className="flex items-center gap-2 text-xs text-white/50">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                              {email.category}
                            </span>
                            <span>{email.trigger_type.replace(/_/g, ' ')}</span>
                            {email.trigger_value !== null && email.trigger_value > 0 && (
                              <span>({email.trigger_value} days)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className="email-preview-content text-sm"
                        dangerouslySetInnerHTML={{ __html: email.body_template }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 space-y-3">
              {/* Test Section */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Send className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-bold text-white">Test This Sequence</h4>
                    </div>
                      <p className="text-xs text-white/60 mb-3">
                        Send all emails from this sequence to your email for testing.
                        {testEmail && (
                          <span className="block mt-1">
                            Test emails will be sent to: <span className="font-mono text-purple-400">{testEmail}</span>
                          </span>
                        )}
                      </p>
                      <button
                        onClick={sendTestSequence}
                        disabled={testingLoading}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        {testingLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending Test Emails...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Test Emails
                          </>
                        )}
                      </button>
                    </div>

                    {/* Test Results */}
                    {testResults.length > 0 && (
                      <div className="flex-1 bg-black/20 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <h5 className="text-xs font-semibold text-white">Test Results</h5>
                        </div>
                        <div className="text-[10px] text-white/60 mb-2">
                          {testResults.filter(r => r.status === 'sent').length} sent • {testResults.filter(r => r.status === 'failed').length} failed
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {testResults.map((result, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 p-1.5 rounded text-[10px] border ${
                                result.status === 'sent'
                                  ? 'bg-green-500/10 border-green-500/20 text-green-300'
                                  : 'bg-red-500/10 border-red-500/20 text-red-300'
                              }`}
                            >
                              {getStatusIcon(result.status)}
                              <span className="flex-1 truncate">{result.name}</span>
                              {result.error && (
                                <span className="text-red-400 text-[9px]" title={result.error}>!</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              {/* Close Button */}
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

interface TemplateCardProps {
  template: EmailCampaignTemplate;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onPreview: () => void;
  deleteConfirm: boolean;
  isAdmin: boolean;
}

function TemplateCard({ template, onEdit, onClone, onDelete, onPreview, deleteConfirm, isAdmin }: TemplateCardProps) {
  const isSystem = template.template_type === 'system';
  const isDefault = template.is_default;

  // Can delete if: (1) Not default, AND (2) Either user template OR (admin + system template)
  const canDelete = !isDefault && (template.template_type === 'user' || isAdmin);

  return (
    <div className={`p-4 rounded-lg border transition-all group ${
      isDefault
        ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 via-white/5 to-white/5 hover:border-yellow-500/70 hover:shadow-lg hover:shadow-yellow-500/20'
        : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-medium text-white truncate">
              {template.name}
            </h3>
            {isDefault && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex-shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                Default
              </span>
            )}
          </div>
          {template.description && (
            <p className="text-xs text-white/60 line-clamp-2 mb-2">
              {template.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
        <div className="flex items-center gap-1">
          <Mail className="w-3.5 h-3.5" />
          <span>{template.email_count || 0} emails</span>
        </div>
        {template.events_count > 0 && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{template.events_count} events</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
          title={isSystem ? 'View sequence details' : 'Edit sequence'}
        >
          <Edit className="w-3.5 h-3.5" />
          {isSystem ? 'View' : 'Edit'}
        </button>
        <button
          onClick={onPreview}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all flex items-center gap-1.5"
          title="Preview all emails in this sequence"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>
        <button
          onClick={onClone}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all flex items-center gap-1.5"
          title="Create a copy of this sequence"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clone</span>
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-all flex items-center gap-1.5 ${
              deleteConfirm
                ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-red-400 hover:border-red-500/40'
            }`}
            title={deleteConfirm ? 'Click again to confirm deletion' : 'Delete this sequence'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{deleteConfirm ? 'Confirm' : 'Delete'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
