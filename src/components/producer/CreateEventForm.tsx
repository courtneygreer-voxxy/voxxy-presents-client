import { useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';

interface CreateEventFormProps {
  onCancel: () => void;
  onSubmit: (eventData: {
    title: string;
    description: string;
    event_date: string;
    location: string;
  }) => Promise<void>;
}

export default function CreateEventForm({ onCancel, onSubmit }: CreateEventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Date is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submitted with data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, submitting...');
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      console.log('Event created successfully');
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Create New Event
        </h1>
        <p className="text-white/60">
          Set up a new event to start accepting vendor applications
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
          <h2 className="text-xl font-semibold text-white">Event Details</h2>

          {/* Event Name */}
          <div>
            <label htmlFor="title" className="block text-white/90 font-medium mb-2">
              Event Name *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Downtown Art Market"
              className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                errors.title ? 'border-red-500' : 'border-white/10'
              } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-white/90 font-medium mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
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

          {/* Date and Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label htmlFor="event_date" className="block text-white/90 font-medium mb-2">
                Date *
              </label>
              <input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleChange('event_date', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                  errors.event_date ? 'border-red-500' : 'border-white/10'
                } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
              />
              {errors.event_date && (
                <p className="mt-1 text-sm text-red-400">{errors.event_date}</p>
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
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Central Park Plaza"
                className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                  errors.location ? 'border-red-500' : 'border-white/10'
                } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-400">{errors.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
