import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, MailX, Building2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { unsubscribeApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UnsubscribeContext {
  email: string;
  event: {
    id: number;
    title: string;
    slug: string;
    event_date: string;
  } | null;
  organization: {
    id: number;
    name: string;
    slug: string;
  } | null;
  subscription_status: {
    event_unsubscribed: boolean;
    organization_unsubscribed: boolean;
    globally_unsubscribed: boolean;
  };
  available_scopes: string[];
}

export default function UnsubscribePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [context, setContext] = useState<UnsubscribeContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<'event' | 'organization' | 'global'>('event');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isResubscribing, setIsResubscribing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUnsubscribeContext(token);
    }
  }, [token]);

  const fetchUnsubscribeContext = async (unsubscribeToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await unsubscribeApi.getByToken(unsubscribeToken);
      setContext(data);

      // Set default scope based on what's available
      if (data.available_scopes.includes('event')) {
        setSelectedScope('event');
      } else if (data.available_scopes.includes('organization')) {
        setSelectedScope('organization');
      } else {
        setSelectedScope('global');
      }
    } catch (err: any) {
      console.error('Failed to fetch unsubscribe context:', err);
      setError(err.message || 'Invalid or expired unsubscribe link');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!token || !selectedScope) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await unsubscribeApi.confirm(token, selectedScope);
      setSuccess(true);
      setSuccessMessage(response.message);
    } catch (err: any) {
      console.error('Failed to unsubscribe:', err);
      setError(err.message || 'Failed to process unsubscribe request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubscribe = async () => {
    if (!token) return;

    try {
      setIsResubscribing(true);
      setError(null);
      const response = await unsubscribeApi.resubscribe(token);
      // Reset success state and show resubscribe message
      setSuccess(false);
      setSuccessMessage('');
      // Reload the page to show updated subscription status
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to resubscribe:', err);
      setError(err.message || 'Failed to resubscribe');
    } finally {
      setIsResubscribing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !context) {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-background/5 border-border backdrop-blur-sm">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-foreground text-2xl">Link Not Valid</CardTitle>
            <CardDescription>
              {error || 'We could not validate this unsubscribe link.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button
              onClick={() => navigate('/')}
              className="voxxy-btn-cta"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-background/5 border-border backdrop-blur-sm">
          <CardHeader className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-foreground text-2xl">Successfully Unsubscribed</CardTitle>
            <CardDescription className="mt-2 text-base">
              {successMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background/5 rounded-lg p-4 border border-border">
              <p className="text-foreground/85 dark:text-foreground/65 text-sm text-center">
                You will no longer receive the emails you selected to unsubscribe from.
              </p>
            </div>

            {error && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-500/90">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="flex justify-center">
                <Button
                  onClick={handleResubscribe}
                  disabled={isResubscribing}
                  variant="outline"
                  className="border-border text-foreground hover:bg-background/10"
                >
                  {isResubscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Changed Your Mind? Resubscribe'
                  )}
                </Button>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => navigate('/')}
                  variant="ghost"
                  className="text-foreground/60 hover:text-foreground hover:bg-background/5"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if already unsubscribed
  const alreadyUnsubscribed = context.subscription_status.globally_unsubscribed;

  return (
    <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-background/5 border-border backdrop-blur-sm">
        <CardHeader className="text-center border-b border-border">
          <MailX className="w-12 h-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-foreground text-2xl">Manage Email Preferences</CardTitle>
          <CardDescription className="mt-2">
            Choose which emails you'd like to stop receiving
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Email Context */}
          <div className="bg-background/5 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-foreground/90 mb-3">
              <Mail className="w-5 h-5" />
              <span className="font-medium">Email Address</span>
            </div>
            <p className="text-foreground/70">{context.email}</p>
          </div>

          {/* Event Context (if available) */}
          {context.event && (
            <div className="bg-background/5 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 text-foreground/90 mb-3">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Event</span>
              </div>
              <p className="text-foreground/70 font-medium">{context.event.title}</p>
              <p className="text-foreground/50 text-sm mt-1">
                {formatDate(context.event.event_date)}
              </p>
            </div>
          )}

          {/* Organization Context (if available) */}
          {context.organization && (
            <div className="bg-background/5 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 text-foreground/90 mb-3">
                <Building2 className="w-5 h-5" />
                <span className="font-medium">Event Producer</span>
              </div>
              <p className="text-foreground/70">{context.organization.name}</p>
            </div>
          )}

          {alreadyUnsubscribed && (
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-500/90">
                You are already unsubscribed from all Voxxy Presents emails.
              </AlertDescription>
            </Alert>
          )}

          {/* Unsubscribe Options */}
          {!alreadyUnsubscribed && (
            <div className="space-y-4">
              <div className="text-foreground/90 font-medium">
                What would you like to unsubscribe from?
              </div>

              <RadioGroup value={selectedScope} onValueChange={(value) => setSelectedScope(value as any)}>
                {context.available_scopes.includes('event') && context.event && (
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-background/5 transition-colors">
                    <RadioGroupItem value="event" id="event" className="mt-1 border-border text-primary data-[state=checked]:border-primary" />
                    <Label htmlFor="event" className="flex-1 cursor-pointer">
                      <div className="text-foreground font-medium">This event only</div>
                      <div className="text-foreground/60 text-sm mt-1">
                        Unsubscribe from emails about {context.event.title}
                      </div>
                    </Label>
                  </div>
                )}

                {context.available_scopes.includes('organization') && context.organization && (
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-background/5 transition-colors">
                    <RadioGroupItem value="organization" id="organization" className="mt-1 border-border text-primary data-[state=checked]:border-primary" />
                    <Label htmlFor="organization" className="flex-1 cursor-pointer">
                      <div className="text-foreground font-medium">All emails from this producer</div>
                      <div className="text-foreground/60 text-sm mt-1">
                        Unsubscribe from all emails from {context.organization.name} (current and future events)
                      </div>
                    </Label>
                  </div>
                )}

                {context.available_scopes.includes('global') && (
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-background/5 transition-colors">
                    <RadioGroupItem value="global" id="global" className="mt-1 border-border text-primary data-[state=checked]:border-primary" />
                    <Label htmlFor="global" className="flex-1 cursor-pointer">
                      <div className="text-foreground font-medium">All Voxxy Presents emails</div>
                      <div className="text-foreground/60 text-sm mt-1">
                        Unsubscribe from all emails from voxxypresents.com
                      </div>
                    </Label>
                  </div>
                )}
              </RadioGroup>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-500/90">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleUnsubscribe}
                  disabled={isSubmitting}
                  className="voxxy-btn-cta px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Unsubscribe'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
