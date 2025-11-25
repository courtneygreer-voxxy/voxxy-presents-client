import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail } from 'lucide-react';

export default function ApplicationConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ticketCode, setTicketCode] = useState('');
  const [eventSlug, setEventSlug] = useState('');

  useEffect(() => {
    const code = searchParams.get('ticket_code');
    const event = searchParams.get('event');

    if (code) setTicketCode(code);
    if (event) setEventSlug(event);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0d2e] to-[#0f0820] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Application Submitted Successfully!
          </h1>

          <p className="text-white/80 mb-8">
            Thank you for applying! Your application has been received and is being reviewed by the event organizers.
          </p>

          {/* Ticket Code */}
          {ticketCode && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-8">
              <p className="text-sm text-white/60 mb-2">Your Application ID</p>
              <p className="text-2xl font-mono font-bold text-purple-300 tracking-wider">
                {ticketCode}
              </p>
              <p className="text-xs text-white/40 mt-2">
                Save this code to track your application status
              </p>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-400" />
              What Happens Next?
            </h2>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  You'll receive a confirmation email with your application details
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  The event organizers will review your application
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  You'll be notified by email when your application status changes
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg"
            >
              Back to Voxxy Presents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
