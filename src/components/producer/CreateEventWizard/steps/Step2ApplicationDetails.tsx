import { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { WizardStepProps, ApplicationRow } from '../types';

const MAX_APPLICATIONS = 20;

export default function Step2ApplicationDetails({
  wizardState,
  updateWizardState,
  errors,
  setErrors,
}: WizardStepProps) {
  const { applicationDetails } = wizardState;

  // State to manage tag input values for each application
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

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
        ...applicationDetails,
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

  const addApplicationRow = () => {
    if (applicationDetails.applications.length >= MAX_APPLICATIONS) {
      return;
    }

    const newApplication: ApplicationRow = {
      id: crypto.randomUUID(),
      name: '',
      booth_price: 0,
      description: '',
      install_date: '',
      install_start_time: '',
      install_end_time: '',
      payment_link: '',
      application_tags: [],
    };

    updateWizardState({
      applicationDetails: {
        ...applicationDetails,
        applications: [...applicationDetails.applications, newApplication],
      },
    });
  };

  const removeApplicationRow = (id: string) => {
    const updatedApplications = applicationDetails.applications.filter((app) => app.id !== id);

    updateWizardState({
      applicationDetails: {
        ...applicationDetails,
        applications: updatedApplications,
      },
    });

    // Clear errors related to this application
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.includes(id)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const addTag = (appId: string) => {
    const tagValue = tagInputs[appId]?.trim();
    if (!tagValue) return;

    const app = applicationDetails.applications.find((a) => a.id === appId);
    if (!app) return;

    const currentTags = app.application_tags || [];

    // Prevent duplicate tags
    if (currentTags.includes(tagValue)) {
      return;
    }

    const updatedApplications = applicationDetails.applications.map((a) =>
      a.id === appId
        ? { ...a, application_tags: [...currentTags, tagValue] }
        : a
    );

    updateWizardState({
      applicationDetails: {
        ...applicationDetails,
        applications: updatedApplications,
      },
    });

    // Clear the input
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
        ...applicationDetails,
        applications: updatedApplications,
      },
    });
  };

  const handleDeadlineChange = (field: 'application_deadline' | 'payment_deadline', value: string) => {
    updateWizardState({
      eventDetails: {
        ...wizardState.eventDetails,
        [field]: value,
      },
    });

    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 space-y-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">Application Details</h2>
          <p className="text-white/60 text-xs mt-0.5">
            Set deadlines and create vendor booth types
          </p>
        </div>

        {/* Application Deadlines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="application_deadline" className="block text-xs text-white/80 font-medium mb-1.5">
              Application Deadline *
            </label>
            <input
              id="application_deadline"
              type="date"
              value={wizardState.eventDetails.application_deadline}
              onChange={(e) => handleDeadlineChange('application_deadline', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
                errors.application_deadline ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
            />
            {errors.application_deadline && (
              <p className="mt-1 text-xs text-red-500">{errors.application_deadline}</p>
            )}
          </div>

          <div>
            <label htmlFor="payment_due_date" className="block text-xs text-white/80 font-medium mb-1.5">
              Payment Due Date
            </label>
            <input
              id="payment_due_date"
              type="date"
              value={wizardState.eventDetails.payment_deadline || ''}
              onChange={(e) => handleDeadlineChange('payment_deadline', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
                errors.payment_deadline ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
            />
            {errors.payment_deadline && (
              <p className="mt-1 text-xs text-red-500">{errors.payment_deadline}</p>
            )}
          </div>
        </div>

        {/* Create Vendor Application Types Section */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-1.5">
            Application Categories *
          </h3>
          <p className="text-white/60 text-xs mb-3">
            Add different booth types with pricing. At least one is required.
          </p>

          {/* Application Rows */}
          <div className="space-y-3">
            {applicationDetails.applications.length === 0 ? (
              <div className="text-center py-6 bg-white/5 rounded-lg border border-dashed border-white/20">
                <p className="text-white/60 mb-3 text-sm">No application types yet</p>
                <button
                  type="button"
                  onClick={addApplicationRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Application Type
                </button>
              </div>
            ) : (
              <>
                {applicationDetails.applications.map((app, index) => (
                  <div
                    key={app.id}
                    className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-3"
                  >
                    {/* Row Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium text-sm">
                        Application Type #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeApplicationRow(app.id)}
                        className="text-white/60 hover:text-red-400 transition-colors"
                        aria-label="Remove application type"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <div>
                      <label
                        htmlFor={`app_name_${app.id}`}
                        className="block text-xs text-white/80 font-medium mb-1.5"
                      >
                        Title *
                      </label>
                      <input
                        id={`app_name_${app.id}`}
                        type="text"
                        value={app.name}
                        onChange={(e) => handleApplicationChange(app.id, 'name', e.target.value)}
                        placeholder="e.g., Artist Booth, Food Vendor, Craft Booth"
                        className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
                          errors[`application_${app.id}_name`]
                            ? 'border-red-500'
                            : 'border-white/10'
                        } text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
                      />
                      {errors[`application_${app.id}_name`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`application_${app.id}_name`]}
                        </p>
                      )}
                    </div>

                    {/* Booth Price */}
                    <div>
                      <label
                        htmlFor={`app_price_${app.id}`}
                        className="block text-xs text-white/80 font-medium mb-1.5"
                      >
                        Booth Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60 text-sm">
                          $
                        </span>
                        <input
                          id={`app_price_${app.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={app.booth_price || ''}
                          onChange={(e) =>
                            handleApplicationChange(
                              app.id,
                              'booth_price',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="150.00"
                          className={`w-full pl-7 pr-3 py-2 text-sm rounded-lg bg-white/10 border ${
                            errors[`application_${app.id}_booth_price`]
                              ? 'border-red-500'
                              : 'border-white/10'
                          } text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
                        />
                      </div>
                      {errors[`application_${app.id}_booth_price`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`application_${app.id}_booth_price`]}
                        </p>
                      )}
                    </div>

                    {/* Description (Optional) */}
                    <div>
                      <label
                        htmlFor={`app_desc_${app.id}`}
                        className="block text-xs text-white/80 font-medium mb-1.5"
                      >
                        Description (Optional)
                      </label>
                      <textarea
                        id={`app_desc_${app.id}`}
                        value={app.description}
                        onChange={(e) =>
                          handleApplicationChange(app.id, 'description', e.target.value)
                        }
                        placeholder="Describe this booth type..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                      />
                    </div>

                    {/* Install Date */}
                    <div>
                      <label
                        htmlFor={`app_install_date_${app.id}`}
                        className="block text-xs text-white/80 font-medium mb-1.5"
                      >
                        Install Date (Optional)
                      </label>
                      <p className="text-white/50 text-xs mb-1.5">
                        When vendors should arrive to set up their booth
                      </p>
                      <input
                        id={`app_install_date_${app.id}`}
                        type="date"
                        value={app.install_date || ''}
                        onChange={(e) =>
                          handleApplicationChange(app.id, 'install_date', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                    </div>

                    {/* Install Times */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor={`app_install_start_${app.id}`}
                          className="block text-xs text-white/80 font-medium mb-1.5"
                        >
                          Install Start Time
                        </label>
                        <input
                          id={`app_install_start_${app.id}`}
                          type="time"
                          value={app.install_start_time || ''}
                          onChange={(e) =>
                            handleApplicationChange(app.id, 'install_start_time', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`app_install_end_${app.id}`}
                          className="block text-xs text-white/80 font-medium mb-1.5"
                        >
                          Install End Time
                        </label>
                        <input
                          id={`app_install_end_${app.id}`}
                          type="time"
                          value={app.install_end_time || ''}
                          onChange={(e) =>
                            handleApplicationChange(app.id, 'install_end_time', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Payment Link */}
                    <div>
                      <label
                        htmlFor={`app_payment_link_${app.id}`}
                        className="block text-xs text-white/80 font-medium mb-1.5"
                      >
                        Payment Link (Optional)
                      </label>
                      <p className="text-white/50 text-xs mb-1.5">
                        URL where vendors can pay for this booth type
                      </p>
                      <input
                        id={`app_payment_link_${app.id}`}
                        type="url"
                        value={app.payment_link || ''}
                        onChange={(e) =>
                          handleApplicationChange(app.id, 'payment_link', e.target.value)
                        }
                        placeholder="https://example.com/pay"
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                    </div>

                    {/* Application Tags */}
                    <div>
                      <label
                        htmlFor={`app_tags_${app.id}`}
                        className="block text-xs text-white/80 font-medium mb-1.5"
                      >
                        Application Tags (Optional)
                      </label>
                      <p className="text-white/50 text-xs mb-1.5">
                        Add tags to help categorize this application type
                      </p>

                      {/* Tag Input with Add Button */}
                      <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                          <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60" />
                          <input
                            id={`app_tags_${app.id}`}
                            type="text"
                            value={tagInputs[app.id] || ''}
                            onChange={(e) =>
                              setTagInputs((prev) => ({ ...prev, [app.id]: e.target.value }))
                            }
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag(app.id);
                              }
                            }}
                            placeholder="e.g., handmade, food, jewelry"
                            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => addTag(app.id)}
                          className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:shadow-lg hover:shadow-purple-500/25 text-white transition-colors flex items-center gap-1.5"
                          aria-label="Add tag"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>

                      {/* Display Added Tags */}
                      {app.application_tags && app.application_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {app.application_tags.map((tag, tagIndex) => (
                            <div
                              key={tagIndex}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-white text-sm"
                            >
                              <Tag className="w-3 h-3" />
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(app.id, tag)}
                                className="text-white/70 hover:text-white transition-colors"
                                aria-label={`Remove ${tag} tag`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Another Button */}
                {applicationDetails.applications.length < MAX_APPLICATIONS && (
                  <button
                    type="button"
                    onClick={addApplicationRow}
                    className="w-full py-2.5 rounded-lg border border-dashed border-white/20 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Application Type
                  </button>
                )}

                {applicationDetails.applications.length >= MAX_APPLICATIONS && (
                  <p className="text-center text-white/50 text-xs">
                    Maximum of {MAX_APPLICATIONS} application types reached
                  </p>
                )}
              </>
            )}
          </div>

          {/* General error for applications */}
          {errors.applications && (
            <p className="mt-2 text-xs text-red-500">{errors.applications}</p>
          )}
        </div>
      </div>
    </div>
  );
}
