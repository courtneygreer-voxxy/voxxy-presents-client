import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Mail, ArrowRight, Sparkles, Building2, DollarSign, Star } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function VendorPendingPage() {
  const { userProfile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-2xl space-y-8 my-8 md:my-12">

          {/* Main Status Card */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-10 w-10 text-blue-300" />
              </div>
              <Badge className="bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-2 text-sm font-medium mb-4 w-fit mx-auto">
                <Sparkles className="h-4 w-4 mr-2" />
                Vendor Account Active
              </Badge>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Welcome, Vendor Partner!
              </CardTitle>
              <CardDescription className="text-lg text-gray-200">
                Your marketplace profile is being set up
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Thank you for joining Voxxy Presents as a Vendor! We're preparing your profile for the
                  marketplace. You'll soon be able to showcase your venue or services to event organizers
                  and manage bookings seamlessly.
                </p>

                {userProfile?.email && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">Account:</strong> {userProfile.email}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      <strong className="text-white">Role:</strong> Vendor
                    </p>
                    {userProfile.name && (
                      <p className="text-sm text-gray-300 mt-1">
                        <strong className="text-white">Name:</strong> {userProfile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                  <Building2 className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                  <h3 className="font-semibold text-white text-sm mb-1">Venue Listing</h3>
                  <p className="text-xs text-gray-300">Showcase your space or services</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                  <DollarSign className="h-8 w-8 text-green-300 mx-auto mb-2" />
                  <h3 className="font-semibold text-white text-sm mb-1">Booking Management</h3>
                  <p className="text-xs text-gray-300">Handle inquiries and reservations</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                  <Star className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
                  <h3 className="font-semibold text-white text-sm mb-1">Get Discovered</h3>
                  <p className="text-xs text-gray-300">Connect with event organizers</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Mail className="h-5 w-5 text-blue-300 mr-2" />
                  <h3 className="font-semibold text-white">What's Next?</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• We're building your vendor dashboard</li>
                  <li>• You'll receive profile setup instructions via email</li>
                  <li>• Our team will help you optimize your listing</li>
                  <li>• Full marketplace access coming soon</li>
                </ul>
                <div className="mt-4">
                  <Button
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30"
                    size="sm"
                    asChild
                  >
                    <a href="mailto:team@voxxypresents.com">
                      Contact Our Team
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="text-center pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-4">
                  Need to sign in with a different account?
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30"
                  >
                    Sign Out
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <Link to="/">
                      Back to Home
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Vendor Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p><strong className="text-white">Marketplace Exposure:</strong> Get discovered by active event organizers</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p><strong className="text-white">Direct Bookings:</strong> Manage inquiries and reservations in one place</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p><strong className="text-white">Automated Guest Lists:</strong> Seamless coordination with event hosts</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p><strong className="text-white">Pricing & Availability:</strong> Keep your information up-to-date easily</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
