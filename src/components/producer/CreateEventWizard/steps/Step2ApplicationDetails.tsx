import { Plus, X } from 'lucide-react';
import { WizardStepProps, ApplicationRow } from '../types';

const MAX_APPLICATIONS = 20;

export default function Step2ApplicationDetails({
  wizardState,
  updateWizardState,
  errors,
  setErrors,
}: WizardStepProps) {
  const { applicationDetails } = wizardState;

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

  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Application Details</h2>
          <p className="text-white/60 text-sm mt-1">
            Create vendor booth types with pricing
          </p>
        </div>

        {/* Create Vendor Application Types Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Create Vendor Application Types *
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Add different booth types with pricing. At least one is required.
          </p>

          {/* Application Rows */}
          <div className="space-y-4">
            {applicationDetails.applications.length === 0 ? (
              <div className="text-center py-8 bg-white/5 rounded-lg border border-dashed border-white/20">
                <p className="text-white/60 mb-4">No application types yet</p>
                <button
                  type="button"
                  onClick={addApplicationRow}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Application Type
                </button>
              </div>
            ) : (
              <>
                {applicationDetails.applications.map((app, index) => (
                  <div
                    key={app.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-4"
                  >
                    {/* Row Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-white/90 font-medium">
                        Application Type #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeApplicationRow(app.id)}
                        className="text-white/60 hover:text-red-400 transition-colors"
                        aria-label="Remove application type"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Title */}
                    <div>
                      <label
                        htmlFor={`app_name_${app.id}`}
                        className="block text-white/90 text-sm font-medium mb-2"
                      >
                        Title *
                      </label>
                      <input
                        id={`app_name_${app.id}`}
                        type="text"
                        value={app.name}
                        onChange={(e) => handleApplicationChange(app.id, 'name', e.target.value)}
                        placeholder="e.g., Artist Booth, Food Vendor, Craft Booth"
                        className={`w-full px-3 py-2 rounded-lg bg-white/5 border ${
                          errors[`application_${app.id}_name`]
                            ? 'border-red-500'
                            : 'border-white/10'
                        } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                      />
                      {errors[`application_${app.id}_name`] && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors[`application_${app.id}_name`]}
                        </p>
                      )}
                    </div>

                    {/* Booth Price */}
                    <div>
                      <label
                        htmlFor={`app_price_${app.id}`}
                        className="block text-white/90 text-sm font-medium mb-2"
                      >
                        Booth Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
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
                          className={`w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border ${
                            errors[`application_${app.id}_booth_price`]
                              ? 'border-red-500'
                              : 'border-white/10'
                          } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                        />
                      </div>
                      {errors[`application_${app.id}_booth_price`] && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors[`application_${app.id}_booth_price`]}
                        </p>
                      )}
                    </div>

                    {/* Description (Optional) */}
                    <div>
                      <label
                        htmlFor={`app_desc_${app.id}`}
                        className="block text-white/90 text-sm font-medium mb-2"
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
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>
                ))}

                {/* Add Another Button */}
                {applicationDetails.applications.length < MAX_APPLICATIONS && (
                  <button
                    type="button"
                    onClick={addApplicationRow}
                    className="w-full py-3 rounded-lg border border-dashed border-white/20 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Application Type
                  </button>
                )}

                {applicationDetails.applications.length >= MAX_APPLICATIONS && (
                  <p className="text-center text-white/50 text-sm">
                    Maximum of {MAX_APPLICATIONS} application types reached
                  </p>
                )}
              </>
            )}
          </div>

          {/* General error for applications */}
          {errors.applications && (
            <p className="mt-2 text-sm text-red-400">{errors.applications}</p>
          )}
        </div>
      </div>
    </div>
  );
}
