import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { UnifiedSignUpForm } from '@/components/auth/UnifiedSignUpForm'
import { usePageTracking } from '@/hooks/usePageTracking'
import { useForceTheme } from '@/hooks/useForceTheme'

export default function SignUpPage() {
  useForceTheme('dark')
  const navigate = useNavigate()

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Track page views
  usePageTracking('Sign Up')

  const handleSignUpSuccess = (email: string) => {
    // After successful signup, redirect to pending/account setup page
    navigate('/pending', {
      state: {
        message: 'Account created successfully! Please check your email for a verification code.',
      },
    })
  }

  const handleSwitchToLogin = () => {
    navigate('/login')
  }

  return (
    <div className="dark voxxy-public-page min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 voxxy-gradient-hero-split relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-foreground">
          <div className="text-center space-y-6">
            <Sparkles className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-4">Join Voxxy</h1>
            <p className="text-xl text-white/80 max-w-md">
              Start managing your events, building your community, and growing your business with
              Voxxy
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 voxxy-auth-panel relative overflow-hidden">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 z-50 text-muted-foreground hover:text-foreground hover:bg-background/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.3] lg:opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23a855f7' fillOpacity='0.3'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <span className="font-nav-logo text-[2.5rem] font-black italic tracking-[0.08em] text-white uppercase leading-none block mb-3">
                VOXXY
              </span>
            </div>

            <Card className="w-full bg-background/5 backdrop-blur-xl border border-primary/30 shadow-[0_0_50px_rgba(144,84,227,0.3)]">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground">Join Voxxy</CardTitle>
                <CardDescription>Choose your account type to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedSignUpForm
                  onSuccess={handleSignUpSuccess}
                  onSwitchToLogin={handleSwitchToLogin}
                  defaultTab="venue_owner"
                />

                {/* Already have account link */}
                <div className="mt-6">
                  <Separator className="bg-background/20 mb-4" />
                  <p className="text-muted-foreground text-sm text-center">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-primary hover:text-primary/70 font-medium transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
