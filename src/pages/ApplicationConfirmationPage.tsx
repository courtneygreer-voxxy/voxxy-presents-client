import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail } from 'lucide-react';

export default function ApplicationConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [applicationCode, setApplicationCode] = useState('');
  const [eventSlug, setEventSlug] = useState('');

  useEffect(() => {
    const code = searchParams.get('application_code');
    const event = searchParams.get('event');

    if (code) setApplicationCode(code);
    if (event) setEventSlug(event);
  }, [searchParams]);

  return (
    <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-background/5 border border-border rounded-lg p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-700 dark:text-green-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Application Submitted Successfully!
          </h1>

          <p className="text-foreground/80 mb-8">
            Thank you for applying! Your application has been received and is being reviewed by the event organizers.
          </p>

          {/* Application Code */}
          {applicationCode && (
            <div className="bg-primary/10 dark:bg-primary/20/20 border border-primary/30 rounded-lg p-6 mb-8">
              <p className="text-sm text-foreground/70 mb-2">Your Application Code</p>
              <p className="text-2xl font-mono font-bold text-violet-900 dark:text-primary tracking-wider">
                {applicationCode}
              </p>
              <p className="text-xs text-foreground/40 mt-2">
                Save this code to track your application status
              </p>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-background/5 border border-border rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-violet-700 dark:text-primary" />
              What Happens Next?
            </h2>
            <ul className="space-y-3 text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-primary/20 text-violet-950 dark:text-primary text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  You'll receive a confirmation email with your application details
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-primary/20 text-violet-950 dark:text-primary text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  The event organizers will review your application
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-primary/20 text-violet-950 dark:text-primary text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
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
              className="px-8 py-3 rounded-lg voxxy-btn-cta font-semibold transition-all shadow-lg"
            >
              Back to Voxxy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
