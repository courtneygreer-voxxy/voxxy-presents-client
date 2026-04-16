import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTracking } from "@/hooks/usePageTracking";
import { analytics } from "@/lib/analytics";
import { TrackedButton } from "@/components/analytics/TrackedButton";
import { TrackedLink } from "@/components/analytics/TrackedLink";

export default function AnalyticsTestPage() {
  usePageTracking('Analytics Test');

  const handleTestEvent = () => {
    analytics.track('Test Event', {
      test_property: 'test_value',
      timestamp: new Date().toISOString()
    });
  };

  const handleTestUserProperties = () => {
    analytics.setUserProperties({
      test_user_property: 'test_value',
      conversion_stage: 'visitor'
    });
  };

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-background/10 backdrop-blur-sm border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Analytics Testing Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Environment Check</h3>
              <p className="text-muted-foreground">
                Mixpanel Token: {import.meta.env.VITE_MIXPANEL_TOKEN ? 'Set' : 'Not Set'}
              </p>
              <p className="text-muted-foreground">
                Environment: {import.meta.env.VITE_ENVIRONMENT || 'development'}
              </p>
              <p className="text-muted-foreground">
                Debug Mode: {import.meta.env.DEV ? 'Yes' : 'No'}
              </p>
              <p className="text-muted-foreground">
                Analytics Enabled: {import.meta.env.VITE_ENVIRONMENT === 'production' ? 'Yes (Production Only)' : 'No (Non-Production)'}
              </p>
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  📊 <strong>Production Only:</strong> Analytics tracking is disabled in development and staging environments.
                  Events will only be sent to Mixpanel when VITE_ENVIRONMENT=production.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Manual Event Testing</h3>
              <div className="flex gap-4">
                <Button onClick={handleTestEvent} className="voxxy-btn-solid">
                  Fire Test Event
                </Button>
                <Button onClick={handleTestUserProperties} className="bg-blue-600 hover:bg-blue-700">
                  Set Test User Properties
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Tracked Components Testing</h3>
              <div className="flex gap-4">
                <TrackedButton
                  className="bg-green-600 hover:bg-green-700"
                  trackingData={{
                    button_text: 'Test CTA',
                    button_location: 'test_page',
                    page_name: 'Analytics Test',
                    is_primary_cta: true
                  }}
                >
                  Test Tracked Button
                </TrackedButton>

                <TrackedLink
                  to="/"
                  className="inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-foreground rounded"
                  trackingData={{
                    link_text: 'Test Link',
                    destination_page: 'Home',
                    current_page: 'Analytics Test',
                    link_position: 'inline'
                  }}
                >
                  Test Tracked Link
                </TrackedLink>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Console Debug</h3>
              <p className="text-muted-foreground text-sm">
                Open browser console to see tracking events and debug information.
                Page views and scroll tracking are automatic.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}