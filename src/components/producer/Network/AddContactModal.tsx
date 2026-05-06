import { useState, useEffect, useRef } from 'react';
import { X, Plus, ChevronDown, Check } from 'lucide-react';
import { vendorContactsApi, categoriesApi, VendorContact } from '@/services/api';
import type { Category } from '@/types/category';
import SimsLoadingScreen from '@/components/ui/SimsLoadingScreen';
import SuccessMessage from '@/components/ui/SuccessMessage';
import { getCategorySequenceBadgeStyle } from '@/lib/categoryBadgeStyles';
import { cn } from '@/lib/utils';

interface AddContactModalProps {
  organizationId: number;
  onClose: () => void;
  onSuccess: (contact: VendorContact) => void;
}

export default function AddContactModal({ organizationId, onClose, onSuccess }: AddContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [organizationCategories, setOrganizationCategories] = useState<Category[]>([]);

  const contactFieldClass = (field?: string) =>
    cn(
      'voxxy-input-frost w-full px-3 py-2.5 text-sm rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all',
      field && errors[field] && 'border-red-500 ring-1 ring-red-500/35'
    );

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch organization's official categories
    categoriesApi.getAll(organizationId).then(response => {
      setOrganizationCategories(response.categories || []);
    }).catch(() => {});

    // Fetch available tags from filter options
    vendorContactsApi.getFilterOptions(organizationId).then(options => {
      setAvailableTags(options.tags || []);
    }).catch(() => {});
  }, [organizationId]);

  const [formData, setFormData] = useState({
    contact_name: '',
    business_name: '',
    email: '',
    phone: '',
    location: '',
    instagram_handle: '',
    tiktok_handle: '',
    website: '',
    eventbrite_email: '',
    venmo_handle: '',
    paypal_email: '',
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
        // TODO: Backend migration needed - these will be silently dropped until then
        eventbrite_email: formData.eventbrite_email || undefined,
        venmo_handle: formData.venmo_handle || undefined,
        paypal_email: formData.paypal_email || undefined,
        categories: formData.categories,
        tags: formData.tags,
        notes: formData.notes || undefined,
        contact_type: 'vendor',
        source: 'manual',
      });

      // Show success screen
      setShowSuccess(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onSuccess(newContact);
        onClose();
      }, 2000);
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      const serverErrors: string[] = error.errors || [];

      // Map backend validation errors to specific form fields
      for (const msg of serverErrors) {
        const lower = msg.toLowerCase();
        if (lower.includes('email')) {
          newErrors.email = msg;
        } else if (lower.includes('phone')) {
          newErrors.phone = msg;
        } else if (lower.includes('name')) {
          newErrors.contact_name = msg;
        } else if (lower.includes('website') || lower.includes('url')) {
          newErrors.website = msg;
        } else if (lower.includes('instagram')) {
          newErrors.instagram_handle = msg;
        } else if (lower.includes('tiktok')) {
          newErrors.tiktok_handle = msg;
        } else {
          // Catch-all for unmapped errors
          newErrors.submit = newErrors.submit ? `${newErrors.submit}; ${msg}` : msg;
        }
      }

      // Fallback if no server errors were parsed
      if (Object.keys(newErrors).length === 0) {
        newErrors.submit = error.message || 'Failed to create contact';
      }

      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-xl w-[90vw] max-w-4xl max-h-[85vh] overflow-y-auto border border-primary/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 voxxy-gradient-modal-header backdrop-blur-md border-b border-primary/20 px-6 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Add New Contact</h2>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading Screen */}
        {isSubmitting && !showSuccess && (
          <SimsLoadingScreen message="Creating your contact..." />
        )}

        {/* Success Screen */}
        {showSuccess && (
          <SuccessMessage
            title="Contact Added!"
            message="Your new contact has been successfully added to your network."
          />
        )}

        {/* Form - only show when not submitting or showing success */}
        {!isSubmitting && !showSuccess && (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-5xl mx-auto">
          {/* Row 1: Full Name, Business Name, Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="contact_name" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="contact_name"
                type="text"
                value={formData.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
                placeholder="John Smith"
                className={contactFieldClass('contact_name')}
              />
              {errors.contact_name && (
                <p className="mt-1 text-xs text-red-400">{errors.contact_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="business_name" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90">
                Business Name
              </label>
              <input
                id="business_name"
                type="text"
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                placeholder="Smith's Ceramics"
                className={contactFieldClass()}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                className={contactFieldClass('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Row 2: Phone, Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className={contactFieldClass('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Search city, state, zip..."
                className={contactFieldClass()}
              />
            </div>
          </div>

          {/* Row 3: Social Media - Instagram, TikTok, Portfolio URL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="instagram_handle" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90 flex items-center gap-2">
                <span className="text-pink-400">@</span> Instagram
              </label>
              <input
                id="instagram_handle"
                type="text"
                value={formData.instagram_handle}
                onChange={(e) => handleChange('instagram_handle', e.target.value)}
                placeholder="@username"
                className={contactFieldClass('instagram_handle')}
              />
              {errors.instagram_handle && (
                <p className="mt-1 text-xs text-red-400">{errors.instagram_handle}</p>
              )}
            </div>

            <div>
              <label htmlFor="tiktok_handle" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90 flex items-center gap-2">
                <span className="text-cyan-400">@</span> TikTok
              </label>
              <input
                id="tiktok_handle"
                type="text"
                value={formData.tiktok_handle}
                onChange={(e) => handleChange('tiktok_handle', e.target.value)}
                placeholder="@username"
                className={contactFieldClass('tiktok_handle')}
              />
              {errors.tiktok_handle && (
                <p className="mt-1 text-xs text-red-400">{errors.tiktok_handle}</p>
              )}
            </div>

            <div>
              <label htmlFor="website" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90 flex items-center gap-2">
                <span className="text-blue-400">🔗</span> Portfolio URL
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://..."
                className={contactFieldClass('website')}
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-400">{errors.website}</p>
              )}
            </div>
          </div>

          {/* Row 4: Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="eventbrite_email" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90">
                Eventbrite Email
              </label>
              <input
                id="eventbrite_email"
                type="email"
                value={formData.eventbrite_email}
                onChange={(e) => handleChange('eventbrite_email', e.target.value)}
                placeholder="artist@email.com"
                className={contactFieldClass()}
              />
            </div>

            <div>
              <label htmlFor="venmo_handle" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90">
                Venmo Handle
              </label>
              <input
                id="venmo_handle"
                type="text"
                value={formData.venmo_handle}
                onChange={(e) => handleChange('venmo_handle', e.target.value)}
                placeholder="@username"
                className={contactFieldClass()}
              />
            </div>

            <div>
              <label htmlFor="paypal_email" className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90">
                PayPal Email
              </label>
              <input
                id="paypal_email"
                type="email"
                value={formData.paypal_email}
                onChange={(e) => handleChange('paypal_email', e.target.value)}
                className={contactFieldClass()}
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-foreground text-sm font-medium mb-1.5 dark:text-foreground/90">
              Categories
            </label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className={cn(
                  contactFieldClass(),
                  'text-left flex items-center justify-between hover:brightness-105'
                )}
              >
                <span className={formData.categories.length > 0 ? 'text-foreground' : 'text-foreground/40'}>
                  {formData.categories.length > 0
                    ? `${formData.categories.length} selected`
                    : 'Select categories...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-foreground/50 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoryDropdownOpen && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-muted border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {organizationCategories.length > 0 ? (
                    organizationCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryToggle(category.name)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-background/10 transition-colors"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          formData.categories.includes(category.name) ? 'bg-primary/50 border-primary' : 'border-border'
                        }`}>
                          {formData.categories.includes(category.name) && <Check className="w-3 h-3 text-foreground" strokeWidth={3} />}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-sm ${
                            formData.categories.includes(category.name)
                              ? 'category-sequence-badge font-semibold'
                              : 'text-foreground/70 bg-background/5 font-medium'
                          }`}
                          style={
                            formData.categories.includes(category.name)
                              ? getCategorySequenceBadgeStyle(category.color)
                              : undefined
                          }
                        >
                          {category.icon && <span>{category.icon}</span>}
                          {category.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-foreground/40">
                      No categories available. Please add categories in the Event Wizard.
                    </div>
                  )}
                </div>
              )}
            </div>
            {formData.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.categories.map(cat => {
                  const category = organizationCategories.find(c => c.name === cat);
                  const categoryColor = category?.color || '#9054e3';
                  return (
                    <span
                      key={cat}
                      className="category-sequence-badge px-2 py-0.5 rounded text-xs flex items-center gap-1.5 font-semibold"
                      style={getCategorySequenceBadgeStyle(categoryColor)}
                    >
                      {category?.icon && <span className="text-[10px]">{category.icon}</span>}
                      {cat}
                      <button type="button" onClick={() => handleCategoryToggle(cat)} className="hover:opacity-80">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-foreground text-sm font-medium mb-2 dark:text-foreground/90">
              Tags
            </label>
            <div className="relative">
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
                  className={cn(contactFieldClass(), 'flex-1')}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-primary/20 hover:bg-primary/30 text-violet-950 dark:text-primary text-sm rounded-lg transition-colors flex items-center gap-2 border border-primary/30"
                >
                  Add
                </button>
              </div>
              {tagInput.length > 0 && availableTags.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !formData.tags.includes(t)).length > 0 && (
                <div className="absolute left-0 right-16 z-10 bg-muted border border-border rounded-lg shadow-xl max-h-32 overflow-y-auto">
                  {availableTags
                    .filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !formData.tags.includes(t))
                    .slice(0, 5)
                    .map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                          setTagInput('');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-foreground/80 hover:bg-background/10 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                </div>
              )}
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary/20 text-violet-950 dark:text-primary rounded-full text-xs flex items-center gap-1.5 border border-primary/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-violet-800 dark:hover:text-primary/90"
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
            <label htmlFor="notes" className="block text-foreground text-sm font-medium mb-2 dark:text-foreground/90">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add notes..."
              rows={3}
              className={cn(contactFieldClass(), 'resize-none min-h-[100px]')}
            />
          </div>

          {/* Validation Note */}
          <p className="text-xs text-foreground/50 italic">
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
              className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg border border-border text-foreground/90 hover:bg-background/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 text-sm font-semibold rounded-lg voxxy-btn-cta hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                  Adding Contact...
                </span>
              ) : (
                'Add Contact'
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
