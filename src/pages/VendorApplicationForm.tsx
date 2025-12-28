import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Calendar, MapPin, Clock } from 'lucide-react';
import { eventsApi, registrationsApi } from '@/services/api';

interface VendorApplication {
  id: number;
  name: string;
  description?: string;
  categories: string[];
  booth_price?: number;
  submissions_count?: number;
}

interface Event {
  id: number;
  title: string;
  slug: string;
  description?: string;
  dates: {
    start?: string;
  };
  location?: string;
  poster_url?: string;
  application_deadline?: string;
  organization?: {
    id: number;
    name: string;
  };
  vendor_applications?: VendorApplication[];
}

export default function VendorApplicationForm() {
  const { slug, applicationId } = useParams<{ slug: string; applicationId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [application, setApplication] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    business_name: '',
    vendor_category: '',
    subscribed: true,
  });

  useEffect(() => {
    if (slug && applicationId) {
      fetchEvent(slug, applicationId);
    }
  }, [slug, applicationId]);

  const fetchEvent = async (eventSlug: string, appId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getById(eventSlug);

      // Find the specific application by ID
      const specificApplication = data.vendor_applications?.find(
        (app: VendorApplication) => app.id === parseInt(appId)
      );

      if (!specificApplication) {
        setError('This vendor application is not available or has been closed.');
        return;
      }

      setEvent(data);
      setApplication(specificApplication);
    } catch (err: any) {
      console.error('Failed to fetch event:', err);
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!application || !event) {
      setError('No vendor application found for this event');
      return;
    }

    // Validation
    if (!formData.name || !formData.email || !formData.business_name || !formData.vendor_category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await registrationsApi.submitVendorApplication(event.slug, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        business_name: formData.business_name,
        vendor_category: formData.vendor_category,
        vendor_application_id: application.id,
        subscribed: formData.subscribed,
      });

      // Redirect to confirmation page with ticket code
      navigate(`/applications/success?ticket_code=${response.ticket_code}&event=${event.slug}`);
    } catch (err: any) {
      console.log('Failed to submit application:', err);
      // Check for errors array first (Rails validation errors), then fallback to message
      const errorMessage = err.errors?.[0] || err.message || 'Failed to submit application. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Unable to Load Application</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all"
          >
            Back to Voxxy Presents
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820]">
      {/* Hero Section */}
      <div className="relative h-[160px] md:h-[250px] overflow-hidden">
        {event?.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-900 to-blue-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0d2e] via-[#1a0d2e]/80 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
              {event?.title}
            </h1>
            <p className="text-white/80 text-base md:text-lg">
              {event?.organization ? `Presented by ${event.organization.name}` : 'Vendor Application'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {application?.name || 'Apply as Vendor'}
              </h2>

              {application?.booth_price && (
                <p className="text-2xl font-bold text-white mb-4">
                  ${Number(application.booth_price).toFixed(2)}
                </p>
              )}

              {application?.description && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                  <p className="text-white/80 text-sm whitespace-pre-wrap">
                    {application.description}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="Your Business Name"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            {/* Vendor Category */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Vendor Category *
              </label>
              <select
                value={formData.vendor_category}
                onChange={(e) => setFormData({ ...formData, vendor_category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              >
                <option value="" className="bg-[#1a0d2e]">Select a category...</option>
                {application?.categories.map((category) => (
                  <option key={category} value={category} className="bg-[#1a0d2e]">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Subscribe Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="subscribed"
                checked={formData.subscribed}
                onChange={(e) => setFormData({ ...formData, subscribed: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="subscribed" className="text-sm text-white/80">
                Keep me updated about this event and future vendor opportunities
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => window.close()}
                    className="flex-1 px-4 md:px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 md:px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 md:w-5 md:h-5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Event Info */}
          <div className="space-y-6">
            {/* Event Description */}
            {event?.description && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">About This Event</h3>
                <p className="text-white/80 text-sm whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Event Details */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
              <div className="space-y-4">
                {event?.dates?.start && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-white/60 text-sm">Event Date</p>
                      <p className="text-white text-sm">{formatDate(event.dates.start)}</p>
                    </div>
                  </div>
                )}
                {event?.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-white/60 text-sm">Location</p>
                      <p className="text-white text-sm">{event.location}</p>
                    </div>
                  </div>
                )}
                {event?.application_deadline && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-white/60 text-sm">Application Deadline</p>
                      <p className="text-white text-sm">{formatDateTime(event.application_deadline)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            {application?.categories && application.categories.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Vendor Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {application.categories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Powered by Voxxy Presents */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <span>Powered by</span>
            <img
              src="/VoxxyTriangle.svg"
              alt="Voxxy"
              className="w-4 h-4 opacity-60"
            />
            <span className="font-semibold">Voxxy Presents</span>
          </div>
        </div>
      </div>
    </div>
  );
}
