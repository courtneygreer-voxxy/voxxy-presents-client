import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  Users,
  Building2,
  Sparkles,
  Calendar,
  MapPin,
  TrendingUp,
  Coffee,
  Music,
  ArrowLeft,
  Home
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail } from '@/utils/validation'

interface SplitScreenLoginFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
  onForgotPassword?: () => void
}

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  submit?: string
}

type UserType = 'club-owner' | 'venue-owner'

export function SplitScreenLoginForm({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword
}: SplitScreenLoginFormProps) {
  const navigate = useNavigate()
  const { signIn, loading, error, clearError } = useAuth()
  const [activeType, setActiveType] = useState<UserType>('club-owner')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Real-time validation
  const validateField = (field: keyof FormData, value: any): string | undefined => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!validateEmail(value)) return 'Please enter a valid email address'
        return undefined

      case 'password':
        if (!value) return 'Password is required'
        return undefined

      default:
        return undefined
    }
  }

  // Handle input changes with validation
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear previous errors for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Clear general auth error when user starts typing
    if (error) {
      clearError()
    }
  }

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    const emailError = validateField('email', formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validateField('password', formData.password)
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    clearError()

    try {
      await signIn({
        email: formData.email,
        password: formData.password
      })
      onSuccess?.()
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const clubFeatures = [
    { icon: Calendar, text: 'Organize amazing events' },
    { icon: Users, text: 'Build your community' },
    { icon: Music, text: 'Curate unique experiences' },
    { icon: Sparkles, text: 'Track your success' }
  ]

  const venueFeatures = [
    { icon: TrendingUp, text: 'Increase foot traffic' },
    { icon: Coffee, text: 'Generate steady revenue' },
    { icon: MapPin, text: 'Get discovered by organizers' },
    { icon: Building2, text: 'Showcase your space' }
  ]

  return (
    <div className="min-h-screen voxxy-gradient-page-alt relative overflow-hidden flex">
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

      {/* Club Owner Side */}
      <div
        className={`relative flex-1 transition-all duration-500 cursor-pointer ${
          activeType === 'club-owner'
            ? 'flex-[2] bg-gradient-to-br from-primary/40 to-pink-600/40'
            : 'bg-background/5 hover:bg-background/10'
        }`}
        onClick={() => setActiveType('club-owner')}
      >
        <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Users className="h-10 w-10 text-violet-700 dark:text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Club Owners</h2>
            <p className="text-muted-foreground text-lg">Create unforgettable events</p>
          </div>

          {activeType === 'club-owner' && (
            <div className="space-y-4 mb-8 animate-in fade-in-50 duration-300">
              {clubFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 text-foreground/90">
                  <feature.icon className="h-5 w-5 flex-shrink-0 text-violet-700 dark:text-primary" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          )}

          {activeType !== 'club-owner' && (
            <div className="text-foreground/60 text-sm">
              Click to login as Club Owner
            </div>
          )}
        </div>
      </div>

      {/* Center Divider */}
      <div className="relative w-px bg-background/20">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-background/10 rounded-full flex items-center justify-center">
          <Separator className="w-px h-4 bg-background/40" />
        </div>
      </div>

      {/* Venue Owner Side */}
      <div
        className={`relative flex-1 transition-all duration-500 cursor-pointer ${
          activeType === 'venue-owner'
            ? 'flex-[2] bg-gradient-to-br from-primary/40 to-purple-600/40'
            : 'bg-background/5 hover:bg-background/10'
        }`}
        onClick={() => setActiveType('venue-owner')}
      >
        <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Building2 className="h-10 w-10 text-purple-700 dark:text-purple-300" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Venue Owners</h2>
            <p className="text-muted-foreground text-lg">Monetize your space</p>
          </div>

          {activeType === 'venue-owner' && (
            <div className="space-y-4 mb-8 animate-in fade-in-50 duration-300">
              {venueFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 text-foreground/90">
                  <feature.icon className="h-5 w-5 flex-shrink-0 text-purple-700 dark:text-purple-300" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          )}

          {activeType !== 'venue-owner' && (
            <div className="text-foreground/60 text-sm">
              Click to login as Venue Owner
            </div>
          )}
        </div>
      </div>

      {/* Login Form Overlay */}
      {activeType && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Card className="voxxy-auth-card pointer-events-auto w-full max-w-md animate-in fade-in-50 zoom-in-95 duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                {activeType === 'club-owner' ? (
                  <>
                    <Users className="h-6 w-6 text-violet-700 dark:text-primary" />
                    Club Owner Login
                  </>
                ) : (
                  <>
                    <Building2 className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                    Venue Owner Login
                  </>
                )}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {activeType === 'club-owner'
                  ? 'Ready to create your next event?'
                  : 'Ready to list your venue?'
                }
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="voxxy-input-frost pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="voxxy-auth-link text-sm transition-colors"
                      disabled={isSubmitting}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="voxxy-input-frost pl-10 pr-10"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className={`w-full ${
                    activeType === 'club-owner'
                      ? 'bg-violet-100 text-foreground border border-violet-200 hover:bg-violet-200 dark:border-transparent dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80'
                      : 'bg-violet-100 text-foreground border border-violet-200 hover:bg-violet-200 dark:border-transparent dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80'
                  }`}
                >
                  {isSubmitting || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    `Sign in as ${activeType === 'club-owner' ? 'Club Owner' : 'Venue Owner'}`
                  )}
                </Button>

                {/* Error Display */}
                {(error || errors.submit) && (
                  <Alert className="bg-red-400/10 border-red-400/30">
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      {error || errors.submit}
                    </AlertDescription>
                  </Alert>
                )}
              </form>

              {/* Switch to Sign Up */}
              <div className="mt-6">
                <Separator className="bg-background/20" />
                <div className="text-center mt-4">
                  <p className="text-muted-foreground text-sm">
                    Don't have an account?{' '}
                    <button
                      onClick={onSwitchToSignUp}
                      className="voxxy-auth-link font-medium transition-colors"
                      disabled={isSubmitting}
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer with Home Link */}
      <div className="absolute bottom-0 left-0 right-0 z-50 border-t border-border bg-gradient-to-t from-background/90 via-background/60 to-transparent py-4 backdrop-blur-sm dark:from-black/50 dark:via-black/20 dark:to-transparent">
        <div className="container mx-auto px-4 flex justify-center">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-background/10 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}