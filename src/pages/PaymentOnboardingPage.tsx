import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  Sparkles,
  Users,
  Calendar,
  Mail,
  BarChart3,
  Zap,
  CreditCard,
  ArrowRight,
  Loader2
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { stripeService } from "@/services/stripeService"
import { useNavigate } from "react-router-dom"

export default function PaymentOnboardingPage() {
  const { userProfile, signOut } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleStartPayment = async () => {
    setIsRedirecting(true)
    setError(null)

    try {
      // Redirect to Stripe Checkout
      await stripeService.redirectToCheckout()
    } catch (err) {
      console.error('Payment redirect failed:', err)
      setError('Failed to start payment process. Please try again.')
      setIsRedirecting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const features = [
    {
      icon: Calendar,
      title: "Unlimited Events",
      description: "Create and manage as many events as you need"
    },
    {
      icon: Users,
      title: "Vendor Management",
      description: "Accept and manage vendor applications with ease"
    },
    {
      icon: Mail,
      title: "Automated Email Campaigns",
      description: "Send targeted emails to vendors and attendees"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Track registrations, payments, and engagement"
    },
    {
      icon: Zap,
      title: "Payment Integration",
      description: "Sync with Eventbrite and track vendor payments"
    },
    {
      icon: CreditCard,
      title: "Custom Branding",
      description: "Customize your event pages and application forms"
    }
  ]

  return (
    <div className="min-h-screen voxxy-gradient-page-alt relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-8">

          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <Badge className="border border-purple-400/30 bg-purple-500/20 px-4 py-2 text-sm font-medium text-violet-950 dark:text-purple-300">
              <Sparkles className="h-4 w-4 mr-2" />
              Producer Account Setup
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Welcome to Voxxy Presents
            </h1>
            {userProfile?.name && (
              <p className="text-xl text-muted-foreground">
                Hi {userProfile.name}! 👋
              </p>
            )}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You're one step away from unlocking the complete event producer platform
            </p>
          </div>

          {/* Main Pricing Card */}
          <Card className="bg-background/10 backdrop-blur-md border-2 border-purple-400/30 shadow-2xl">
            <CardHeader className="text-center pb-6 space-y-2">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4">
                  <Users className="h-12 w-12 text-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Producer Monthly Plan
              </CardTitle>
              <div className="flex items-baseline justify-center gap-2 pt-4">
                <span className="text-6xl font-bold text-foreground">$80</span>
                <span className="text-xl text-muted-foreground">/month</span>
              </div>
              <CardDescription className="text-lg pt-2">
                Everything you need to manage successful events
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4 py-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-background/5 backdrop-blur-sm border border-border rounded-lg p-4 hover:bg-background/10 transition-colors"
                  >
                    <div className="rounded-lg bg-purple-500/20 p-2 flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-purple-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="space-y-4 pt-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleStartPayment}
                  disabled={isRedirecting}
                  className="w-full voxxy-btn-cta-pink text-lg py-6 rounded-lg shadow-md hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Redirecting to Payment...
                    </>
                  ) : (
                    <>
                      Start Your Producer Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Secure payment powered by Stripe • Cancel anytime
                </p>
              </div>

              {/* Account Info */}
              {userProfile && (
                <div className="bg-background/5 backdrop-blur-sm border border-border rounded-lg p-4 mt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    <strong className="text-foreground">Account:</strong> {userProfile.email}
                  </p>
                  {userProfile.organization_id && (
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      <strong className="text-foreground">Organization ID:</strong> {userProfile.organization_id}
                    </p>
                  )}
                </div>
              )}

              {/* Footer Actions */}
              <div className="text-center pt-6 border-t border-border space-y-4">
                <p className="text-sm text-muted-foreground">
                  Need to sign in with a different account?
                </p>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="bg-background/10 backdrop-blur-sm border border-border text-foreground hover:bg-background/15 hover:border-border"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trust Signals */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-background/5 backdrop-blur-sm border border-border">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">$80/mo</div>
                <div className="text-sm text-muted-foreground">Transparent Pricing</div>
              </CardContent>
            </Card>
            <Card className="bg-background/5 backdrop-blur-sm border border-border">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Platform Access</div>
              </CardContent>
            </Card>
            <Card className="bg-background/5 backdrop-blur-sm border border-border">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">∞</div>
                <div className="text-sm text-muted-foreground">Unlimited Events</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
