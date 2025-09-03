import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Download, ArrowLeft, CheckCircle } from 'lucide-react'
import CreateClubFlowEnhanced from './CreateClubFlowEnhanced'
import { getUserProfileConnections } from '@/services/profilePlatformService'
import type { CreateClubData } from '@/types/createClub'
import type { PlatformConnection } from '@/types/platformIntegration'

interface ImportFromEventbriteFlowProps {
  onBack: () => void
}

export default function ImportFromEventbriteFlow({ onBack }: ImportFromEventbriteFlowProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [eventbriteConnection, setEventbriteConnection] = useState<PlatformConnection | null>(null)
  const [importedData, setImportedData] = useState<CreateClubData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEventbriteData()
  }, [currentUser])

  const loadEventbriteData = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      setError(null)

      // Get user's Eventbrite connection
      const connections = await getUserProfileConnections(currentUser.uid)
      const eventbriteConn = connections.find(conn => 
        conn.platform === 'eventbrite' && conn.status === 'connected'
      )

      if (!eventbriteConn) {
        setError('No Eventbrite connection found. Please connect your account first.')
        return
      }

      setEventbriteConnection(eventbriteConn)

      // Mock importing data from Eventbrite (in production, this would call Eventbrite API)
      const mockEventbriteData: CreateClubData = {
        name: eventbriteConn.platformAccountName || 'My Eventbrite Organization',
        tagline: 'Imported from Eventbrite',
        description: `Welcome to ${eventbriteConn.platformAccountName || 'our community'}! This club was imported from our Eventbrite account to help us better manage our events and community.`,
        contactEmail: eventbriteConn.platformAccountEmail || currentUser.email || '',
        defaultLocation: 'TBD',
        defaultAddress: '',
        logoUrl: undefined,
        bannerUrl: undefined,
        socialLinks: {
          eventbrite: eventbriteConn.platformAccountUrl
        },
        aboutOfferings: [
          'Event management and ticketing',
          'Community building',
          'Regular meetups and gatherings'
        ]
      }

      setImportedData(mockEventbriteData)

    } catch (error) {
      console.error('Failed to load Eventbrite data:', error)
      setError('Failed to load Eventbrite data. Please try again.')
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Failed to load data from Eventbrite."
      })
    } finally {
      setLoading(false)
    }
  }

  // If we have imported data, render the club creation flow with pre-populated data
  if (importedData && !loading && !error) {
    return (
      <div className="relative">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Options
          </Button>
        </div>

        <CreateClubFlowEnhanced 
          initialData={importedData}
          isImportedFromEventbrite={true}
          eventbriteConnection={eventbriteConnection}
        />
      </div>
    )
  }

  // Loading, error, or selection screen
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Import from Eventbrite</h1>
              <p className="text-gray-300 mt-2">Setting up your club with Eventbrite data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                ) : error ? (
                  <div className="text-2xl">❌</div>
                ) : (
                  <Download className="h-8 w-8 text-orange-400" />
                )}
              </div>
              <CardTitle className="text-white">
                {loading ? 'Loading Eventbrite Data' : error ? 'Import Failed' : 'Ready to Import'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {loading && (
                <div>
                  <p className="text-gray-200 mb-4">
                    Fetching your account information from Eventbrite...
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Connected to Eventbrite</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading account details...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div>
                  <p className="text-red-300 mb-4">{error}</p>
                  <div className="space-y-3">
                    <Button
                      onClick={loadEventbriteData}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Retry Import
                    </Button>
                    <Button
                      onClick={onBack}
                      variant="outline"
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Options
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}