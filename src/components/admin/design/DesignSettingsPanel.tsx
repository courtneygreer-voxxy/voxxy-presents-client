import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Palette, 
  Image, 
  Layout, 
  Eye, 
  Save, 
  RotateCcw, 
  Sparkles 
} from "lucide-react"
import { BackgroundSelector } from './BackgroundSelector'
import { ColorPalette } from './ColorPalette'
import { LayoutOptions } from './LayoutOptions'
import { DesignPreview } from './DesignPreview'
import type { Organization } from '@/types/database'
import type { OrganizationDesign, DesignState } from '@/types/design'

interface DesignSettingsPanelProps {
  organization: Organization
  onSave: (design: OrganizationDesign) => Promise<void>
  onPreview: (design: OrganizationDesign) => void
  isLoading?: boolean
}

const DEFAULT_DESIGN: OrganizationDesign = {
  background: {
    type: 'color',
    value: '#ffffff',
    opacity: 1,
  },
  theme: {
    primaryColor: '#000000',
    secondaryColor: '#666666',
    textColor: '#1a1a1a',
    accentColor: '#0066cc',
  },
  layout: {
    headerStyle: 'default',
    contentAlignment: 'left',
    cardStyle: 'default',
  },
}

export function DesignSettingsPanel({ 
  organization, 
  onSave, 
  onPreview, 
  isLoading = false 
}: DesignSettingsPanelProps) {
  const [designState, setDesignState] = useState<DesignState>(() => {
    // Initialize from organization's existing design or defaults
    const existingDesign = organization.settings?.design || DEFAULT_DESIGN
    return {
      current: existingDesign,
      preview: existingDesign,
      isPreviewMode: false,
      unsavedChanges: false,
      isLoading: false,
    }
  })

  const [activeTab, setActiveTab] = useState('background')

  const updateDesign = useCallback((updates: Partial<OrganizationDesign>) => {
    setDesignState(prev => {
      const newPreview = {
        ...prev.preview,
        ...updates,
        // Deep merge nested objects
        background: { ...prev.preview.background, ...updates.background },
        theme: { ...prev.preview.theme, ...updates.theme },
        layout: { ...prev.preview.layout, ...updates.layout },
      }

      // Check for changes
      const hasChanges = JSON.stringify(newPreview) !== JSON.stringify(prev.current)

      return {
        ...prev,
        preview: newPreview,
        unsavedChanges: hasChanges,
      }
    })
  }, [])

  const handlePreviewToggle = useCallback(() => {
    setDesignState(prev => {
      const newPreviewMode = !prev.isPreviewMode
      if (newPreviewMode) {
        onPreview(prev.preview)
      }
      return {
        ...prev,
        isPreviewMode: newPreviewMode,
      }
    })
  }, [onPreview])

  const handleSave = useCallback(async () => {
    if (!designState.unsavedChanges) return

    setDesignState(prev => ({ ...prev, isLoading: true, error: undefined }))

    try {
      await onSave(designState.preview)
      setDesignState(prev => ({
        ...prev,
        current: prev.preview,
        unsavedChanges: false,
        isLoading: false,
        isPreviewMode: false,
      }))
    } catch (error) {
      setDesignState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save design',
      }))
    }
  }, [designState.preview, designState.unsavedChanges, onSave])

  const handleReset = useCallback(() => {
    setDesignState(prev => ({
      ...prev,
      preview: prev.current,
      unsavedChanges: false,
      isPreviewMode: false,
    }))
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* Design Controls */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Design Your Page
            </h1>
            <p className="text-muted-foreground mt-1">
              Customize how your organization page looks to visitors
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {designState.unsavedChanges && (
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Unsaved Changes
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewToggle}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {designState.isPreviewMode ? 'Exit Preview' : 'Preview'}
            </Button>
          </div>
        </div>

        {/* Design Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customization Options</CardTitle>
            <CardDescription>
              Personalize your organization's visual identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="background" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Background
                </TabsTrigger>
                <TabsTrigger value="colors" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Layout
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="background" className="space-y-4">
                  <BackgroundSelector
                    background={designState.preview.background}
                    onChange={(background) => updateDesign({ background })}
                  />
                </TabsContent>

                <TabsContent value="colors" className="space-y-4">
                  <ColorPalette
                    theme={designState.preview.theme}
                    onChange={(theme) => updateDesign({ theme })}
                  />
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  <LayoutOptions
                    layout={designState.preview.layout}
                    onChange={(layout) => updateDesign({ layout })}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!designState.unsavedChanges || designState.isLoading || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {designState.isLoading || isLoading ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!designState.unsavedChanges || designState.isLoading}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Error Message */}
        {designState.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 text-sm">{designState.error}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-1">
        <DesignPreview
          organization={organization}
          design={designState.preview}
          isPreviewMode={designState.isPreviewMode}
        />
      </div>
    </div>
  )
}

export default DesignSettingsPanel