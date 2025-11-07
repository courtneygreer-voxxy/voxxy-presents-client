import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Users, Mail, ArrowRight, Home, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function ConsumerDashboard() {
  const navigate = useNavigate()
  const { userProfile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a]">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Voxxy Presents</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                {userProfile?.name || userProfile?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome to Voxxy Presents!
            </h2>
            <p className="text-gray-300">
              You're currently signed in as a guest user
            </p>
          </div>

          {/* Info Alert */}
          <Alert className="bg-blue-500/20 border-blue-500/50">
            <AlertDescription className="text-white">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Looking to host events or offer services?</p>
                  <p className="text-sm text-gray-200">
                    You'll need a Producer or Vendor account to access those features. Contact us to upgrade your account!
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Account Type Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Producer Card */}
            <Card className="bg-white/5 backdrop-blur-xl border border-purple-500/30 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Producer Account</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Host events and manage your community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" />
                    <span>Create and manage events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" />
                    <span>Build your audience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" />
                    <span>Track RSVPs and engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" />
                    <span>Manage your organization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Vendor Card */}
            <Card className="bg-white/5 backdrop-blur-xl border border-pink-500/30 hover:border-pink-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Building2 className="h-6 w-6 text-pink-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Vendor Account</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  List your venue or services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-pink-400 flex-shrink-0" />
                    <span>Showcase your venue or services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-pink-400 flex-shrink-0" />
                    <span>Manage bookings and inquiries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-pink-400 flex-shrink-0" />
                    <span>Get discovered by event organizers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-pink-400 flex-shrink-0" />
                    <span>Update pricing and availability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(236,72,153,0.5)]"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Us to Upgrade
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/40"
            >
              <Home className="h-4 w-4 mr-2" />
              Browse Events
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-8 text-sm text-gray-400">
            <p>
              Questions? Email us at{' '}
              <a
                href="mailto:support@voxxypresents.com"
                className="text-pink-400 hover:text-pink-300 underline"
              >
                support@voxxypresents.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
