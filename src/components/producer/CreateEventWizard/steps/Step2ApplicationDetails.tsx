import { useState, useEffect } from 'react'
import { Tag, Zap, Plus, X } from 'lucide-react'
import { WizardStepProps, ApplicationRow, PaymentPriceType } from '../types'
import { Category } from '@/types/category'
import { categoriesApi } from '@/services/api'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { isDevOrStaging } from '@/config/environments'
import { DebugPanel } from '../../DebugPanel'

interface Step2Props extends WizardStepProps {
  organizationId: number
}

/**
 * Step2ApplicationDetails - Applicant category selection and details
 *
 * Second step of the event creation wizard. Allows producers to select applicant
 * categories and configure details with smart pre-fill from previous events.
 * Pricing/payment configuration has moved to Step 3 (PaymentConfig).
 *
 * Features:
 * - Select applicant categories from organization's saved categories
 * - **Smart Pre-fill**: Auto-populates details from previous events
 * - Shows "Pre-filled from [Event Name]" indicator when using defaults
 * - One-click to clear pre-filled data
 * - Inline category creation without leaving wizard
 * - Configure description, install times, and tags per category
 * - Application deadline configuration
 * - Dev mode prefill for testing
 *
 * Validation Rules:
 * - Application deadline required (must be before event date)
 * - At least 1 category required
 * - Each category must have unique name
 */
