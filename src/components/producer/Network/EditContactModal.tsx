import { useState, useEffect, useRef } from 'react';
import { X, Plus, ChevronDown, Check, Calendar, History, TrendingUp } from 'lucide-react';
import { vendorContactsApi, categoriesApi, VendorContact } from '@/services/api';
import type { Category } from '@/types/category';
import { getCategorySequenceBadgeStyle } from '@/lib/categoryBadgeStyles';

interface EditContactModalProps {
  organizationId: number;
  contact: VendorContact;
  onClose: () => void;
  onSuccess: (contact: VendorContact) => void;
}

export default function EditContactModal({ organizationId, contact, onClose, onSuccess }: EditContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [organizationCategories, setOrganizationCategories] = useState<Category[]>([]);
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
    contact_name: contact.contact_name,
    business_name: contact.business_name || '',
    email: contact.email,
    phone: contact.phone || '',
    location: contact.location || '',
    instagram_handle: contact.instagram_handle || '',
    tiktok_handle: contact.tiktok_handle || '',
    website: contact.website || '',
    eventbrite_email: contact.eventbrite_email || '',
    venmo_handle: contact.venmo_handle || '',
    paypal_email: contact.paypal_email || '',
    categories: contact.categories || [],
    tags: contact.tags || [],
    notes: contact.notes || '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'Contact name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
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
      const updatedContact = await vendorContactsApi.update(contact.id, {
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
      });

      onSuccess(updatedContact);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to update contact' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="voxxy-overlay-scrim fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="voxxy-modal-surface rounded-xl w-full max-w-2xl max-h-[82vh] flex flex-col">
        {/* Header */}
        <div className="voxxy-gradient-modal-header px-5 py-3 flex items-center justify-between border-b border-primary/20 flex-shrink-0 rounded-t-xl">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Edit Contact</h2>
            <p className="text-foreground/50 text-[11px] mt-0.5">{contact.contact_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Row 1: Full Name, Business Name, Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="contact_name" className="block text-xs font-medium text-foreground/70 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="contact_name"
                type="text"
                value={formData.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border ${
                  errors.contact_name ? 'border-red-500' : 'border-border'
                } text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
              />
              {errors.contact_name && (
                <p className="mt-1 text-xs text-red-400">{errors.contact_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="business_name" className="block text-xs font-medium text-foreground/70 mb-1">
                Business Name
              </label>
              <input
                id="business_name"
                type="text"
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-foreground/70 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border ${
                  errors.email ? 'border-red-500' : 'border-border'
                } text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Row 2: Phone, Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-foreground/70 mb-1">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-xs font-medium text-foreground/70 mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City, State, ZIP"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Row 3: Social Media */}
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
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
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
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
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
                className={`w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border ${
                  errors.website ? 'border-red-500' : 'border-border'
                } text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-400">{errors.website}</p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="eventbrite_email" className="block text-xs font-medium text-foreground/70 mb-1">
                Eventbrite Email
              </label>
              <input
                id="eventbrite_email"
                type="email"
                value={formData.eventbrite_email}
                onChange={(e) => handleChange('eventbrite_email', e.target.value)}
                placeholder="artist@email.com"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="venmo_handle" className="block text-xs font-medium text-foreground/70 mb-1">
                Venmo Handle
              </label>
              <input
                id="venmo_handle"
                type="text"
                value={formData.venmo_handle}
                onChange={(e) => handleChange('venmo_handle', e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="paypal_email" className="block text-xs font-medium text-foreground/70 mb-1">
                PayPal Email
              </label>
              <input
                id="paypal_email"
                type="email"
                value={formData.paypal_email}
                onChange={(e) => handleChange('paypal_email', e.target.value)}
                placeholder="artist@paypal.com"
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-medium text-foreground/70 mb-1">
              Categories
            </label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-left flex items-center justify-between hover:bg-background/15 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="flex-1 px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-primary/20 hover:bg-primary/30 text-violet-950 dark:text-primary text-sm rounded-lg transition-colors flex items-center gap-2 border border-primary/30"
                >
                  <Plus className="w-3.5 h-3.5" />
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
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
            />
          </div>

          {/* Metadata */}
          <div className="bg-background/5 rounded-lg p-4 space-y-2 text-xs border border-border">
            <div className="flex justify-between text-foreground/50">
              <span>Source:</span>
              <span className="text-foreground/70 capitalize">{contact.source?.replace('_', ' ') || 'Manual'}</span>
            </div>
            <div className="flex justify-between text-foreground/50">
              <span>Interactions:</span>
              <span className="text-foreground/70">{contact.interaction_count || 0}</span>
            </div>
            {contact.last_contacted_at && (
              <div className="flex justify-between text-foreground/50">
                <span>Last Contacted:</span>
                <span className="text-foreground/70">
                  {new Date(contact.last_contacted_at).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-foreground/50">
              <span>Added:</span>
              <span className="text-foreground/70">
                {new Date(contact.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Event History Section */}
          {contact.event_history && contact.event_history.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Event Application History</h3>
                <span className="text-xs text-foreground/50">
                  ({contact.total_applications || 0} application{contact.total_applications !== 1 ? 's' : ''} • {contact.total_events || 0} event{contact.total_events !== 1 ? 's' : ''})
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {contact.event_history.map((event, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-background/20 border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">{event.event_name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                            {event.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-foreground/60">
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Applied {new Date(event.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.status === 'approved' || event.status === 'confirmed'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : event.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : event.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info Change History */}
          {contact.change_history && contact.change_history.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-foreground">Contact Information Changes</h3>
                <span className="text-xs text-foreground/50">
                  ({contact.change_history.length} change{contact.change_history.length !== 1 ? 's' : ''})
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {contact.change_history.map((change, index) => (
                  <div
                    key={index}
                    className="p-2.5 rounded-lg bg-background/10 border border-border text-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-foreground capitalize">{change.field.replace(/_/g, ' ')}</span>
                      <span className="text-foreground/50 flex-shrink-0">
                        {new Date(change.changed_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground/60">
                      <span className="line-through">{change.old_value || '(empty)'}</span>
                      <span>→</span>
                      <span className="text-green-400 font-medium">{change.new_value}</span>
                    </div>
                    <div className="mt-1 text-foreground/50">
                      via {change.event_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-xs text-red-400">{errors.submit}</p>
            </div>
          )}

        </div>
          {/* Footer */}
          <div className="px-5 py-3 border-t border-border flex justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-foreground hover:bg-background/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg voxxy-btn-cta transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-border border-t-primary rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
