import { useState } from 'react';
import { Lock, X, Zap } from 'lucide-react';
import { WizardStepProps } from '../types';
import VenueAutocomplete from '../VenueAutocomplete';
import LocationAutocomplete from '../LocationAutocomplete';
import googlePlacesService, { LocationData } from '@/services/googlePlacesService';
import { isDevOrStaging } from '@/config/environments';
import { useAuth } from '@/contexts/AuthContext';
import { DebugPanel } from '../../DebugPanel';

/**
 * Step1EventDetails - Event information and deadlines configuration
 *
 * First step of the event creation wizard. Collects basic event information
 * including dates, location, and important deadlines.
 *
 * Features:
 * - Event name, description, and dates
 * - Google Places venue autocomplete
 * - Location autocomplete (auto-fills from venue)
 * - Optional fields: start/end times, age restriction, ticket link
 * - Application and payment deadline configuration
 * - Dev mode prefill for testing
 *
 * Validation Rules:
 * - Event name required (min 3 characters)
 * - Event date required (must be in future)
 * - Location required
 * - Application deadline required (must be before event date)
 * - End date must be on or after start date (if provided)
 *
 * @param {WizardStepProps} props - Wizard state and update functions
 * @param {WizardState} props.wizardState - Current wizard state
 * @param {Function} props.updateWizardState - Function to update wizard state
 * @param {Record<string, string>} props.errors - Validation errors
 * @param {Function} props.setErrors - Function to set validation errors
 * @param {boolean} props.isAdmin - Whether user is admin (shows debug panel)
 *
 * @returns {JSX.Element} Step 1 form with event details inputs
 */
