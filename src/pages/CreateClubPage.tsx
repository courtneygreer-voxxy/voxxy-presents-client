import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Download, 
  ArrowRight, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import CreateClubFlowEnhanced from '@/components/CreateClubFlowEnhanced'
import ImportFromEventbriteFlow from '@/components/ImportFromEventbriteFlow'
import { getUserProfileConnections } from '@/services/profilePlatformService'
import type { PlatformConnection } from '@/types/platformIntegration'

export default function CreateClubPage() {
  const { currentUser } = useAuth()
  const [creationMethod, setCreationMethod] = useState<'manual' | 'eventbrite' | null>(null)
  const [hasEventbriteConnection, setHasEventbriteConnection] = useState(false)
  const [loading, setLoading] = useState(true)
  const [connections, setConnections] = useState<PlatformConnection[]>([])

  useEffect(() => {
    checkEventbriteConnection()
  }, [currentUser])

  const checkEventbriteConnection = async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    try {
      const userConnections = await getUserProfileConnections(currentUser.uid)
      const eventbriteConn = userConnections.find(conn => 
        conn.platform === 'eventbrite' && conn.status === 'connected'
      )
      
      setConnections(userConnections)
      setHasEventbriteConnection(!!eventbriteConn)
    } catch (error) {
      console.error('Failed to check Eventbrite connection:', error)
      setHasEventbriteConnection(false)
    } finally {
      setLoading(false)
    }
  }

  // If user has chosen a creation method, render the appropriate flow
  if (creationMethod === 'manual') {
    return <CreateClubFlowEnhanced />
  }

  if (creationMethod === 'eventbrite') {
    return <ImportFromEventbriteFlow onBack={() => setCreationMethod(null)} />
  }

  // Show creation method choice screen
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Create Your Club</h1>
          <p className="text-gray-300 mt-2">Choose how you'd like to set up your community</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {loading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-gray-300">Checking your platform connections...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create New Club - Manual */}
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <Plus className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Create New Club</h3>
                      <p className="text-sm text-gray-300 font-normal">Start from scratch</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-200">
                    Build your club profile step by step. Perfect if you're starting fresh or want complete control over your setup.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Custom branding and messaging</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Full customization options</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Manual event creation</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setCreationMethod('manual')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Club
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Import from Eventbrite */}
              <Card className={`bg-white/10 backdrop-blur-sm border border-white/20 transition-all ${
                hasEventbriteConnection 
                  ? 'hover:border-white/30 cursor-pointer group' 
                  : 'opacity-60'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                      hasEventbriteConnection
                        ? 'bg-orange-500/20 group-hover:bg-orange-500/30'
                        : 'bg-gray-500/20'
                    }`}>
                      <Download className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Import from Eventbrite</h3>
                      <p className="text-sm text-gray-300 font-normal">Use existing account</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-200">
                    Import your club information and events directly from your connected Eventbrite account.
                  </p>

                  {hasEventbriteConnection ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Auto-populate club details</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Import existing events</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Real-time event sync</span>
                        </div>
                      </div>

                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-green-200">Eventbrite account connected</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => setCreationMethod('eventbrite')}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white group-hover:bg-orange-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Import from Eventbrite
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-yellow-200">Eventbrite not connected</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400">
                        Connect your Eventbrite account in Profile Settings → Platform Integrations first.
                      </p>

                      <Button
                        onClick={() => window.open('/profile?tab=integrations', '_blank')}
                        variant="outline"
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect Eventbrite
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}