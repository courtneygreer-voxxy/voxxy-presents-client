import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  Eye,
  Maximize2,
  Grid,
  AlertTriangle,
  Zap
} from "lucide-react"
import { useDesign, useDesignStyles, checkColorAccessibility } from '@/contexts/DesignContext'
import '@/styles/design-preview.css'
import type { Organization } from '@/types/database'
import type { OrganizationDesign } from '@/types/design'

interface DesignPreviewProps {
  organization: Organization
  design?: OrganizationDesign
  isStandalone?: boolean
}

const DEVICE_SIZES = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%', height: 'auto' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px', height: 'auto' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px', height: 'auto' },
]

export function DesignPreview({ organization, design: propDesign, isStandalone = false }: DesignPreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showGrid, setShowGrid] = useState(false)

  // Use context if available, otherwise use prop design
  const designContext = !isStandalone ? useDesign() : null
  const contextStyles = !isStandalone ? useDesignStyles() : {}
  
  const design = propDesign || (designContext?.designState.preview)
  const isPreviewMode = designContext?.designState.isPreviewMode || false
  const isLoading = designContext?.designState.isLoading || false

  // Check for required data
  if (!organization) {
    return (
      <Card className="sticky top-6">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">Organization data is loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (!design) {
    return (
      <Card className="sticky top-6">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">No design data available</div>
        </CardContent>
      </Card>
    )
  }

  const currentDevice = DEVICE_SIZES.find(d => d.id === selectedDevice) || DEVICE_SIZES[0]

  // Memoize design styles computation
  const designStyles = useMemo(() => {
    if (!isStandalone && contextStyles && Object.keys(contextStyles).length > 0) {
      return contextStyles
    }

    const backgroundValue = design.background.type === 'image' 
      ? design.background.value
      : design.background.value

    return {
      '--primary-color': design.theme.primaryColor,
      '--secondary-color': design.theme.secondaryColor,
      '--text-color': design.theme.textColor,
      '--accent-color': design.theme.accentColor,
      '--background': design.background.type === 'color' 
        ? design.background.value
        : design.background.type === 'gradient'
        ? design.background.value
        : `url(${backgroundValue})`,
      '--background-size': design.background.size || 'cover',
      '--background-position': design.background.position || 'center',
    } as React.CSSProperties
  }, [design, contextStyles, isStandalone])

  // Check accessibility
  const accessibilityCheck = useMemo(() => checkColorAccessibility(design), [design])
  const hasAccessibilityIssues = !accessibilityCheck.primaryOnBackground || 
                                 !accessibilityCheck.textOnBackground || 
                                 !accessibilityCheck.accentOnBackground

  const PreviewContent = useCallback(() => (
    <div 
      className={`min-h-full relative overflow-hidden ${showGrid ? 'grid-overlay' : ''}`}
      style={designStyles}
    >
      {/* Background */}
      {design.background.type === 'image' ? (
        <div className="absolute inset-0">
          <img
            src={design.background.value}
            alt="Background"
            className="w-full h-full object-cover"
            style={{
              objectPosition: design.background.position || 'center',
            }}
            loading="lazy"
          />
        </div>
      ) : (
        <div 
          className="absolute inset-0"
          style={{
            background: (designStyles as any)['--background'],
            backgroundSize: (designStyles as any)['--background-size'],
            backgroundPosition: (designStyles as any)['--background-position'],
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      
      {/* Background Overlay */}
      {design.background.overlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: design.background.overlay,
            opacity: design.background.opacity || 1,
          }}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md">
            <Zap className="h-4 w-4 animate-spin" />
            <span className="text-sm">Updating design...</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className={`p-4 ${
          design.layout.headerStyle === 'minimal' ? 'py-3' :
          design.layout.headerStyle === 'bold' ? 'py-6' : 'py-4'
        }`}>
          <div className={`max-w-4xl mx-auto ${
            design.layout.contentAlignment === 'center' ? 'text-center' : 'text-left'
          }`}>
            {design.layout.headerStyle === 'bold' ? (
              <div className="space-y-2">
                <h1 
                  className="text-3xl font-bold"
                  style={{ color: design.theme.primaryColor }}
                >
                  {organization?.name || 'Organization Name'}
                </h1>
                <p 
                  className="text-lg"
                  style={{ color: design.theme.textColor }}
                >
                  {organization.description}
                </p>
              </div>
            ) : design.layout.headerStyle === 'minimal' ? (
              <h1 
                className="text-xl font-semibold"
                style={{ color: design.theme.primaryColor }}
              >
                {organization.name}
              </h1>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h1 
                    className="text-2xl font-bold"
                    style={{ color: design.theme.primaryColor }}
                  >
                    {organization?.name || 'Organization Name'}
                  </h1>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: design.theme.secondaryColor }}
                  >
                    {organization?.description || 'Organization Description'}
                  </p>
                </div>
                <Badge 
                  className="text-xs"
                  style={{ 
                    backgroundColor: design.theme.accentColor,
                    color: '#ffffff'
                  }}
                >
                  Preview
                </Badge>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4">
          <div className={`max-w-4xl mx-auto space-y-6 ${
            design.layout.contentAlignment === 'center' ? 'text-center' : 'text-left'
          }`}>
            {/* About Section */}
            <section>
              <h2 
                className="text-xl font-semibold mb-3"
                style={{ color: design.theme.primaryColor }}
              >
                About Us
              </h2>
              <p 
                className="leading-relaxed"
                style={{ color: design.theme.textColor }}
              >
                {(typeof organization?.background === 'string' ? organization.background : null) || 
                  "Welcome to our community! We're passionate about bringing people together and creating meaningful experiences. Join us for events, workshops, and activities that inspire and connect."}
              </p>
            </section>

            {/* Sample Events */}
            <section>
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: design.theme.primaryColor }}
              >
                Upcoming Events
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className={`p-4 border ${
                      design.layout.cardStyle === 'rounded' ? 'rounded-lg' :
                      design.layout.cardStyle === 'minimal' ? 'rounded border-dashed' :
                      'rounded shadow-sm'
                    }`}
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: design.theme.primaryColor + '20'
                    }}
                  >
                    <h3 
                      className="font-medium mb-2"
                      style={{ color: design.theme.primaryColor }}
                    >
                      Sample Event {i}
                    </h3>
                    <p 
                      className="text-sm mb-3"
                      style={{ color: design.theme.textColor }}
                    >
                      Join us for an amazing experience filled with community, learning, and fun.
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: design.theme.secondaryColor }}>
                        Dec {15 + i}, 2024
                      </span>
                      <span 
                        className="font-medium"
                        style={{ color: design.theme.accentColor }}
                      >
                        Learn More →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Call to Action */}
            <section className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="px-6 py-2 rounded font-medium text-white border-none"
                  style={{ backgroundColor: design.theme.primaryColor }}
                >
                  Join Our Community
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-2 rounded font-medium"
                  style={{ 
                    color: design.theme.accentColor,
                    borderColor: design.theme.accentColor,
                    backgroundColor: 'transparent'
                  }}
                >
                  Browse Events
                </Button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  ), [design, designStyles, showGrid, selectedDevice, isLoading])

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="h-full flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <h3 className="font-medium">Design Preview</h3>
              <Badge variant="secondary">Fullscreen</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(false)}
            >
              Exit Fullscreen
            </Button>
          </div>

          {/* Device Selector */}
          <div className="flex items-center justify-center gap-2 p-3 border-b bg-muted/30">
            {DEVICE_SIZES.map((device) => (
              <Button
                key={device.id}
                variant={selectedDevice === device.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDevice(device.id)}
                className="flex items-center gap-2"
              >
                <device.icon className="h-4 w-4" />
                {device.label}
              </Button>
            ))}
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-4 bg-gray-100 overflow-auto">
            <div 
              className="mx-auto bg-white border shadow-lg overflow-hidden"
              style={{
                width: currentDevice.width,
                maxWidth: '100%',
                minHeight: selectedDevice === 'mobile' ? '667px' : '500px',
              }}
            >
              <PreviewContent />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              See how your design looks to visitors
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="flex items-center gap-2"
            >
              <Grid className="h-4 w-4" />
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Fullscreen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/${organization?.slug || 'preview'}`, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Live
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Accessibility Warnings */}
        {hasAccessibilityIssues && (
          <div className="p-4 border-b">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <div className="font-medium mb-1">Accessibility Issues Detected</div>
                <ul className="text-xs space-y-1">
                  {!accessibilityCheck.primaryOnBackground && (
                    <li>• Primary color may not be readable on this background</li>
                  )}
                  {!accessibilityCheck.textOnBackground && (
                    <li>• Text color may not be readable on this background</li>
                  )}
                  {!accessibilityCheck.accentOnBackground && (
                    <li>• Accent color may not be readable on this background</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Device Tabs */}
        <Tabs value={selectedDevice} onValueChange={setSelectedDevice}>
          <div className="px-6 pb-4">
            <TabsList className="grid grid-cols-3 w-full">
              {DEVICE_SIZES.map((device) => (
                <TabsTrigger 
                  key={device.id} 
                  value={device.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <device.icon className="h-3 w-3" />
                  {device.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Preview Content */}
          <div className="bg-gray-50 p-4">
            {DEVICE_SIZES.map((device) => (
              <TabsContent 
                key={device.id} 
                value={device.id} 
                className="mt-0"
              >
                <div 
                  className="bg-white border rounded-lg shadow-sm overflow-hidden mx-auto"
                  style={{
                    width: device.id === 'mobile' ? '320px' : 
                           device.id === 'tablet' ? '480px' : '100%',
                    maxWidth: '100%',
                    height: device.id === 'mobile' ? '400px' : 
                           device.id === 'tablet' ? '360px' : '320px',
                  }}
                >
                  <div className="w-full h-full overflow-auto text-xs">
                    <PreviewContent />
                  </div>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>

        {/* Status */}
        {isPreviewMode && (
          <div className="px-6 py-3 bg-primary/5 border-t">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Eye className="h-4 w-4" />
              <span className="font-medium">Preview Mode Active</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DesignPreview