export default function Step1EventDetails({
  wizardState,
  updateWizardState,
  errors,
  setErrors,
  isAdmin,
}: WizardStepProps) {
  const { eventDetails } = wizardState;
  const { userProfile } = useAuth();

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

  // DEV ONLY: Prefill form with test data
  const handlePrefill = () => {
    // Calculate dates relative to today
    const today = new Date();
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + 30); // Event in 30 days

    const eventEndDate = new Date(eventDate);
    eventEndDate.setDate(eventDate.getDate() + 2); // 3-day event

    const applicationDeadline = new Date(eventDate);
    applicationDeadline.setDate(eventDate.getDate() - 14); // 2 weeks before event

    const paymentDeadline = new Date(eventDate);
    paymentDeadline.setDate(eventDate.getDate() - 7); // 1 week before event

    updateWizardState({
      eventDetails: {
        ...eventDetails,
        title: `Test Event #${generateRandomCode()}`,
        description: 'Join us for a three-day celebration of local artists, makers, and food vendors in beautiful Prospect Park. This family-friendly event features live music, food trucks, artisan booths, and interactive workshops.',
        venue: 'Prospect Park Bandshell',
        location: 'Brooklyn, NY',
        event_date: eventDate.toISOString().split('T')[0],
        event_end_date: eventEndDate.toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '18:00',
        age_restriction: 'All Ages',
        ticket_link: 'https://www.example.com/tickets/brooklyn-market',
        application_deadline: applicationDeadline.toISOString().split('T')[0],
        payment_deadline: paymentDeadline.toISOString().split('T')[0],
      },
    });

    // Mark venue as selected (since we're setting it programmatically)
    setIsVenueSelected(true);

    // Clear any errors
    setErrors({});
  };

  // Generate random event code for unique titles
  const generateRandomCode = () => Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="space-y-4">
      {/* DEV/ADMIN: Prefill Button */}
      {(isDevOrStaging() || isAdmin) && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-200/90 font-medium">
                {isDevOrStaging() ? 'Dev Mode' : 'Admin Mode'}
              </span>
            </div>
            <button
              onClick={handlePrefill}
              className="px-3 py-1.5 text-xs font-medium bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-md transition-colors border border-yellow-500/30 hover:border-yellow-500/50"
            >
              Prefill Test Data
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 space-y-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">Event Details</h2>
          <p className="text-white/60 text-xs mt-0.5">
            Provide basic information about your event
          </p>
        </div>

        {/* Event Name */}
        <div>
          <label htmlFor="title" className="block text-xs text-white/80 font-medium mb-1.5">
            Event Name *
          </label>
          <input
            id="title"
            type="text"
            value={eventDetails.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Downtown Art Market"
            className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
              errors.title ? 'border-red-500' : 'border-white/10'
            } text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        {/* Venue - Google Places Autocomplete */}
        <div>
          <label htmlFor="venue" className="block text-xs text-white/80 font-medium mb-1.5">
            Event Venue
          </label>
          <p className="text-white/50 text-xs mb-1.5">
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
                className="absolute right-3 top-2 z-10 text-white/60 hover:text-white transition-colors"
                aria-label="Clear venue"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Location - Conditional based on venue selection */}
        <div>
          <label htmlFor="location" className="block text-xs text-white/80 font-medium mb-1.5">
            Location (City) *
          </label>

          {isVenueSelected ? (
            <>
              <p className="text-white/50 text-xs mb-1.5 flex items-center gap-1.5">
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
                  className="w-full px-3 py-2 pl-8 text-sm rounded-lg bg-white/5 border border-white/10 text-white/60 cursor-not-allowed"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-1 text-xs text-white/50">
                Clear the venue to manually select a city
              </p>
            </>
          ) : (
            <>
              <p className="text-white/50 text-xs mb-1.5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="event_date" className="block text-xs text-white/80 font-medium mb-1.5">
              Event Date *
            </label>
            <p className="text-white/50 text-xs mb-1.5">Start date for multi-day events</p>
            <input
              id="event_date"
              type="date"
              value={eventDetails.event_date}
              onChange={(e) => handleChange('event_date', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
                errors.event_date ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
            />
            {errors.event_date && (
              <p className="mt-1 text-xs text-red-500">{errors.event_date}</p>
            )}
          </div>

          <div>
            <label htmlFor="event_end_date" className="block text-xs text-white/80 font-medium mb-1.5">
              Event End Date
            </label>
            <p className="text-white/50 text-xs mb-1.5">Optional for multi-day events</p>
            <input
              id="event_end_date"
              type="date"
              value={eventDetails.event_end_date || ''}
              onChange={(e) => handleChange('event_end_date', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
                errors.event_end_date ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
            />
            {errors.event_end_date && (
              <p className="mt-1 text-xs text-red-500">{errors.event_end_date}</p>
            )}
          </div>
        </div>

        {/* Event Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="start_time" className="block text-xs text-white/80 font-medium mb-1.5">
              Start Time
            </label>
            <input
              id="start_time"
              type="time"
              value={eventDetails.start_time || ''}
              onChange={(e) => handleChange('start_time', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
                errors.start_time ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
            />
            {errors.start_time && (
              <p className="mt-1 text-xs text-red-500">{errors.start_time}</p>
            )}
          </div>

          <div>
            <label htmlFor="end_time" className="block text-xs text-white/80 font-medium mb-1.5">
              End Time
            </label>
            <input
              id="end_time"
              type="time"
              value={eventDetails.end_time || ''}
              onChange={(e) => handleChange('end_time', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
                errors.end_time ? 'border-red-500' : 'border-white/10'
              } text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
            />
            {errors.end_time && (
              <p className="mt-1 text-xs text-red-500">{errors.end_time}</p>
            )}
          </div>
        </div>

        {/* Age Restriction */}
        <div>
          <label htmlFor="age_restriction" className="block text-xs text-white/80 font-medium mb-1.5">
            Age Restriction
          </label>
          <p className="text-white/50 text-xs mb-1.5">
            Specify if there's an age requirement (e.g., "18+", "21+", "All Ages")
          </p>
          <input
            id="age_restriction"
            type="text"
            value={eventDetails.age_restriction || ''}
            onChange={(e) => handleChange('age_restriction', e.target.value)}
            placeholder="e.g., All Ages, 18+, 21+"
            className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
              errors.age_restriction ? 'border-red-500' : 'border-white/10'
            } text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
          />
          {errors.age_restriction && (
            <p className="mt-1 text-xs text-red-500">{errors.age_restriction}</p>
          )}
        </div>

        {/* Ticket Link */}
        <div>
          <label htmlFor="ticket_link" className="block text-xs text-white/80 font-medium mb-1.5">
            Ticket Link
          </label>
          <p className="text-white/50 text-xs mb-1.5">
            URL where attendees can purchase tickets
          </p>
          <input
            id="ticket_link"
            type="url"
            value={eventDetails.ticket_link || ''}
            onChange={(e) => handleChange('ticket_link', e.target.value)}
            placeholder="https://example.com/tickets"
            className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
              errors.ticket_link ? 'border-red-500' : 'border-white/10'
            } text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
          />
          {errors.ticket_link && (
            <p className="mt-1 text-xs text-red-500">{errors.ticket_link}</p>
          )}
        </div>

        {/* Event Details (Description) - Moved to bottom and made optional */}
        <div>
          <label htmlFor="description" className="block text-xs text-white/80 font-medium mb-1.5">
            Event Details
          </label>
          <p className="text-white/50 text-xs mb-1.5">
            Provide additional details about your event
          </p>
          <textarea
            id="description"
            value={eventDetails.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe your event, what vendors can expect, special features, etc..."
            rows={2}
            className={`w-full px-3 py-2 text-sm rounded-lg bg-white/10 border ${
              errors.description ? 'border-red-500' : 'border-white/10'
            } text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Admin Debug Panel */}
      <DebugPanel
        title="Step 1: Event Details"
        data={{
          wizardState,
          eventDetails: wizardState.eventDetails,
          errors,
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
