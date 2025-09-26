import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { VenueCreateFlow } from '@/components/venue/VenueCreateFlow'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to create a venue.</p>
          <Button onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Venue</h1>
            <p className="text-gray-600 mt-2">
              Join Voxxy's network of event venues. Build your profile and start attracting events.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <VenueCreateFlow />
      </div>
    </div>
  )
}