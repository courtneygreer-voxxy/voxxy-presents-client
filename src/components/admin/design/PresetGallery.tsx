import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Check, Eye } from "lucide-react"
import type { ImageSource, DesignCategory } from '@/types/design'

interface PresetGalleryProps {
  onImageSelect: (imageUrl: string) => void
  selectedImage?: string
}

// Mock preset images - In production, these would come from an API or CDN
const PRESET_IMAGES: ImageSource[] = [
  // Professional Category
  {
    id: 'prof-1',
    name: 'Modern Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200',
    description: 'Clean modern office space with natural light',
    source: 'preset',
    category: 'professional',
    tags: ['office', 'modern', 'clean', 'business'],
    colors: ['#ffffff', '#f5f5f5', '#333333'],
    dimensions: { width: 800, height: 600 }
  },
  {
    id: 'prof-2',
    name: 'Conference Room',
    url: 'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=300&h=200',
    description: 'Professional conference room setup',
    source: 'preset',
    category: 'professional',
    tags: ['meeting', 'professional', 'corporate'],
    colors: ['#2c3e50', '#ffffff', '#34495e'],
    dimensions: { width: 800, height: 600 }
  },
  {
    id: 'prof-3',
    name: 'Minimalist Workspace',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200',
    description: 'Clean minimalist workspace',
    source: 'preset',
    category: 'professional',
    tags: ['minimal', 'workspace', 'clean'],
    colors: ['#ffffff', '#f8f9fa', '#6c757d'],
    dimensions: { width: 800, height: 600 }
  },

  // Artistic Category
  {
    id: 'art-1',
    name: 'Abstract Waves',
    url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=300&h=200',
    description: 'Colorful abstract wave pattern',
    source: 'preset',
    category: 'artistic',
    tags: ['abstract', 'colorful', 'waves', 'creative'],
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
    dimensions: { width: 800, height: 600 }
  },
  {
    id: 'art-2',
    name: 'Watercolor Splash',
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200',
    description: 'Artistic watercolor splash background',
    source: 'preset',
    category: 'artistic',
    tags: ['watercolor', 'artistic', 'creative', 'paint'],
    colors: ['#e74c3c', '#f39c12', '#9b59b6'],
    dimensions: { width: 800, height: 600 }
  },

  // Vibrant Category
  {
    id: 'vib-1',
    name: 'Neon Lights',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200',
    description: 'Vibrant neon light display',
    source: 'preset',
    category: 'vibrant',
    tags: ['neon', 'vibrant', 'lights', 'colorful'],
    colors: ['#ff0080', '#00ff80', '#8000ff'],
    dimensions: { width: 800, height: 600 }
  },
  {
    id: 'vib-2',
    name: 'Gradient Mesh',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200',
    description: 'Colorful gradient mesh pattern',
    source: 'preset',
    category: 'vibrant',
    tags: ['gradient', 'colorful', 'mesh', 'modern'],
    colors: ['#ff6b35', '#f7931e', '#ffd23f'],
    dimensions: { width: 800, height: 600 }
  },

  // Minimal Category
  {
    id: 'min-1',
    name: 'Soft Geometric',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=300&h=200',
    description: 'Soft geometric shapes on white',
    source: 'preset',
    category: 'minimal',
    tags: ['geometric', 'minimal', 'soft', 'shapes'],
    colors: ['#ffffff', '#f1f3f4', '#e8eaed'],
    dimensions: { width: 800, height: 600 }
  },
  {
    id: 'min-2',
    name: 'Paper Texture',
    url: 'https://images.unsplash.com/photo-1544376664-80b17f09d399?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1544376664-80b17f09d399?w=300&h=200',
    description: 'Subtle paper texture background',
    source: 'preset',
    category: 'minimal',
    tags: ['paper', 'texture', 'minimal', 'subtle'],
    colors: ['#ffffff', '#fafafa', '#f5f5f5'],
    dimensions: { width: 800, height: 600 }
  },

  // Nature Category
  {
    id: 'nat-1',
    name: 'Forest Path',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200',
    description: 'Peaceful forest path with sunlight',
    source: 'preset',
    category: 'nature',
    tags: ['forest', 'nature', 'path', 'peaceful'],
    colors: ['#2d4a22', '#7cb342', '#8bc34a'],
    dimensions: { width: 800, height: 600 }
  },
  {
    id: 'nat-2',
    name: 'Ocean Waves',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=200',
    description: 'Calm ocean waves from above',
    source: 'preset',
    category: 'nature',
    tags: ['ocean', 'waves', 'water', 'calm'],
    colors: ['#006064', '#0097a7', '#00acc1'],
    dimensions: { width: 800, height: 600 }
  }
]

const CATEGORIES: { value: DesignCategory; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Clean, business-focused designs' },
  { value: 'artistic', label: 'Artistic', description: 'Creative and expressive backgrounds' },
  { value: 'vibrant', label: 'Vibrant', description: 'Bold, colorful, and energetic' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, clean, and understated' },
  { value: 'nature', label: 'Nature', description: 'Natural scenes and organic patterns' },
]

export function PresetGallery({ onImageSelect, selectedImage }: PresetGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<DesignCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)

  const filteredImages = useMemo(() => {
    let images = PRESET_IMAGES

    // Filter by category
    if (selectedCategory !== 'all') {
      images = images.filter(img => img.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      images = images.filter(img => 
        img.name.toLowerCase().includes(query) ||
        img.description?.toLowerCase().includes(query) ||
        img.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return images
  }, [selectedCategory, searchQuery])

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {CATEGORIES.map(category => (
              <TabsTrigger key={category.value} value={category.value} className="whitespace-nowrap">
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'} found
        </p>
        {selectedCategory !== 'all' && (
          <Badge variant="secondary" className="text-xs">
            {CATEGORIES.find(cat => cat.value === selectedCategory)?.label}
          </Badge>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredImages.map((image) => (
          <Card
            key={image.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
            onMouseEnter={() => setHoveredImage(image.id)}
            onMouseLeave={() => setHoveredImage(null)}
            onClick={() => onImageSelect(image.url)}
          >
            <CardContent className="p-0 relative">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={image.thumbnail}
                  alt={image.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                
                {/* Hover Overlay */}
                {hoveredImage === image.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                )}

                {/* Selection Indicator */}
                {selectedImage === image.url && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-white/80 text-gray-700"
                  >
                    {CATEGORIES.find(cat => cat.value === image.category)?.label}
                  </Badge>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-3">
                <h3 className="font-medium text-sm text-foreground mb-1">
                  {image.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {image.description}
                </p>
                
                {/* Color Palette */}
                {image.colors && (
                  <div className="flex items-center gap-1 mt-2">
                    {image.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredImages.length === 0 && (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-2">No images found</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground text-center pt-4 border-t">
        All images are provided under appropriate licenses. More images coming soon!
      </div>
    </div>
  )
}

export default PresetGallery