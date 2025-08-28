import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Palette, 
  Image, 
  Upload, 
  Link as LinkIcon,
  Gradient,
  Eye,
  Check
} from "lucide-react"
import { PresetGallery } from './PresetGallery'
import { ImageUpload } from './ImageUpload'
import type { OrganizationDesign } from '@/types/design'

interface BackgroundSelectorProps {
  background: OrganizationDesign['background']
  onChange: (background: OrganizationDesign['background']) => void
}

const PRESET_COLORS = [
  { name: 'Clean White', value: '#ffffff' },
  { name: 'Off White', value: '#fafafa' },
  { name: 'Light Gray', value: '#f5f5f5' },
  { name: 'Warm Gray', value: '#f7f6f3' },
  { name: 'Cool Gray', value: '#f1f5f9' },
  { name: 'Soft Blue', value: '#f0f9ff' },
  { name: 'Soft Green', value: '#f0fdf4' },
  { name: 'Soft Purple', value: '#faf5ff' },
  { name: 'Soft Pink', value: '#fdf2f8' },
  { name: 'Soft Yellow', value: '#fffbeb' },
  { name: 'Deep Navy', value: '#1e293b' },
  { name: 'Rich Black', value: '#0f172a' },
]

const PRESET_GRADIENTS = [
  { name: 'Ocean Breeze', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset Glow', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Forest Dawn', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Golden Hour', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: 'Purple Haze', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Midnight Blue', value: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
]

export function BackgroundSelector({ background, onChange }: BackgroundSelectorProps) {
  const [activeType, setActiveType] = useState(background.type)
  const [customColor, setCustomColor] = useState(
    background.type === 'color' ? background.value : '#ffffff'
  )
  const [customUrl, setCustomUrl] = useState(
    background.type === 'image' ? background.value : ''
  )
  const [customGradient, setCustomGradient] = useState(
    background.type === 'gradient' ? background.value : PRESET_GRADIENTS[0].value
  )

  const handleTypeChange = (type: 'color' | 'image' | 'gradient') => {
    setActiveType(type)
    
    let newBackground: OrganizationDesign['background']
    
    switch (type) {
      case 'color':
        newBackground = {
          ...background,
          type: 'color',
          value: customColor,
        }
        break
      case 'gradient':
        newBackground = {
          ...background,
          type: 'gradient',
          value: customGradient,
        }
        break
      case 'image':
        newBackground = {
          ...background,
          type: 'image',
          value: customUrl,
          position: background.position || 'center',
          size: background.size || 'cover',
        }
        break
    }
    
    onChange(newBackground)
  }

  const handleColorSelect = (color: string) => {
    setCustomColor(color)
    onChange({
      ...background,
      type: 'color',
      value: color,
    })
  }

  const handleGradientSelect = (gradient: string) => {
    setCustomGradient(gradient)
    onChange({
      ...background,
      type: 'gradient',
      value: gradient,
    })
  }

  const handleImageSelect = (imageUrl: string) => {
    setCustomUrl(imageUrl)
    onChange({
      ...background,
      type: 'image',
      value: imageUrl,
      position: background.position || 'center',
      size: background.size || 'cover',
    })
  }

  const handleOverlayChange = (overlay: string) => {
    onChange({
      ...background,
      overlay,
    })
  }

  const handleOpacityChange = (opacity: number) => {
    onChange({
      ...background,
      opacity: opacity / 100,
    })
  }

  return (
    <div className="space-y-6">
      {/* Background Type Selector */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Background Type</Label>
        <Tabs value={activeType} onValueChange={handleTypeChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="color" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color
            </TabsTrigger>
            <TabsTrigger value="gradient" className="flex items-center gap-2">
              <Gradient className="h-4 w-4" />
              Gradient
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Image
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {/* Color Selection */}
            <TabsContent value="color" className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Preset Colors</Label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorSelect(color.value)}
                      className="relative w-10 h-10 rounded-lg border-2 hover:scale-105 transition-transform"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {background.value === color.value && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="custom-color" className="text-sm font-medium mb-2 block">
                  Custom Color
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="custom-color"
                    type="color"
                    value={customColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Gradient Selection */}
            <TabsContent value="gradient" className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Preset Gradients</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PRESET_GRADIENTS.map((gradient) => (
                    <button
                      key={gradient.name}
                      onClick={() => handleGradientSelect(gradient.value)}
                      className="relative h-16 rounded-lg border-2 hover:scale-105 transition-transform overflow-hidden"
                      style={{ background: gradient.value }}
                      title={gradient.name}
                    >
                      {background.value === gradient.value && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-2 text-xs text-white font-medium">
                        {gradient.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Image Selection */}
            <TabsContent value="image" className="space-y-4">
              <Tabs defaultValue="presets">
                <TabsList>
                  <TabsTrigger value="presets">Preset Gallery</TabsTrigger>
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                </TabsList>

                <TabsContent value="presets" className="mt-4">
                  <PresetGallery onImageSelect={handleImageSelect} />
                </TabsContent>

                <TabsContent value="upload" className="mt-4">
                  <ImageUpload onImageUpload={handleImageSelect} />
                </TabsContent>

                <TabsContent value="url" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-url">Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="image-url"
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleImageSelect(customUrl)}
                        disabled={!customUrl}
                        size="sm"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Image Options */}
              {background.type === 'image' && background.value && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Image Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Position</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['top', 'center', 'bottom'].map((position) => (
                          <Button
                            key={position}
                            variant={background.position === position ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onChange({
                              ...background,
                              position: position as any
                            })}
                            className="capitalize"
                          >
                            {position}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Size</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['cover', 'contain', 'auto'].map((size) => (
                          <Button
                            key={size}
                            variant={background.size === size ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onChange({
                              ...background,
                              size: size as any
                            })}
                            className="capitalize"
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Overlay Options */}
      {(background.type === 'image' || background.type === 'gradient') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overlay Settings</CardTitle>
            <CardDescription className="text-xs">
              Add an overlay to improve text readability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="overlay-color" className="text-sm font-medium mb-2 block">
                Overlay Color
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="overlay-color"
                  type="color"
                  value={background.overlay || '#000000'}
                  onChange={(e) => handleOverlayChange(e.target.value)}
                  className="w-16 h-8"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOverlayChange('')}
                >
                  Remove
                </Button>
              </div>
            </div>

            {background.overlay && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Overlay Opacity: {Math.round((background.opacity || 1) * 100)}%
                </Label>
                <Slider
                  value={[(background.opacity || 1) * 100]}
                  onValueChange={([value]) => handleOpacityChange(value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Selection Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="w-full h-24 rounded-lg border-2 border-dashed border-gray-200 relative overflow-hidden"
            style={{
              background: background.type === 'color' 
                ? background.value
                : background.type === 'gradient'
                ? background.value
                : `url(${background.value})`,
              backgroundSize: background.size || 'cover',
              backgroundPosition: background.position || 'center',
            }}
          >
            {background.overlay && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: background.overlay,
                  opacity: background.opacity || 1,
                }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <Badge variant="secondary" className="bg-white/80 text-gray-700">
                Background Preview
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BackgroundSelector