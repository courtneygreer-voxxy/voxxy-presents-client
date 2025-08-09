import type React from "react"
import { useState } from "react"

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
} from "lucide-react"

import { useBrooklynHeartsClub } from "@/hooks/useBrooklynHeartsClub"
import EventRegistration from "@/components/EventRegistration"

export default function BrooklynHeartsClub() {
  const { organization, events, loading, error } = useBrooklynHeartsClub()
  const [expandedEvents, setExpandedEvents] = useState<string[]>([])

  const toggleEventDetails = (eventId: string) => {
    setExpandedEvents((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading Brooklyn Hearts Club...</p>
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
      {/* Header Photo Section - Facebook Style */}
      <section id="home" className="relative h-80 overflow-hidden">
        <img
          src="/brooklyn-hearts-club-banner.svg?height=320&width=1200"
          alt="Art Club Header"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-6 left-6 text-white">
          <div className="flex items-center space-x-4 mb-2">
            <img
              src="/brooklyn-hearts-club-logo.svg?height=80&width=80"
              alt="Brooklyn Hearts club Logo"
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

      {/* Quick Background Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to {organization.name}</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {organization.background}
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events - List Style */}
      <section id="events" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-10">Upcoming Events</h3>
          {(() => {
            console.log('Brooklyn Hearts Club - All events:', events.map(e => ({ id: e.id, title: e.title, status: e.status })))
            const publicEvents = events.filter(event => {
              const status = event.status || 'published'
              return ['presale', 'published', 'sold_out'].includes(status)
            })
            console.log('Brooklyn Hearts Club - Public events:', publicEvents.map(e => ({ id: e.id, title: e.title, status: e.status })))
            return publicEvents
          })().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No upcoming events at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.filter(event => {
                const status = event.status || 'published'
                return ['presale', 'published', 'sold_out'].includes(status)
              }).map((event) => (
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
                          <h4 className="text-xl font-semibold text-gray-900">{event.title}</h4>
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
                            {new Date(event.date).toLocaleDateString()} • {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">Price: {event.price.description}</div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 md:ml-6">
                        <EventRegistration event={event as any} />
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
                src="/brooklyn-hearts-club-about-images-1.svg?height=400&width=600"
                alt="Art Club Members"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-6">
              <h4 className="text-2xl font-semibold text-gray-900">Our Story</h4>
              <p className="text-gray-700 leading-relaxed">
                Founded in 2018 by a group of passionate local artists, Brooklyn Hearts club began as a small gathering
                in a converted warehouse space. What started as weekly sketch sessions has grown into a thriving
                community of over 200 members from all walks of life.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our club welcomes artists of all skill levels, from complete beginners picking up a brush for the first
                time to seasoned professionals looking to connect with fellow creatives. We offer a diverse range of
                activities including workshops, exhibitions, collaborative projects, and social events.
              </p>
              <h4 className="text-2xl font-semibold text-gray-900 pt-4">What We Offer</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Weekly open studio sessions with shared materials
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Monthly workshops led by professional artists
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Quarterly exhibitions showcasing member artwork
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Access to professional-grade equipment and studio space
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Networking opportunities with local galleries and art organizations
                </li>
              </ul>
              <div className="pt-6">
                <h4 className="text-2xl font-semibold text-gray-900 mb-4">Connect With Us</h4>
                <div className="flex items-center gap-4">
                  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors" aria-label="Instagram">
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors" aria-label="Bluesky">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.015.27-.031.402-.05-.132.019-.266.035-.402.05-2.67-.296-5.568.628-6.383 3.364C.378 17.804 0 22.764 0 23.452c0 .688.139 1.86.902 2.203.659.299 1.664.621 4.3-1.239C7.954 22.474 10.913 18.535 12 16.421c1.087 2.114 4.046 6.053 6.798 7.995 2.636 1.86 3.641 1.538 4.3 1.239.763-.343.902-1.515.902-2.203 0-.688-.378-5.648-.624-6.477-.815-2.736-3.713-3.66-6.383-3.364-.136.015-.27-.031-.402.05.132-.019.266.035.402-.50 2.67.296 5.568-.628 6.383-3.364.246-.829.624-5.789.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.239C16.046 4.747 13.087 8.686 12 10.8z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors" aria-label="LinkTree">
                    <ExternalLink className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors" aria-label="Eventbrite">
                    <Calendar className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors" aria-label="Venmo">
                    <DollarSign className="h-6 w-6" />
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
                  123 Art Street, Creative District
                </div>
              </div>
              <div className="group relative">
                <Mail className="h-5 w-5 hover:text-purple-400 transition-colors cursor-pointer" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  team@heyvoxxy
                </div>
              </div>
              <div className="group relative">
                <svg
                  className="h-5 w-5 hover:text-purple-400 transition-colors cursor-pointer"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Connect on LinkedIn
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