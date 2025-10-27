import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Plus } from 'lucide-react'
import { EntertainmentSpecificDetails } from '@/types/vendor'

interface EntertainmentDetailsSectionProps {
  data: Partial<EntertainmentSpecificDetails>
  onChange: (data: Partial<EntertainmentSpecificDetails>) => void
}

const PERFORMER_TYPES = [
  { value: 'dj', label: 'DJ' },
  { value: 'band', label: 'Band/Live Music' },
  { value: 'comedian', label: 'Comedian' },
  { value: 'dancer', label: 'Dancer/Dance Group' },
  { value: 'magician', label: 'Magician' },
  { value: 'speaker', label: 'Speaker/MC' },
  { value: 'other', label: 'Other' }
] as const

const COMMON_GENRES = [
  'Hip-Hop', 'House', 'Techno', 'Rock', 'Pop', 'Jazz',
  'R&B', 'Latin', 'EDM', 'Indie', 'Country', 'Classical'
]

const COMMON_EQUIPMENT = [
  'DJ Equipment', 'Sound System', 'Microphones', 'Lighting',
  'Speakers', 'Mixer', 'Turntables', 'Instruments', 'Stage Setup'
]

export function EntertainmentDetailsSection({ data, onChange }: EntertainmentDetailsSectionProps) {
  const [customGenre, setCustomGenre] = useState('')
  const [customEquipment, setCustomEquipment] = useState('')
  const [customLink, setCustomLink] = useState('')

  const addGenre = (genre: string) => {
    if (genre && !(data.genres || []).includes(genre)) {
      onChange({
        ...data,
        genres: [...(data.genres || []), genre]
      })
    }
  }

  const removeGenre = (genre: string) => {
    onChange({
      ...data,
      genres: (data.genres || []).filter(g => g !== genre)
    })
  }

  const addEquipment = (equipment: string) => {
    if (equipment && !(data.equipmentProvided || []).includes(equipment)) {
      onChange({
        ...data,
        equipmentProvided: [...(data.equipmentProvided || []), equipment]
      })
    }
  }

  const removeEquipment = (equipment: string) => {
    onChange({
      ...data,
      equipmentProvided: (data.equipmentProvided || []).filter(e => e !== equipment)
    })
  }

  const addPortfolioLink = () => {
    if (customLink.trim()) {
      onChange({
        ...data,
        portfolioLinks: [...(data.portfolioLinks || []), customLink.trim()]
      })
      setCustomLink('')
    }
  }

  const removePortfolioLink = (link: string) => {
    onChange({
      ...data,
      portfolioLinks: (data.portfolioLinks || []).filter(l => l !== link)
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Entertainment Details</h3>

      {/* Performer Type */}
      <div className="space-y-2">
        <Label className="text-white">Performer Type *</Label>
        <Select
          value={data.performerType || 'dj'}
          onValueChange={(value) => onChange({ ...data, performerType: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select performer type" />
          </SelectTrigger>
          <SelectContent>
            {PERFORMER_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Genres/Styles */}
      <div className="space-y-2">
        <Label className="text-white">Genres/Styles *</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_GENRES.map(genre => (
            <button
              key={genre}
              type="button"
              onClick={() => {
                if ((data.genres || []).includes(genre)) {
                  removeGenre(genre)
                } else {
                  addGenre(genre)
                }
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                (data.genres || []).includes(genre)
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Selected genres */}
        {(data.genres || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {data.genres!.map(genre => (
              <Badge key={genre} variant="secondary" className="gap-1">
                {genre}
                <button
                  type="button"
                  onClick={() => removeGenre(genre)}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Custom genre */}
        <div className="flex gap-2">
          <Input
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            placeholder="Add custom genre..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (customGenre.trim()) {
                  addGenre(customGenre.trim())
                  setCustomGenre('')
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (customGenre.trim()) {
                addGenre(customGenre.trim())
                setCustomGenre('')
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Group Size */}
      <div className="space-y-2">
        <Label className="text-white">Group Size</Label>
        <Input
          type="number"
          value={data.groupSize || ''}
          onChange={(e) => onChange({ ...data, groupSize: parseInt(e.target.value) || undefined })}
          placeholder="e.g., 1 for solo, 5 for band"
        />
        <p className="text-xs text-gray-400">Number of performers (leave blank for solo)</p>
      </div>

      {/* Equipment Provided */}
      <div className="space-y-2">
        <Label className="text-white">Equipment Provided</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_EQUIPMENT.map(equipment => (
            <button
              key={equipment}
              type="button"
              onClick={() => {
                if ((data.equipmentProvided || []).includes(equipment)) {
                  removeEquipment(equipment)
                } else {
                  addEquipment(equipment)
                }
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                (data.equipmentProvided || []).includes(equipment)
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {equipment}
            </button>
          ))}
        </div>

        {/* Custom equipment */}
        <div className="flex gap-2">
          <Input
            value={customEquipment}
            onChange={(e) => setCustomEquipment(e.target.value)}
            placeholder="Add custom equipment..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (customEquipment.trim()) {
                  addEquipment(customEquipment.trim())
                  setCustomEquipment('')
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (customEquipment.trim()) {
                addEquipment(customEquipment.trim())
                setCustomEquipment('')
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Portfolio Links */}
      <div className="space-y-2">
        <Label className="text-white">Portfolio Links (YouTube, Spotify, SoundCloud, etc.)</Label>

        {(data.portfolioLinks || []).length > 0 && (
          <div className="space-y-2 mb-2">
            {data.portfolioLinks!.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-purple-400 hover:text-purple-300 truncate"
                >
                  {link}
                </a>
                <button
                  type="button"
                  onClick={() => removePortfolioLink(link)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
            placeholder="https://youtube.com/... or https://spotify.com/..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addPortfolioLink()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPortfolioLink}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Performance Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Performance Duration</Label>
          <Input
            value={data.performanceDuration || ''}
            onChange={(e) => onChange({ ...data, performanceDuration: e.target.value })}
            placeholder="e.g., 2 hours, full night"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Setup Time</Label>
          <Input
            value={data.setupTime || ''}
            onChange={(e) => onChange({ ...data, setupTime: e.target.value })}
            placeholder="e.g., 30 minutes"
          />
        </div>
      </div>

      {/* Technical Requirements */}
      <div className="space-y-2">
        <Label className="text-white">Technical Requirements</Label>
        <Textarea
          value={(data.technicalRequirements || []).join(', ')}
          onChange={(e) => onChange({
            ...data,
            technicalRequirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          placeholder="e.g., Stage size 10x10, Power outlets, Sound system"
          rows={3}
        />
        <p className="text-xs text-gray-400">Separate requirements with commas</p>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-white">Price Range (Optional)</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Input
              type="number"
              value={data.priceRange?.min || ''}
              onChange={(e) => onChange({
                ...data,
                priceRange: {
                  ...data.priceRange,
                  min: parseInt(e.target.value) || 0,
                  max: data.priceRange?.max || 0,
                  unit: data.priceRange?.unit || 'per_event'
                }
              })}
              placeholder="Min $"
            />
          </div>
          <div>
            <Input
              type="number"
              value={data.priceRange?.max || ''}
              onChange={(e) => onChange({
                ...data,
                priceRange: {
                  ...data.priceRange,
                  min: data.priceRange?.min || 0,
                  max: parseInt(e.target.value) || 0,
                  unit: data.priceRange?.unit || 'per_event'
                }
              })}
              placeholder="Max $"
            />
          </div>
          <div>
            <Select
              value={data.priceRange?.unit || 'per_event'}
              onValueChange={(value) => onChange({
                ...data,
                priceRange: {
                  ...data.priceRange,
                  min: data.priceRange?.min || 0,
                  max: data.priceRange?.max || 0,
                  unit: value as 'per_hour' | 'per_event' | 'per_person'
                }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_hour">Per Hour</SelectItem>
                <SelectItem value="per_event">Per Event</SelectItem>
                <SelectItem value="per_person">Per Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
