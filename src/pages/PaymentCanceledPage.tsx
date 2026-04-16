import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { stripeService } from "@/services/stripeService"
import { useState } from 'react'

export default function PaymentCanceledPage() {
  const navigate = useNavigate()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleTryAgain = async () => {
    setIsRetrying(true)
    try {
      await stripeService.redirectToCheckout()
    } catch (error) {
      console.error('Failed to restart payment:', error)
      setIsRetrying(false)
      // Error will be shown if redirect fails
    }
  }

  const handleGoBack = () => {
    navigate('/pending')
  }

  return (
    <div className="min-h-screen voxxy-gradient-page-alt relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">

          {/* Canceled Card */}
          <Card className="bg-background/10 backdrop-blur-md border-2 border-orange-400/30 shadow-2xl">
            <CardHeader className="text-center pb-6 space-y-4">
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-orange-500/20 rounded-full p-6">
                  <XCircle className="h-20 w-20 text-orange-400" />
                </div>
              </div>

              <Badge className="bg-orange-500/20 border border-orange-400/30 text-orange-950 dark:text-orange-300 px-4 py-2 text-sm font-medium w-fit mx-auto">
                Payment Canceled
              </Badge>

              <CardTitle className="text-4xl font-bold text-foreground">
                Payment Not Completed
              </CardTitle>

              <CardDescription className="text-lg text-foreground/85 dark:text-gray-200">
                No charges were made to your card
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status Message */}
              <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-6 text-center space-y-2">
                <p className="text-foreground font-semibold text-lg">
                  Your payment was canceled
                </p>
                <p className="text-foreground/85 dark:text-muted-foreground">
                  Don't worry! You can try again whenever you're ready to activate your producer account.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleTryAgain}
                  disabled={isRetrying}
                  className="w-full voxxy-btn-cta-pink"
                  size="lg"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Try Again
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="w-full bg-background/10 backdrop-blur-sm border border-border text-foreground hover:bg-background/15"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Go Back
                </Button>
              </div>

              {/* What Happened */}
              <div className="bg-background/5 backdrop-blur-sm border border-border rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-foreground text-lg mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  What happened?
                </h3>
                <p className="text-sm text-muted-foreground">
                  The payment process was interrupted before completion. This could be because:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• You clicked the back button or closed the payment window</li>
                  <li>• You chose not to complete the payment at this time</li>
                  <li>• The payment session expired</li>
                </ul>
                <p className="text-sm text-muted-foreground pt-2">
                  <strong className="text-foreground">No charges were made.</strong> When you're ready, you can restart the payment process.
                </p>
              </div>

              {/* Support */}
              <div className="bg-background/5 backdrop-blur-sm border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Having trouble? Contact us at{' '}
                  <a
                    href="mailto:support@voxxypresents.com"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    support@voxxypresents.com
                  </a>
                </p>
              </div>

              {/* Reassurance */}
              <div className="text-center border-t border-border pt-6">
                <p className="text-xs text-muted-foreground">
                  🔒 All payments are securely processed by Stripe
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
