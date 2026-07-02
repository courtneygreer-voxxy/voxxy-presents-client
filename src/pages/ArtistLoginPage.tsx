import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Eye, EyeOff, Loader2, Mail, Lock, Palette } from 'lucide-react'
import { useForceTheme } from '@/hooks/useForceTheme'

interface FormData {
  email: string
  password: string
}

export default function ArtistLoginPage() {
  useForceTheme('dark')
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Prototype passthrough — navigate to dashboard after brief delay
    setTimeout(() => {
      setIsSubmitting(false)
      navigate('/artist/dashboard')
    }, 800)
  }

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
            <h1 className="text-5xl font-bold mb-4">Welcome Back, Artist</h1>
            <p className="text-xl text-white/80 max-w-md">
              Sign in to manage your shows, track applications, and share your work with producers
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Palette className="h-16 w-16 mx-auto text-primary mb-4" />
              <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            </div>

            <Card className="w-full bg-background/5 backdrop-blur-xl border border-primary/30 shadow-[0_0_50px_rgba(144,84,227,0.3)]">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground">Artist Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
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
                        className="pl-10 bg-background/5 border-primary/30 text-foreground placeholder:text-muted-foreground focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground">
                        Password
                      </Label>
                      <button
                        type="button"
                        className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
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
                        className="pl-10 pr-10 bg-background/5 border-primary/30 text-foreground placeholder:text-muted-foreground focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
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
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full voxxy-btn-cta font-semibold shadow-md dark:shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-6">
                  <Separator className="bg-background/20" />
                  <div className="text-center mt-4">
                    <p className="text-muted-foreground text-sm">
                      Don't have an account?{' '}
                      <Link
                        to="/artist/signup"
                        className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
                      >
                        Create your artist profile
                      </Link>
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
