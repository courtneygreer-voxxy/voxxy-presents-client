import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Repeat,
  Mail,
  Instagram,
  ExternalLink,
  DollarSign,
  Loader,
  Edit,
  X
} from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"
import EventRegistration from "@/components/EventRegistration"
import { OrganizationEditForm } from "@/components/OrganizationEditForm"
import { isFeatureEnabled } from '@/config/environments'
import type { Organization } from "@/types/database"

interface OrganizationPageProps {
  organizationSlug: string
  bannerImage?: string
  logoImage?: string
  aboutImage?: string
  showAdminControls?: boolean
  customContent?: {
    story?: string
    offerings?: string[]
  }
}

export default function OrganizationPage({ 
  organizationSlug, 
  bannerImage,
  logoImage,
  aboutImage,
  showAdminControls = false,
  customContent
}: OrganizationPageProps) {
  const { organization, events, loading, error, updateOrganization } = useOrganization(organizationSlug)
  const [expandedEvents, setExpandedEvents] = useState<string[]>([])
  const [isEditMode, setIsEditMode] = useState(false)

  const toggleEventDetails = (eventId: string) => {
    setExpandedEvents((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  const handleSaveOrganization = async (updates: Partial<Organization>) => {
    try {
      await updateOrganization(updates)
      setIsEditMode(false)
    } catch (error) {
      console.error('Failed to save organization:', error)
      // TODO: Show error toast
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading {organizationSlug}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Organization not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Controls */}
      {showAdminControls && isFeatureEnabled('adminControls') && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Link to={`/${organizationSlug}/admin`}>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
          </Link>
          {!isEditMode ? (
            <Button
              onClick={() => setIsEditMode(true)}
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Quick Edit
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditMode(false)}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Edit Mode Form */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <OrganizationEditForm
              organization={organization}
              onSave={handleSaveOrganization}
              onCancel={() => setIsEditMode(false)}
            />
          </div>
        </div>
      )}

      {/* Header Photo Section */}
      <section id="home" className="relative h-80 overflow-hidden">
        <img
          src={bannerImage || organization.bannerUrl || "/placeholder.jpg"}
          alt={`${organization.name} Header`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-6 left-6 text-white">
          <div className="flex items-center space-x-4 mb-2">
            <img
              src={logoImage || organization.logoUrl || "/placeholder-logo.png"}
              alt={`${organization.name} Logo`}
              width={80}
              height={80}
              className="rounded-full border-4 border-white"
            />
            <div>
              <h2 className="text-4xl font-bold">{organization.name}</h2>
              <p className="text-lg text-gray-200">{organization.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Bio Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to {organization.name}</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {organization.bio}
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events - List Style */}
      <section id="events" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-10">Upcoming Events</h3>
          {(() => {
            console.log('All events:', events.map(e => ({ id: e.id, title: e.title, status: e.status })))
            const publishedEvents = events.filter(event => (event.status || 'published') === 'published')
            console.log('Published events:', publishedEvents.map(e => ({ id: e.id, title: e.title, status: e.status })))
            
            // Split events into main events and recurring events
            const mainEvents = publishedEvents.filter(event => !event.isRecurring)
            const recurringEvents = publishedEvents.filter(event => event.isRecurring)
            
            return { publishedEvents, mainEvents, recurringEvents }
          })().publishedEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No upcoming events at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Main Events Section */}
              {(() => {
                const publishedEvents = events.filter(event => (event.status || 'published') === 'published')
                const mainEvents = publishedEvents.filter(event => !event.isRecurring)
                return mainEvents.length > 0 && (
                  <div className="space-y-6">
                      {mainEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    {/* Main Event Info */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {event.category}
                          </Badge>
                          {event.isRecurring && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Repeat className="h-3 w-3" />
                              Recurring
                            </Badge>
                          )}
                          <h4 className="text-2xl font-bold text-gray-900">{event.title}</h4>
                        </div>

                        {event.series && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-purple-600">Part of: {event.series.name}</span>
                          </div>
                        )}

                        <p className="text-gray-600 mb-3">{event.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {event.date instanceof Date ? event.date.toLocaleDateString() : new Date(event.date).toLocaleDateString()} • {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">Price: {event.price.description}</div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 md:ml-6">
                        <EventRegistration event={{
                          ...event,
                          date: event.date instanceof Date ? event.date.toISOString() : event.date,
                          createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
                          updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : event.updatedAt
                        }} />
                        <Button
                          variant="outline"
                          onClick={() => toggleEventDetails(event.id)}
                          className="flex items-center gap-2"
                        >
                          Details
                          {expandedEvents.includes(event.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedEvents.includes(event.id) && (
                      <div className="border-t pt-4 mt-4 space-y-4">
                        {event.series && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">About {event.series.name}</h5>
                            <p className="text-gray-600 text-sm">{event.series.description}</p>
                          </div>
                        )}

                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Event Details</h5>
                          <p className="text-gray-600 text-sm mb-3">{event.fullDescription}</p>
                          <div className="text-sm text-gray-600">
                            <p>
                              <strong>Address:</strong> {event.address}
                            </p>
                          </div>
                        </div>

                        {event.isRecurring && event.recurringDates && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">Upcoming Dates & Themes</h5>
                            <div className="space-y-2">
                              {event.recurringDates.map((recurringDate, index) => (
                                <div key={index} className="flex items-start gap-3 text-sm">
                                  <span className="font-medium text-purple-600 min-w-[2rem]">{recurringDate.date}</span>
                                  <div>
                                    <span className="font-medium text-gray-900">{recurringDate.theme}:</span>
                                    <span className="text-gray-600 ml-1">{recurringDate.description}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
                      ))}
                  </div>
                )
              })()}

              {/* Recurring Events Section */}
              {(() => {
                const publishedEvents = events.filter(event => (event.status || 'published') === 'published')
                const recurringEvents = publishedEvents.filter(event => event.isRecurring)
                return recurringEvents.length > 0 && (
                  <div>
                    <h4 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <Repeat className="h-6 w-6" />
                      Recurring Events
                    </h4>
                    <div className="space-y-6">
                      {recurringEvents.map((event) => (
                        <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <div className="flex flex-col">
                              {/* Main Event Info */}
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                                <div className="flex-1 mb-4 md:mb-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                      {event.category}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <Repeat className="h-3 w-3" />
                                      Recurring
                                    </Badge>
                                    <h4 className="text-2xl font-bold text-gray-900">{event.title}</h4>
                                  </div>

                                  {event.series && (
                                    <div className="mb-2">
                                      <span className="text-sm font-medium text-purple-600">Part of: {event.series.name}</span>
                                    </div>
                                  )}

                                  <p className="text-gray-600 mb-3">{event.description}</p>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      {event.time}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      {event.location}
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">Price: {event.price.description}</div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 md:ml-6">
                                  <EventRegistration event={{
                                    ...event,
                                    date: event.date instanceof Date ? event.date.toISOString() : event.date,
                                    createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
                                    updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : event.updatedAt
                                  }} />
                                  <Button
                                    variant="outline"
                                    onClick={() => toggleEventDetails(event.id)}
                                    className="flex items-center gap-2"
                                  >
                                    Details & Schedule
                                    {expandedEvents.includes(event.id) ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                            {/* Expanded Details */}
                            {expandedEvents.includes(event.id) && (
                              <div className="border-t pt-4 mt-4 space-y-4">
                                {event.series && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-2">About {event.series.name}</h5>
                                    <p className="text-gray-700">{event.series.description}</p>
                                  </div>
                                )}

                                {event.fullDescription && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                                    <p className="text-gray-700 leading-relaxed">{event.fullDescription}</p>
                                  </div>
                                )}

                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-2">Location</h5>
                                  <p className="text-gray-700">{event.address}</p>
                                </div>

                                {/* Recurring Schedule */}
                                {event.isRecurring && event.recurringDates && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-3">Upcoming Schedule</h5>
                                    <div className="space-y-2">
                                      {event.recurringDates.map((recurringDate, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                          <span className="font-medium text-purple-600 min-w-[2rem]">{recurringDate.date}</span>
                                          <div>
                                            <span className="font-medium text-gray-900">{recurringDate.theme}:</span>
                                            <span className="text-gray-600 ml-1">{recurringDate.description}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">About {organization.name}</h3>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={aboutImage || "/placeholder.jpg"}
                alt={`${organization.name} About`}
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-6">
              <h4 className="text-2xl font-semibold text-gray-900">Our Story</h4>
              <div className="text-gray-700 leading-relaxed space-y-4">
                {customContent?.story ? (
                  <div dangerouslySetInnerHTML={{ __html: customContent.story }} />
                ) : (
                  <>
                    <p>
                      {organization.name} is a vibrant community dedicated to bringing people together through shared experiences and creativity.
                    </p>
                    <p>
                      Our mission is to create meaningful connections and foster a sense of belonging in our local community.
                    </p>
                  </>
                )}
              </div>
              
              {customContent?.offerings && (
                <>
                  <h4 className="text-2xl font-semibold text-gray-900 pt-4">What We Offer</h4>
                  <ul className="space-y-2 text-gray-700">
                    {customContent.offerings.map((offering, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                        {offering}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              <div className="pt-6">
                <h4 className="text-2xl font-semibold text-gray-900 mb-4">Connect With Us</h4>
                <div className="flex items-center gap-4">
                  {organization.socialLinks.instagram && (
                    <a 
                      href={`https://instagram.com/${organization.socialLinks.instagram.replace('@', '')}`} 
                      className="text-gray-600 hover:text-purple-600 transition-colors" 
                      aria-label="Instagram"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                  )}
                  {organization.socialLinks.website && (
                    <a 
                      href={organization.socialLinks.website} 
                      className="text-gray-600 hover:text-purple-600 transition-colors" 
                      aria-label="Website"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-6 w-6" />
                    </a>
                  )}
                  {organization.socialLinks.eventbrite && (
                    <a 
                      href={organization.socialLinks.eventbrite} 
                      className="text-gray-600 hover:text-purple-600 transition-colors" 
                      aria-label="Eventbrite"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calendar className="h-6 w-6" />
                    </a>
                  )}
                  {organization.socialLinks.venmo && (
                    <a 
                      href={`https://venmo.com/${organization.socialLinks.venmo.replace('@', '')}`} 
                      className="text-gray-600 hover:text-purple-600 transition-colors" 
                      aria-label="Venmo"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <DollarSign className="h-6 w-6" />
                    </a>
                  )}
                  <a 
                    href={`mailto:${organization.contactEmail}`} 
                    className="text-gray-600 hover:text-purple-600 transition-colors" 
                    aria-label="Email"
                  >
                    <Mail className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Proudly presented by</p>
            <h5 className="text-2xl font-bold text-purple-400">voxxypresents</h5>
          </div>
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-300 mb-4">
              Voxxy Presents simplifies recurring club events with custom pages, automated waitlists, and seamless
              messaging that keeps your community connected and your calendar full.
            </p>
            <div className="flex justify-center items-center gap-6 text-sm text-gray-400">
              <div className="group relative">
                <MapPin className="h-5 w-5 hover:text-purple-400 transition-colors cursor-pointer" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {organization.settings.defaultAddress}
                </div>
              </div>
              <div className="group relative">
                <Mail className="h-5 w-5 hover:text-purple-400 transition-colors cursor-pointer" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {organization.contactEmail}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6">
            <p className="text-sm text-gray-500">&copy; 2025 Voxxy AI, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}