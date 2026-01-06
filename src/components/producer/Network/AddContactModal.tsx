import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { vendorContactsApi, VendorContact } from '@/services/api';

interface AddContactModalProps {
  organizationId: number;
  onClose: () => void;
  onSuccess: (contact: VendorContact) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'Artist', label: 'Artist' },
  { value: 'Table Vendor', label: 'Table Vendor' },
  { value: 'Sponsor', label: 'Sponsor' },
  { value: 'Food & Beverage', label: 'Food & Beverage' },
];

export default function AddContactModal({ organizationId, onClose, onSuccess }: AddContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    contact_name: '',
    business_name: '',
    email: '',
    phone: '',
    location: '',
    instagram_handle: '',
    tiktok_handle: '',
    website: '',
    categories: [] as string[],
    tags: [] as string[],
    notes: '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required and must be unique';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate URL if provided
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Portfolio URL must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newContact = await vendorContactsApi.create(organizationId, {
        contact_name: formData.contact_name,
        business_name: formData.business_name || undefined,
        email: formData.email,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
        instagram_handle: formData.instagram_handle || undefined,
        tiktok_handle: formData.tiktok_handle || undefined,
        website: formData.website || undefined,
        categories: formData.categories,
        tags: formData.tags,
        notes: formData.notes || undefined,
        contact_type: 'vendor',
        source: 'manual',
      });

      onSuccess(newContact);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create contact' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-md border-b border-purple-500/20 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add New Contact</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Full Name, Business Name, Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="contact_name" className="block text-white/90 text-sm font-medium mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="contact_name"
                type="text"
                value={formData.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
                placeholder="John Smith"
                className={`w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border ${
                  errors.contact_name ? 'border-red-500' : 'border-white/20'
                } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
              />
              {errors.contact_name && (
                <p className="mt-1 text-xs text-red-400">{errors.contact_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="business_name" className="block text-white/90 text-sm font-medium mb-1.5">
                Business Name
              </label>
              <input
                id="business_name"
                type="text"
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                placeholder="Smith's Ceramics"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                className={`w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border ${
                  errors.email ? 'border-red-500' : 'border-white/20'
                } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Row 2: Phone, Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-white/90 text-sm font-medium mb-1.5">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-white/90 text-sm font-medium mb-1.5">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Search city, state, zip..."
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Row 3: Social Media - Instagram, TikTok, Portfolio URL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="instagram_handle" className="block text-white/90 text-sm font-medium mb-1.5 flex items-center gap-2">
                <span className="text-pink-400">@</span> Instagram
              </label>
              <input
                id="instagram_handle"
                type="text"
                value={formData.instagram_handle}
                onChange={(e) => handleChange('instagram_handle', e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="tiktok_handle" className="block text-white/90 text-sm font-medium mb-1.5 flex items-center gap-2">
                <span className="text-cyan-400">@</span> TikTok
              </label>
              <input
                id="tiktok_handle"
                type="text"
                value={formData.tiktok_handle}
                onChange={(e) => handleChange('tiktok_handle', e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-white/90 text-sm font-medium mb-1.5 flex items-center gap-2">
                <span className="text-blue-400">🔗</span> Portfolio URL
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://..."
                className={`w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border ${
                  errors.website ? 'border-red-500' : 'border-white/20'
                } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-400">{errors.website}</p>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-white/90 text-sm font-medium">
                Categories
              </label>
              <button
                type="button"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORY_OPTIONS.map((category) => (
                <label
                  key={category.value}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all cursor-pointer ${
                    formData.categories.includes(category.value)
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.value)}
                    onChange={() => handleCategoryToggle(category.value)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 focus:ring-2"
                  />
                  <span className="text-sm font-medium">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-white/90 text-sm font-medium mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm rounded-lg transition-colors flex items-center gap-2 border border-purple-500/30"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs flex items-center gap-1.5 border border-purple-500/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-purple-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-white/90 text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add notes..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
            />
          </div>

          {/* Validation Note */}
          <p className="text-xs text-white/50 italic">
            * Email is required and must be unique
          </p>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-xs text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg border border-white/30 text-white/90 hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding Contact...
                </span>
              ) : (
                'Add Contact'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
