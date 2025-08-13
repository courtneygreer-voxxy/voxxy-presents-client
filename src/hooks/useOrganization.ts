import { useState, useEffect, useCallback } from 'react'
import { organizationsApi, eventsApi } from '@/services/api'
import { getOrganizationBySlug, getEventsByOrganization, updateOrganization as updateOrganizationInFirebase } from '@/lib/database'
import { getDataSource, getApiUrl, getCurrentEnvironment } from '@/config/environments'
import type { Organization, Event } from '@/types/database'

export function useOrganization(organizationSlug: string) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const currentEnv = getCurrentEnvironment()
      const dataSource = getDataSource()
      const apiUrl = getApiUrl()
      
      console.log(`Loading data for ${organizationSlug} in ${currentEnv} environment using ${dataSource}`)
      
      if (dataSource === 'firebase') {
        // Direct Firebase access (development/sandbox)
        console.log('Using Firebase directly')
        
        const org = await getOrganizationBySlug(organizationSlug)
        if (!org) {
          throw new Error(`Organization '${organizationSlug}' not found in ${currentEnv} environment`)
        }
        setOrganization(org)

        const eventsList = await getEventsByOrganization(org.id)
        setEvents(eventsList)
        
      } else if (dataSource === 'api' && apiUrl) {
        // API access (staging/production)
        console.log(`Using API: ${apiUrl}`)
        
        const org = await organizationsApi.getBySlug(organizationSlug)
        setOrganization(org)

        const eventsList = await eventsApi.getByOrganization(org.id)
        setEvents(eventsList)
        
      } else {
        throw new Error(`Invalid data source configuration for ${currentEnv} environment`)
      }

    } catch (err) {
      console.error(`Error loading ${organizationSlug} data:`, err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [organizationSlug])

  useEffect(() => {
    if (organizationSlug) {
      loadData()
    }
  }, [organizationSlug, loadData])

  const refreshEvents = async () => {
    if (!organization) return
    
    try {
      const eventsList = await eventsApi.getByOrganization(organization.id)
      setEvents(eventsList)
    } catch (err) {
      console.error('Error refreshing events:', err)
    }
  }

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return

    try {
      const currentEnv = getCurrentEnvironment()
      const dataSource = getDataSource()
      const apiUrl = getApiUrl()
      
      console.log(`Updating organization in ${currentEnv} environment using ${dataSource}`)
      
      // Temporary workaround: Use Firebase for all updates until API endpoint is ready
      console.log(`Updating organization via Firebase (${currentEnv} - temporary workaround)`)
      
      // Update directly in Firebase for all environments
      const updatedOrg = await updateOrganizationInFirebase(organization.id, updates)
      setOrganization(updatedOrg)
      
      console.log(`✅ Organization updated successfully in Firebase (${currentEnv})`)
      
    } catch (err) {
      console.error('Error updating organization:', err)
      throw err
    }
  }

  return {
    organization,
    events,
    loading,
    error,
    refreshEvents,
    updateOrganization,
    reload: loadData
  }
}