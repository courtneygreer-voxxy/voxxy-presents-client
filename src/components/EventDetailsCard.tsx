import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'

export interface EventDetails {
  id: string
  date: Date | undefined
  time: string
  title: string
  description: string
  location: string // If different from main location
}

interface EventDetailsCardProps {
  event: EventDetails
  index: number
  mainLocation: string
  onUpdate: (index: number, field: keyof EventDetails, value: any) => void
  onRemove: (index: number) => void
}

export default function EventDetailsCard({
  event,
  index,
  mainLocation,
  onUpdate,
  onRemove,
}: EventDetailsCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground">Event {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {event.date ? format(event.date, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={event.date}
                onSelect={(date) => onUpdate(index, 'date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time */}
        <div>
          <Label htmlFor={`time-${event.id}`}>Time *</Label>
          <Input
            id={`time-${event.id}`}
            type="time"
            value={event.time}
            onChange={(e) => onUpdate(index, 'time', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Theme/Title */}
      <div>
        <Label htmlFor={`title-${event.id}`}>Theme/Title *</Label>
        <Input
          id={`title-${event.id}`}
          value={event.title}
          onChange={(e) => onUpdate(index, 'title', e.target.value)}
          placeholder="e.g., 'Life Drawing', 'Abstract Techniques'"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor={`description-${event.id}`}>Description</Label>
        <Textarea
          id={`description-${event.id}`}
          value={event.description}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          placeholder="What makes this event special?"
          rows={2}
        />
      </div>

      {/* Location Override */}
      <div>
        <Label htmlFor={`location-${event.id}`}>Location (if different)</Label>
        <Input
          id={`location-${event.id}`}
          value={event.location}
          onChange={(e) => onUpdate(index, 'location', e.target.value)}
          placeholder={`Leave empty to use: ${mainLocation}`}
        />
        {!event.location && (
          <p className="text-xs text-gray-500 mt-1">Will use main location: {mainLocation}</p>
        )}
      </div>
    </div>
  )
}
