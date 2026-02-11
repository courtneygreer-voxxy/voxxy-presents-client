import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Sparkles, Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail } from '@/utils/validation'
import { usePageTracking } from '@/hooks/usePageTracking'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  submit?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Track page views
  usePageTracking('Login')

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear field-specific errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Clear submit error
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: undefined }))
    }

    // Clear AuthContext error
    if (error) {
      clearError()
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors(prev => ({ ...prev, submit: undefined }))

    try {
      await signIn({
        email: formData.email.trim(),
        password: formData.password
      })

      // RedirectIfAuthenticated component will handle routing based on user role
    } catch (err) {
      console.error('Login error:', err)

      let errorMessage = 'Invalid email or password. Please try again.'
      if (err instanceof Error) {
        errorMessage = err.message
      }

      setErrors(prev => ({ ...prev, submit: errorMessage }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Development-only bypass login
  const handleDevLogin = async () => {
    setIsSubmitting(true)
    setErrors({})

    try {
      const { authApi } = await import('@/services/api')
      const data = await authApi.devLogin()

      // Manually trigger sign in flow
      await signIn({ email: data.email, password: 'test123' })
    } catch (err) {
      console.error('Dev login error:', err)
      setErrors({ submit: 'Dev login failed' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#a855f7] via-[#ec4899] to-[#3b82f6] relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          <div className="text-center space-y-6">
            <Sparkles className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl text-purple-100 max-w-md">
              Sign in to manage your events, engage your community, and grow with Voxxy Presents
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-[#0f0b1f] relative overflow-hidden">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 z-50 text-gray-300 hover:text-white hover:bg-white/10"
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
              <Sparkles className="h-16 w-16 mx-auto text-purple-400 mb-4" />
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            </div>

            <Card className="w-full bg-white/5 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">Sign In</CardTitle>
                <CardDescription className="text-gray-300">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Error Display */}
                {(error || errors.submit) && (
                  <Alert className="bg-red-500/20 border-red-500 border-2 mb-6 shadow-lg">
                    <AlertDescription className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-white font-medium">
                        {error || errors.submit}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10 bg-white/5 border-purple-500/30 text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
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
                      <Label htmlFor="password" className="text-white">Password</Label>
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
                        disabled={isSubmitting}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10 bg-white/5 border-purple-500/30 text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                  >
                    {isSubmitting || loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                {/* Development Login Bypass */}
                {import.meta.env.DEV && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={handleDevLogin}
                      disabled={isSubmitting}
                      variant="outline"
                      className="w-full border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 font-medium"
                    >
                      🔧 Dev Login (Bypass Auth)
                    </Button>
                    <p className="text-yellow-400/70 text-xs text-center mt-2">
                      Development only - creates test user automatically
                    </p>
                  </div>
                )}

                {/* Request Beta Access */}
                <div className="mt-6">
                  <Separator className="bg-white/20" />
                  <div className="text-center mt-4">
                    <p className="text-gray-300 text-sm">
                      Don't have an account?{' '}
                      <button
                        onClick={() => navigate('/contact')}
                        className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
                        disabled={isSubmitting}
                      >
                        Request beta access
                      </button>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
