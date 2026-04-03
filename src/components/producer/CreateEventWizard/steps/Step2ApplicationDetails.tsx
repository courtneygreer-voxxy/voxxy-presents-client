import { useState, useEffect } from 'react';
import { Tag, Zap, Plus, X } from 'lucide-react';
import { WizardStepProps, ApplicationRow } from '../types';
import { Category } from '@/types/category';
import { categoriesApi } from '@/services/api';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { isDevOrStaging } from '@/config/environments';
import { DebugPanel } from '../../DebugPanel';

interface Step2Props extends WizardStepProps {
  organizationId: number;
}

/**
 * Step2ApplicationDetails - Category selection and booth configuration
 *
 * Second step of the event creation wizard. Allows producers to select vendor
 * categories and configure booth pricing with smart pre-fill from previous events.
 *
 * Features:
 * - Select vendor categories from organization's saved categories
 * - **Smart Pre-fill**: Auto-populates booth pricing and details from previous events
 * - Shows "Pre-filled from [Event Name]" indicator when using defaults
 * - One-click to clear pre-filled data
 * - Inline category creation without leaving wizard
 * - Configure booth price, description, install times, payment links per category
 * - Application deadline and payment deadline configuration
 * - Dev mode prefill for testing
 *
 * Smart Pre-fill Logic:
 * - Uses category.default_booth_price if available
 * - Shows category.last_used_event_name as source
 * - Pre-fills install times, payment links, tags from category defaults
 * - NO API call needed - uses cached category data from initial fetch
 *
 * Validation Rules:
 * - Application deadline required (must be before event date)
 * - At least 1 category required
 * - Each category must have unique name
 * - Booth price must be greater than $0 per category
 *
 * @param {Step2Props} props - Wizard state and organization context
 * @param {WizardState} props.wizardState - Current wizard state
 * @param {Function} props.updateWizardState - Function to update wizard state
 * @param {number} props.organizationId - Current organization ID
 * @param {Record<string, string>} props.errors - Validation errors
 * @param {Function} props.setErrors - Function to set validation errors
 * @param {boolean} props.isAdmin - Whether user is admin (shows debug panel)
 *
 * @returns {JSX.Element} Step 2 form with category selection and configuration
 */
