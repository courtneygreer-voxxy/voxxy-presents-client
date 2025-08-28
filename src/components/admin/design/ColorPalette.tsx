import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Palette, Wand2, RefreshCw } from "lucide-react"
import type { OrganizationDesign } from '@/types/design'

interface ColorPaletteProps {
  theme: OrganizationDesign['theme']
  onChange: (theme: OrganizationDesign['theme']) => void
}

// Predefined color palettes
const COLOR_PALETTES = [
  {
    name: 'Modern Professional',
    category: 'professional',
    colors: {
      primaryColor: '#2563eb', // Blue
      secondaryColor: '#64748b', // Slate
      textColor: '#1e293b',     // Dark slate
      accentColor: '#3b82f6',   // Light blue
    }
  },
  {
    name: 'Warm & Friendly',
    category: 'warm',
    colors: {
      primaryColor: '#ea580c', // Orange
      secondaryColor: '#78716c', // Stone
      textColor: '#292524',     // Dark stone
      accentColor: '#fb923c',   // Light orange
    }
  },
  {
    name: 'Creative Purple',
    category: 'creative',
    colors: {
      primaryColor: '#7c3aed', // Purple
      secondaryColor: '#6b7280', // Gray
      textColor: '#1f2937',     // Dark gray
      accentColor: '#a855f7',   // Light purple
    }
  },
  {
    name: 'Nature Green',
    category: 'nature',
    colors: {
      primaryColor: '#059669', // Emerald
      secondaryColor: '#6b7280', // Gray
      textColor: '#1f2937',     // Dark gray
      accentColor: '#10b981',   // Light emerald
    }
  },
  {
    name: 'Bold Pink',
    category: 'bold',
    colors: {
      primaryColor: '#db2777', // Pink
      secondaryColor: '#6b7280', // Gray
      textColor: '#1f2937',     // Dark gray
      accentColor: '#ec4899',   // Light pink
    }
  },
  {
    name: 'Cool Teal',
    category: 'cool',
    colors: {
      primaryColor: '#0d9488', // Teal
      secondaryColor: '#64748b', // Slate
      textColor: '#1e293b',     // Dark slate
      accentColor: '#14b8a6',   // Light teal
    }
  },
  {
    name: 'Classic Monochrome',
    category: 'neutral',
    colors: {
      primaryColor: '#1f2937', // Dark gray
      secondaryColor: '#6b7280', // Medium gray
      textColor: '#111827',     // Very dark gray
      accentColor: '#374151',   // Accent gray
    }
  },
  {
    name: 'Soft Pastels',
    category: 'pastel',
    colors: {
      primaryColor: '#8b5cf6', // Soft purple
      secondaryColor: '#a1a1aa', // Zinc
      textColor: '#3f3f46',     // Dark zinc
      accentColor: '#a78bfa',   // Light purple
    }
  }
]

const COLOR_CATEGORIES = [
  { value: 'all', label: 'All Palettes' },
  { value: 'professional', label: 'Professional' },
  { value: 'creative', label: 'Creative' },
  { value: 'nature', label: 'Nature' },
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'bold', label: 'Bold' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'pastel', label: 'Pastel' },
]

const INDIVIDUAL_COLORS = {
  primary: [
    '#1f2937', '#374151', '#2563eb', '#3b82f6', '#059669', '#10b981', 
    '#0d9488', '#14b8a6', '#7c3aed', '#a855f7', '#db2777', '#ec4899',
    '#ea580c', '#fb923c', '#dc2626', '#ef4444', '#ca8a04', '#eab308'
  ],
  text: [
    '#000000', '#111827', '#1f2937', '#374151', '#4b5563', '#6b7280'
  ],
  accent: [
    '#3b82f6', '#10b981', '#14b8a6', '#a855f7', '#ec4899', '#fb923c',
    '#ef4444', '#eab308', '#06b6d4', '#8b5cf6', '#f59e0b', '#84cc16'
  ]
}

