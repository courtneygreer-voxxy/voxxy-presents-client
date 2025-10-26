import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Mail,
  Users,
  Clock,
  Calendar,
  Download,
  Filter,
  Send,
  Megaphone,
  Loader,
  Edit3,
  X,
  AlertCircle
} from "lucide-react"
import { subscriptionService } from '@/services/subscriptionService'
import { SubscriberQRModal } from '@/components/SubscriberQRModal'
import type { Event } from '@/types/database'

interface SubscribersListProps {
  organizationId: string
  organizationSlug: string
  organizationName: string
  events: Event[]
}

export default function SubscribersList({ organizationId, organizationSlug, organizationName, events }: SubscribersListProps) {
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null)
  const [campaignResult, setCampaignResult] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<string>('')
  const [messageTitle, setMessageTitle] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')

  useEffect(() => {
    async function loadSubscribers() {
      setLoading(true)
      setError(null)
      try {
        const subscribers = await subscriptionService.getOrganizationSubscribers(organizationId)
        setNewsletterSubscribers(subscribers)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscribers')
        setNewsletterSubscribers([])
      } finally {
        setLoading(false)
      }
    }

    loadSubscribers()
  }, [organizationId])

  // Calculate stats
  const totalNewsletterSubscribers = newsletterSubscribers.length

  // Open modal to edit template
  const openTemplateModal = (templateType: string) => {
    setCurrentTemplate(templateType)

    // Set default values for announcement
    if (templateType === 'announcement') {
      setMessageTitle('Important Announcement')
      setMessageSubject('📢 Important Updates from Our Community')
      setMessageContent('We have an important announcement to share with our community.')
    }

    setIsModalOpen(true)
  }

  // Send campaign function
  const sendCampaign = async () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      setCampaignResult('❌ Please fill in all required fields!')
      setTimeout(() => setCampaignResult(null), 3000)
      return
    }

    // Check if there are subscribers
    if (totalNewsletterSubscribers === 0) {
      setCampaignResult('❌ No subscribers to send to!')
      setTimeout(() => setCampaignResult(null), 3000)
      return
    }

    setSendingCampaign(currentTemplate)
    setCampaignResult(null)
    setIsModalOpen(false)

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizationId,
          title: messageTitle,
          subject: messageSubject,
          content: messageContent,
          audience: 'all_subscribers',
          templateType: currentTemplate,
          sendImmediately: true
        })
      })

      if (response.ok) {
        setCampaignResult(`✅ ${messageTitle} sent to ${totalNewsletterSubscribers} subscribers!`)
      } else {
        const errorData = await response.json()
        setCampaignResult(`❌ Failed to send: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Campaign send error:', error)
      setCampaignResult('❌ Network error - please check your connection')
    } finally {
      setSendingCampaign(null)
      setTimeout(() => setCampaignResult(null), 5000)
    }
  }

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentTemplate('')
    setMessageTitle('')
    setMessageSubject('')
    setMessageContent('')
  }

  // Export subscribers function
  const exportSubscribers = () => {
    if (newsletterSubscribers.length === 0) {
      alert('No subscribers to export')
      return
    }

    // Prepare data for export
    const exportData = newsletterSubscribers.map(sub => ({
      Name: sub.name || 'No name',
      Email: sub.email,
      'Event Title': sub.eventTitle,
      'Subscribed Date': new Date(sub.subscribedAt).toLocaleDateString()
    }))

    // Convert to CSV
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escape commas and quotes in CSV
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `subscribers-${organizationId}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  if (loading) {
    return (
      <div className="admin-dark space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="!bg-white/10 backdrop-blur-sm !border-white/20">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
          <CardContent className="py-12">
            <div className="text-center">Loading subscriber data...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="admin-dark space-y-6">
      {/* Stats & Quick Actions */}
      <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-white">Total Club Subscribers</p>
                <p className="text-2xl font-bold text-white">{totalNewsletterSubscribers}</p>
                <p className="text-xs text-gray-400">Active subscribers from all events</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => openTemplateModal('announcement')}
                disabled={sendingCampaign !== null}
                size="sm"
                variant="outline"
                className="bg-white/5 border-white/20 hover:bg-white/10 text-white flex items-center gap-2"
              >
                {sendingCampaign === 'announcement' ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Megaphone className="h-4 w-4" />
                )}
                Announcement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Result */}
      {campaignResult && (
        <Card className={`!border-2 ${campaignResult.includes('✅') ? '!border-green-400/50 !bg-green-500/10' : '!border-red-400/50 !bg-red-500/10'} backdrop-blur-sm`}>
          <CardContent className="p-3">
            <p className={`text-sm font-medium ${campaignResult.includes('✅') ? 'text-green-300' : 'text-red-300'}`}>
              {campaignResult}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Club Subscribers */}
      <Card className="!bg-gray-900/60 backdrop-blur-md !border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-white">Club Subscribers</CardTitle>
            <CardDescription className="text-gray-300">
              People subscribed to your clubs's updates
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <SubscriberQRModal
              organizationSlug={organizationSlug}
              organizationName={organizationName}
            />
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800/60 border-white/20 hover:bg-gray-700/60 text-white"
            >
              <Filter className="h-4 w-4 mr-2 text-purple-400" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800/60 border-white/20 hover:bg-gray-700/60 text-white"
              onClick={exportSubscribers}
            >
              <Download className="h-4 w-4 mr-2 text-purple-400" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {totalNewsletterSubscribers > 0 ? (
            <div className="space-y-4">
              {newsletterSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between py-3 px-4 bg-gray-800/40 backdrop-blur-sm rounded border border-white/20 hover:bg-gray-700/50 hover:border-white/30 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-white">{subscriber.name || 'No name'}</p>
                      <p className="text-xs text-gray-200">{subscriber.email}</p>
                      {subscriber.eventTitle && (
                        <p className="text-xs text-gray-300">From: {subscriber.eventTitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Calendar className="h-3 w-3 text-purple-400" />
                      {subscriber.subscribedAt && !isNaN(new Date(subscriber.subscribedAt).getTime())
                        ? new Date(subscriber.subscribedAt).toLocaleDateString()
                        : 'Date unknown'}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        if (confirm(`Delete ${subscriber.name || subscriber.email} from subscribers?`)) {
                          // TODO: Call API to delete subscriber
                          console.log('Delete subscriber:', subscriber.id)
                          alert('Delete functionality will be connected to API')
                        }
                      }}
                      title="Delete subscriber"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Club Subscribers Yet</h3>
              <p className="text-gray-300 text-center">
                When people subscribe to get alerts about your events, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>


      {error && (
        <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
          <CardContent className="py-4">
            <p className="text-red-400">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Template Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg !bg-gray-900 !border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-400" />
              Send Announcement
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Customize your announcement before sending to {totalNewsletterSubscribers} subscribers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-300">
                Campaign Title *
              </Label>
              <Input
                id="title"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="Enter campaign title..."
                className="bg-white/5 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="subject" className="text-sm font-medium text-gray-300">
                Email Subject Line
              </Label>
              <Input
                id="subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="bg-white/5 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium text-gray-300">
                Message Content *
              </Label>
              <Textarea
                id="content"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Enter your message content..."
                rows={4}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Communicate important information to your community
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              onClick={closeModal}
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={sendCampaign}
              disabled={!messageTitle.trim() || !messageContent.trim() || sendingCampaign !== null}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {sendingCampaign ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {totalNewsletterSubscribers} Subscribers
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}