export default function Step2ApplicationDetails({
  wizardState,
  updateWizardState,
  errors,
  setErrors,
  isAdmin,
  organizationId,
}: Step2Props) {
  const { applicationDetails, eventDetails } = wizardState;

  // Local state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createCategoryError, setCreateCategoryError] = useState('');

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [organizationId]);

  // Sync selectedCategoryIds with applications
  useEffect(() => {
    const categoryIds = applicationDetails.applications
      .filter(app => app.category_id)
      .map(app => app.category_id!);
    setSelectedCategoryIds(categoryIds);
  }, [applicationDetails.applications]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoriesApi.getAll(organizationId, true);
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle category toggle
  const toggleCategory = (categoryId: number) => {
    const isSelected = selectedCategoryIds.includes(categoryId);
    const newSelectedIds = isSelected
      ? selectedCategoryIds.filter(id => id !== categoryId)
      : [...selectedCategoryIds, categoryId];

    handleCategoryChange(newSelectedIds);
  };

  // Handle category selection changes
  const handleCategoryChange = (categoryIds: number[]) => {
    const newApps: ApplicationRow[] = [];

    // Keep existing applications for still-selected categories
    for (const catId of categoryIds) {
      const existingApp = applicationDetails.applications.find(app => app.category_id === catId);
      const category = categories.find(c => c.id === catId);

      if (existingApp) {
        // Keep existing application data
        newApps.push(existingApp);
      } else if (category) {
        // Create new application using category defaults (no API call!)
        const hasDefaults = category.default_booth_price && category.default_booth_price > 0;
        const installDate = eventDetails.payment_deadline || '';

        newApps.push({
          id: crypto.randomUUID(),
          category_id: category.id,
          category_name: category.name,
          category_color: category.color,
          category_icon: category.icon,
          category_email_campaign_template_id: category.email_campaign_template_id,
          name: category.name,
          booth_price: category.default_booth_price || 0,
          description: category.default_description || '',
          install_date: installDate,
          install_start_time: category.default_install_start_time || '',
          install_end_time: category.default_install_end_time || '',
          payment_link: category.default_payment_link || '',
          application_tags: category.default_application_tags || [],
          // Track where pre-filled data came from
          prefilled_from_event: hasDefaults ? category.last_used_event_name : undefined,
          prefilled_from_event_id: hasDefaults ? category.last_used_event_id : undefined,
        });
      }
    }

    updateWizardState({
      applicationDetails: {
        applications: newApps,
      },
    });

    setSelectedCategoryIds(categoryIds);
  };

  // Handle creating new category inline
  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) {
      setCreateCategoryError('Category name is required');
      return;
    }

    try {
      setCreateCategoryError('');
      const newCategory = await categoriesApi.create(organizationId, {
        name: newCategoryName.trim(),
      });

      // Add to categories list
      setCategories(prev => [...prev, newCategory]);

      // Auto-select the new category (no longer async)
      toggleCategory(newCategory.id);

      // Reset form
      setNewCategoryName('');
      setIsCreatingCategory(false);
    } catch (error: any) {
      setCreateCategoryError(error.message || 'Failed to create category');
    }
  };

  // Handle application field changes
  const handleApplicationChange = (
    id: string,
    field: keyof ApplicationRow,
    value: string | number
  ) => {
    const updatedApplications = applicationDetails.applications.map((app) =>
      app.id === id ? { ...app, [field]: value } : app
    );

    updateWizardState({
      applicationDetails: {
        applications: updatedApplications,
      },
    });

    // Clear related errors
    const errorKey = `application_${id}_${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  // Handle deadline changes
  const handleDeadlineChange = (field: 'application_deadline' | 'payment_deadline', value: string) => {
    updateWizardState({
      eventDetails: {
        ...eventDetails,
        [field]: value,
      },
    });

    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Tag management
  const addTag = (appId: string) => {
    const tagValue = tagInputs[appId]?.trim();
    if (!tagValue) return;

    const app = applicationDetails.applications.find((a) => a.id === appId);
    if (!app) return;

    const currentTags = app.application_tags || [];
    if (currentTags.includes(tagValue)) return;

    const updatedApplications = applicationDetails.applications.map((a) =>
      a.id === appId
        ? { ...a, application_tags: [...currentTags, tagValue] }
        : a
    );

    updateWizardState({
      applicationDetails: {
        applications: updatedApplications,
      },
    });

    setTagInputs((prev) => ({ ...prev, [appId]: '' }));
  };

  const removeTag = (appId: string, tagToRemove: string) => {
    const app = applicationDetails.applications.find((a) => a.id === appId);
    if (!app) return;

    const updatedTags = (app.application_tags || []).filter((tag) => tag !== tagToRemove);

    const updatedApplications = applicationDetails.applications.map((a) =>
      a.id === appId ? { ...a, application_tags: updatedTags } : a
    );

    updateWizardState({
      applicationDetails: {
        applications: updatedApplications,
      },
    });
  };

  // Clear pre-filled data for an application
  const clearPrefilledData = (appId: string) => {
    const app = applicationDetails.applications.find((a) => a.id === appId);
    if (!app) return;

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
          }
        : a
    );

    updateWizardState({
      applicationDetails: {
        applications: updatedApplications,
      },
    });
  };

  // DEV: Prefill test data
  const handlePrefill = async () => {
    // Create test categories if needed
    const testCategoryNames = ['Food Vendor', 'Artist', 'Sponsor'];
    const createdCategories: Category[] = [];

    for (const name of testCategoryNames) {
      const existing = categories.find(c => c.name === name);
      if (existing) {
        createdCategories.push(existing);
      } else {
        try {
          const newCat = await categoriesApi.create(organizationId, { name });
          createdCategories.push(newCat);
          setCategories(prev => [...prev, newCat]);
        } catch (error) {
          console.error('Failed to create test category:', error);
        }
      }
    }

    // Calculate dates
    const eventDate = eventDetails.event_date
      ? new Date(eventDetails.event_date)
      : new Date();
    const today = new Date();
    const applicationDeadline = new Date(eventDate);
    applicationDeadline.setDate(eventDate.getDate() - 14);
    if (applicationDeadline < today) {
      applicationDeadline.setDate(today.getDate() + 7);
    }

    const paymentDeadline = new Date(eventDate);
    paymentDeadline.setDate(eventDate.getDate() - 7);
    if (paymentDeadline < today) {
      paymentDeadline.setDate(today.getDate() + 3);
    }

    const installDate = new Date(eventDate);
    installDate.setDate(eventDate.getDate() - 1);

    // Create applications for test categories
    const sampleApplications: ApplicationRow[] = createdCategories.map((cat, idx) => ({
      id: crypto.randomUUID(),
      category_id: cat.id,
      category_name: cat.name,
      name: cat.name,
      booth_price: [350, 200, 500][idx] || 200,
      description: ['Full food service booth', 'Standard 10x10 booth', 'Premium corner booth'][idx] || '',
      install_date: installDate.toISOString().split('T')[0],
      install_start_time: '08:00',
      install_end_time: '10:00',
      payment_link: '',
      application_tags: [],
    }));

    updateWizardState({
      eventDetails: {
        ...eventDetails,
        application_deadline: applicationDeadline.toISOString().split('T')[0],
        payment_deadline: paymentDeadline.toISOString().split('T')[0],
      },
      applicationDetails: {
        applications: sampleApplications,
      },
    });

    setErrors({});
  };

  return (
    <div className="space-y-4">
      {/* DEV: Prefill Button */}
      {isDevOrStaging() && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-200/90 font-medium">Dev Mode</span>
            </div>
            <button
              onClick={handlePrefill}
              className="px-3 py-1.5 text-xs font-medium bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-md transition-colors border border-yellow-500/30"
            >
              Prefill Test Data
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 space-y-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">Application Categories</h2>
          <p className="text-white/60 text-xs mt-0.5">
            Choose vendor categories and configure pricing for each
          </p>
        </div>

        {/* Deadlines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/80 font-medium mb-1.5">
              Application Deadline *
            </label>
            <input
              type="date"
              value={eventDetails.application_deadline}
              onChange={(e) => handleDeadlineChange('application_deadline', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
                errors.application_deadline ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
            {errors.application_deadline && (
              <p className="mt-1 text-xs text-red-500">{errors.application_deadline}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-white/80 font-medium mb-1.5">
              Payment Due Date
            </label>
            <input
              type="date"
              value={eventDetails.payment_deadline || ''}
              onChange={(e) => handleDeadlineChange('payment_deadline', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Category List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-xs text-white/80 font-medium">
                Select Application Categories *
              </label>
              <p className="text-white/50 text-xs mt-0.5">
                Click categories to add them to your event. Each will have its own pricing and details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingCategory(true)}
              className="px-3 py-1.5 text-xs rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              New Category
            </button>
          </div>

          {loadingCategories ? (
            <div className="py-8 text-center text-white/60 text-sm">Loading categories...</div>
          ) : (
            <>
              {/* New Category Form */}
              {isCreatingCategory && (
                <div className="mb-3 p-3 bg-white/5 rounded-lg border border-purple-500/30">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        setCreateCategoryError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateNewCategory();
                        }
                        if (e.key === 'Escape') {
                          setIsCreatingCategory(false);
                          setNewCategoryName('');
                          setCreateCategoryError('');
                        }
                      }}
                      placeholder="Enter category name (e.g., Food Vendor, Artist)"
                      autoFocus
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleCreateNewCategory}
                      className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCategory(false);
                        setNewCategoryName('');
                        setCreateCategoryError('');
                      }}
                      className="px-3 py-2 text-sm rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
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
                    const isSelected = selectedCategoryIds.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={`
                          relative px-4 py-3 rounded-lg border-2 transition-all text-left
                          ${isSelected
                            ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category.color || '#8B5CF6' }}
                              />
                              {category.icon && (
                                <span className="text-lg">{category.icon}</span>
                              )}
                              <span className="text-sm font-medium text-white truncate">
                                {category.name}
                              </span>
                            </div>
                            {category.usage && (
                              <p className="text-xs text-white/40">
                                Used in {category.usage.applications_count} {category.usage.applications_count === 1 ? 'application' : 'applications'}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-white/60 mb-3">No categories yet</p>
                  <p className="text-xs text-white/40">Click "New Category" to create your first one</p>
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
            <h3 className="text-sm font-semibold text-white">Configure Each Category</h3>

            {applicationDetails.applications.map((app) => {
              const category = categories.find(c => c.id === app.category_id);

              return (
                <div
                  key={app.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <CategoryBadge category={category || null} size="md" />
                  </div>

                  {/* Pre-filled Data Indicator */}
                  {app.prefilled_from_event && (
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <p className="text-xs text-blue-300">
                          Pre-filled from: <span className="font-medium">{app.prefilled_from_event}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => clearPrefilledData(app.id)}
                        className="flex-shrink-0 p-1 rounded hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 transition-colors"
                        title="Clear pre-filled data"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Booth Price */}
                  <div>
                    <label className="block text-xs text-white/80 font-medium mb-1.5">
                      Booth Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={app.booth_price || ''}
                        onChange={(e) => handleApplicationChange(app.id, 'booth_price', parseFloat(e.target.value) || 0)}
                        placeholder="150.00"
                        className={`w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-white/10 border ${
                          errors[`application_${app.id}_booth_price`] ? 'border-red-500' : 'border-white/10'
                        } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                      />
                    </div>
                    {errors[`application_${app.id}_booth_price`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`application_${app.id}_booth_price`]}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs text-white/80 font-medium mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      value={app.description}
                      onChange={(e) => handleApplicationChange(app.id, 'description', e.target.value)}
                      placeholder="Describe this booth type..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    />
                  </div>

                  {/* Install Date & Times */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-white/80 font-medium mb-1.5">
                        Install Date
                      </label>
                      <input
                        type="date"
                        value={app.install_date || ''}
                        onChange={(e) => handleApplicationChange(app.id, 'install_date', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/80 font-medium mb-1.5">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={app.install_start_time || ''}
                        onChange={(e) => handleApplicationChange(app.id, 'install_start_time', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/80 font-medium mb-1.5">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={app.install_end_time || ''}
                        onChange={(e) => handleApplicationChange(app.id, 'install_end_time', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Payment Link */}
                  <div>
                    <label className="block text-xs text-white/80 font-medium mb-1.5">
                      Payment Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={app.payment_link || ''}
                      onChange={(e) => handleApplicationChange(app.id, 'payment_link', e.target.value)}
                      placeholder="https://example.com/pay"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs text-white/80 font-medium mb-1.5">
                      Application Tags (Optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60" />
                        <input
                          type="text"
                          value={tagInputs[app.id] || ''}
                          onChange={(e) => setTagInputs(prev => ({ ...prev, [app.id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag(app.id);
                            }
                          }}
                          placeholder="e.g., handmade, food"
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => addTag(app.id)}
                        className="px-3 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5"
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
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-white text-sm"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(app.id, tag)}
                              className="text-white/70 hover:text-white transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Debug Panel */}
      <DebugPanel
        title="Step 2: Application Categories"
        data={{
          categories,
          selectedCategoryIds,
          applications: applicationDetails.applications,
          errors,
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
