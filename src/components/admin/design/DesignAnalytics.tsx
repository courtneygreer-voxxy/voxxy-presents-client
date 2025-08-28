import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  TrendingUp, 
  Eye, 
  Users, 
  Zap, 
  Download,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Info,
  Palette
} from "lucide-react"
import { designService } from '@/services/designService'
import { validateDesignPerformance, designPerformanceMonitor } from '@/utils/designOptimization'
import { useDesign } from '@/contexts/DesignContext'
import type { Organization } from '@/types/database'

interface DesignAnalyticsProps {
  organization: Organization
}

interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  conversionRate: number
  topColors: { color: string; usage: number }[]
  performanceScore: number
}

export function DesignAnalytics({ organization }: DesignAnalyticsProps) {
  const { designState } = useDesign()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Performance validation
  const performanceReport = useMemo(() => {
    return validateDesignPerformance(designState.preview)
  }, [designState.preview])

  // Load analytics data
  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true)
      setError(null)
      
      try {
        const data = await designService.getDesignAnalytics(organization.id, timeRange)
        setAnalyticsData(data)
      } catch (err) {
        // Mock data for development/demo
        setAnalyticsData({
          pageViews: Math.floor(Math.random() * 10000) + 1000,
          uniqueVisitors: Math.floor(Math.random() * 3000) + 500,
          conversionRate: Math.random() * 15 + 2,
          topColors: [
            { color: designState.preview.theme.primaryColor, usage: 45 },
            { color: designState.preview.theme.accentColor, usage: 28 },
            { color: designState.preview.theme.secondaryColor, usage: 15 },
            { color: designState.preview.theme.textColor, usage: 12 }
          ],
          performanceScore: performanceReport.score
        })
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [organization.id, timeRange, designState.preview, performanceReport.score])

  const handleExportReport = async () => {
    try {
      const blob = await designService.exportDesign(organization.id, 'json')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${organization.slug}-design-analytics.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export analytics:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Design Analytics</h2>
          <p className="text-muted-foreground">
            Performance insights and usage statistics for your design
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
        <TabsList>
          <TabsTrigger value="7d">Last 7 days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 days</TabsTrigger>
          <TabsTrigger value="90d">Last 90 days</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Error Display */}
      {error && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Analytics data is currently simulated. {error}
          </AlertDescription>
        </Alert>
      )}

      {analyticsData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                    <p className="text-2xl font-bold">{analyticsData.pageViews.toLocaleString()}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+12.5%</span>
                  <span className="text-sm text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
                    <p className="text-2xl font-bold">{analyticsData.uniqueVisitors.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+8.3%</span>
                  <span className="text-sm text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{analyticsData.conversionRate.toFixed(1)}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+2.1%</span>
                  <span className="text-sm text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Performance Score</p>
                    <p className="text-2xl font-bold">{analyticsData.performanceScore}</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2">
                  <Progress 
                    value={analyticsData.performanceScore} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Analysis
                </CardTitle>
                <CardDescription>
                  Optimization insights for your current design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Score</span>
                  <Badge 
                    variant={performanceReport.score >= 90 ? 'default' : 
                            performanceReport.score >= 70 ? 'secondary' : 'destructive'}
                  >
                    {performanceReport.score}/100
                  </Badge>
                </div>

                <Progress value={performanceReport.score} className="h-3" />

                {/* Issues */}
                {performanceReport.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Issues to Address</h4>
                    {performanceReport.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                        {issue.severity === 'high' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                        ) : issue.severity === 'medium' ? (
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        )}
                        <span className="text-sm">{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {performanceReport.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Recommendations</h4>
                    {performanceReport.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Color Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Usage Analytics
                </CardTitle>
                <CardDescription>
                  How your color palette performs with visitors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.topColors.map((colorData, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: colorData.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{colorData.color}</span>
                        <span className="text-sm text-muted-foreground">{colorData.usage}%</span>
                      </div>
                      <Progress value={colorData.usage} className="h-2" />
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-3 rounded bg-blue-50">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Your primary color ({designState.preview.theme.primaryColor}) 
                    is performing well with {analyticsData.topColors[0]?.usage}% engagement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Performance Metrics</CardTitle>
              <CardDescription>
                Live performance data from your design editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(designPerformanceMonitor.getPerformanceReport()).map(([operation, metrics]) => (
                  <div key={operation} className="p-4 rounded-lg bg-muted/30">
                    <h4 className="font-medium capitalize mb-2">
                      {operation.replace(/-/g, ' ')}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Average:</span>
                        <span className="font-mono">{metrics.average}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min:</span>
                        <span className="font-mono">{metrics.min}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max:</span>
                        <span className="font-mono">{metrics.max}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samples:</span>
                        <span className="font-mono">{metrics.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {Object.keys(designPerformanceMonitor.getPerformanceReport()).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Performance metrics will appear here as you use the design editor</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default DesignAnalytics