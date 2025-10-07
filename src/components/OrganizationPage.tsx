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
  User
} from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"
import ImageCarousel from "@/components/ImageCarousel"
import { ShareButton } from "@/components/ShareButton"
import { WelcomeSection } from "@/components/WelcomeSection"
import { SubscriptionModal } from "@/components/SubscriptionModal"
import { RSVPModal } from "@/components/RSVPModal"
import { isFeatureEnabled } from '@/config/environments'
// import { getDisplayAboutStory, getDisplayOfferings, isDefaultContent } from '@/utils/defaultContent'

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
  const { organization, events, loading, eventsLoading, loadEventsOnDemand, error } = useOrganization(organizationSlug)
  const [expandedEvents, setExpandedEvents] = useState<string[]>([])


  const toggleEventDetails = (eventId: string) => {
    setExpandedEvents((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  // Function to get background style based on organization's backgroundStyle
  const getBackgroundStyle = (backgroundStyle: string = 'stars') => {
    switch (backgroundStyle) {
      case 'gradient-purple':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          animation: 'none'
        }
      case 'gradient-sunset':
        return {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
          animation: 'none'
        }
      case 'minimal-grid':
        return {
          background: '#111827',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          animation: 'none'
        }
      case 'abstract-waves':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 10s ease-in-out infinite'
        }
      case 'stars':
      default:
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-300">Loading {organizationSlug}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-300">Club not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden admin-dark">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={getBackgroundStyle(organization.backgroundStyle)}
      />
      
      <div className="relative z-10">
      {/* Top Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <ShareButton
          url={`${window.location.origin}/${organizationSlug}`}
          title={organization.name}
          description={organization.description}
          variant="outline"
          size="sm"
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 text-white"
        />
        {showAdminControls && isFeatureEnabled('adminControls') && (
          <>
            <Link to="/profile">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 text-white"
                size="sm"
              >
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to={`/${organizationSlug}/admin`}>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          </>
        )}
      </div>


      {/* Welcome Section - Replaces header photo and welcome */}
      <WelcomeSection 
        organization={organization}
        logoImage={logoImage}
        showAdminControls={showAdminControls}
      />

      {/* Upcoming Events - List Style */}
      <section id="events" className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <h3 className="text-3xl font-bold text-center text-white mb-10">
            Upcoming Events
          </h3>
          {(() => {
            console.log('All events:', events.map(e => ({ id: e.id, title: e.title, status: e.status })))
            const publishedEvents = events.filter(event => {
              const status = event.status || 'published'
              return ['published', 'presale', 'sold_out'].includes(status)
            })
            console.log('Published events:', publishedEvents.map(e => ({ id: e.id, title: e.title, status: e.status })))
            
            // Split events into main events and recurring events
            const mainEvents = publishedEvents.filter(event => !event.isRecurring)
            const recurringEvents = publishedEvents.filter(event => event.isRecurring)
            
            return { publishedEvents, mainEvents, recurringEvents }
          })().publishedEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300">No upcoming events at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Main Events Section */}
              {(() => {
                const publishedEvents = events.filter(event => {
              const status = event.status || 'published'
              return ['published', 'presale', 'sold_out'].includes(status)
            })
                const mainEvents = publishedEvents.filter(event => !event.isRecurring)
                return mainEvents.length > 0 && (
                  <div className="space-y-6">
                      {mainEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300 bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    {/* Main Event Info */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                          {event.status === 'sold_out' && (
                            <Badge className="bg-white text-purple-600 border border-purple-600">
                              SOLD OUT
                            </Badge>
                          )}
                          {event.status === 'presale' && (
                            <Badge className="bg-purple-600 text-white">
                              PRESALE
                            </Badge>
                          )}
                          {event.isRecurring && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Repeat className="h-3 w-3" />
                              Recurring
                            </Badge>
                          )}
                          <h4 className="text-2xl font-bold text-white">{event.title}</h4>
                        </div>

                        {event.series && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-purple-600">Part of: {event.series.name}</span>
                          </div>
                        )}

                        <p className="text-gray-300 mb-3">{event.description}</p>
                        <div className="flex flex-col gap-2 text-sm text-gray-300 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                            {event.date instanceof Date ? event.date.toLocaleDateString() : new Date(event.date).toLocaleDateString()} • {event.time}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-white">
                          Price: {(() => {
                            if (event.price.type === 'free') {
                              return 'Free'
                            } else if (event.price.type === 'group_deal' && event.price.groupDealDetails) {
                              return `${event.price.groupDealDetails.minimumPeople}+ people: $${event.price.groupDealDetails.pricePerPerson}/person (reg. $${event.price.groupDealDetails.normalPricePerPerson}/person)`
                            } else if (event.price.type === 'paid') {
                              const priceText = []
                              if (event.price.advancePrice) {
                                priceText.push(`Presale: $${event.price.advancePrice}`)
                              }
                              if (event.price.amount) {
                                priceText.push(`${event.price.advancePrice ? 'Door: ' : ''}$${event.price.amount}`)
                              }
                              const prices = priceText.length > 0 ? priceText.join(' • ') : ''
                              return prices + (event.price.description ? ` • ${event.price.description}` : '')
                            } else {
                              return event.price.description || 'Price TBD'
                            }
                          })()}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 md:ml-6">
                        <RSVPModal event={event} />
                        <Button
                          variant="ghost"
                          onClick={() => toggleEventDetails(event.id)}
                          className="flex items-center gap-2 bg-transparent border border-purple-400/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/50"
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
                      <div className="border-t border-purple-400/30 pt-6 mt-6 space-y-6">
                        {event.series && (
                          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-400/20">
                            <h5 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                              <Repeat className="h-4 w-4" />
                              About {event.series.name}
                            </h5>
                            <p className="text-gray-300 text-sm leading-relaxed">{event.series.description}</p>
                          </div>
                        )}

                        <div className="space-y-4">
                          <h5 className="font-semibold text-white text-lg">✨ What to Expect</h5>
                          <p className="text-gray-300 leading-relaxed">{event.fullDescription}</p>

                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-white mb-1">Venue</p>
                                {event.venueName && event.venueSlug ? (
                                  <Link
                                    to={`/venue/${event.venueSlug}`}
                                    className="text-purple-300 hover:text-purple-200 hover:underline font-medium"
                                  >
                                    {event.venueName}
                                  </Link>
                                ) : (
                                  <p className="text-gray-300">{event.venueName || event.location}</p>
                                )}
                                <p className="text-gray-400 text-sm mt-1">{event.address}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {event.isRecurring && event.recurringDates && (
                          <div>
                            <h5 className="font-semibold text-white mb-4 text-lg">📅 Upcoming Dates & Themes</h5>
                            <div className="space-y-3">
                              {event.recurringDates.map((recurringDate, index) => (
                                <div key={index} className="bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg p-3 border border-purple-400/20">
                                  <div className="flex items-start gap-3">
                                    <span className="font-bold text-purple-400 min-w-[3rem] text-sm">{recurringDate.date}</span>
                                    <div className="flex-1">
                                      <span className="font-semibold text-white">{recurringDate.theme}</span>
                                      <p className="text-gray-300 text-sm mt-1">{recurringDate.description}</p>
                                    </div>
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
                const publishedEvents = events.filter(event => {
              const status = event.status || 'published'
              return ['published', 'presale', 'sold_out'].includes(status)
            })
                const recurringEvents = publishedEvents.filter(event => event.isRecurring)
                return recurringEvents.length > 0 && (
                  <div>
                    <h4 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                      <Repeat className="h-6 w-6 text-purple-400" />
                      Recurring Events
                    </h4>
                    <div className="space-y-6">
                      {recurringEvents.map((event) => (
                        <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300 bg-white/10 backdrop-blur-sm border-white/20">
                          <CardContent className="p-6">
                            <div className="flex flex-col">
                              {/* Main Event Info */}
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                                <div className="flex-1 mb-4 md:mb-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    {event.status === 'sold_out' && (
                                      <Badge className="bg-white text-purple-600 border border-purple-600">
                                        SOLD OUT
                                      </Badge>
                                    )}
                                    {event.status === 'presale' && (
                                      <Badge className="bg-purple-600 text-white">
                                        PRESALE
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <Repeat className="h-3 w-3" />
                                      Recurring
                                    </Badge>
                                    <h4 className="text-2xl font-bold text-white">{event.title}</h4>
                                  </div>

                                  {event.series && (
                                    <div className="mb-2">
                                      <span className="text-sm font-medium text-purple-600">Part of: {event.series.name}</span>
                                    </div>
                                  )}

                                  <p className="text-gray-300 mb-3">{event.description}</p>
                                  <div className="flex flex-col gap-2 text-sm text-gray-300 mb-3">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                                      {event.time}
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium text-white">
                                    Price: {(() => {
                                      if (event.price.type === 'free') {
                                        return 'Free'
                                      } else if (event.price.type === 'group_deal' && event.price.groupDealDetails) {
                                        return `${event.price.groupDealDetails.minimumPeople}+ people: $${event.price.groupDealDetails.pricePerPerson}/person (reg. $${event.price.groupDealDetails.normalPricePerPerson}/person)`
                                      } else if (event.price.type === 'paid') {
                                        const priceText = []
                                        if (event.price.advancePrice) {
                                          priceText.push(`Presale: $${event.price.advancePrice}`)
                                        }
                                        if (event.price.amount) {
                                          priceText.push(`${event.price.advancePrice ? 'Door: ' : ''}$${event.price.amount}`)
                                        }
                                        const prices = priceText.length > 0 ? priceText.join(' • ') : ''
                                        return prices + (event.price.description ? ` • ${event.price.description}` : '')
                                      } else {
                                        return event.price.description || 'Price TBD'
                                      }
                                    })()}
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 md:ml-6">
                                  <RSVPModal event={event} />
                                  <Button
                                    variant="ghost"
                                    onClick={() => toggleEventDetails(event.id)}
                                    className="flex items-center gap-2 bg-transparent border border-purple-400/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/50"
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
                              <div className="border-t border-purple-400/30 pt-6 mt-6 space-y-6">
                                {event.series && (
                                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-400/20">
                                    <h5 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                                      <Repeat className="h-4 w-4" />
                                      About {event.series.name}
                                    </h5>
                                    <p className="text-gray-300 text-sm leading-relaxed">{event.series.description}</p>
                                  </div>
                                )}

                                <div className="space-y-4">
                                  {event.fullDescription && (
                                    <>
                                      <h5 className="font-semibold text-white text-lg">✨ What to Expect</h5>
                                      <p className="text-gray-300 leading-relaxed">{event.fullDescription}</p>
                                    </>
                                  )}

                                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="flex items-start gap-3">
                                      <MapPin className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="font-medium text-white mb-1">Venue</p>
                                        {event.venueName && event.venueSlug ? (
                                          <Link
                                            to={`/venue/${event.venueSlug}`}
                                            className="text-purple-300 hover:text-purple-200 hover:underline font-medium"
                                          >
                                            {event.venueName}
                                          </Link>
                                        ) : (
                                          <p className="text-gray-300">{event.venueName || event.location}</p>
                                        )}
                                        <p className="text-gray-400 text-sm mt-1">{event.address}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Recurring Schedule */}
                                {event.isRecurring && event.recurringDates && (
                                  <div>
                                    <h5 className="font-semibold text-white mb-4 text-lg">📅 Upcoming Schedule</h5>
                                    <div className="space-y-3">
                                      {event.recurringDates.map((recurringDate, index) => (
                                        <div key={index} className="bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg p-3 border border-purple-400/20">
                                          <div className="flex items-start gap-3">
                                            <span className="font-bold text-purple-400 min-w-[3rem] text-sm">{recurringDate.date}</span>
                                            <div className="flex-1">
                                              <span className="font-semibold text-white">{recurringDate.theme}</span>
                                              <p className="text-gray-300 text-sm mt-1">{recurringDate.description}</p>
                                            </div>
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
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <h3 className="text-4xl font-bold text-center text-white mb-12">
            About {organization.name}
          </h3>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <ImageCarousel
                images={(() => {
                  // Use new aboutImages array if available, otherwise fall back to single aboutImageUrl or aboutImage prop
                  if (organization.aboutImages && organization.aboutImages.length > 0) {
                    return organization.aboutImages
                  } else if (organization.aboutImageUrl) {
                    return [organization.aboutImageUrl]
                  } else if (aboutImage) {
                    return [aboutImage]
                  } else {
                    return []
                  }
                })()}
                altText={`${organization.name} About`}
                className="w-full h-96"
              />
            </div>
            <div className="h-96 flex flex-col">
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div>
                  <h4 className="text-2xl font-semibold text-white mb-4">Our Story</h4>
                  <div className="text-gray-200 leading-relaxed space-y-4">
                    {organization?.aboutStory ? (
                      <div>
                        {organization.aboutStory.split('\n').map((paragraph, index) => (
                          <p key={index} className={paragraph.trim() === '' ? 'h-4' : ''}>
                            {paragraph.trim() === '' ? '\u00A0' : paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="italic text-gray-400">Welcome to {organization?.name || 'our club'}! We're building an amazing community...</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-2xl font-semibold text-white mb-4">What We Offer</h4>
                  <ul className="space-y-2 text-gray-200">
                    {organization?.aboutOfferings && organization.aboutOfferings.length > 0 ? 
                      organization.aboutOfferings.map((offering, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-3 bg-purple-600"></div>
                          {offering}
                        </li>
                      )) : (
                        <>
                          <li className="flex items-center italic text-gray-400">
                            <div className="w-2 h-2 rounded-full mr-3 bg-gray-500"></div>
                            Community building
                          </li>
                          <li className="flex items-center italic text-gray-400">
                            <div className="w-2 h-2 rounded-full mr-3 bg-gray-500"></div>
                            Regular meetups
                          </li>
                          <li className="flex items-center italic text-gray-400">
                            <div className="w-2 h-2 rounded-full mr-3 bg-gray-500"></div>
                            Fun activities
                          </li>
                        </>
                      )
                    }
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-2xl font-semibold text-white mb-4">Connect With Us</h4>
                <div className="flex items-center gap-4">
                  {organization.socialLinks?.instagram && (
                    <a 
                      href={`https://instagram.com/${organization.socialLinks.instagram.replace('@', '')}`} 
                      className="text-gray-300 hover:text-purple-400 transition-colors" 
                      aria-label="Instagram"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                  )}
                  {organization.socialLinks?.website && (
                    <a 
                      href={organization.socialLinks.website} 
                      className="text-gray-300 hover:text-purple-400 transition-colors" 
                      aria-label="Website"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-6 w-6" />
                    </a>
                  )}
                  {organization.socialLinks?.venmo && (
                    <a 
                      href={`https://venmo.com/${organization.socialLinks.venmo.replace('@', '')}`} 
                      className="text-gray-300 hover:text-purple-400 transition-colors" 
                      aria-label="Venmo"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <DollarSign className="h-6 w-6" />
                    </a>
                  )}
                  {organization.socialLinks?.other && (
                    <a 
                      href={organization.socialLinks.other} 
                      className="text-gray-300 hover:text-purple-400 transition-colors" 
                      aria-label="Other Social Link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-6 w-6" />
                    </a>
                  )}
                  <a 
                    href={`mailto:${organization.contactEmail}`} 
                    className="text-gray-300 hover:text-purple-400 transition-colors" 
                    aria-label="Email"
                  >
                    <Mail className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-4">
                Stay in the Loop with {organization.name}
              </h3>
              <p className="text-lg text-gray-300 mb-8">
                Never miss out on events, updates, and community news. Join our community and be the first to know what's happening!
              </p>
              <SubscriptionModal 
                organization={organization}
                trigger={
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center gap-3 mx-auto group shadow-lg hover:shadow-xl transform hover:scale-105">
                    <span className="text-xl">💌</span>
                    Subscribe for Updates
                    <span className="group-hover:translate-x-1 transition-transform text-xl">→</span>
                  </button>
                }
              />
              <p className="text-sm text-gray-400 mt-4">
                Join our community • Unsubscribe anytime • Your privacy is protected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white/5 backdrop-blur-sm text-gray-300 py-3 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs">Powered by <span className="text-purple-500 font-medium">voxxypresents</span></p>
        </div>
      </footer>
      </div>
    </div>
  )
}