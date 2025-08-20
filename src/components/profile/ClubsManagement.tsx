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
  Palette,
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
      if (!userProfile?.organizationIds?.length) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const clubPromises = userProfile.organizationIds.map(async (orgId) => {
          try {
            const org = await getOrganization(orgId)
            return org
          } catch (error) {
            console.error(`Failed to load club ${orgId}:`, error)
            return null
          }
        })

        const clubResults = await Promise.all(clubPromises)
        const validClubs = clubResults.filter((club): club is Organization => club !== null)
        setClubs(validClubs)
      } catch (error) {
        console.error('Failed to load clubs:', error)
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
            <h2 className="text-2xl font-bold">My Clubs</h2>
            <p className="text-gray-600">Manage your clubs and events</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
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
            <h2 className="text-2xl font-bold">My Clubs</h2>
            <p className="text-gray-600">Manage your clubs and events</p>
          </div>
          <Button asChild>
            <Link to="/create-club">
              <Plus className="h-4 w-4 mr-2" />
              Create Club
            </Link>
          </Button>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first club to start building your community and managing events.
            </p>
            <Button asChild size="lg">
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
          <h2 className="text-2xl font-bold">My Clubs</h2>
          <p className="text-gray-600">
            You're managing {clubs.length} club{clubs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link to="/create-club">
            <Plus className="h-4 w-4 mr-2" />
            Create Club
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>
            Overview of your clubs and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{clubs.length}</div>
              <div className="text-sm text-gray-600">Total Clubs</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {clubs.reduce((acc, club) => {
                  return acc + (club.socialLinks ? Object.keys(club.socialLinks).length : 0)
                }, 0)}
              </div>
              <div className="text-sm text-gray-600">Social Connections</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {clubs.filter(club => club.aboutImages?.length || club.aboutImageUrl).length}
              </div>
              <div className="text-sm text-gray-600">Clubs with Images</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clubs List - Single Column */}
      <div className="space-y-4">
        {clubs.map((club) => (
          <Card key={club.id} className="hover:shadow-lg transition-shadow">
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
                      <h3 className="text-xl font-semibold text-gray-900">{club.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {club.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Club Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {club.settings?.defaultLocation && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{club.settings.defaultLocation}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <Palette className="h-4 w-4 mr-3 text-gray-400" />
                  <span>Theme: {club.settings?.theme?.primaryColor || 'Default'}</span>
                </div>
                
                {club.contactEmail && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{club.contactEmail}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                  <span>Created {new Date(club.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button asChild className="flex-1 min-w-[140px]">
                  <Link to={`/${club.slug}/admin`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Club
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="flex-1 min-w-[120px]">
                  <Link to={`/${club.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="flex-1 min-w-[100px]">
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