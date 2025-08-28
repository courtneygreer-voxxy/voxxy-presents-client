import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Palette } from "lucide-react"
import type { OrganizationDesign } from '@/types/design'

interface BackgroundSelectorProps {
  background: OrganizationDesign['background']
  onChange: (background: OrganizationDesign['background']) => void
}

const PRESET_COLORS = [
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da',
  '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe',
  '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca',
  '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
  '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
  '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa',
  '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc',
  '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'
]

export function BackgroundSelectorSimple({ background, onChange }: BackgroundSelectorProps) {
  const handleColorChange = (color: string) => {
    onChange({
      type: 'color',
      value: color,
      opacity: 1
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Background Color
        </CardTitle>
        <CardDescription>
          Choose a background color for your organization page
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Color Display */}
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg border-2 border-gray-200"
            style={{ backgroundColor: background.value }}
          />
          <div className="flex-1">
            <Label className="text-sm font-medium">Current Color</Label>
            <p className="text-sm text-muted-foreground">{background.value}</p>
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Custom Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={background.value}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-16 h-10"
            />
            <Input
              type="text"
              value={background.value}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#ffffff"
              className="flex-1"
            />
          </div>
        </div>

        {/* Preset Colors */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Preset Colors</Label>
          <div className="grid grid-cols-10 gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                  background.value === color ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BackgroundSelectorSimple