import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Loader2, Mail, Lock, Users, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail } from '@/utils/validation'

interface UnifiedLoginFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
  onForgotPassword?: () => void
  defaultTab?: 'club-owner' | 'venue-owner'
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

export function UnifiedLoginForm({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword,
  defaultTab = 'club-owner',
}: UnifiedLoginFormProps) {
  const { signIn, loading, error, clearError } = useAuth()
  const [activeTab, setActiveTab] = useState<UserType>(defaultTab)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
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
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear previous errors for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
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
        password: formData.password,
      })
      onSuccess?.()
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTabContent = (userType: UserType) => {
    const isClubOwner = userType === 'club-owner'

    return (
      <div className="space-y-6">
        {/* Tab Description */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            {isClubOwner ? (
              <Users className="h-5 w-5 text-primary" />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
            <h3 className="text-lg font-semibold text-foreground">
              {isClubOwner ? 'Club Owner Login' : 'Venue Owner Login'}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm">
            {isClubOwner
              ? 'Organize events and manage your club community'
              : 'Manage your venue and connect with event organizers'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 bg-background/10 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-primary hover:text-primary/70 text-sm transition-colors"
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
                className="pl-10 pr-10 bg-background/10 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
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
            {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full voxxy-btn-solid"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              `Sign in as ${isClubOwner ? 'Club Owner' : 'Venue Owner'}`
            )}
          </Button>

          {/* Error Display */}
          {(error || errors.submit) && (
            <Alert className="bg-red-400/10 border-red-400/30">
              <AlertDescription className="text-red-300">{error || errors.submit}</AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md bg-background/15 backdrop-blur-md border border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
        <CardDescription>Choose your account type to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as UserType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/10 backdrop-blur-sm">
            <TabsTrigger
              value="club-owner"
              className="data-[state=active]:bg-violet-200 data-[state=active]:text-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground text-muted-foreground"
            >
              <Users className="h-4 w-4 mr-2" />
              Club Owner
            </TabsTrigger>
            <TabsTrigger
              value="venue-owner"
              className="data-[state=active]:bg-violet-200 data-[state=active]:text-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground text-muted-foreground"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Venue Owner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="club-owner" className="mt-0">
            {getTabContent('club-owner')}
          </TabsContent>

          <TabsContent value="venue-owner" className="mt-0">
            {getTabContent('venue-owner')}
          </TabsContent>
        </Tabs>

        {/* Switch to Sign Up */}
        <div className="mt-6">
          <Separator className="bg-background/20" />
          <div className="text-center mt-4">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-primary hover:text-primary/70 font-medium transition-colors"
                disabled={isSubmitting}
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
