import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  Layout, 
  AlignLeft, 
  AlignCenter, 
  Square, 
  RectangleHorizontal,
  Minus
} from "lucide-react"
import type { OrganizationDesign } from '@/types/design'

interface LayoutOptionsProps {
  layout: OrganizationDesign['layout']
  onChange: (layout: OrganizationDesign['layout']) => void
}

const HEADER_STYLES = [
  {
    value: 'default',
    label: 'Default',
    description: 'Standard header with organization name and navigation',
    preview: 'A balanced header with your logo, name, and menu items'
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Clean, simple header focusing on essential elements',
    preview: 'Just your organization name and key information'
  },
  {
    value: 'bold',
    label: 'Bold',
    description: 'Large, prominent header that makes a strong first impression',
    preview: 'Big, eye-catching header with emphasis on your brand'
  }
] as const

const CONTENT_ALIGNMENTS = [
  {
    value: 'left',
    label: 'Left Aligned',
    description: 'Content aligned to the left (recommended for readability)',
    icon: AlignLeft
  },
  {
    value: 'center',
    label: 'Center Aligned',
    description: 'Content centered on the page',
    icon: AlignCenter
  }
] as const

const CARD_STYLES = [
  {
    value: 'default',
    label: 'Default',
    description: 'Standard cards with subtle shadows and borders',
    icon: Square
  },
  {
    value: 'rounded',
    label: 'Rounded',
    description: 'Cards with rounded corners for a softer look',
    icon: RectangleHorizontal
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Clean cards with minimal borders and shadows',
    icon: Minus
  }
] as const

export function LayoutOptions({ layout, onChange }: LayoutOptionsProps) {
  const handleChange = (key: keyof OrganizationDesign['layout'], value: any) => {
    onChange({
      ...layout,
      [key]: value
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2 flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Layout Options
        </h3>
        <p className="text-sm text-muted-foreground">
          Customize how your organization page is structured and displayed
        </p>
      </div>

      {/* Header Style */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Header Style</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose how your organization's header appears to visitors
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={layout.headerStyle}
            onValueChange={(value) => handleChange('headerStyle', value)}
          >
            {HEADER_STYLES.map((style) => (
              <div key={style.value} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={style.value} id={style.value} />
                  <Label htmlFor={style.value} className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{style.label}</span>
                        {layout.headerStyle === style.value && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="ml-6 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    {style.preview}
                  </p>
                </div>

                {/* Visual Preview */}
                <div className="ml-6">
                  <div className="w-full max-w-sm border rounded p-2 bg-muted/20">
                    {style.value === 'default' && (
                      <div className="space-y-1">
                        <div className="h-3 bg-primary/20 rounded w-1/3"></div>
                        <div className="h-2 bg-muted-foreground/20 rounded w-1/2"></div>
                      </div>
                    )}
                    {style.value === 'minimal' && (
                      <div className="space-y-1">
                        <div className="h-2 bg-primary/20 rounded w-1/4"></div>
                      </div>
                    )}
                    {style.value === 'bold' && (
                      <div className="space-y-2">
                        <div className="h-4 bg-primary/20 rounded w-2/3"></div>
                        <div className="h-2 bg-muted-foreground/20 rounded w-1/2"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Content Alignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Alignment</CardTitle>
          <p className="text-sm text-muted-foreground">
            How should the main content be aligned on the page?
          </p>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={layout.contentAlignment}
            onValueChange={(value) => handleChange('contentAlignment', value)}
          >
            <div className="grid grid-cols-1 gap-4">
              {CONTENT_ALIGNMENTS.map((alignment) => (
                <div key={alignment.value} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={alignment.value} id={alignment.value} />
                    <Label htmlFor={alignment.value} className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <alignment.icon className="h-4 w-4" />
                          <span className="font-medium">{alignment.label}</span>
                          {layout.contentAlignment === alignment.value && (
                            <Badge variant="secondary" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="ml-6">
                    <p className="text-sm text-muted-foreground">
                      {alignment.description}
                    </p>
                    
                    {/* Visual Preview */}
                    <div className="mt-2 w-full max-w-sm border rounded p-3 bg-muted/20">
                      <div className={`space-y-1 ${
                        alignment.value === 'center' ? 'text-center' : 'text-left'
                      }`}>
                        <div className={`h-2 bg-primary/20 rounded ${
                          alignment.value === 'center' ? 'mx-auto w-1/2' : 'w-2/3'
                        }`}></div>
                        <div className={`h-2 bg-muted-foreground/20 rounded ${
                          alignment.value === 'center' ? 'mx-auto w-1/3' : 'w-1/2'
                        }`}></div>
                        <div className={`h-2 bg-muted-foreground/20 rounded ${
                          alignment.value === 'center' ? 'mx-auto w-2/5' : 'w-3/5'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Card Style */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Card Style</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose the style for event cards and content sections
          </p>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={layout.cardStyle}
            onValueChange={(value) => handleChange('cardStyle', value)}
          >
            <div className="grid grid-cols-1 gap-4">
              {CARD_STYLES.map((style) => (
                <div key={style.value} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={style.value} id={style.value} />
                    <Label htmlFor={style.value} className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <style.icon className="h-4 w-4" />
                          <span className="font-medium">{style.label}</span>
                          {layout.cardStyle === style.value && (
                            <Badge variant="secondary" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="ml-6">
                    <p className="text-sm text-muted-foreground">
                      {style.description}
                    </p>
                    
                    {/* Visual Preview */}
                    <div className="mt-2 w-full max-w-sm">
                      <div className={`p-3 border bg-muted/20 ${
                        style.value === 'rounded' ? 'rounded-lg' :
                        style.value === 'minimal' ? 'rounded border-dashed' :
                        'rounded shadow-sm'
                      }`}>
                        <div className="space-y-2">
                          <div className="h-2 bg-primary/20 rounded w-1/2"></div>
                          <div className="h-1 bg-muted-foreground/20 rounded w-3/4"></div>
                          <div className="h-1 bg-muted-foreground/20 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            More Layout Options Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
            <span>Typography settings (font family, sizes)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
            <span>Custom spacing and margins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
            <span>Animation and transition effects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
            <span>Mobile-specific layout options</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LayoutOptions