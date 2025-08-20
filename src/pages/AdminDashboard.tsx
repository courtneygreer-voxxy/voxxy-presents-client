import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Eye, Users, Calendar, ExternalLink } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { organizationsRef } from '@/lib/database'
import { getDocs, query, where } from 'firebase/firestore'
import type { Organization } from '@/types/database'

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)


  // Load user's organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      setLoading(true)
      try {
        // For now, get all organizations since we don't have auth yet
        // Later this will filter by user.uid
        const querySnapshot = await getDocs(organizationsRef)
        const orgs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as Organization[]
        setOrganizations(orgs)
      } catch (error) {
        console.error('Failed to load organizations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrganizations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your clubs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Clubs</h1>
              <p className="text-gray-600 mt-1">Manage your clubs and create new ones</p>
            </div>
            <Button onClick={() => navigate('/create-club')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Club
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {organizations.length === 0 ? (
          /* No Clubs State */
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No clubs yet</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Create your first club to start building your community and organizing events.
              </p>
              <Button onClick={() => navigate('/create-club')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Club
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Clubs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-0">
                  {/* Club Banner */}
                  {org.bannerUrl ? (
                    <img 
                      src={org.bannerUrl} 
                      alt={`${org.name} banner`}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg flex items-center justify-center">
                      <span className="text-white font-semibold">{org.name}</span>
                    </div>
                  )}
                  
                  {/* Club Info */}
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      {org.logoUrl ? (
                        <img 
                          src={org.logoUrl} 
                          alt={`${org.name} logo`}
                          className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-sm flex-shrink-0 -mt-8"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 -mt-8">
                          <span className="text-gray-600 text-xs font-bold">{org.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{org.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{org.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        /{org.slug}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`/${org.slug}`, '_blank')
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/${org.slug}/admin`)}
                          className="flex items-center gap-1"
                        >
                          <Settings className="h-3 w-3" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Create New Club Card */}
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer group border-dashed border-2 border-gray-300 hover:border-purple-400"
              onClick={() => navigate('/create-club')}
            >
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Plus className="h-12 w-12 text-gray-400 group-hover:text-purple-500 mb-4 transition-colors" />
                <h3 className="font-semibold text-gray-900 mb-2">Create New Club</h3>
                <p className="text-sm text-gray-600">Start building your community</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Stats */}
        {organizations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">My Clubs</p>
                    <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ExternalLink className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Pages</p>
                    <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}