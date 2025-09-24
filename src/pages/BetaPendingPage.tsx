import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Mail, ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function BetaPendingPage() {
  const { userProfile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-8">

          {/* Main Beta Status Card */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-purple-300" />
              </div>
              <Badge className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 px-4 py-2 text-sm font-medium mb-4 w-fit mx-auto">
                <Sparkles className="h-4 w-4 mr-2" />
                Beta Access Pending
              </Badge>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Welcome to Voxxy Presents!
              </CardTitle>
              <CardDescription className="text-lg text-gray-200">
                Your beta access request is being reviewed by our team
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Thank you for your interest in joining Voxxy Presents! We've received your beta access request
                  and our team is currently reviewing your application. You'll receive an email confirmation once
                  your access has been approved.
                </p>

                {userProfile?.email && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">Account:</strong> {userProfile.email}
                    </p>
                    {userProfile.betaRequestedAt && (
                      <p className="text-sm text-gray-300 mt-1">
                        <strong className="text-white">Requested:</strong> {new Date(userProfile.betaRequestedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
                    <h3 className="font-semibold text-white">What's Next?</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Our team will review your application</li>
                    <li>• We'll reach out to discuss your event needs</li>
                    <li>• Beta pricing and onboarding details</li>
                    <li>• Full platform access upon approval</li>
                  </ul>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <Mail className="h-5 w-5 text-blue-300 mr-2" />
                    <h3 className="font-semibold text-white">Questions?</h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    Need to update your information or have questions about beta access?
                  </p>
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
                  <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                    <Link to="/">
                      Back to Home
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Beta Process Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Application Submitted</p>
                    <p className="text-sm text-gray-300">Your beta access request has been received</p>
                  </div>
                </div>

                <div className="flex items-center opacity-50">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Team Review</p>
                    <p className="text-sm text-gray-300">We'll evaluate your event organizing needs</p>
                  </div>
                </div>

                <div className="flex items-center opacity-50">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Approval & Setup</p>
                    <p className="text-sm text-gray-300">Personal onboarding and full platform access</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}