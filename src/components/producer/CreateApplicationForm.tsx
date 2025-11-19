import { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { vendorApplicationsApi } from '@/services/api';

interface Event {
  slug: string;
  title: string;
  event_date?: string;
  location?: string;
}

interface CreateApplicationFormProps {
  event: Event;
  onBack: () => void;
  onSuccess: () => void;
  existingApplication?: {
    id: number;
    name: string;
    description?: string;
    categories: string[];
    status: 'active' | 'inactive';
  };
}

export default function CreateApplicationForm({
  event,
  onBack,
  onSuccess,
  existingApplication,
}: CreateApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: existingApplication?.name || '',
    description: existingApplication?.description || '',
    status: existingApplication?.status || 'active' as 'active' | 'inactive',
  });
  const [categories, setCategories] = useState<string[]>(existingApplication?.categories || []);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Application name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        categories,
      };

      if (existingApplication) {
        await vendorApplicationsApi.update(existingApplication.id, data);
      } else {
        await vendorApplicationsApi.create(event.slug, data);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Failed to save application:', err);
      setError(err.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">
          {existingApplication ? 'Edit Application' : 'Create Application'}
        </h1>
        <p className="text-white/60">
          {existingApplication ? 'Update your vendor application form' : 'Set up your vendor application form'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Application Details */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Application Details</h2>

          {/* Application Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              Application Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Vendor Application - Winter Market 2025"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Include pricing, requirements, and what you're looking for in vendors.

Example: We're seeking talented vendors for our Winter Market. Booth fee is $150. Looking for artisans, food vendors, and crafters who align with our community-focused mission..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Event Info (Read-only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Event Date
              </label>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80">
                {event.event_date
                  ? new Date(event.event_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Not set'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Location
              </label>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80">
                {event.location || 'Not set'}
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Categories */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-white">Vendor Categories</h2>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Define categories with descriptions that vendors will see
          </p>

          {/* Add Category Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              placeholder="e.g., Artist, Food Vendor, Crafts"
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {/* Categories List */}
          {categories.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-lg">
              <p className="text-white/40 text-sm">No categories added yet</p>
              <p className="text-white/30 text-xs mt-1">
                Categories help vendors understand what you're looking for
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/10 border border-white/20"
                >
                  <span className="text-white">{category}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category)}
                    className="text-white/60 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Saving...'
              : existingApplication
              ? 'Update Application'
              : 'Create Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
