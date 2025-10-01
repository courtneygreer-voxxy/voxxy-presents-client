import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Settings,
  Calendar,
  Users,
  Eye,
  Loader,
  Edit,
  Plus,
  MapPin,
  Mail,
  User,
  Link2,
  Download,
  QrCode,
  CheckCircle,
  XCircle,
  Ticket,
  RefreshCw,
  DollarSign
} from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"
import { useAuth } from "@/hooks/useAuth"
import { OrganizationEditForm } from "@/components/OrganizationEditForm"
import { OrganizationDangerZone } from "@/components/OrganizationDangerZone"
import { ShareButton } from "@/components/ShareButton"
import AboutImagesManager from "@/components/AboutImagesManager"
import SubscribersList from "@/components/SubscribersList"
import { RSVPListModal } from "@/components/RSVPListModal"
import { PreviewBadge } from '@/components/ui/preview-badge'
import { isFeatureEnabled } from '@/config/environments'
import EventBudgetManager from '@/components/budget/EventBudgetManager'
import type { Organization, Event } from '@/types/database'

export default function OrganizationAdminEnhanced() {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { organization, events, loading, error, updateOrganization, deleteOrganization, refreshEvents } = useOrganization(orgSlug || '')
  
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Ticket validation state
  const [ticketCode, setTicketCode] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [validationLoading, setValidationLoading] = useState(false)
  const [validationHistory, setValidationHistory] = useState<any[]>([])
  const [manualCode, setManualCode] = useState('')
  const [ticketDashboard, setTicketDashboard] = useState<any>(null)
  const [ticketDashboardLoading, setTicketDashboardLoading] = useState(true)
  
  

  const adminEnabled = isFeatureEnabled('adminControls')


  const handleSaveOrganization = async (updates: Partial<Organization>) => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      await updateOrganization(updates)
      setSaveMessage('✅ Club updated successfully! Changes are now live.')
      setTimeout(() => setSaveMessage(null), 4000)
    } catch (error) {
      console.error('Failed to save organization:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSaveMessage(`❌ Failed to save changes: ${errorMessage}. Please try again.`)
      setTimeout(() => setSaveMessage(null), 7000)
    } finally {
      setIsSaving(false)
    }
  }




  const handleDeleteOrganization = async () => {
    setIsDeleting(true)
    setSaveMessage(null)

    try {
      await deleteOrganization()
      setSaveMessage('✅ Organization deleted successfully!')
      
      setTimeout(() => {
        navigate('/')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to delete organization:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSaveMessage(`❌ Failed to delete organization: ${errorMessage}. Please try again.`)
      setTimeout(() => setSaveMessage(null), 7000)
    } finally {
      setIsDeleting(false)
    }
  }

  // Ticket validation functions
  const validateTicket = async (code: string) => {
    if (!code.trim()) return

    setValidationLoading(true)
    setValidationResult(null)

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/tickets/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qrCode: code.trim() })
      })

      const result = await response.json()
      setValidationResult(result)

      // Add to validation history
      const historyItem = {
        id: Date.now(),
        code: code.trim(),
        result,
        timestamp: new Date(),
        success: response.ok
      }
      setValidationHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10 validations

      // Clear input after validation
      setTicketCode('')
      setManualCode('')
    } catch (error) {
      console.error('Ticket validation error:', error)
      setValidationResult({
        valid: false,
        message: 'Network error - please check your connection'
      })
    } finally {
      setValidationLoading(false)
    }
  }

  const handleManualValidation = () => {
    if (manualCode.trim()) {
      validateTicket(manualCode.trim())
    }
  }

  if (!adminEnabled) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-[0.5] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.5'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      <div className="relative z-10">
        <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Disabled</h1>
          <p className="text-gray-300 mb-6">Admin controls are not available in this environment.</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-[0.5] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.5'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      <div className="relative z-10">
        <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Loading admin panel...</p>
        </div>
      </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-[0.5] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.5'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      <div className="relative z-10">
        <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Organization Not Found</h1>
          <p className="text-gray-300 mb-6">{error || 'The requested organization could not be found.'}</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden admin-dark">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-[0.5] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.5'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{organization.name} Admin</h1>
              <p className="text-gray-300 mt-1">
                Manage your organization and events
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <ShareButton
                url={`${window.location.origin}/${orgSlug}`}
                title={organization.name}
                description={organization.description}
                variant="outline"
                size="sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/${orgSlug}`)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Public Page
              </Button>
            </div>
          </div>

          {/* Save Status */}
          {saveMessage && (
            <div className={`mt-4 p-4 rounded-lg border backdrop-blur-sm ${
              saveMessage.includes('✅') 
                ? 'bg-green-500/20 border-green-400/30 text-green-200' 
                : 'bg-red-500/20 border-red-400/30 text-red-200'
            }`}>
              <p className="text-sm font-medium">{saveMessage}</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="organization" className="flex gap-8" orientation="vertical">
          <div className="w-64 flex-shrink-0">
            <TabsList className="flex flex-col h-fit w-full !bg-transparent backdrop-blur-sm border border-white/20">
              <TabsTrigger value="organization" className="flex items-center gap-2 w-full justify-start !bg-transparent text-gray-400 hover:text-white hover:bg-white/10 data-[state=active]:!bg-white/20 data-[state=active]:!text-white transition-colors">
                <Edit className="h-4 w-4 text-purple-400" />
                Club
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2 w-full justify-start !bg-transparent text-gray-400 hover:text-white hover:bg-white/10 data-[state=active]:!bg-white/20 data-[state=active]:!text-white transition-colors">
                <Calendar className="h-4 w-4 text-purple-400" />
                Events
              </TabsTrigger>
              {/* Events Subcategories */}
              <div className="ml-2 flex flex-col">
                <TabsTrigger value="tickets" className="flex items-center gap-2 w-full justify-start !bg-transparent text-gray-400 hover:text-white hover:bg-white/10 data-[state=active]:!bg-white/20 data-[state=active]:!text-white transition-colors text-sm px-4 py-3">
                  <QrCode className="h-4 w-4 text-purple-400" />
                  Tickets
                </TabsTrigger>
                <TabsTrigger value="budget" className="flex items-center gap-2 w-full justify-start !bg-transparent text-gray-400 hover:text-white hover:bg-white/10 data-[state=active]:!bg-white/20 data-[state=active]:!text-white transition-colors text-sm px-4 py-3">
                  <DollarSign className="h-4 w-4 text-purple-400" />
                  Budget
                </TabsTrigger>
              </div>
              <TabsTrigger value="subscribers" className="flex items-center gap-2 w-full justify-start !bg-transparent text-gray-400 hover:text-white hover:bg-white/10 data-[state=active]:!bg-white/20 data-[state=active]:!text-white transition-colors">
                <Users className="h-4 w-4 text-purple-400" />
                Subscribers
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 w-full justify-start !bg-transparent text-gray-400 hover:text-white hover:bg-white/10 data-[state=active]:!bg-white/20 data-[state=active]:!text-white transition-colors">
                <Settings className="h-4 w-4 text-purple-400" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 min-w-0">

            {/* Organization Settings Tab */}
            <TabsContent value="organization">
              <div className="space-y-6">
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Organization Settings</CardTitle>
                    <CardDescription className="text-gray-300">
                      Update your organization's information, branding, and contact details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OrganizationEditForm
                      organization={organization}
                      onSave={handleSaveOrganization}
                      onCancel={() => {}}
                      isFullPage={true}
                      isSaving={isSaving}
                    />
                  </CardContent>
                </Card>


              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Events</h2>
                    <p className="text-gray-300">Import events from platforms or create new ones to manage your club</p>
                  </div>
                  <Button
                    asChild
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 relative z-20"
                  >
                    <Link to={`/${orgSlug}/create-event`}>
                      <Plus className="h-4 w-4" />
                      Create Event
                    </Link>
                  </Button>
                </div>

                {events.length === 0 ? (
                  <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 text-white">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-purple-400 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No events yet</h3>
                      <p className="text-gray-300 text-center mb-6">
                        Create events to get started.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          asChild
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Link to={`/${orgSlug}/create-event`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Event
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Card key={event.id} className="!bg-white/10 backdrop-blur-sm !border-white/20">
                        <CardContent className="p-6">
                          <div className="flex flex-col">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                              <div className="flex-1 mb-4 md:mb-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant={
                                    event.status === 'published' ? 'default' :
                                    event.status === 'presale' ? 'secondary' :
                                    event.status === 'sold_out' ? 'destructive' :
                                    event.status === 'cancelled' ? 'destructive' :
                                    event.status === 'completed' ? 'outline' :
                                    'secondary'
                                  }>
                                    {event.status === 'presale' ? 'PreSale' :
                                     event.status === 'sold_out' ? 'Sold Out' :
                                     event.status === 'cancelled' ? 'Canceled' :
                                     event.status === 'completed' ? 'Complete' :
                                     event.status === 'published' ? 'Published' :
                                     event.status === 'draft' ? 'Draft' :
                                     event.status}
                                  </Badge>
                                  <h4 className="text-xl font-semibold text-white">{event.title}</h4>
                                </div>

                                <p className="text-gray-300 mb-3">{event.description}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-300 mb-3">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                                    {event.date instanceof Date 
                                      ? event.date.toLocaleDateString() 
                                      : new Date(event.date).toLocaleDateString()
                                    } • {event.time}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                                    {event.location}
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-white">Price: {event.price.description}</div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 md:ml-6">
                                <RSVPListModal event={event} />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                                  asChild
                                >
                                  <Link to={`/${orgSlug}/edit-event/${event.id}`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

              </div>
            </TabsContent>


            {/* Subscribers Tab */}
            <TabsContent value="subscribers">
              <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Subscriber Management</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage club subscribers and event update requests.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {organization && (
                    <SubscribersList 
                      organizationId={organization.id}
                      events={events}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Ticket Management</h2>
                    <p className="text-gray-300">Validate tickets and manage digital entry for your events</p>
                  </div>
                </div>

                {/* Ticket Validation Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* QR Code Scanner Section */}
                  <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-purple-400" />
                        QR Code Scanner
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Point camera at QR code on ticket
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                        <div className="text-center">
                          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-300 mb-4">Camera scanner would appear here</p>
                          <p className="text-sm text-gray-400">Use manual entry below for testing</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Manual Entry Section */}
                  <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-purple-400" />
                        Manual Entry
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Enter QR code or backup code manually
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            QR Code or Backup Code
                          </label>
                          <Input
                            placeholder="Enter code here..."
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleManualValidation()}
                            className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                          />
                        </div>

                        <Button
                          onClick={handleManualValidation}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          disabled={validationLoading || !manualCode.trim()}
                        >
                          {validationLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Validate Ticket
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <Card className={`!border-2 ${validationResult.valid ? '!border-green-400/50 !bg-green-500/10' : '!border-red-400/50 !bg-red-500/10'} backdrop-blur-sm`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {validationResult.valid ? (
                          <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-400 flex-shrink-0 mt-1" />
                        )}

                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold mb-2 ${validationResult.valid ? 'text-green-300' : 'text-red-300'}`}>
                            {validationResult.valid ? '✅ Valid Ticket' : '❌ Invalid Ticket'}
                          </h3>

                          <p className={`mb-3 ${validationResult.valid ? 'text-green-200' : 'text-red-200'}`}>
                            {validationResult.message}
                          </p>

                          {validationResult.valid && validationResult.ticket && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2 border border-white/20">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-300">Attendee:</span>
                                  <p className="text-white">{validationResult.ticket.attendeeName}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-300">Event:</span>
                                  <p className="text-white">{validationResult.ticket.eventTitle}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-300">Ticket #:</span>
                                  <p className="text-white font-mono">{validationResult.ticket.ticketNumber}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-300">Status:</span>
                                  <Badge className={validationResult.ticket.status === 'valid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                    {validationResult.ticket.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Validation History */}
                {validationHistory.length > 0 && (
                  <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Validations</CardTitle>
                      <CardDescription className="text-gray-300">Last {validationHistory.length} ticket validations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {validationHistory.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              item.success ? 'bg-green-500/10 border-green-400/30' : 'bg-red-500/10 border-red-400/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {item.success ? (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-400" />
                              )}
                              <div>
                                <p className="font-medium text-sm text-white">
                                  {item.result.valid ? 'Valid' : 'Invalid'} - {item.result.message}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {item.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-mono text-gray-400">
                                {item.code.substring(0, 12)}...
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Help Section */}
                <Card className="!bg-purple-500/10 !border-purple-400/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-purple-300">How to Use Ticket Validation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-purple-200">
                    <div className="flex items-start gap-3">
                      <QrCode className="h-5 w-5 flex-shrink-0 mt-0.5 text-purple-400" />
                      <div>
                        <p className="font-medium">QR Code Scanning</p>
                        <p className="text-sm text-purple-300">Point your device's camera at the QR code on the attendee's ticket. The code will be automatically detected and validated.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Ticket className="h-5 w-5 flex-shrink-0 mt-0.5 text-purple-400" />
                      <div>
                        <p className="font-medium">Manual Entry</p>
                        <p className="text-sm text-purple-300">If QR scanning isn't working, attendees can provide their 6-digit backup code for manual entry.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-purple-400" />
                      <div>
                        <p className="font-medium">Validation Results</p>
                        <p className="text-sm text-purple-300">Valid tickets show green with attendee details. Invalid tickets show red with error reasons.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget">
              <EventBudgetManager
                events={events}
                organizationId={organization.id}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Admin Management */}
                <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Club Administrators</CardTitle>
                    <CardDescription className="text-gray-300">
                      Add other administrators to help manage your club.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Input
                          placeholder="Enter admin email address"
                          className="flex-1"
                        />
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          Add Admin
                        </Button>
                      </div>
                      
                      {/* Current Admins List */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Current Administrators:</p>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">You (Owner)</p>
                              <p className="text-gray-400 text-xs">{organization.contactEmail}</p>
                            </div>
                            <span className="text-xs text-purple-400 bg-purple-400/20 px-2 py-1 rounded">Owner</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <OrganizationDangerZone
                  organization={organization}
                  onDelete={handleDeleteOrganization}
                  isDeleting={isDeleting}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>



    </div>
  )
}