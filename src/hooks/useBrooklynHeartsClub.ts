import { useState, useEffect } from 'react'
import { organizationsApi, eventsApi } from '@/services/api'

export interface Event {
  id: string
  organizationId: string
  title: string
  description: string
  fullDescription: string
  category: string
  date: string
  time: string
  location: string
  address: string
  price: {
    type: 'free' | 'paid' | 'donation'
    amount?: number
    description: string
    advancePrice?: number
  }
  capacity?: number
  registrationRequired: boolean
  eventbriteUrl?: string
  presaleEnabled: boolean
  series?: {
    name: string
    description: string
  }
  isRecurring: boolean
  recurringDates?: Array<{
    date: string
    theme: string
    description: string
  }>
  imageUrl?: string
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  description: string
  bio: string
  logoUrl?: string
  bannerUrl?: string
  contactEmail: string
  socialLinks: {
    instagram?: string
    website?: string
    eventbrite?: string
    venmo?: string
  }
  settings: {
    defaultLocation: string
    defaultAddress: string
    theme: {
      primaryColor: string
      backgroundColor: string
    }
  }
  ownerId: string
  createdAt: string
  updatedAt: string
}

export function useBrooklynHeartsClub() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load organization
      const org = await organizationsApi.getBySlug('brooklyn-hearts-club')
      setOrganization(org)

      // Load events for this organization
      const eventsList = await eventsApi.getByOrganization(org.id)
      setEvents(eventsList)

    } catch (err) {
      console.error('Error loading Brooklyn Hearts Club data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const refreshEvents = async () => {
    if (!organization) return
    
    try {
      const eventsList = await eventsApi.getByOrganization(organization.id)
      setEvents(eventsList)
    } catch (err) {
      console.error('Error refreshing events:', err)
    }
  }

  return {
    organization,
    events,
    loading,
    error,
    refreshEvents,
    reload: loadData
  }
}