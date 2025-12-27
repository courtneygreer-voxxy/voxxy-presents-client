import { WizardStepProps } from '../types';

export default function Step1EventDetails({
  wizardState,
  updateWizardState,
  errors,
  setErrors,
}: WizardStepProps) {
  const { eventDetails } = wizardState;

  const handleChange = (field: keyof typeof eventDetails, value: string) => {
    updateWizardState({
      eventDetails: {
        ...eventDetails,
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
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Event Details</h2>
          <p className="text-white/60 text-sm mt-1">
            Provide basic information about your event
          </p>
        </div>

        {/* Event Name */}
        <div>
          <label htmlFor="title" className="block text-white/90 font-medium mb-2">
            Event Name *
          </label>
          <input
            id="title"
            type="text"
            value={eventDetails.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Downtown Art Market"
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
              errors.title ? 'border-red-500' : 'border-white/10'
            } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-white/90 font-medium mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={eventDetails.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe your event..."
            rows={4}
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
              errors.description ? 'border-red-500' : 'border-white/10'
            } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description}</p>
          )}
        </div>

        {/* Event Date */}
        <div>
          <label htmlFor="event_date" className="block text-white/90 font-medium mb-2">
            Event Date *
          </label>
          <input
            id="event_date"
            type="date"
            value={eventDetails.event_date}
            onChange={(e) => handleChange('event_date', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
              errors.event_date ? 'border-red-500' : 'border-white/10'
            } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
          {errors.event_date && (
            <p className="mt-1 text-sm text-red-400">{errors.event_date}</p>
          )}
        </div>

        {/* Application Deadline */}
        <div>
          <label htmlFor="application_deadline" className="block text-white/90 font-medium mb-2">
            Application Deadline *
          </label>
          <p className="text-white/50 text-sm mb-2">
            Deadline for vendors to submit applications
          </p>
          <input
            id="application_deadline"
            type="date"
            value={eventDetails.application_deadline}
            onChange={(e) => handleChange('application_deadline', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
              errors.application_deadline ? 'border-red-500' : 'border-white/10'
            } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
          {errors.application_deadline && (
            <p className="mt-1 text-sm text-red-400">{errors.application_deadline}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-white/90 font-medium mb-2">
            Location *
          </label>
          <input
            id="location"
            type="text"
            value={eventDetails.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., Central Park Plaza"
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
              errors.location ? 'border-red-500' : 'border-white/10'
            } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
          {errors.location && <p className="mt-1 text-sm text-red-400">{errors.location}</p>}
        </div>
      </div>
    </div>
  );
}
