import { useState, useEffect, useCallback } from 'react'
import { organizationsApi, eventsApi } from '@/services/api'
import { getOrganizationBySlug, getEventsByOrganization, updateOrganization as updateOrganizationInFirebase, deleteOrganization as deleteOrganizationInFirebase } from '@/lib/database'
import { getDataSource, getApiUrl, getCurrentEnvironment } from '@/config/environments'
import type { Organization, Event } from '@/types/database'

interface UseOrganizationOptions {
  loadEvents?: boolean // Whether to automatically load events (default: true for backward compatibility)
}

export function useOrganization(organizationSlug: string, options: UseOrganizationOptions = {}) {
  const { loadEvents = true } = options
  
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const currentEnv = getCurrentEnvironment()
      const dataSource = getDataSource()
      const apiUrl = getApiUrl()
      
      console.log(`Loading organization ${organizationSlug} in ${currentEnv} environment using ${dataSource}${loadEvents ? ' (with events)' : ' (org only)'}`)
      
      if (dataSource === 'firebase') {
        // Direct Firebase access (development/sandbox)
        console.log('Using Firebase directly')
        
        // Always load organization first
        const org = await getOrganizationBySlug(organizationSlug)
        if (!org) {
          throw new Error(`Organization '${organizationSlug}' not found in ${currentEnv} environment`)
        }
        setOrganization(org)
        
        if (loadEvents) {
          // Load events after organization is loaded and available in UI
          console.log('Loading events...')
          const eventsList = await getEventsByOrganization(org.id)
          setEvents(eventsList)
        }
        
      } else if (dataSource === 'api' && apiUrl) {
        // API access (staging/production)
        console.log(`Using API: ${apiUrl}`)
        
        if (loadEvents) {
          // Load organization first, then events (API doesn't support parallel org+events by slug)
          console.log('Loading organization, then events...')
          const org = await organizationsApi.getBySlug(organizationSlug)
          setOrganization(org)
          
          const eventsList = await eventsApi.getByOrganization(org.id)
          setEvents(eventsList)
        } else {
          // Load only organization
          console.log('Loading organization only...')
          const org = await organizationsApi.getBySlug(organizationSlug)
          setOrganization(org)
        }
        
      } else {
        throw new Error(`Invalid data source configuration for ${currentEnv} environment`)
      }

    } catch (err) {
      console.error(`Error loading ${organizationSlug} data:`, err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [organizationSlug, loadEvents])

  useEffect(() => {
    if (organizationSlug) {
      loadData()
    }
  }, [organizationSlug, loadData])

  const loadEventsOnDemand = async () => {
    if (!organization) {
      console.log('⚠️ Cannot load events: no organization loaded')
      return
    }
    
    if (events.length > 0) {
      console.log('⚡ Events already loaded, skipping...')
      return
    }
    
    console.log(`🔄 Loading events on demand for: ${organization.name} (${organization.id})`)
    setEventsLoading(true)
    
    try {
      const dataSource = getDataSource()
      let eventsList: Event[]

      if (dataSource === 'firebase') {
        console.log('Loading events via Firebase')
        eventsList = await getEventsByOrganization(organization.id)
        console.log(`✅ Found ${eventsList.length} events via Firebase`)
      } else {
        console.log('Loading events via API')
        eventsList = await eventsApi.getByOrganization(organization.id)
        console.log(`✅ Found ${eventsList.length} events via API`)
      }
      
      setEvents(eventsList)
      console.log('📋 Events loaded into state')
    } catch (err) {
      console.error('❌ Error loading events:', err)
    } finally {
      setEventsLoading(false)
    }
  }

  const refreshEvents = async () => {
    if (!organization) {
      console.log('⚠️ Cannot refresh events: no organization loaded')
      return
    }
    
    console.log(`🔄 Refreshing events for organization: ${organization.name} (${organization.id})`)
    setEventsLoading(true)
    
    try {
      const dataSource = getDataSource()
      let eventsList: Event[]

      if (dataSource === 'firebase') {
        console.log('Refreshing events via Firebase')
        eventsList = await getEventsByOrganization(organization.id)
        console.log(`✅ Found ${eventsList.length} events via Firebase`)
      } else {
        console.log('Refreshing events via API')
        eventsList = await eventsApi.getByOrganization(organization.id)
        console.log(`✅ Found ${eventsList.length} events via API`)
      }
      
      setEvents(eventsList)
      console.log('📋 Events list updated in state')
    } catch (err) {
      console.error('❌ Error refreshing events:', err)
    } finally {
      setEventsLoading(false)
    }
  }

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return

    try {
      const currentEnv = getCurrentEnvironment()
      const dataSource = getDataSource()
      const apiUrl = getApiUrl()
      
      console.log(`Updating organization in ${currentEnv} environment using ${dataSource}`)
      
      if (dataSource === 'firebase') {
        // Development/Staging/Sandbox mode: Firebase direct update
        console.log(`Updating organization via Firebase (${currentEnv})`)
        
        // Update directly in Firebase
        const updatedOrg = await updateOrganizationInFirebase(organization.id, updates)
        setOrganization(updatedOrg)
        
        console.log(`✅ Organization updated successfully in Firebase (${currentEnv})`)
        
      } else if (dataSource === 'api' && apiUrl) {
        // Production mode: API update (use slug instead of ID)
        console.log(`Updating organization via API: ${apiUrl}`)
        const updatedOrg = await organizationsApi.updateBySlug(organization.slug, updates)
        setOrganization(updatedOrg)
        
      } else {
        throw new Error(`Invalid update configuration for ${currentEnv} environment`)
      }
      
    } catch (err) {
      console.error('Error updating organization:', err)
      throw err
    }
  }

  const deleteOrganization = async () => {
    if (!organization) return

    try {
      const currentEnv = getCurrentEnvironment()
      const dataSource = getDataSource()
      const apiUrl = getApiUrl()
      
      console.log(`Deleting organization in ${currentEnv} environment using ${dataSource}`)
      
      if (dataSource === 'firebase') {
        // Development/Staging/Sandbox mode: Firebase direct delete
        console.log(`Deleting organization via Firebase (${currentEnv})`)
        await deleteOrganizationInFirebase(organization.id)
        console.log(`✅ Organization deleted successfully in Firebase (${currentEnv})`)
        
      } else if (dataSource === 'api' && apiUrl) {
        // Production mode: API delete (use slug instead of ID)
        console.log(`Deleting organization via API: ${apiUrl}`)
        await organizationsApi.deleteBySlug(organization.slug)
        
      } else {
        throw new Error(`Invalid delete configuration for ${currentEnv} environment`)
      }
      
      // Clear local state after successful deletion
      setOrganization(null)
      setEvents([])
      
    } catch (err) {
      console.error('Error deleting organization:', err)
      throw err
    }
  }

  return {
    organization,
    events,
    loading,
    eventsLoading,
    error,
    loadEventsOnDemand,
    refreshEvents,
    updateOrganization,
    deleteOrganization,
    reload: loadData
  }
}