// Email system dashboard for monitoring communications
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Mail, 
  Send, 
  MessageCircle, 
  AlertCircle, 
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Settings
} from "lucide-react"
import { useEmailSystem, useEmailDeliveryMonitor } from '@/hooks/useEmailSystem'
import { ContactFormSubmission } from '@/types/database'
import { EmailDeliveryStatus } from '@/types/email'
import { formatDistanceToNow } from 'date-fns'

interface EmailSystemDashboardProps {
  organizationId?: string
}

export default function EmailSystemDashboard({ organizationId }: EmailSystemDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const emailSystem = useEmailSystem({ 
    organizationId, 
    autoRefresh: true,
    refreshInterval: 30000 
  })

  // Filter submissions based on search and filters
  const filteredSubmissions = emailSystem.submissions.filter(submission => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!submission.name.toLowerCase().includes(query) && 
          !submission.email.toLowerCase().includes(query) &&
          !submission.organizationName?.toLowerCase().includes(query)) {
        return false
      }
    }

    // Status filter
    if (statusFilter !== 'all' && submission.status !== statusFilter) {
      return false
    }

    // Type filter
    if (typeFilter !== 'all' && submission.type !== typeFilter) {
      return false
    }

    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="secondary">Received</Badge>
      case 'processing':
        return <Badge variant="outline">Processing</Badge>
      case 'responded':
        return <Badge variant="default">Responded</Badge>
      case 'closed':
        return <Badge variant="outline">Closed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'beta_request':
        return <Badge className="bg-purple-100 text-purple-800">Beta Request</Badge>
      case 'newsletter_signup':
        return <Badge className="bg-blue-100 text-blue-800">Newsletter</Badge>
      case 'general_contact':
        return <Badge className="bg-gray-100 text-gray-800">Contact</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email System</h2>
          <p className="text-gray-600">Monitor communications and manage email workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={emailSystem.loadSubmissions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {emailSystem.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{emailSystem.error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={emailSystem.clearError}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{emailSystem.submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emailSystem.submissions.filter(s => s.status === 'responded').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emailSystem.submissions.filter(s => s.status === 'received' || s.status === 'processing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Beta Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emailSystem.submissions.filter(s => s.type === 'beta_request').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submissions">Contact Submissions</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Monitoring</TabsTrigger>
        </TabsList>

        {/* Contact Submissions */}
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Contact Form Submissions</CardTitle>
                  <CardDescription>
                    Manage incoming contact requests and communications
                  </CardDescription>
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search submissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="beta_request">Beta Request</SelectItem>
                      <SelectItem value="newsletter_signup">Newsletter</SelectItem>
                      <SelectItem value="general_contact">Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {emailSystem.submissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading submissions...</span>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No submissions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{submission.name}</p>
                              <p className="text-sm text-gray-600">{submission.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(submission.type)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {submission.organizationName || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(submission.status)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatDistanceToNow(submission.submittedAt, { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              {submission.emailThreadId && (
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage email templates for automated responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSystem.templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading templates...</span>
                </div>
              ) : emailSystem.templates.length === 0 ? (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No templates configured</p>
                  <Button className="mt-4">
                    Create Template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {emailSystem.templates.map((template) => (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{template.subject}</h3>
                            <p className="text-sm text-gray-600">{template.type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={template.isActive ? "default" : "secondary"}>
                              {template.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Monitoring */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Email Delivery Monitoring</CardTitle>
              <CardDescription>
                Track email delivery status and handle failures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Email delivery monitoring will appear here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Track sent emails, delivery confirmations, and bounce handling
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}