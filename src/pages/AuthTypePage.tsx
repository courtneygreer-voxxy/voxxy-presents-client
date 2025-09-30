import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building2, ArrowRight } from 'lucide-react'

export default function AuthTypePage() {
  const navigate = useNavigate()

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
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Voxxy</h1>
            <p className="text-gray-300 text-lg">Choose your account type to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Club Owner Card */}
            <Card className="bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white">Club Owner</CardTitle>
                <CardDescription className="text-gray-300">
                  Organize events and build your community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Create and manage events</li>
                  <li>• Build member communities</li>
                  <li>• Track RSVPs and engagement</li>
                  <li>• Access to beta features</li>
                </ul>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate('/signup/club-owner')}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => navigate('/login/club-owner')}
                    variant="outline"
                    className="flex-1 bg-white/90 border-white text-black hover:bg-white"
                  >
                    Login
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Venue Owner Card */}
            <Card className="bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white">Venue Owner</CardTitle>
                <CardDescription className="text-gray-300">
                  List your venue and connect with organizers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• List and promote your venue</li>
                  <li>• Connect with event organizers</li>
                  <li>• Manage booking requests</li>
                  <li>• Immediate access - no waiting</li>
                </ul>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate('/signup/venue-owner')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => navigate('/login/venue-owner')}
                    variant="outline"
                    className="flex-1 bg-white/90 border-white text-black hover:bg-white"
                  >
                    Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Not sure which is right for you?{' '}
              <a href="/help" className="text-purple-400 hover:text-purple-300 underline">
                Learn more about the differences
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}