import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const navigate = useNavigate()
  const { refreshUserProfile } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Refresh user profile to get updated payment status
    const refreshProfile = async () => {
      try {
        await refreshUserProfile()
        setIsRefreshing(false)
      } catch (error) {
        console.error('Failed to refresh profile:', error)
        setIsRefreshing(false)
      }
    }

    refreshProfile()
  }, [refreshUserProfile])

  useEffect(() => {
    if (isRefreshing) return

    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          navigate('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRefreshing, navigate])

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen voxxy-gradient-page-alt relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">

          {/* Success Card */}
          <Card className="bg-background/10 backdrop-blur-md border-2 border-green-400/30 shadow-2xl">
            <CardHeader className="text-center pb-6 space-y-4">
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-green-500/20 rounded-full p-6 animate-pulse">
                  <CheckCircle className="h-20 w-20 text-green-400" />
                </div>
              </div>

              <Badge variant="tintGreen" className="mx-auto w-fit gap-2 px-4 py-2 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Payment Successful
              </Badge>

              <CardTitle className="text-4xl font-bold text-foreground">
                Welcome to Voxxy Presents!
              </CardTitle>

              <CardDescription className="text-lg text-foreground/85 dark:text-gray-200">
                Your producer account is now active
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Confirmation Message */}
              <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-6 text-center space-y-2">
                <p className="text-foreground font-semibold text-lg">
                  🎉 Payment Confirmed!
                </p>
                <p className="text-foreground/85 dark:text-muted-foreground">
                  You now have full access to all producer features. Time to create something amazing!
                </p>
                {sessionId && (
                  <p className="text-xs text-foreground/75 dark:text-muted-foreground pt-2 font-mono">
                    Session: {sessionId.substring(0, 20)}...
                  </p>
                )}
              </div>

              {/* What's Next */}
              <div className="bg-background/5 backdrop-blur-sm border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-foreground text-lg mb-3">
                  What's Next?
                </h3>
                <ul className="space-y-3 text-sm text-foreground/85 dark:text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Create your first event and set up vendor applications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Build your vendor network and send invitations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Configure automated email sequences for applicants</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Track payments and manage your event budget</span>
                  </li>
                </ul>
              </div>

              {/* Redirect Notice */}
              <div className="text-center space-y-4 pt-4">
                {isRefreshing ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                    <p className="text-foreground/80 dark:text-muted-foreground text-sm">
                      Setting up your account...
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-foreground/80 dark:text-muted-foreground text-sm">
                      Redirecting to your dashboard in {countdown} seconds...
                    </p>
                    <Button
                      onClick={handleGoToDashboard}
                      className="voxxy-btn-cta-pink"
                      size="lg"
                    >
                      Go to Dashboard Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>

              {/* Receipt Notice */}
              <div className="bg-background/5 backdrop-blur-sm border border-border rounded-lg p-4 mt-6">
                <p className="text-sm text-foreground/82 dark:text-muted-foreground text-center">
                  📧 A receipt has been sent to your email
                </p>
                <p className="text-xs text-foreground/78 dark:text-muted-foreground text-center mt-1">
                  You can manage your subscription anytime from your dashboard settings
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
