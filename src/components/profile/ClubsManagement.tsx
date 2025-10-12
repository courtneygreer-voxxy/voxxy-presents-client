import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  Building2,
  ExternalLink,
  Settings,
  Calendar,
  Users,
  MapPin,
  Mail
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getOrganization } from '@/lib/database'
import type { Organization } from '@/types/database'

interface ClubWithData extends Organization {
  isLoading?: boolean
}

export function ClubsManagement() {
  const { userProfile, currentUser } = useAuth()
  const [clubs, setClubs] = useState<ClubWithData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  // Load club data
  useEffect(() => {
    const loadClubs = async () => {
      // Only show debug logs in development and staging environments
      const isDevelopment = import.meta.env.DEV
      const isStaging = window.location.hostname.includes('staging') ||
                       window.location.hostname.includes('dev') ||
                       import.meta.env.VITE_ENVIRONMENT === 'staging'
      const showDebugLogs = isDevelopment || isStaging

      if (showDebugLogs) {
        console.log('🔍 CLUB DEBUG: Starting club load...')
        console.log('🔍 CLUB DEBUG: userProfile:', userProfile)
        console.log('🔍 CLUB DEBUG: organizationIds:', userProfile?.organizationIds)
        console.log('🔍 CLUB DEBUG: organizationIds length:', userProfile?.organizationIds?.length)
      }

      if (!userProfile?.organizationIds?.length) {
        if (showDebugLogs) {
          console.log('🔍 CLUB DEBUG: No organizationIds found, setting loading to false')
        }
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        if (showDebugLogs) {
          console.log('🔍 CLUB DEBUG: Loading clubs for IDs:', userProfile.organizationIds)
        }
        const clubPromises = userProfile.organizationIds.map(async (orgId) => {
          try {
            if (showDebugLogs) {
              console.log(`🔍 CLUB DEBUG: Loading club ${orgId}...`)
            }
            const org = await getOrganization(orgId)
            if (showDebugLogs) {
              console.log(`🔍 CLUB DEBUG: Loaded club ${orgId}:`, org?.name || 'null')
            }
            return org
          } catch (error) {
            if (showDebugLogs) {
              console.error(`🔍 CLUB DEBUG: Failed to load club ${orgId}:`, error)
            }
            return null
          }
        })

        const clubResults = await Promise.all(clubPromises)
        const validClubs = clubResults.filter((club): club is Organization => club !== null)
        if (showDebugLogs) {
          console.log('🔍 CLUB DEBUG: Final valid clubs:', validClubs)
        }
        setClubs(validClubs)
      } catch (error) {
        if (showDebugLogs) {
          console.error('🔍 CLUB DEBUG: Failed to load clubs:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadClubs()
  }, [userProfile?.organizationIds, location.pathname]) // Re-load when navigating back to profile

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">My Clubs</h2>
            <p className="text-gray-200">Manage your clubs and events</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!clubs.length) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">My Clubs</h2>
            <p className="text-gray-200">Manage your clubs and events</p>
          </div>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link to="/create-club">
              <Plus className="h-4 w-4 mr-2" />
              Create Club
            </Link>
          </Button>
        </div>

        {/* Empty State */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No clubs yet</h3>
            <p className="text-gray-200 mb-6 max-w-md mx-auto">
              Create your first club to start building your community and managing events.
            </p>
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/create-club">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Club
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">My Clubs</h2>
          <p className="text-gray-200">
            You're managing {clubs.length} club{clubs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
          <Link to="/create-club">
            <Plus className="h-4 w-4 mr-2" />
            Create Club
          </Link>
        </Button>
      </div>


      {/* Clubs List - Single Column */}
      <div className="space-y-4">
        {clubs.map((club) => (
          <Card key={club.id} className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {club.logoUrl && (
                      <img 
                        src={club.logoUrl} 
                        alt={`${club.name} logo`}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-white">{club.name}</h3>
                      <p className="text-gray-200 text-sm mt-1">
                        {club.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Club Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {club.settings?.defaultLocation && (
                  <div className="flex items-center text-sm text-gray-200">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{club.settings.defaultLocation}</span>
                  </div>
                )}

                {club.contactEmail && (
                  <div className="flex items-center text-sm text-gray-200">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{club.contactEmail}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button asChild className="flex-1 min-w-[140px] bg-purple-600 hover:bg-purple-700 text-white">
                  <Link to={`/${club.slug}/admin`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Club
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="flex-1 min-w-[120px] bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30">
                  <Link to={`/${club.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="flex-1 min-w-[100px] bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30">
                  <Link to={`/${club.slug}/admin`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Events
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}