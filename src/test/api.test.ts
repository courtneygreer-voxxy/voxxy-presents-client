import { describe, it, expect, vi, beforeEach } from 'vitest'
import { organizationsApi, eventsApi, registrationsApi } from '../services/api'

// Mock fetch globally
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('organizationsApi', () => {
    it('should fetch organization by slug', async () => {
      const mockOrg = { id: '1', name: 'Test Org', slug: 'test-org' }
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrg,
      })

      const result = await organizationsApi.getBySlug('test-org')
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/organizations/test-org',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockOrg)
    })

    it('should create a new organization', async () => {
      const newOrg = { name: 'New Org', slug: 'new-org' }
      const createdOrg = { id: '2', ...newOrg }
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createdOrg,
      })

      const result = await organizationsApi.create(newOrg)
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/organizations',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(newOrg),
        })
      )
      expect(result).toEqual(createdOrg)
    })

    it('should update an existing organization', async () => {
      const updateData = { name: 'Updated Org Name' }
      const updatedOrg = { id: '1', name: 'Updated Org Name', slug: 'test-org' }
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedOrg,
      })

      const result = await organizationsApi.update('1', updateData)
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/organizations/1',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual(updatedOrg)
    })
  })

  describe('eventsApi', () => {
    it('should fetch events by organization', async () => {
      const mockEvents = [
        { id: '1', title: 'Event 1', organizationId: 'org1' },
        { id: '2', title: 'Event 2', organizationId: 'org1' }
      ]
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      })

      const result = await eventsApi.getByOrganization('org1')
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/events?organization=org1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockEvents)
    })

    it('should create a new event', async () => {
      const newEvent = { title: 'Test Event', organizationId: 'org1' }
      const createdEvent = { id: '3', ...newEvent }
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createdEvent,
      })

      const result = await eventsApi.create(newEvent)
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/events',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newEvent),
        })
      )
      expect(result).toEqual(createdEvent)
    })

    it('should update an existing event', async () => {
      const updateData = { title: 'Updated Event' }
      const updatedEvent = { id: '1', title: 'Updated Event', organizationId: 'org1' }
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedEvent,
      })

      const result = await eventsApi.update('1', updateData)
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/events/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual(updatedEvent)
    })

    it('should delete an event', async () => {
      const deleteResponse = { success: true }
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => deleteResponse,
      })

      const result = await eventsApi.delete('1')
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/events/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result).toEqual(deleteResponse)
    })
  })

  describe('registrationsApi', () => {
    it('should create a registration', async () => {
      const registrationData = {
        eventId: 'event1',
        name: 'John Doe',
        email: 'john@example.com',
        registrationType: 'rsvp_yes' as const
      }
      const createdRegistration = { id: '1', ...registrationData }
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createdRegistration,
      })

      const result = await registrationsApi.create(registrationData)
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/registrations',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(registrationData),
        })
      )
      expect(result).toEqual(createdRegistration)
    })
  })
})