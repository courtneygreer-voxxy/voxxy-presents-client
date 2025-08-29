import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Ticket
} from "lucide-react"
import { format } from 'date-fns'
import type { PlatformEvent, PlatformTicketSales, PlatformType } from '@/types/platformIntegration'
import { getCrossPlatformEventAnalytics, getPlatformTicketSales } from '@/services/platformIntegrationService'
import { useToast } from '@/hooks/use-toast'

interface TicketManagementCenterProps {
  organizationId: string
  connectedPlatforms: PlatformType[]
}

interface EventAnalytics {
  totalEvents: number
  totalTicketsSold: number
  totalRevenue: number
  platformBreakdown: Array<{
    platform: PlatformType
    events: number
    ticketsSold: number
    revenue: number
  }>
  recentEvents: PlatformEvent[]
}

interface TicketSalesData {
  [eventId: string]: PlatformTicketSales[]
}

const platformConfig = {
  eventbrite: { name: 'Eventbrite', color: 'bg-orange-500', icon: '🎫' },
  luma: { name: 'Luma', color: 'bg-purple-500', icon: '✨' },
  meetup: { name: 'Meetup', color: 'bg-red-500', icon: '👥' }
}

export function TicketManagementCenter({ organizationId, connectedPlatforms }: TicketManagementCenterProps) {
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [ticketSales, setTicketSales] = useState<TicketSalesData>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'platforms'>('overview')
  
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [organizationId])

  const loadAnalytics = async () => {
    if (refreshing) return
    
    setLoading(!analytics) // Only show loading on initial load
    setRefreshing(true)
    
    try {
      const analyticsData = await getCrossPlatformEventAnalytics(organizationId)
      setAnalytics(analyticsData)
      
      // Load detailed ticket sales for recent events
      const salesPromises = analyticsData.recentEvents.map(async event => {
        try {
          // In a real implementation, you'd get the connection ID for this event
          const sales = await getPlatformTicketSales('mock-connection-id', event.id)
          return { eventId: event.id, sales }
        } catch (error) {
          return { eventId: event.id, sales: [] }
        }
      })
      
      const salesResults = await Promise.all(salesPromises)
      const salesData: TicketSalesData = {}
      salesResults.forEach(({ eventId, sales }) => {
        salesData[eventId] = sales
      })
      setTicketSales(salesData)
      
    } catch (error) {
      console.error('Failed to load analytics:', error)
      toast({
        variant: "destructive",
        title: "Failed to Load Analytics",
        description: "Could not load ticket sales data. Please try again."
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadAnalytics()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600 mb-4">Unable to load ticket management data.</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ticket Command Center</h2>
          <p className="text-gray-600">
            Track ticket sales and event performance across all platforms
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Ticket className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalTicketsSold.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analytics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg per Event</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics.totalEvents > 0 ? Math.round(analytics.totalRevenue / analytics.totalEvents) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="events">Event Performance</TabsTrigger>
          <TabsTrigger value="platforms">Platform Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.platformBreakdown.map(platform => {
                  const config = platformConfig[platform.platform]
                  const revenuePercentage = analytics.totalRevenue > 0 
                    ? (platform.revenue / analytics.totalRevenue) * 100 
                    : 0
                  
                  return (
                    <div key={platform.platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded ${config.color} flex items-center justify-center text-white text-xs`}>
                            {config.icon}
                          </div>
                          <span className="font-medium">{config.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${platform.revenue.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">
                            {platform.events} events • {platform.ticketsSold} tickets
                          </div>
                        </div>
                      </div>
                      <Progress value={revenuePercentage} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {revenuePercentage.toFixed(1)}% of total revenue
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {/* Recent Events Performance */}
          {analytics.recentEvents.map(event => {
            const eventSales = ticketSales[event.id] || []
            const totalSold = eventSales.reduce((sum, sale) => sum + sale.totalSold, 0)
            const totalRevenue = eventSales.reduce((sum, sale) => sum + sale.totalRevenue, 0)
            const totalCapacity = event.capacity || 0
            const capacityUsed = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0
            const config = platformConfig[event.platform]

            return (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded ${config.color} flex items-center justify-center text-white text-xs`}>
                          {config.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <Badge variant="outline">{config.name}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{format(event.startDate, 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <a
                      href={event.platformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{totalSold}</div>
                      <div className="text-sm text-gray-600">Tickets Sold</div>
                      {totalCapacity > 0 && (
                        <div className="text-xs text-gray-500">
                          of {totalCapacity} capacity
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                    
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {capacityUsed.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Capacity Used</div>
                      {totalCapacity > 0 && (
                        <Progress value={capacityUsed} className="h-2 mt-1" />
                      )}
                    </div>
                  </div>

                  {/* Ticket Types Breakdown */}
                  {eventSales.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Ticket Types</h4>
                      <div className="space-y-2">
                        {eventSales[0].ticketTypes.map(ticketType => (
                          <div key={ticketType.name} className="flex items-center justify-between text-sm">
                            <span>{ticketType.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-600">
                                {ticketType.sold} sold
                                {ticketType.capacity && ` of ${ticketType.capacity}`}
                              </span>
                              <span className="font-medium">
                                ${(ticketType.price * ticketType.sold).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          {/* Platform Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Revenue Comparison */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Revenue by Platform</h4>
                  <div className="space-y-3">
                    {analytics.platformBreakdown.map(platform => {
                      const config = platformConfig[platform.platform]
                      const maxRevenue = Math.max(...analytics.platformBreakdown.map(p => p.revenue))
                      const percentage = maxRevenue > 0 ? (platform.revenue / maxRevenue) * 100 : 0
                      
                      return (
                        <div key={platform.platform} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${config.color}`}></div>
                              <span className="text-sm font-medium">{config.name}</span>
                            </div>
                            <span className="text-sm font-semibold">
                              ${platform.revenue.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Ticket Sales Comparison */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Tickets Sold by Platform</h4>
                  <div className="space-y-3">
                    {analytics.platformBreakdown.map(platform => {
                      const config = platformConfig[platform.platform]
                      const maxTickets = Math.max(...analytics.platformBreakdown.map(p => p.ticketsSold))
                      const percentage = maxTickets > 0 ? (platform.ticketsSold / maxTickets) * 100 : 0
                      
                      return (
                        <div key={platform.platform} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${config.color}`}></div>
                              <span className="text-sm font-medium">{config.name}</span>
                            </div>
                            <span className="text-sm font-semibold">
                              {platform.ticketsSold.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}