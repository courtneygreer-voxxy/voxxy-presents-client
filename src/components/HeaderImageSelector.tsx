import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Image, Check } from "lucide-react"

interface HeaderImageSelectorProps {
  currentImage?: string
  onImageSelect: (imageUrl: string) => void
  isSaving?: boolean
}

// Preset header images - these would come from a curated collection
const PRESET_IMAGES = [
  {
    id: 'abstract-1',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=300&fit=crop',
    name: 'Abstract Gradient',
    description: 'Colorful abstract gradient'
  },
  {
    id: 'music-1', 
    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=300&fit=crop',
    name: 'Music Vibes',
    description: 'Musical instruments and lights'
  },
  {
    id: 'city-1',
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=1200&h=300&fit=crop',
    name: 'City Lights',
    description: 'Urban cityscape at night'
  },
  {
    id: 'nature-1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=300&fit=crop',
    name: 'Mountain Vista',
    description: 'Scenic mountain landscape'
  },
  {
    id: 'creative-1',
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=300&fit=crop',
    name: 'Creative Space',
    description: 'Artistic workspace'
  },
  {
    id: 'community-1',
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=300&fit=crop',
    name: 'Community',
    description: 'People gathering together'
  }
]

export function HeaderImageSelector({ currentImage, onImageSelect }: HeaderImageSelectorProps) {
  return (
    <Card className="!bg-background/10 backdrop-blur-sm !border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Image className="h-5 w-5" />
          Header Image
        </CardTitle>
        <CardDescription>
          Choose a header image for your organization page
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_IMAGES.map((image) => (
            <div key={image.id} className="relative group cursor-pointer">
              <div 
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  currentImage === image.url 
                    ? 'border-purple-400 ring-2 ring-purple-400/30' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onImageSelect(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-24 object-cover"
                />
                {currentImage === image.url && (
                  <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                    <Check className="h-6 w-6 text-purple-400 bg-background/20 backdrop-blur-sm rounded-full p-1" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium text-foreground">{image.name}</p>
                <p className="text-xs text-muted-foreground">{image.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {currentImage && (
          <div className="mt-6 p-4 bg-background/5 backdrop-blur-sm border border-border rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Current Selection</h4>
            <img 
              src={currentImage} 
              alt="Current header" 
              className="w-full h-16 object-cover rounded border border-border"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}