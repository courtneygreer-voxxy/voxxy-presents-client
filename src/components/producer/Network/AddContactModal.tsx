import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { vendorContactsApi, categoriesApi, VendorContact } from '@/services/api'
import type { Category } from '@/types/category'
import SimsLoadingScreen from '@/components/ui/SimsLoadingScreen'
import SuccessMessage from '@/components/ui/SuccessMessage'
import { getCategorySequenceBadgeStyle } from '@/lib/categoryBadgeStyles'
import { cn } from '@/lib/utils'
import TagInput from './TagInput'

interface AddContactModalProps {
  organizationId: number
  onClose: () => void
  onSuccess: (contact: VendorContact) => void
}

export default function AddContactModal({
  organizationId,
  onClose,
  onSuccess,
}: AddContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [organizationCategories, setOrganizationCategories] = useState<Category[]>([])

  const contactFieldClass = (field?: string) =>
    cn(
      'voxxy-input-frost w-full px-3 py-2.5 text-sm rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all',
      field && errors[field] && 'border-red-500 ring-1 ring-red-500/35',
    )

  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch organization's official categories
    categoriesApi
      .getAll(organizationId)
      .then((response) => {
        setOrganizationCategories(response.categories || [])
      })
      .catch(() => {})

    // Fetch available tags from filter options
    vendorContactsApi
      .getFilterOptions(organizationId)
      .then((options) => {
        setAvailableTags(options.tags || [])
      })
      .catch(() => {})
  }, [organizationId])

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    instagram_handle: '',
    tiktok_handle: '',
    website: '',
    affiliation: '',
    categories: [] as string[],
    tags: [] as string[],
    notes: '',
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required and must be unique'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate URL if provided
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Portfolio URL must start with http:// or https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const newContact = await vendorContactsApi.create(organizationId, {
        first_name: formData.first_name,
        last_name: formData.last_name || undefined,
        email: formData.email,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
        instagram_handle: formData.instagram_handle || undefined,
        tiktok_handle: formData.tiktok_handle || undefined,
        website: formData.website || undefined,
        affiliation: formData.affiliation || undefined,
        categories: formData.categories,
        tags: formData.tags,
        notes: formData.notes || undefined,
        contact_type: 'vendor',
        source: 'manual',
      })

      // Show success screen
      setShowSuccess(true)

      // Auto-close after 2 seconds
      setTimeout(() => {
        onSuccess(newContact)
        onClose()
      }, 2000)
    } catch (error: any) {
      const newErrors: Record<string, string> = {}
      const serverErrors: string[] = error.errors || []

      // Map backend validation errors to specific form fields
      for (const msg of serverErrors) {
        const lower = msg.toLowerCase()
        if (lower.includes('email')) {
          newErrors.email = msg
        } else if (lower.includes('phone')) {
          newErrors.phone = msg
        } else if (lower.includes('name')) {
          newErrors.first_name = msg
        } else if (lower.includes('website') || lower.includes('url')) {
          newErrors.website = msg
        } else if (lower.includes('instagram')) {
          newErrors.instagram_handle = msg
        } else if (lower.includes('tiktok')) {
          newErrors.tiktok_handle = msg
        } else {
          // Catch-all for unmapped errors
          newErrors.submit = newErrors.submit ? `${newErrors.submit}; ${msg}` : msg
        }
      }

      // Fallback if no server errors were parsed
      if (Object.keys(newErrors).length === 0) {
        newErrors.submit = error.message || 'Failed to create contact'
      }

      setErrors(newErrors)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="voxxy-overlay-scrim fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="voxxy-modal-surface rounded-xl w-full max-w-2xl max-h-[82vh] flex flex-col">
        {/* Header */}
        <div className="voxxy-gradient-modal-header px-5 py-3 flex items-center justify-between border-b border-primary/20 flex-shrink-0 rounded-t-xl">
          <h2 className="text-sm font-semibold text-foreground">Add New Contact</h2>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading Screen */}
        {isSubmitting && !showSuccess && <SimsLoadingScreen message="Creating your contact..." />}

        {/* Success Screen */}
        {showSuccess && (
          <SuccessMessage
            title="Contact Added!"
            message="Your new contact has been successfully added to your network."
          />
        )}

        {/* Form - only show when not submitting or showing success */}
        {!isSubmitting && !showSuccess && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {/* Row 1: First Name, Last Name, Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-xs font-medium text-foreground/70 mb-1"
                  >
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="John"
                    className={contactFieldClass('first_name')}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-red-400">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-xs font-medium text-foreground/70 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Smith"
                    className={contactFieldClass()}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-foreground/70 mb-1"
                  >
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
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: Phone, Location, Affiliation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-medium text-foreground/70 mb-1"
                  >
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
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-xs font-medium text-foreground/70 mb-1"
                  >
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

                <div>
                  <label
                    htmlFor="affiliation"
                    className="block text-xs font-medium text-foreground/70 mb-1"
                  >
                    Affiliation
                  </label>
                  <input
                    id="affiliation"
                    type="text"
                    value={formData.affiliation}
                    onChange={(e) => handleChange('affiliation', e.target.value)}
                    placeholder="Business or group name"
                    className={contactFieldClass()}
                  />
                </div>
              </div>

              {/* Row 3: Social Media - Instagram, TikTok, Portfolio URL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="instagram_handle"
                    className="block text-xs font-medium text-foreground/70 mb-1 flex items-center gap-1.5"
                  >
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
                  <label
                    htmlFor="tiktok_handle"
                    className="block text-xs font-medium text-foreground/70 mb-1 flex items-center gap-1.5"
                  >
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
                  <label
                    htmlFor="website"
                    className="block text-xs font-medium text-foreground/70 mb-1 flex items-center gap-1.5"
                  >
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
                  {errors.website && <p className="mt-1 text-xs text-red-400">{errors.website}</p>}
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
                    className={cn(
                      contactFieldClass(),
                      'text-left flex items-center justify-between hover:brightness-105',
                    )}
                  >
                    <span
                      className={
                        formData.categories.length > 0 ? 'text-foreground' : 'text-foreground/40'
                      }
                    >
                      {formData.categories.length > 0
                        ? `${formData.categories.length} selected`
                        : 'Select categories...'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-foreground/50 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`}
                    />
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
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                formData.categories.includes(category.name)
                                  ? 'bg-primary/50 border-primary'
                                  : 'border-border'
                              }`}
                            >
                              {formData.categories.includes(category.name) && (
                                <Check className="w-3 h-3 text-foreground" strokeWidth={3} />
                              )}
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
                    {formData.categories.map((cat) => {
                      const category = organizationCategories.find((c) => c.name === cat)
                      const categoryColor = category?.color || '#9054e3'
                      return (
                        <span
                          key={cat}
                          className="category-sequence-badge px-2 py-0.5 rounded text-xs flex items-center gap-1.5 font-semibold"
                          style={getCategorySequenceBadgeStyle(categoryColor)}
                        >
                          {category?.icon && <span className="text-[10px]">{category.icon}</span>}
                          {cat}
                          <button
                            type="button"
                            onClick={() => handleCategoryToggle(cat)}
                            className="hover:opacity-80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-foreground text-sm font-medium mb-2 dark:text-foreground/90">
                  Tags
                </label>
                <TagInput
                  value={formData.tags}
                  onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
                  availableTags={availableTags}
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-foreground text-sm font-medium mb-2 dark:text-foreground/90"
                >
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
                    Adding...
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
  )
}
