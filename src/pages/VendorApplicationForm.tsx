import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { eventsApi, registrationsApi } from '@/services/api';

interface Event {
  id: number;
  title: string;
  slug: string;
  dates: {
    start?: string;
  };
  location?: string;
  vendor_application?: {
    id: number;
    name: string;
    description?: string;
    categories: string[];
  };
}

export default function VendorApplicationForm() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
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
    if (slug) {
      fetchEvent(slug);
    }
  }, [slug]);

  const fetchEvent = async (eventSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getById(eventSlug);

      if (!data.vendor_application) {
        setError('This event is not accepting vendor applications.');
        return;
      }

      setEvent(data);
    } catch (err: any) {
      console.error('Failed to fetch event:', err);
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event?.vendor_application) {
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
        vendor_application_id: event.vendor_application.id,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Voxxy Presents
        </button>

        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Apply as Vendor
          </h1>
          <p className="text-white/60 mb-2">{event?.title}</p>
          <p className="text-purple-300 text-lg mb-6">
            {event?.vendor_application?.name}
          </p>

          {event?.vendor_application?.description && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
              <p className="text-white/80 text-sm whitespace-pre-wrap">
                {event.vendor_application.description}
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
                {event?.vendor_application?.categories.map((category) => (
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
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
