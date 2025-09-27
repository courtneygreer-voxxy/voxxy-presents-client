import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { VenueCreateFlow } from '@/components/venue/VenueCreateFlow'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2 } from 'lucide-react'

export default function VenueCreatePage() {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated } = useAuth()

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated background dots */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-8 w-full max-w-md relative z-10">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-gray-300 mb-6">Please sign in to create a venue.</p>
            <Button
              onClick={() => navigate('/login')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated background dots */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-32 left-1/3 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-purple-300/30 rounded-full animate-pulse delay-300"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/voxxy-shop')}
              className="text-white hover:bg-white/10 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Voxxy Shop
            </Button>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-white">Create Your Venue</h1>
            <p className="text-gray-300 mt-2">
              Join Voxxy's network of event venues. Build your profile and start attracting events.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <VenueCreateFlow />
      </div>
    </div>
  )
}