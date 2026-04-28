import { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { vendorApplicationsApi } from '@/services/api';
import { formatDateForInput, formatEventDate } from '@/utils/dateHelpers';

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
    pricing?: {
      booth_price: number;
      currency: string;
    };
    categories: string[];
    install_date?: string;
    install_start_time?: string;
    install_end_time?: string;
    payment_link?: string;
    application_tags?: string;
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
    booth_price: existingApplication?.pricing?.booth_price || 0,
    install_date: formatDateForInput(existingApplication?.install_date) || '',
    install_start_time: existingApplication?.install_start_time || '',
    install_end_time: existingApplication?.install_end_time || '',
    payment_link: existingApplication?.payment_link || '',
    status: existingApplication?.status || 'active' as 'active' | 'inactive',
  });


  // Initialize tags from application_tags (comma-separated string)
  const [tags, setTags] = useState<string[]>(
    existingApplication?.application_tags
      ? existingApplication.application_tags.split(',').map(t => t.trim()).filter(t => t)
      : []
  );
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Application name is required');
      return;
    }

    if (formData.booth_price === undefined || formData.booth_price < 0) {
      setError('Booth price must be $0 or greater');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        booth_price: formData.booth_price,
        status: formData.status,
        install_date: formData.install_date || undefined,
        install_start_time: formData.install_start_time || undefined,
        install_end_time: formData.install_end_time || undefined,
        payment_link: formData.payment_link || undefined,
        application_tags: tags.length > 0 ? tags.join(',') : undefined,
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
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {existingApplication ? 'Edit Application' : 'Create Application'}
        </h1>
        <p className="text-foreground/60">
          {existingApplication ? 'Update your vendor application form' : 'Set up your vendor application form'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Application Details */}
        <div className="bg-background/5 border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Application Details</h2>

          {/* Application Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Application Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Vendor Application - Winter Market 2025"
              className="w-full px-4 py-3 rounded-lg bg-background/10 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Include pricing, requirements, and what you're looking for in vendors.

Example: We're seeking talented vendors for our Winter Market. Booth fee is $150. Looking for artisans, food vendors, and crafters who align with our community-focused mission..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-background/10 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Booth Price */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Booth Price *
            </label>
            <p className="text-foreground/50 text-sm mb-2">
              Price vendors will pay for this booth type
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.booth_price ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    booth_price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="150.00"
                className="w-full pl-8 pr-4 py-3 rounded-lg bg-background/10 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Install Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Install Date (Optional)
            </label>
            <p className="text-foreground/50 text-sm mb-2">
              When vendors should arrive to set up their booth
            </p>
            <input
              type="date"
              value={formData.install_date}
              onChange={(e) =>
                setFormData({ ...formData, install_date: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-background/10 border border-border text-foreground focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Install Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Install Start Time
              </label>
              <input
                type="time"
                value={formData.install_start_time}
                onChange={(e) =>
                  setFormData({ ...formData, install_start_time: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-background/10 border border-border text-foreground focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Install End Time
              </label>
              <input
                type="time"
                value={formData.install_end_time}
                onChange={(e) =>
                  setFormData({ ...formData, install_end_time: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-background/10 border border-border text-foreground focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Payment Link */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Payment Link (Optional)
            </label>
            <p className="text-foreground/50 text-sm mb-2">
              URL where vendors can pay for this booth type
            </p>
            <input
              type="url"
              value={formData.payment_link}
              onChange={(e) =>
                setFormData({ ...formData, payment_link: e.target.value })
              }
              placeholder="https://example.com/pay"
              className="w-full px-4 py-3 rounded-lg bg-background/10 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Event Info (Read-only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-foreground/60 mb-2">
                Event Date
              </label>
              <div className="px-4 py-3 rounded-lg bg-background/5 border border-border text-foreground/80">
                {event.event_date
                  ? formatEventDate(event.event_date, 'MMMM d, yyyy')
                  : 'Not set'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground dark:text-foreground/60 mb-2">
                Location
              </label>
              <div className="px-4 py-3 rounded-lg bg-background/5 border border-border text-foreground/80">
                {event.location || 'Not set'}
              </div>
            </div>
          </div>
        </div>

        {/* Application Tags */}
        <div className="bg-background/5 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-foreground">Application Tags (Optional)</h2>
          </div>
          <p className="text-sm text-foreground/60 mb-4">
            Add tags to help categorize this application type
          </p>

          {/* Add Tag Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="e.g., handmade, food, jewelry"
              className="flex-1 px-4 py-2 rounded-lg bg-background/10 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 rounded-lg voxxy-btn-cta transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Tag
            </button>
          </div>

          {/* Tags List */}
          {tags.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <p className="text-foreground/40 text-sm">No tags added yet</p>
              <p className="text-foreground/30 text-xs mt-1">
                Tags help categorize and organize applications
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-foreground text-sm"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
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
            className="flex-1 px-6 py-3 rounded-lg border border-border text-foreground hover:bg-background/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-lg voxxy-btn-cta transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