export function ColorPalette({ theme, onChange }: ColorPaletteProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeColorType, setActiveColorType] = useState<'palette' | 'custom'>('palette')

  const filteredPalettes = selectedCategory === 'all' 
    ? COLOR_PALETTES 
    : COLOR_PALETTES.filter(p => p.category === selectedCategory)

  const handlePaletteSelect = (palette: typeof COLOR_PALETTES[0]) => {
    onChange(palette.colors)
  }

  const handleColorChange = (colorType: keyof OrganizationDesign['theme'], color: string) => {
    onChange({
      ...theme,
      [colorType]: color
    })
  }

  const isPaletteSelected = (palette: typeof COLOR_PALETTES[0]) => {
    return Object.entries(palette.colors).every(([key, value]) => 
      theme[key as keyof OrganizationDesign['theme']] === value
    )
  }

  const generateRandomPalette = () => {
    const randomPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)]
    onChange(randomPalette.colors)
  }

  return (
    <div className="space-y-6">
      {/* Palette Type Selector */}
      <Tabs value={activeColorType} onValueChange={(value) => setActiveColorType(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="palette" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Color Palettes
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Custom Colors
          </TabsTrigger>
        </TabsList>

        {/* Preset Palettes */}
        <TabsContent value="palette" className="space-y-4">
          {/* Random Generator */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Choose from our curated color palettes
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateRandomPalette}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Random
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {COLOR_CATEGORIES.map(category => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="text-xs"
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredPalettes.map((palette) => (
              <Card
                key={palette.name}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  isPaletteSelected(palette) ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handlePaletteSelect(palette)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-sm">{palette.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-1 capitalize">
                        {palette.category}
                      </Badge>
                    </div>
                    {isPaletteSelected(palette) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  {/* Color Preview */}
                  <div className="flex gap-2">
                    <div
                      className="flex-1 h-8 rounded border"
                      style={{ backgroundColor: palette.colors.primaryColor }}
                      title={`Primary: ${palette.colors.primaryColor}`}
                    />
                    <div
                      className="flex-1 h-8 rounded border"
                      style={{ backgroundColor: palette.colors.secondaryColor }}
                      title={`Secondary: ${palette.colors.secondaryColor}`}
                    />
                    <div
                      className="flex-1 h-8 rounded border"
                      style={{ backgroundColor: palette.colors.accentColor }}
                      title={`Accent: ${palette.colors.accentColor}`}
                    />
                    <div
                      className="flex-1 h-8 rounded border"
                      style={{ backgroundColor: palette.colors.textColor }}
                      title={`Text: ${palette.colors.textColor}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Colors */}
        <TabsContent value="custom" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Customize individual colors to match your brand
          </p>

          {/* Primary Color */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Primary Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
              
              {/* Quick Colors */}
              <div className="grid grid-cols-9 gap-1">
                {INDIVIDUAL_COLORS.primary.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange('primaryColor', color)}
                    className="w-8 h-8 rounded border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Secondary Color */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Secondary Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={theme.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={theme.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  placeholder="#666666"
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Text Color */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Text Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) => handleColorChange('textColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={theme.textColor}
                  onChange={(e) => handleColorChange('textColor', e.target.value)}
                  placeholder="#1a1a1a"
                  className="flex-1"
                />
              </div>
              
              {/* Quick Colors */}
              <div className="grid grid-cols-6 gap-1">
                {INDIVIDUAL_COLORS.text.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange('textColor', color)}
                    className="w-8 h-8 rounded border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accent Color */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Accent Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  placeholder="#0066cc"
                  className="flex-1"
                />
              </div>
              
              {/* Quick Colors */}
              <div className="grid grid-cols-6 gap-1">
                {INDIVIDUAL_COLORS.accent.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange('accentColor', color)}
                    className="w-8 h-8 rounded border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Current Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Color Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-4 rounded-lg border-2"
            style={{
              backgroundColor: '#ffffff',
              color: theme.textColor,
              borderColor: theme.primaryColor,
            }}
          >
            <h3
              className="font-bold text-lg mb-2"
              style={{ color: theme.primaryColor }}
            >
              Your Organization
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: theme.secondaryColor }}
            >
              This is how your text will look with the selected colors.
            </p>
            <div className="flex gap-2">
              <span
                className="px-3 py-1 rounded text-sm font-medium"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: '#ffffff'
                }}
              >
                Primary Button
              </span>
              <span
                className="px-3 py-1 rounded text-sm underline"
                style={{ color: theme.accentColor }}
              >
                Accent Link
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ColorPalette