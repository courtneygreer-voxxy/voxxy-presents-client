import { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { WizardStepProps } from '../types';
import VenueAutocomplete from '../VenueAutocomplete';
import LocationAutocomplete from '../LocationAutocomplete';
import googlePlacesService, { LocationData } from '@/services/googlePlacesService';

export default function Step1EventDetails({
  wizardState,
  updateWizardState,
  errors,
  setErrors,
}: WizardStepProps) {
  const { eventDetails } = wizardState;

  // Track if venue was selected from autocomplete (for locking location)
  const [isVenueSelected, setIsVenueSelected] = useState(false);

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

  // Handle venue selection from autocomplete
  const handleVenueSelect = (locationData: LocationData, venueName: string) => {
    // Auto-fill location with city
    const cityDisplay = googlePlacesService.getCityDisplay(locationData);
    if (cityDisplay) {
      // Update both venue and location atomically to avoid race condition
      updateWizardState({
        eventDetails: {
          ...eventDetails,
          venue: venueName,
          location: cityDisplay,
        },
      });

      // Mark venue as selected (locks location)
      setIsVenueSelected(true);

      // Clear errors if they were set
      const newErrors = { ...errors };
      delete newErrors.venue;
      delete newErrors.location;
      setErrors(newErrors);
    }
  };

  // Handle clearing venue (also clears location)
  const handleClearVenue = () => {
    updateWizardState({
      eventDetails: {
        ...eventDetails,
        venue: '',
        location: '',
      },
    });

    // Unlock location
    setIsVenueSelected(false);

    // Clear errors
    const newErrors = { ...errors };
    delete newErrors.venue;
    delete newErrors.location;
    setErrors(newErrors);
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

        {/* Venue - Google Places Autocomplete */}
        <div>
          <label htmlFor="venue" className="block text-white/90 font-medium mb-2">
            Event Venue
          </label>
          <p className="text-white/50 text-sm mb-2">
            Search for the venue where the event will take place
          </p>
          <div className="relative">
            <VenueAutocomplete
              value={eventDetails.venue || ''}
              onChange={(value) => handleChange('venue', value)}
              onLocationSelect={handleVenueSelect}
              error={errors.venue}
              placeholder="e.g., Brooklyn Steel, Central Park..."
            />
            {/* Clear button - only show when venue is selected from autocomplete (not while typing) */}
            {eventDetails.venue && isVenueSelected && (
              <button
                type="button"
                onClick={handleClearVenue}
                className="absolute right-3 top-3 z-10 text-white/60 hover:text-white transition-colors"
                aria-label="Clear venue"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Location - Conditional based on venue selection */}
        <div>
          <label htmlFor="location" className="block text-white/90 font-medium mb-2">
            Location (City) *
          </label>

          {isVenueSelected ? (
            <>
              <p className="text-white/50 text-sm mb-2 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Location locked to venue
              </p>
              {/* Locked/Disabled location field */}
              <div className="relative">
                <input
                  id="location"
                  type="text"
                  value={eventDetails.location}
                  disabled
                  className="w-full px-4 py-3 pl-10 rounded-lg bg-white/5 border border-white/10 text-white/50 cursor-not-allowed"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-1 text-xs text-white/40">
                Clear the venue to manually select a city
              </p>
            </>
          ) : (
            <>
              <p className="text-white/50 text-sm mb-2">
                Search for the city where the event will be held
              </p>
              {/* City autocomplete when no venue selected */}
              <LocationAutocomplete
                value={eventDetails.location}
                onChange={(value) => handleChange('location', value)}
                error={errors.location}
                placeholder="e.g., Brooklyn, Los Angeles..."
              />
            </>
          )}
        </div>

        {/* Event Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event_date" className="block text-white/90 font-medium mb-2">
              Event Date *
            </label>
            <p className="text-white/50 text-xs mb-2">Start date for multi-day events</p>
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

          <div>
            <label htmlFor="event_end_date" className="block text-white/90 font-medium mb-2">
              Event End Date
            </label>
            <p className="text-white/50 text-xs mb-2">Optional for multi-day events</p>
            <input
              id="event_end_date"
              type="date"
              value={eventDetails.event_end_date || ''}
              onChange={(e) => handleChange('event_end_date', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                errors.event_end_date ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            />
            {errors.event_end_date && (
              <p className="mt-1 text-sm text-red-400">{errors.event_end_date}</p>
            )}
          </div>
        </div>

        {/* Event Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_time" className="block text-white/90 font-medium mb-2">
              Start Time
            </label>
            <input
              id="start_time"
              type="time"
              value={eventDetails.start_time || ''}
              onChange={(e) => handleChange('start_time', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                errors.start_time ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            />
            {errors.start_time && (
              <p className="mt-1 text-sm text-red-400">{errors.start_time}</p>
            )}
          </div>

          <div>
            <label htmlFor="end_time" className="block text-white/90 font-medium mb-2">
              End Time
            </label>
            <input
              id="end_time"
              type="time"
              value={eventDetails.end_time || ''}
              onChange={(e) => handleChange('end_time', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                errors.end_time ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            />
            {errors.end_time && (
              <p className="mt-1 text-sm text-red-400">{errors.end_time}</p>
            )}
          </div>
        </div>

        {/* Application Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="application_deadline" className="block text-white/90 font-medium mb-2">
              Application Deadline *
            </label>
            <p className="text-white/50 text-xs mb-2">
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

          <div>
            <label htmlFor="payment_deadline" className="block text-white/90 font-medium mb-2">
              Payment Deadline
            </label>
            <p className="text-white/50 text-xs mb-2">
              Deadline for approved vendors to pay
            </p>
            <input
              id="payment_deadline"
              type="date"
              value={eventDetails.payment_deadline || ''}
              onChange={(e) => handleChange('payment_deadline', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
                errors.payment_deadline ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            />
            {errors.payment_deadline && (
              <p className="mt-1 text-sm text-red-400">{errors.payment_deadline}</p>
            )}
          </div>
        </div>

        {/* Age Restriction */}
        <div>
          <label htmlFor="age_restriction" className="block text-white/90 font-medium mb-2">
            Age Restriction
          </label>
          <p className="text-white/50 text-sm mb-2">
            Specify if there's an age requirement (e.g., "18+", "21+", "All Ages")
          </p>
          <input
            id="age_restriction"
            type="text"
            value={eventDetails.age_restriction || ''}
            onChange={(e) => handleChange('age_restriction', e.target.value)}
            placeholder="e.g., All Ages, 18+, 21+"
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
              errors.age_restriction ? 'border-red-500' : 'border-white/10'
            } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
          {errors.age_restriction && (
            <p className="mt-1 text-sm text-red-400">{errors.age_restriction}</p>
          )}
        </div>

        {/* Ticket Link */}
        <div>
          <label htmlFor="ticket_link" className="block text-white/90 font-medium mb-2">
            Ticket Link
          </label>
          <p className="text-white/50 text-sm mb-2">
            URL where attendees can purchase tickets
          </p>
          <input
            id="ticket_link"
            type="url"
            value={eventDetails.ticket_link || ''}
            onChange={(e) => handleChange('ticket_link', e.target.value)}
            placeholder="https://example.com/tickets"
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
              errors.ticket_link ? 'border-red-500' : 'border-white/10'
            } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
          {errors.ticket_link && (
            <p className="mt-1 text-sm text-red-400">{errors.ticket_link}</p>
          )}
        </div>

        {/* Event Details (Description) - Moved to bottom and made optional */}
        <div>
          <label htmlFor="description" className="block text-white/90 font-medium mb-2">
            Event Details
          </label>
          <p className="text-white/50 text-sm mb-2">
            Provide additional details about your event
          </p>
          <textarea
            id="description"
            value={eventDetails.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe your event, what vendors can expect, special features, etc..."
            rows={4}
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${
              errors.description ? 'border-red-500' : 'border-white/10'
            } text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
