import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Download, ExternalLink } from "lucide-react"
import { analytics } from '@/lib/analytics'
import type { Event } from '@/types/database'

interface AddToCalendarProps {
  event: Event
  organizationName?: string
}

export function AddToCalendar({ event, organizationName }: AddToCalendarProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Format date for calendar services
  const formatDateForCalendar = (date: Date): string => {
    // Convert to YYYYMMDDTHHMMSSZ format for calendar services
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const getEventDates = () => {
    const startDate = event.date instanceof Date ? event.date : new Date(event.date)
    
    // If no end date provided, assume 2 hour duration
    let endDate = event.endDate ? 
      (event.endDate instanceof Date ? event.endDate : new Date(event.endDate)) :
      new Date(startDate.getTime() + (2 * 60 * 60 * 1000)) // Add 2 hours

    return {
      start: formatDateForCalendar(startDate),
      end: formatDateForCalendar(endDate)
    }
  }

  const generateCalendarData = () => {
    const dates = getEventDates()
    const title = encodeURIComponent(event.title)
    const description = encodeURIComponent(
      `${event.description}\n\n${event.fullDescription || ''}\n\nOrganized by: ${organizationName || 'Voxxy Presents'}`
    )
    const location = encodeURIComponent(`${event.location}, ${event.address}`)

    return {
      title,
      description,
      location,
      startDate: dates.start,
      endDate: dates.end
    }
  }

  const handleGoogleCalendar = () => {
    setIsGenerating(true)
    const data = generateCalendarData()

    // Track calendar click
    analytics.track('add_to_calendar_clicked', {
      event_id: event.id,
      event_title: event.title,
      calendar_type: 'google',
      organization_name: organizationName
    })

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${data.title}&dates=${data.startDate}/${data.endDate}&details=${data.description}&location=${data.location}`

    window.open(googleUrl, '_blank')
    setTimeout(() => setIsGenerating(false), 1000)
  }

  const handleOutlookCalendar = () => {
    setIsGenerating(true)
    const data = generateCalendarData()

    // Track calendar click
    analytics.track('add_to_calendar_clicked', {
      event_id: event.id,
      event_title: event.title,
      calendar_type: 'outlook',
      organization_name: organizationName
    })

    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${data.title}&startdt=${data.startDate}&enddt=${data.endDate}&body=${data.description}&location=${data.location}`

    window.open(outlookUrl, '_blank')
    setTimeout(() => setIsGenerating(false), 1000)
  }

  const handleAppleCalendar = () => {
    setIsGenerating(true)
    const data = generateCalendarData()

    // Track calendar click
    analytics.track('add_to_calendar_clicked', {
      event_id: event.id,
      event_title: event.title,
      calendar_type: 'apple',
      organization_name: organizationName
    })
    
    // Create ICS file content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Voxxy Presents//Event Calendar//EN
BEGIN:VEVENT
UID:${event.id}@voxxypresents.com
DTSTAMP:${formatDateForCalendar(new Date())}
DTSTART:${data.startDate}
DTEND:${data.endDate}
SUMMARY:${decodeURIComponent(data.title)}
DESCRIPTION:${decodeURIComponent(data.description)}
LOCATION:${decodeURIComponent(data.location)}
END:VEVENT
END:VCALENDAR`

    // Create blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setTimeout(() => setIsGenerating(false), 1000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          disabled={isGenerating}
        >
          <Calendar className="h-4 w-4" />
          {isGenerating ? 'Adding...' : 'Add to Calendar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="glass-modal border-white/30" align="end">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          <Calendar className="h-4 w-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlookCalendar} className="cursor-pointer">
          <Calendar className="h-4 w-4 mr-2" />
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAppleCalendar} className="cursor-pointer">
          <Download className="h-4 w-4 mr-2" />
          Apple Calendar (.ics)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}