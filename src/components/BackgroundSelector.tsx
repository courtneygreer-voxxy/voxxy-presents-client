import React from 'react'
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Check, Palette } from "lucide-react"

interface BackgroundSelectorProps {
  currentBackground: string
  onBackgroundSelect: (backgroundId: string) => void
  isSaving?: boolean
}

const backgroundOptions = [
  {
    id: 'stars',
    name: 'Animated Stars',
    description: 'Subtle blinking dots animation',
    preview: 'Current default with animated dots'
  },
  {
    id: 'gradient-purple',
    name: 'Purple Gradient',
    description: 'Smooth purple to blue gradient',
    preview: 'Linear gradient from purple to deep blue'
  },
  {
    id: 'gradient-sunset', 
    name: 'Sunset Gradient',
    description: 'Warm orange to pink gradient',
    preview: 'Sunset colors with warm tones'
  },
  {
    id: 'minimal-grid',
    name: 'Minimal Grid',
    description: 'Subtle geometric grid pattern',
    preview: 'Clean geometric lines on dark background'
  },
  {
    id: 'abstract-waves',
    name: 'Abstract Waves',
    description: 'Flowing wave patterns',
    preview: 'Smooth flowing abstract shapes'
  }
]

export function BackgroundSelector({ currentBackground, onBackgroundSelect }: BackgroundSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Page Background</label>
        <p className="text-xs text-muted-foreground mb-4">
          Choose a background style for your club page. Works beautifully with glass morphism design.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {backgroundOptions.map((option) => (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all hover:scale-105 !bg-background/5 backdrop-blur-sm border-2 ${
              currentBackground === option.id 
                ? '!border-primary !bg-primary/20' 
                : '!border-border hover:!border-primary/50'
            }`}
            onClick={() => onBackgroundSelect(option.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground text-sm">{option.name}</h4>
                </div>
                {currentBackground === option.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">{option.description}</p>
              <p className="text-xs text-muted-foreground">{option.preview}</p>
              
              {/* Preview Box */}
              <div className={`mt-3 h-12 rounded border border-border relative overflow-hidden ${getPreviewClasses(option.id)}`}>
                <div className="absolute inset-0 opacity-60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentBackground && (
        <div className="text-xs text-muted-foreground text-center">
          Selected: {backgroundOptions.find(bg => bg.id === currentBackground)?.name || 'Custom'}
        </div>
      )}
    </div>
  )
}

function getPreviewClasses(backgroundId: string): string {
  switch (backgroundId) {
    case 'stars':
      return 'bg-muted relative'
    case 'gradient-purple':
      return 'bg-gradient-to-br from-primary to-blue-800'
    case 'gradient-sunset':
      return 'bg-gradient-to-br from-orange-500 via-voxxy-pink to-primary'
    case 'minimal-grid':
      return 'bg-muted bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]'
    case 'abstract-waves':
      return 'bg-gradient-to-br from-indigo-600 via-primary to-pink-600'
    default:
      return 'bg-muted'
  }
}