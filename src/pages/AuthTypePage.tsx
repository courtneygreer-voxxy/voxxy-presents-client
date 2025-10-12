import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building2, ArrowRight, Home } from 'lucide-react'

export default function AuthTypePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Left Side - Club Owner */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#a855f7] via-[#ec4899] to-[#8b5cf6] relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen py-12 px-8 text-white">
          <div className="w-full max-w-md space-y-6">
            {/* Icon and Title */}
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Club Owner</h1>
              <p className="text-xl text-purple-100 mb-8">
                Organize events and build your community
              </p>
            </div>

            {/* Features */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
              <CardContent className="pt-6">
                <ul className="text-white space-y-3 text-base">
                  <li className="flex items-start">
                    <span className="mr-3 text-pink-300">✓</span>
                    <span>Create and manage events</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-pink-300">✓</span>
                    <span>Build member communities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-pink-300">✓</span>
                    <span>Track RSVPs and engagement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-pink-300">✓</span>
                    <span>Access to beta features</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/signup/club-owner')}
                className="w-full bg-white text-purple-700 hover:bg-gray-100 py-6 text-lg font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Sign Up
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/login/club-owner')}
                variant="outline"
                className="w-full bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white/20 py-6 text-lg font-semibold"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Venue Owner */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#ec4899] relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen py-12 px-8 text-white">
          <div className="w-full max-w-md space-y-6">
            {/* Icon and Title */}
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Venue Owner</h1>
              <p className="text-xl text-blue-100 mb-8">
                List your venue and connect with organizers
              </p>
            </div>

            {/* Features */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <CardContent className="pt-6">
                <ul className="text-white space-y-3 text-base">
                  <li className="flex items-start">
                    <span className="mr-3 text-blue-300">✓</span>
                    <span>List and promote your venue</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-blue-300">✓</span>
                    <span>Connect with event organizers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-blue-300">✓</span>
                    <span>Manage booking requests</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-blue-300">✓</span>
                    <span>Immediate access - no waiting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/signup/venue-owner')}
                className="w-full bg-white text-blue-700 hover:bg-gray-100 py-6 text-lg font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Sign Up
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/login/venue-owner')}
                variant="outline"
                className="w-full bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white/20 py-6 text-lg font-semibold"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Home Link */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm border-t border-white/10 py-4">
        <div className="container mx-auto px-4 flex justify-center">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="text-white hover:text-white hover:bg-white/20 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}