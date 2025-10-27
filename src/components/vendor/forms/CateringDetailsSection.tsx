import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { X, Plus } from 'lucide-react'
import { CateringSpecificDetails } from '@/types/vendor'

interface CateringDetailsSectionProps {
  data: Partial<CateringSpecificDetails>
  onChange: (data: Partial<CateringSpecificDetails>) => void
}

const COMMON_CUISINE_TYPES = [
  'Italian', 'Mexican', 'BBQ', 'Asian', 'Mediterranean',
  'American', 'Indian', 'Vegan', 'Desserts', 'Seafood'
]

const DIETARY_OPTIONS = [
  'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free',
  'Nut-Free', 'Halal', 'Kosher'
]

const SERVICE_TYPES = [
  { value: 'buffet', label: 'Buffet Style' },
  { value: 'plated', label: 'Plated Service' },
  { value: 'family_style', label: 'Family Style' },
  { value: 'stations', label: 'Food Stations' }
] as const

export function CateringDetailsSection({ data, onChange }: CateringDetailsSectionProps) {
  const [customCuisine, setCustomCuisine] = useState('')
  const [customDietary, setCustomDietary] = useState('')

  const addCuisineType = (cuisine: string) => {
    if (cuisine && !(data.cuisineTypes || []).includes(cuisine)) {
      onChange({
        ...data,
        cuisineTypes: [...(data.cuisineTypes || []), cuisine]
      })
    }
  }

  const removeCuisineType = (cuisine: string) => {
    onChange({
      ...data,
      cuisineTypes: (data.cuisineTypes || []).filter(c => c !== cuisine)
    })
  }

  const addDietaryOption = (option: string) => {
    if (option && !(data.dietaryOptions || []).includes(option)) {
      onChange({
        ...data,
        dietaryOptions: [...(data.dietaryOptions || []), option]
      })
    }
  }

  const removeDietaryOption = (option: string) => {
    onChange({
      ...data,
      dietaryOptions: (data.dietaryOptions || []).filter(o => o !== option)
    })
  }

  const toggleServiceType = (type: 'buffet' | 'plated' | 'family_style' | 'stations') => {
    const serviceTypes = data.serviceTypes || []
    if (serviceTypes.includes(type)) {
      onChange({
        ...data,
        serviceTypes: serviceTypes.filter(t => t !== type)
      })
    } else {
      onChange({
        ...data,
        serviceTypes: [...serviceTypes, type]
      })
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Catering Details</h3>

      {/* Cuisine Types */}
      <div className="space-y-2">
        <Label className="text-white">Cuisine Types *</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_CUISINE_TYPES.map(cuisine => (
            <button
              key={cuisine}
              type="button"
              onClick={() => {
                if ((data.cuisineTypes || []).includes(cuisine)) {
                  removeCuisineType(cuisine)
                } else {
                  addCuisineType(cuisine)
                }
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                (data.cuisineTypes || []).includes(cuisine)
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>

        {/* Selected cuisines */}
        {(data.cuisineTypes || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {data.cuisineTypes!.map(cuisine => (
              <Badge key={cuisine} variant="secondary" className="gap-1">
                {cuisine}
                <button
                  type="button"
                  onClick={() => removeCuisineType(cuisine)}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Custom cuisine */}
        <div className="flex gap-2">
          <Input
            value={customCuisine}
            onChange={(e) => setCustomCuisine(e.target.value)}
            placeholder="Add custom cuisine type..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (customCuisine.trim()) {
                  addCuisineType(customCuisine.trim())
                  setCustomCuisine('')
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (customCuisine.trim()) {
                addCuisineType(customCuisine.trim())
                setCustomCuisine('')
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Service Types */}
      <div className="space-y-2">
        <Label className="text-white">Service Types *</Label>
        <div className="grid grid-cols-2 gap-2">
          {SERVICE_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleServiceType(value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                (data.serviceTypes || []).includes(value)
                  ? 'border-orange-500 bg-orange-500/20'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              <span className="text-white font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Options */}
      <div className="space-y-2">
        <Label className="text-white">Dietary Options</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {DIETARY_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => {
                if ((data.dietaryOptions || []).includes(option)) {
                  removeDietaryOption(option)
                } else {
                  addDietaryOption(option)
                }
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                (data.dietaryOptions || []).includes(option)
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Serves Alcohol */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div>
          <Label className="text-white font-medium">Serves Alcohol</Label>
          <p className="text-sm text-gray-300">Do you provide alcoholic beverages?</p>
        </div>
        <Switch
          checked={data.servesAlcohol || false}
          onCheckedChange={(checked) => onChange({ ...data, servesAlcohol: checked })}
        />
      </div>

      {/* Delivery Available */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div>
          <Label className="text-white font-medium">Delivery Available</Label>
          <p className="text-sm text-gray-300">Can you deliver to event locations?</p>
        </div>
        <Switch
          checked={data.deliveryAvailable || false}
          onCheckedChange={(checked) => onChange({ ...data, deliveryAvailable: checked })}
        />
      </div>

      {/* Delivery Radius (conditional) */}
      {data.deliveryAvailable && (
        <div className="space-y-2">
          <Label className="text-white">Delivery Radius (miles)</Label>
          <Input
            type="number"
            value={data.deliveryRadius || ''}
            onChange={(e) => onChange({ ...data, deliveryRadius: parseInt(e.target.value) || undefined })}
            placeholder="e.g., 15"
          />
        </div>
      )}

      {/* Minimum Order */}
      <div className="space-y-2">
        <Label className="text-white">Minimum Order ($)</Label>
        <Input
          type="number"
          value={data.minimumOrder || ''}
          onChange={(e) => onChange({ ...data, minimumOrder: parseInt(e.target.value) || undefined })}
          placeholder="e.g., 500"
        />
        <p className="text-xs text-gray-400">Optional minimum order amount for events</p>
      </div>

      {/* Setup & Cleanup */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Setup Time</Label>
          <Input
            value={data.setupTime || ''}
            onChange={(e) => onChange({ ...data, setupTime: e.target.value })}
            placeholder="e.g., 30 minutes"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <Label className="text-white font-medium text-sm">Cleanup Included</Label>
          </div>
          <Switch
            checked={data.cleanupIncluded || false}
            onCheckedChange={(checked) => onChange({ ...data, cleanupIncluded: checked })}
          />
        </div>
      </div>
    </div>
  )
}