export default function Step2ApplicationDetails({
  wizardState,
  updateWizardState,
  errors,
  setErrors,
  isAdmin,
  organizationId,
}: Step2Props) {
  const { applicationDetails, eventDetails } = wizardState

  // Local state
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({})
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [createCategoryError, setCreateCategoryError] = useState('')

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [organizationId])

  // Sync selectedCategoryIds with applications
  useEffect(() => {
    const categoryIds = applicationDetails.applications
      .filter((app) => app.category_id)
      .map((app) => app.category_id!)
    setSelectedCategoryIds(categoryIds)
  }, [applicationDetails.applications])

  const loadCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await categoriesApi.getAll(organizationId, true)
      setCategories(response.categories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  // Handle category toggle
  const toggleCategory = (categoryId: number) => {
    const isSelected = selectedCategoryIds.includes(categoryId)
    const newSelectedIds = isSelected
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId]

    handleCategoryChange(newSelectedIds)
  }

  // Handle category selection changes
  const handleCategoryChange = (categoryIds: number[]) => {
    const newApps: ApplicationRow[] = []

    // Keep existing applications for still-selected categories
    for (const catId of categoryIds) {
      const existingApp = applicationDetails.applications.find((app) => app.category_id === catId)
      const category = categories.find((c) => c.id === catId)

      if (existingApp) {
        // Keep existing application data
        newApps.push(existingApp)
      } else if (category) {
        // Create new application using category values with precedence logic
        // Precedence: manual booth_price > default_booth_price (from last event) > 0
        const boothPrice = category.booth_price ?? category.default_booth_price ?? 0
        const description = category.description || category.default_description || ''

        // Only show "Pre-filled from..." if using smart defaults (not manually set values)
        const usingSmartDefaults =
          !category.booth_price && category.default_booth_price && category.default_booth_price > 0

        // Default install_date to event date (installs typically happen day-of)
        const installDateDefault = eventDetails.event_date || ''

        newApps.push({
          id: crypto.randomUUID(),
          category_id: category.id,
          category_name: category.name,
          category_color: category.color,
          category_icon: category.icon,
          category_email_campaign_template_id: category.email_campaign_template_id,
          name: category.name,
          booth_price: boothPrice, // Kept for backward compat with backend
          description: description,
          install_date: installDateDefault,
          install_start_time: category.default_install_start_time || '',
          install_end_time: category.default_install_end_time || '',
          payment_link: category.default_payment_link || '', // Legacy, now per-engine in Step 3
          application_tags: category.default_application_tags || [],
          // Track where pre-filled data came from (only for smart defaults, not manual values)
          prefilled_from_event: usingSmartDefaults ? category.last_used_event_name : undefined,
          prefilled_from_event_id: usingSmartDefaults ? category.last_used_event_id : undefined,
          // Payment config initialized for Step 3
          // If category has saved payment_preferences, use them as the starting point
          payment_prices:
            category.payment_preferences && category.payment_preferences.length > 0
              ? category.payment_preferences.map((pref) => ({
                  type: pref.type as PaymentPriceType,
                  label: pref.label,
                  amount: pref.amount,
                  is_percentage: pref.is_percentage,
                }))
              : [
                  {
                    type: 'booth_price' as PaymentPriceType,
                    label: 'Booth Fee',
                    amount: boothPrice,
                    is_percentage: false,
                  },
                ],
          payment_engines: [],
        })
      }
    }

    updateWizardState({
      applicationDetails: {
        applications: newApps,
      },
    })

    setSelectedCategoryIds(categoryIds)
  }

  // Handle creating new category inline
  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) {
      setCreateCategoryError('Category name is required')
      return
    }

    try {
      setCreateCategoryError('')
      const newCategory = await categoriesApi.create(organizationId, {
        name: newCategoryName.trim(),
      })

      // Add to categories list
      setCategories((prev) => [...prev, newCategory])

      // Auto-select the new category (no longer async)
      toggleCategory(newCategory.id)

      // Reset form
      setNewCategoryName('')
      setIsCreatingCategory(false)
    } catch (error: any) {
      setCreateCategoryError(error.message || 'Failed to create category')
    }
  }

  // Handle application field changes
  const handleApplicationChange = (
    id: string,
    field: keyof ApplicationRow,
    value: string | number,
  ) => {
    const updatedApplications = applicationDetails.applications.map((app) =>
      app.id === id ? { ...app, [field]: value } : app,
    )

    updateWizardState({
      applicationDetails: {
        applications: updatedApplications,
      },
    })

    // Clear related errors
    const errorKey = `application_${id}_${field}`
    if (errors[errorKey]) {
      const newErrors = { ...errors }
      delete newErrors[errorKey]
      setErrors(newErrors)
    }
  }

  // Handle application deadline change
  const handleDeadlineChange = (value: string) => {
    updateWizardState({
      eventDetails: {
        ...eventDetails,
        application_deadline: value,
      },
    })

    if (errors.application_deadline) {
      const newErrors = { ...errors }
      delete newErrors.application_deadline
      setErrors(newErrors)
    }
  }

  // Tag management
  const addTag = (appId: string) => {
    const tagValue = tagInputs[appId]?.trim()
    if (!tagValue) return

    const app = applicationDetails.applications.find((a) => a.id === appId)
    if (!app) return

    const currentTags = app.application_tags || []
    if (currentTags.includes(tagValue)) return

    const updatedApplications = applicationDetails.applications.map((a) =>
      a.id === appId ? { ...a, application_tags: [...currentTags, tagValue] } : a,
    )

    updateWizardState({
      applicationDetails: {
        applications: updatedApplications,
      },
    })

    setTagInputs((prev) => ({ ...prev, [appId]: '' }))
  }

  const removeTag = (appId: string, tagToRemove: string) => {
    const app = applicationDetails.applications.find((a) => a.id === appId)
    if (!app) return

    const updatedTags = (app.application_tags || []).filter((tag) => tag !== tagToRemove)

    const updatedApplications = applicationDetails.applications.map((a) =>
      a.id === appId ? { ...a, application_tags: updatedTags } : a,
    )

    updateWizardState({
      applicationDetails: {
        applications: updatedApplications,
      },
    })
  }

  // Clear pre-filled data for an application
  const clearPrefilledData = (appId: string) => {
    const app = applicationDetails.applications.find((a) => a.id === appId)
    if (!app) return

    const updatedApplications = applicationDetails.applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            name: a.category_name || '',
            booth_price: 0,
            description: '',
            install_date: '',
            install_start_time: '',
            install_end_time: '',
            payment_link: '',
            application_tags: [],
            prefilled_from_event: undefined,
            prefilled_from_event_id: undefined,
            payment_prices: [
              { type: 'booth_price' as const, label: 'Booth Fee', amount: 0, is_percentage: false },
            ],
            payment_engines: [],
          }
        : a,
    )

    updateWizardState({
      applicationDetails: {
        applications: updatedApplications,
      },
    })
  }

  // DEV: Prefill test data
  const handlePrefill = async () => {
    // Create test categories if needed
    const testCategoryNames = ['Food Vendor', 'Artist', 'Sponsor']
    const createdCategories: Category[] = []

    for (const name of testCategoryNames) {
      const existing = categories.find((c) => c.name === name)
      if (existing) {
        createdCategories.push(existing)
      } else {
        try {
          const newCat = await categoriesApi.create(organizationId, { name })
          createdCategories.push(newCat)
          setCategories((prev) => [...prev, newCat])
        } catch (error) {
          console.error('Failed to create test category:', error)
        }
      }
    }

    // Calculate dates
    const eventDate = eventDetails.event_date ? new Date(eventDetails.event_date) : new Date()
    const today = new Date()
    const applicationDeadline = new Date(eventDate)
    applicationDeadline.setDate(eventDate.getDate() - 14)
    if (applicationDeadline < today) {
      applicationDeadline.setDate(today.getDate() + 7)
    }

    const paymentDeadline = new Date(eventDate)
    paymentDeadline.setDate(eventDate.getDate() - 7)
    if (paymentDeadline < today) {
      paymentDeadline.setDate(today.getDate() + 3)
    }

    const installDate = new Date(eventDate)
    installDate.setDate(eventDate.getDate() - 1)

    // Create applications for test categories
    const boothPrices = [350, 200, 500]
    const sampleApplications: ApplicationRow[] = createdCategories.map((cat, idx) => ({
      id: crypto.randomUUID(),
      category_id: cat.id,
      category_name: cat.name,
      name: cat.name,
      booth_price: boothPrices[idx] || 200,
      description:
        ['Full food service booth', 'Standard 10x10 booth', 'Premium corner booth'][idx] || '',
      install_date: installDate.toISOString().split('T')[0],
      install_start_time: '08:00',
      install_end_time: '10:00',
      payment_link: '',
      application_tags: [],
      payment_prices: [
        {
          type: 'booth_price' as const,
          label: 'Booth Fee',
          amount: boothPrices[idx] || 200,
          is_percentage: false,
        },
      ],
      payment_engines: [],
    }))

    updateWizardState({
      eventDetails: {
        ...eventDetails,
        application_deadline: applicationDeadline.toISOString().split('T')[0],
      },
      paymentConfiguration: {
        ...wizardState.paymentConfiguration,
        payment_deadline: paymentDeadline.toISOString().split('T')[0],
      },
      applicationDetails: {
        applications: sampleApplications,
      },
    })

    setErrors({})
  }

  return (
    <div className="space-y-4">
      {/* DEV: Prefill Button */}
      {isDevOrStaging() && (
        <div className="rounded-lg border border-amber-400/60 bg-amber-50 p-3 dark:border-yellow-500/35 dark:bg-yellow-500/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-700 dark:text-yellow-400 shrink-0" />
              <span className="text-xs font-medium text-amber-950 dark:text-yellow-200">
                Dev Mode
              </span>
            </div>
            <button
              onClick={handlePrefill}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors border border-amber-600/40 bg-amber-100 text-amber-950 hover:bg-amber-200/90 dark:border-yellow-500/40 dark:bg-yellow-500/20 dark:text-yellow-100 dark:hover:bg-yellow-500/30"
            >
              Prefill Test Data
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Applicant Categories</h2>
          <p className="text-foreground/60 text-xs mt-0.5">
            Choose applicant categories and configure details for each. Pricing is set in the next
            step.
          </p>
        </div>

        {/* Category List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-xs text-foreground/80 font-medium">
                Select Application Categories *
              </label>
              <p className="text-foreground/50 text-xs mt-0.5">
                Click categories to add them to your event. Each will have its own pricing and
                details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingCategory(true)}
              className="px-3 py-1.5 text-xs rounded-lg voxxy-btn-solid transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              New Category
            </button>
          </div>

          {loadingCategories ? (
            <div className="py-8 text-center text-foreground/60 text-sm">Loading categories...</div>
          ) : (
            <>
              {/* New Category Form */}
              {isCreatingCategory && (
                <div className="mb-3 p-3 bg-background/5 rounded-lg border border-primary/30">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value)
                        setCreateCategoryError('')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCreateNewCategory()
                        }
                        if (e.key === 'Escape') {
                          setIsCreatingCategory(false)
                          setNewCategoryName('')
                          setCreateCategoryError('')
                        }
                      }}
                      placeholder="Enter category name (e.g., Food Vendor, Artist)"
                      autoFocus
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleCreateNewCategory}
                      className="px-4 py-2 text-sm rounded-lg voxxy-btn-solid transition-colors"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCategory(false)
                        setNewCategoryName('')
                        setCreateCategoryError('')
                      }}
                      className="px-3 py-2 text-sm rounded-lg bg-background/5 hover:bg-background/10 text-foreground/70 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  {createCategoryError && (
                    <p className="mt-2 text-xs text-red-400">{createCategoryError}</p>
                  )}
                </div>
              )}

              {/* Categories Grid */}
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {categories.map((category) => {
                    const isSelected = selectedCategoryIds.includes(category.id)
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={`
                          relative px-4 py-3 rounded-lg border-2 transition-all text-left
                          ${
                            isSelected
                              ? 'border-primary bg-primary/20 shadow-lg shadow-primary/20'
                              : 'border-border bg-background/5 hover:border-border hover:bg-background/10'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category.color || '#9054e3' }}
                              />
                              {category.icon && <span className="text-lg">{category.icon}</span>}
                              <span className="text-sm font-medium text-foreground truncate">
                                {category.name}
                              </span>
                            </div>
                            {category.usage && (
                              <p className="text-xs text-foreground/40">
                                Used in {category.usage.applications_count}{' '}
                                {category.usage.applications_count === 1
                                  ? 'application'
                                  : 'applications'}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full voxxy-accent-tile flex items-center justify-center">
                              <span className="text-foreground text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-foreground/60 mb-3">No categories yet</p>
                  <p className="text-xs text-foreground/40">
                    Click "New Category" to create your first one
                  </p>
                </div>
              )}
            </>
          )}

          {errors.applications && (
            <p className="mt-2 text-xs text-red-500">{errors.applications}</p>
          )}
        </div>

        {/* Application Configuration Forms (one per selected category) */}
        {applicationDetails.applications.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-semibold text-foreground">Configure Each Category</h3>

            {applicationDetails.applications.map((app) => {
              const category = categories.find((c) => c.id === app.category_id)

              return (
                <div
                  key={app.id}
                  className="bg-background/5 rounded-lg p-4 border border-border space-y-3"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <CategoryBadge category={category || null} size="md" />
                  </div>

                  {/* Pre-filled Data Indicator */}
                  {app.prefilled_from_event && (
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <p className="text-xs text-blue-300">
                          Pre-filled from:{' '}
                          <span className="font-medium">{app.prefilled_from_event}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => clearPrefilledData(app.id)}
                        className="flex-shrink-0 p-1 rounded hover:bg-blue-500/20 text-blue-950 dark:text-blue-300 hover:text-blue-200 transition-colors"
                        title="Clear pre-filled data"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      value={app.description}
                      onChange={(e) =>
                        handleApplicationChange(app.id, 'description', e.target.value)
                      }
                      placeholder="Describe this booth type..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  {/* Install Date & Times */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                        Install Date
                      </label>
                      <input
                        type="date"
                        value={app.install_date || ''}
                        onChange={(e) =>
                          handleApplicationChange(app.id, 'install_date', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={app.install_start_time || ''}
                        onChange={(e) =>
                          handleApplicationChange(app.id, 'install_start_time', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={app.install_end_time || ''}
                        onChange={(e) =>
                          handleApplicationChange(app.id, 'install_end_time', e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs text-foreground/80 font-medium mb-1.5">
                      Application Tags (Optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/60" />
                        <input
                          type="text"
                          value={tagInputs[app.id] || ''}
                          onChange={(e) =>
                            setTagInputs((prev) => ({ ...prev, [app.id]: e.target.value }))
                          }
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag(app.id)
                            }
                          }}
                          placeholder="e.g., handmade, food"
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-background/10 border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => addTag(app.id)}
                        className="px-3 py-2 text-sm rounded-lg voxxy-btn-solid transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>

                    {app.application_tags && app.application_tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {app.application_tags.map((tag, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-foreground text-sm"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(app.id, tag)}
                              className="text-foreground/70 hover:text-foreground transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Debug Panel */}
      <DebugPanel
        title="Step 2: Applicant Categories"
        data={{
          categories,
          selectedCategoryIds,
          applications: applicationDetails.applications,
          errors,
        }}
        isAdmin={isAdmin}
      />
    </div>
  )
}
