import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowRight, Shield, Building2, Store, ChevronDown, ChevronUp, Calendar, Mail, Key, Database } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { adminApi } from "@/services/api"

interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
  status?: 'active' | 'suspended' | 'banned'
  confirmed_at: string | null
  created_at?: string
  updated_at?: string
  last_sign_in_at?: string
  sign_in_count?: number
  current_sign_in_ip?: string
  organizations?: any[]
  events?: any[]
  vendor_applications?: any[]
  registrations?: any[]
  [key: string]: any // Allow additional fields
}

export default function AdminDashboardPage() {
  const { userProfile, signOut } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const allUsers = await adminApi.getAllUsers()

      console.log('📥 Raw user data from API:', allUsers.slice(0, 3)) // Log first 3 users to see structure

      // Filter to only show Voxxy Presents users (vendors and venue_owners/producers)
      // Note: If role field is missing, we'll show all users for now
      const presentsUsers = allUsers.filter((user: User) => {
        // If no role field exists, include all users (we'll fix this in Rails later)
        if (!user.role) {
          return true // Show all users if role field is missing
        }
        return user.role === 'vendor' || user.role === 'venue_owner' || user.role === 'producer'
      })

      setUsers(presentsUsers)
      console.log(`✅ Loaded ${presentsUsers.length} users (filtered from ${allUsers.length} total)`)
    } catch (err) {
      console.error('❌ Failed to load users:', err)
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getRoleBadgeColor = (role?: string) => {
    if (!role) return 'bg-gray-500/20 border-gray-400/30 text-gray-300'
    switch (role) {
      case 'venue_owner':
      case 'producer':
        return 'bg-green-500/20 border-green-400/30 text-green-300'
      case 'vendor':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-300'
      case 'consumer':
        return 'bg-amber-500/20 border-amber-400/30 text-amber-300'
      case 'admin':
        return 'bg-purple-500/20 border-purple-400/30 text-purple-300'
      default:
        return 'bg-gray-500/20 border-gray-400/30 text-gray-300'
    }
  }

  const getRoleIcon = (role?: string) => {
    if (!role) return <Users className="h-4 w-4" />
    switch (role) {
      case 'venue_owner':
      case 'producer':
        return <Building2 className="h-4 w-4" />
      case 'vendor':
        return <Store className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getDisplayRole = (role?: string) => {
    if (!role) return 'No Role' // Handle missing role field
    switch (role) {
      case 'venue_owner':
        return 'Producer'
      case 'producer':
        return 'Producer'
      case 'vendor':
        return 'Vendor'
      case 'consumer':
        return 'Consumer'
      case 'admin':
        return 'Admin'
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <div className="relative z-10 min-h-screen px-4 py-12 md:py-16">
        <div className="w-full max-w-6xl mx-auto space-y-8 my-8 md:my-12">

          {/* Header Card */}
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-purple-300" />
              </div>
              <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300 px-4 py-2 text-sm font-medium mb-4 w-fit mx-auto">
                <Shield className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Badge>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Voxxy Presents Users
              </CardTitle>
              <CardDescription className="text-lg text-gray-200">
                Manage vendors and producers
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {userProfile?.email && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Logged in as:</strong> {userProfile.email}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    <strong className="text-white">Role:</strong> Admin
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">
                  All Users ({users.length})
                </h3>
                <Button
                  onClick={loadUsers}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-300">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No Voxxy Presents users found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => {
                    const isExpanded = expandedUserId === user.id
                    return (
                      <div
                        key={user.id}
                        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden transition-all"
                      >
                        {/* User Header - Always Visible */}
                        <button
                          onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-3">
                              {getRoleIcon(user.role)}
                              <div>
                                <h4 className="text-sm font-semibold text-white">
                                  {user.name || 'No name'}
                                </h4>
                                <p className="text-xs text-gray-300">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>
                              {getDisplayRole(user.role)}
                            </Badge>
                            <Badge
                              className={
                                user.confirmed_at
                                  ? "bg-green-500/20 border-green-400/30 text-green-300 text-xs"
                                  : "bg-yellow-500/20 border-yellow-400/30 text-yellow-300 text-xs"
                              }
                            >
                              {user.confirmed_at ? 'Verified' : 'Unverified'}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-300" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                        </button>

                        {/* Expanded User Context - Shows ALL Data */}
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
                            {/* Basic Info Section */}
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 space-y-2">
                              <h5 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                <Database className="h-4 w-4 text-purple-300" />
                                User Context
                              </h5>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <p className="text-gray-400">User ID</p>
                                  <p className="text-white font-mono">#{user.id}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Email</p>
                                  <p className="text-white break-all">{user.email}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Name</p>
                                  <p className="text-white">{user.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Role</p>
                                  <p className="text-white">{user.role || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Created At</p>
                                  <p className="text-white">{user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Updated At</p>
                                  <p className="text-white">{user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Last Sign In</p>
                                  <p className="text-white">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Sign In Count</p>
                                  <p className="text-white">{user.sign_in_count || 0} times</p>
                                </div>
                                {user.current_sign_in_ip && (
                                  <div>
                                    <p className="text-gray-400">Last IP</p>
                                    <p className="text-white font-mono">{user.current_sign_in_ip}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-gray-400">Confirmed At</p>
                                  <p className="text-white">{user.confirmed_at ? new Date(user.confirmed_at).toLocaleString() : 'Not confirmed'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Organizations Section */}
                            {user.organizations && user.organizations.length > 0 && (
                              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                                <h5 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                  <Building2 className="h-4 w-4 text-green-300" />
                                  Organizations ({user.organizations.length})
                                </h5>
                                <div className="space-y-2">
                                  {user.organizations.map((org: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded p-3 text-xs space-y-1">
                                      <p className="text-white font-semibold">{org.name || `Organization #${org.id}`}</p>
                                      <p className="text-gray-300">ID: {org.id}</p>
                                      {org.created_at && <p className="text-gray-400">Created: {new Date(org.created_at).toLocaleDateString()}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Events Section */}
                            {user.events && user.events.length > 0 && (
                              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                                <h5 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                  <Calendar className="h-4 w-4 text-blue-300" />
                                  Events ({user.events.length})
                                </h5>
                                <div className="space-y-2">
                                  {user.events.map((event: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded p-3 text-xs space-y-1">
                                      <p className="text-white font-semibold">{event.title || `Event #${event.id}`}</p>
                                      <p className="text-gray-300">Slug: {event.slug}</p>
                                      {event.event_date && <p className="text-gray-400">Date: {new Date(event.event_date).toLocaleDateString()}</p>}
                                      {event.location && <p className="text-gray-400">Location: {event.location}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Registrations Section */}
                            {user.registrations && user.registrations.length > 0 && (
                              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                                <h5 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                  <Store className="h-4 w-4 text-yellow-300" />
                                  Registrations ({user.registrations.length})
                                </h5>
                                <div className="space-y-2">
                                  {user.registrations.map((reg: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded p-3 text-xs space-y-1">
                                      <p className="text-white font-semibold">{reg.business_name || `Registration #${reg.id}`}</p>
                                      <p className="text-gray-300">Status: {reg.status}</p>
                                      {reg.vendor_category && <p className="text-gray-400">Category: {reg.vendor_category}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Raw JSON Dump - Shows EVERYTHING */}
                            <details className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                              <summary className="text-sm font-semibold text-white cursor-pointer flex items-center gap-2">
                                <Key className="h-4 w-4 text-red-300" />
                                Raw User Object (Debug)
                              </summary>
                              <pre className="mt-3 text-xs text-gray-300 overflow-auto max-h-96 bg-black/30 p-3 rounded border border-white/10">
                                {JSON.stringify(user, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="text-center pt-6 border-t border-white/10">
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30"
                  >
                    Sign Out
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                    <Link to="/">
                      Back to Home
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
