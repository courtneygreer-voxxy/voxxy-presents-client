import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  Palette,
  Globe,
  Instagram,
} from 'lucide-react'
import { useForceTheme } from '@/hooks/useForceTheme'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  businessName: string
  instagramHandle: string
  tiktokHandle: string
  website: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  acceptTerms?: string
  submit?: string
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  businessName: '',
  instagramHandle: '',
  tiktokHandle: '',
  website: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

export default function ArtistSignUpPage() {
  useForceTheme('dark')
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms to continue'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    // Prototype passthrough — navigate to dashboard after brief delay
    setTimeout(() => {
      setIsSubmitting(false)
      navigate('/artist/dashboard')
    }, 800)
  }

  const inputClass =
    'bg-background/5 border-primary/30 text-foreground placeholder:text-muted-foreground focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20'

  return (
    <div className="dark voxxy-public-page min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 voxxy-gradient-hero-split relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-foreground">
          <div className="text-center space-y-6">
            <Palette className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-4">Join as an Artist</h1>
            <p className="text-xl text-white/80 max-w-md">
              Create your profile, discover shows, track applications, and connect with producers —
              all in one place
            </p>
            <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
              {[
                'Get discovered by event producers',
                'Track all your show applications',
                'Share a public artist profile',
                'Get notified about new opportunities',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-white/70">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-400 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 voxxy-auth-panel relative overflow-hidden">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 z-50 text-muted-foreground hover:text-foreground hover:bg-background/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div
          className="absolute inset-0 opacity-[0.3] lg:opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23a855f7' fillOpacity='0.3'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg w-full space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Palette className="h-16 w-16 mx-auto text-primary mb-4" />
              <h1 className="text-3xl font-bold text-foreground">Join as an Artist</h1>
            </div>

            <Card className="w-full bg-background/5 backdrop-blur-xl border border-primary/30 shadow-[0_0_50px_rgba(144,84,227,0.3)]">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Create Your Artist Profile
                </CardTitle>
                <CardDescription>
                  Set up your account to start applying for shows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-foreground">
                        First Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={`pl-10 ${inputClass}`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-red-400 text-sm">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-foreground">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={inputClass}
                        disabled={isSubmitting}
                      />
                      {errors.lastName && (
                        <p className="text-red-400 text-sm">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 ${inputClass}`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  </div>

                  {/* Phone + Business Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground">
                        Phone <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 555-5555"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`pl-10 ${inputClass}`}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-foreground">
                        Artist / Business Name{' '}
                        <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <Input
                        id="businessName"
                        placeholder="Studio name or brand"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        className={inputClass}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Social Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-foreground">
                        Instagram <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="instagram"
                          placeholder="@handle"
                          value={formData.instagramHandle}
                          onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                          className={`pl-10 ${inputClass}`}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok" className="text-foreground">
                        TikTok <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <Input
                        id="tiktok"
                        placeholder="@handle"
                        value={formData.tiktokHandle}
                        onChange={(e) => handleInputChange('tiktokHandle', e.target.value)}
                        className={inputClass}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-foreground">
                        Website <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          placeholder="yoursite.com"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className={`pl-10 ${inputClass}`}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-background/20" />

                  {/* Password Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min 8 characters"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`pl-10 pr-10 ${inputClass}`}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-sm">{errors.password}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`pl-10 pr-10 ${inputClass}`}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) =>
                        handleInputChange('acceptTerms', checked === true)
                      }
                      disabled={isSubmitting}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-snug">
                      I agree to the{' '}
                      <span className="text-pink-400 cursor-pointer">Terms of Service</span> and{' '}
                      <span className="text-pink-400 cursor-pointer">Privacy Policy</span>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-red-400 text-sm">{errors.acceptTerms}</p>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full voxxy-btn-cta font-semibold shadow-md dark:shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Artist Account'
                    )}
                  </Button>
                </form>

                {/* Sign In Link */}
                <div className="mt-6">
                  <Separator className="bg-background/20 mb-4" />
                  <p className="text-muted-foreground text-sm text-center">
                    Already have an account?{' '}
                    <Link
                      to="/artist/login"
                      className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
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
