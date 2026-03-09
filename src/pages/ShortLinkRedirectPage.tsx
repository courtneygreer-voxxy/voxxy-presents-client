import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorApplicationsApi } from '@/services/api';

export default function ShortLinkRedirectPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lookupAndRedirect = async () => {
      if (!code) {
        setError('No application code provided');
        return;
      }

      try {
        // Lookup the event by shareable code
        const eventData = await vendorApplicationsApi.lookupByCode(code);

        // Extract the application ID from the vendor_applications array
        if (!eventData.vendor_applications || eventData.vendor_applications.length === 0) {
          setError('No active applications found for this event');
          return;
        }

        // Find the specific application that matches the shareable_code
        const matchingApp = eventData.vendor_applications.find(
          (app: any) => app.shareable_code === code
        );

        if (!matchingApp) {
          setError('Application not found for this code');
          return;
        }

        const applicationId = matchingApp.id;

        // Redirect to the vendor application form for this event
        navigate(`/events/${eventData.slug}/apply/${applicationId}`, { replace: true });
      } catch (err: any) {
        console.error('Failed to lookup application:', err);
        setError(err.message || 'Application not found');
      }
    };

    lookupAndRedirect();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Application Not Found</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Loading application...</p>
      </div>
    </div>
  );
}
