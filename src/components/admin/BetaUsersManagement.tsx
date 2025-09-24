import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  Search,
  Filter,
  X,
  RefreshCw,
  UserCheck,
  UserX
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User } from '@/types/database'

interface BetaUser extends User {
  // Add any additional fields we might need
}

export default function BetaUsersManagement() {
  const [betaUsers, setBetaUsers] = useState<BetaUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all')
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  // Load beta users
  const loadBetaUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef) // Get all users, we'll filter on the frontend for now
      const querySnapshot = await getDocs(q)

      const users: BetaUser[] = []
      querySnapshot.forEach((doc) => {
        const userData = doc.data()
        users.push({
          id: doc.id,
          ...userData,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          betaRequestedAt: userData.betaRequestedAt?.toDate() || undefined,
          betaApprovedAt: userData.betaApprovedAt?.toDate() || undefined,
        } as BetaUser)
      })

      // Sort by creation date, newest first
      users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setBetaUsers(users)
    } catch (err) {
      console.error('Error loading beta users:', err)
      setError('Failed to load beta users')
    } finally {
      setLoading(false)
    }
  }

  // Update user beta status
  const updateBetaStatus = async (userId: string, status: 'approved' | 'denied') => {
    setUpdatingUserId(userId)

    try {
      const userRef = doc(db, 'users', userId)
      const updateData: any = {
        betaStatus: status,
        updatedAt: Timestamp.now()
      }

      if (status === 'approved') {
        updateData.betaApprovedAt = Timestamp.now()
        updateData.betaApprovedBy = 'admin' // Could be the current admin user ID
      }

      await updateDoc(userRef, updateData)

      // Update local state
      setBetaUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? {
                ...user,
                betaStatus: status,
                betaApprovedAt: status === 'approved' ? new Date() : user.betaApprovedAt,
                betaApprovedBy: status === 'approved' ? 'admin' : user.betaApprovedBy
              }
            : user
        )
      )

      // TODO: Send approval/denial email notification
      console.log(`Beta ${status} for user ${userId}`)

    } catch (err) {
      console.error(`Error updating beta status:`, err)
      setError(`Failed to ${status} user`)
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Filter users based on search and status
  const filteredUsers = betaUsers.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || user.betaStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  // Get stats
  const stats = {
    total: betaUsers.length,
    pending: betaUsers.filter(u => u.betaStatus === 'pending').length,
    approved: betaUsers.filter(u => u.betaStatus === 'approved').length,
    denied: betaUsers.filter(u => u.betaStatus === 'denied').length
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  useEffect(() => {
    loadBetaUsers()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Loading beta users...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Denied</p>
                <p className="text-2xl font-bold text-red-600">{stats.denied}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Beta Users Management
              </CardTitle>
              <CardDescription>
                Manage beta access requests and user approvals
              </CardDescription>
            </div>
            <Button onClick={loadBetaUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchQuery || statusFilter !== 'all') && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No beta users found</p>
                {(searchQuery || statusFilter !== 'all') && (
                  <Button onClick={clearFilters} variant="link" className="mt-2">
                    Clear filters to see all users
                  </Button>
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{user.name || 'Unnamed User'}</h3>
                          <Badge
                            variant={
                              user.betaStatus === 'approved' ? 'default' :
                              user.betaStatus === 'denied' ? 'destructive' :
                              'secondary'
                            }
                            className={
                              user.betaStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              user.betaStatus === 'denied' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {user.betaStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Requested: {new Date(user.betaRequestedAt || user.createdAt).toLocaleDateString()}
                          </div>
                          {user.betaApprovedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Approved: {new Date(user.betaApprovedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {user.betaStatus === 'pending' && (
                          <>
                            <Button
                              onClick={() => updateBetaStatus(user.id, 'approved')}
                              disabled={updatingUserId === user.id}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => updateBetaStatus(user.id, 'denied')}
                              disabled={updatingUserId === user.id}
                              variant="destructive"
                              size="sm"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Deny
                            </Button>
                          </>
                        )}

                        {user.betaStatus === 'denied' && (
                          <Button
                            onClick={() => updateBetaStatus(user.id, 'approved')}
                            disabled={updatingUserId === user.id}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        )}

                        {user.betaStatus === 'approved' && (
                          <Button
                            onClick={() => updateBetaStatus(user.id, 'denied')}
                            disabled={updatingUserId === user.id}
                            variant="destructive"
                            size="sm"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}