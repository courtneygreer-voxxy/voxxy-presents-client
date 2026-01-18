import { useState } from 'react';
import { X, Filter, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { contactListsApi, ContactList } from '@/services/api';
import SmartListBuilder from './SmartListBuilder';
import ManualListBuilder from './ManualListBuilder';

interface CreateListModalProps {
  organizationId: number;
  onClose: () => void;
  onSuccess: (newList: ContactList) => void;
}

type ListType = 'smart' | 'manual' | null;
type Step = 'select-type' | 'configure';

export default function CreateListModal({
  organizationId,
  onClose,
  onSuccess,
}: CreateListModalProps) {
  const [step, setStep] = useState<Step>('select-type');
  const [listType, setListType] = useState<ListType>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // List data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Smart list filters
  const [filters, setFilters] = useState<{
    categories?: string[];
    locations?: string[];
    tags?: string[];
  }>({});

  // Manual list contact IDs
  const [contactIds, setContactIds] = useState<number[]>([]);

  const handleSelectType = (type: ListType) => {
    setListType(type);
    setStep('configure');
  };

  const handleBack = () => {
    if (step === 'configure') {
      setStep('select-type');
      setListType(null);
      // Reset data
      setName('');
      setDescription('');
      setFilters({});
      setContactIds([]);
    }
  };

  const handleCreate = async () => {
    if (!listType || !name.trim()) {
      setError('Please provide a name for your list');
      return;
    }

    // Validate filters/contacts based on type
    if (listType === 'smart') {
      const hasFilters =
        (filters.categories && filters.categories.length > 0) ||
        (filters.locations && filters.locations.length > 0) ||
        (filters.tags && filters.tags.length > 0);

      if (!hasFilters) {
        setError('Please select at least one filter for your smart list');
        return;
      }
    } else if (listType === 'manual') {
      if (contactIds.length === 0) {
        setError('Please select at least one contact for your manual list');
        return;
      }
    }

    try {
      setCreating(true);
      setError(null);

      const listData = {
        name: name.trim(),
        description: description.trim() || undefined,
        list_type: listType,
        ...(listType === 'smart' ? { filters } : { contact_ids: contactIds }),
      };

      const newList = await contactListsApi.create(organizationId, listData);
      onSuccess(newList);
    } catch (err: any) {
      setError(err.message || 'Failed to create list');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-white/20 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {step === 'configure' && (
              <button
                onClick={handleBack}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">
                {step === 'select-type' ? 'Create New List' : `Create ${listType === 'smart' ? 'Smart' : 'Manual'} List`}
              </h2>
              <p className="text-sm text-white/60 mt-0.5">
                {step === 'select-type'
                  ? 'Choose how you want to organize your contacts'
                  : 'Configure your list settings and filters'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 'select-type' && (
            <div className="space-y-4">
              <p className="text-white/70 text-sm mb-6">
                Select the type of list you want to create:
              </p>

              {/* Smart List Option */}
              <button
                onClick={() => handleSelectType('smart')}
                className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl text-left transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-colors">
                    <Filter className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">Smart List</h3>
                      <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                        Dynamic
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">
                      Automatically updates based on filters like categories, locations, and tags
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <div className="w-1 h-1 bg-purple-400 rounded-full" />
                        <span>Auto-updates when contacts change</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <div className="w-1 h-1 bg-purple-400 rounded-full" />
                        <span>Filter by category, location, and tags</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <div className="w-1 h-1 bg-purple-400 rounded-full" />
                        <span>Perfect for recurring event types</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors mt-2" />
                </div>
              </button>

              {/* Manual List Option */}
              <button
                onClick={() => handleSelectType('manual')}
                className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl text-left transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-colors">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">Manual List</h3>
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">
                        Static
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">
                      Hand-pick specific contacts that remain fixed over time
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <div className="w-1 h-1 bg-blue-400 rounded-full" />
                        <span>Select specific contacts manually</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <div className="w-1 h-1 bg-blue-400 rounded-full" />
                        <span>Contacts stay fixed unless you edit</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <div className="w-1 h-1 bg-blue-400 rounded-full" />
                        <span>Perfect for one-time or special events</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-blue-400 transition-colors mt-2" />
                </div>
              </button>
            </div>
          )}

          {step === 'configure' && (
            <div className="space-y-6">
              {/* Name & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    List Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Food Vendors, NYC Artists, Premium Sponsors"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description <span className="text-white/40 text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description to help remember what this list is for..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-white/40 mt-1">
                    {description.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Type-specific configuration */}
              {listType === 'smart' && (
                <SmartListBuilder
                  organizationId={organizationId}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              )}

              {listType === 'manual' && (
                <ManualListBuilder
                  organizationId={organizationId}
                  selectedContactIds={contactIds}
                  onSelectionChange={setContactIds}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'configure' && (
          <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white/60 hover:text-white text-sm font-medium transition-colors"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {creating ? 'Creating...' : 'Create List'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
