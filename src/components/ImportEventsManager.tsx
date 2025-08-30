import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Download, 
  RefreshCw, 
  Calendar,
  ExternalLink,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { PlatformConnectionManager } from "./platform/PlatformConnectionManager"
import type { Organization } from '@/types/database'

interface ImportEventsManagerProps {
  organization: Organization
  onEventImported?: (events: any[]) => void
}

export function ImportEventsManager({ organization, onEventImported }: ImportEventsManagerProps) {
  const [importing, setImporting] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const handleImportFromPlatform = async (platform: string) => {
    setImporting(true)
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock imported events
      const mockEvents = [
        {
          title: `Sample Event from ${platform}`,
          description: `This event was imported from ${platform}`,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          platform: platform
        }
      ]
      
      onEventImported?.(mockEvents)
      setLastSync(new Date())
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Import Events
          </CardTitle>
          <CardDescription>
            Import events from your connected platforms or create them manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="platforms" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="platforms">From Platforms</TabsTrigger>
              <TabsTrigger value="manual">Manual Create</TabsTrigger>
            </TabsList>
            
            <TabsContent value="platforms" className="space-y-4">
              {/* Quick Import Section */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Quick Import</h4>
                      <p className="text-sm text-blue-700">Import events from connected platforms</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastSync && (
                        <span className="text-xs text-blue-600">
                          Last sync: {lastSync.toLocaleTimeString()}
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleImportFromPlatform('Eventbrite')}
                        disabled={importing}
                        className="bg-white"
                      >
                        {importing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Import Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Connections */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connected Platforms</CardTitle>
                  <CardDescription>
                    Manage your platform connections and sync settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PlatformConnectionManager
                    organizationId={organization.id}
                    showAddConnection={true}
                    compact={true}
                  />
                </CardContent>
              </Card>

              {/* Import History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Imports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mock import history */}
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">Eventbrite Sync</div>
                          <div className="text-sm text-gray-600">3 events imported</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">2 hours ago</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">Luma Sync</div>
                          <div className="text-sm text-gray-600">Scheduled for tonight</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">Auto-sync</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Event Creation</h3>
                  <p className="text-gray-600 mb-4">
                    Create events manually using our event creation wizard
                  </p>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Event
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}