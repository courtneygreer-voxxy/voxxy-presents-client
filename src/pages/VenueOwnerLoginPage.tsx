import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Mail, Lock, Building2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail } from '@/services/authService'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  submit?: string
}

export default function VenueOwnerLoginPage() {
  const navigate = useNavigate()
  const { signIn, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    if (error) {
      clearError()
    }
  }

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
      // No manual navigation needed here
    } catch (err) {
      console.error('Venue owner login error:', err)
      setErrors(prev => ({ ...prev, submit: 'Invalid email or password. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="w-full bg-white/15 backdrop-blur-md border border-white/30">
            <CardHeader className="text-center">
              <Button
                onClick={() => navigate('/auth')}
                variant="ghost"
                size="sm"
                className="absolute top-4 left-4 text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Building2 className="h-6 w-6 text-green-400" />
                <CardTitle className="text-2xl font-bold text-white">Venue Owner Login</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Sign in to manage your venue and bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-green-400"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-green-400"
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
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

                {/* Error Display */}
                {(error || errors.submit) && (
                  <Alert className="bg-red-400/10 border-red-400/30">
                    <AlertDescription className="text-red-300">
                      {error || errors.submit}
                    </AlertDescription>
                  </Alert>
                )}
              </form>

              {/* Forgot Password */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-green-400 hover:text-green-300 text-sm transition-colors"
                  disabled={isSubmitting}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Switch to Signup */}
              <div className="mt-6 text-center">
                <p className="text-gray-300 text-sm">
                  Don't have a venue owner account?{' '}
                  <button
                    onClick={() => navigate('/signup/venue-owner')}
                    className="text-green-400 hover:text-green-300 font-medium transition-colors"
                    disabled={isSubmitting}
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}