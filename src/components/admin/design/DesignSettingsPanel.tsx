import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Save, 
  RotateCcw, 
  Sparkles,
  AlertCircle
} from "lucide-react"
import { DesignProvider, useDesign, validateDesign } from '@/contexts/DesignContext'
import { BackgroundSelectorSimple } from './BackgroundSelectorSimple'
import type { Organization } from '@/types/database'
import type { OrganizationDesign } from '@/types/design'

// Inner component that uses the design context
function DesignSettingsPanelInner({ organization }: { organization: Organization }) {
  const { 
    designState, 
    updatePreviewDesign, 
    saveDesign, 
    resetDesign
  } = useDesign()

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Validate design on changes
  useEffect(() => {
    const errors = validateDesign(designState.preview)
    setValidationErrors(errors)
  }, [designState.preview])

  const handleSave = useCallback(async () => {
    if (validationErrors.length > 0) return
    await saveDesign()
  }, [saveDesign, validationErrors])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Design Customization</h2>
        <p className="text-muted-foreground">
          Customize your organization's background color
        </p>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-3">
        {designState.unsavedChanges && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Unsaved Changes
          </Badge>
        )}
        
        {designState.isLoading && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Saving...
          </Badge>
        )}

        {designState.isPreviewMode && (
          <Badge className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Preview Mode Active
          </Badge>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Please fix the following issues:</div>
            <ul className="text-sm list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {designState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{designState.error}</AlertDescription>
        </Alert>
      )}

      <div className="w-full">
        {/* Settings Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Design Settings
                  </CardTitle>
                  <CardDescription>
                    Customize colors, backgrounds, and layout options
                  </CardDescription>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetDesign}
                    disabled={!designState.unsavedChanges}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={designState.isLoading || validationErrors.length > 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Design
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <BackgroundSelectorSimple 
                background={designState.preview.background}
                onChange={(background) => updatePreviewDesign({ background })}
              />
              
              {/* Text Color Selector */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium mb-4">Text Color</h4>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: designState.preview.theme.textColor }}
                  />
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={designState.preview.theme.textColor}
                        onChange={(e) => updatePreviewDesign({ 
                          theme: { ...designState.preview.theme, textColor: e.target.value }
                        })}
                        className="w-16 h-10"
                      />
                      <input
                        type="text"
                        value={designState.preview.theme.textColor}
                        onChange={(e) => updatePreviewDesign({ 
                          theme: { ...designState.preview.theme, textColor: e.target.value }
                        })}
                        placeholder="#000000"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

// External wrapper interface
interface DesignSettingsPanelWrapperProps {
  organization: Organization
  onSave: (design: OrganizationDesign) => Promise<void>
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

// Main export component with DesignProvider wrapper
export function DesignSettingsPanel({ organization, onSave }: DesignSettingsPanelWrapperProps) {
  return (
    <DesignProvider organization={organization} onDesignSave={onSave}>
      <DesignSettingsPanelInner organization={organization} />
    </DesignProvider>
  )
}

export default DesignSettingsPanel