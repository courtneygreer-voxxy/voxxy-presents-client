import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Repeat, Clock, Users } from "lucide-react"
import type { Organization } from "@/types/database"

interface EventTypeSelectionProps {
  organization: Organization
  isOpen: boolean
  onClose: () => void
  onSelectType: (type: 'one-time' | 'recurring') => void
}

export default function EventTypeSelection({ organization, isOpen, onClose, onSelectType }: EventTypeSelectionProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            What type of event would you like to create for {organization.name}?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* One-Time Event */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300" 
                onClick={() => onSelectType('one-time')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">One-Time Event</CardTitle>
              <CardDescription>
                Single event happening on a specific date
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Single date</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Simple setup</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Perfect for workshops, parties, special events</span>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Create One-Time Event
              </Button>
            </CardContent>
          </Card>

          {/* Recurring Event */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300" 
                onClick={() => onSelectType('recurring')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Repeat className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Recurring Event</CardTitle>
              <CardDescription>
                Event series with multiple dates and themes
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <Repeat className="h-4 w-4" />
                  <span>Multiple dates</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Themed variations</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Perfect for weekly/monthly series</span>
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Create Recurring Event
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}