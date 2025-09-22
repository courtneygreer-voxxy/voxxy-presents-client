export interface EventUpdate {
  id: string
  eventId: string
  changeType: 'time' | 'date' | 'location' | 'cancellation' | 'description' | 'title' | 'general'
  fieldName: string
  oldValue: any
  newValue: any
  changedAt: Date
  changedBy?: string
  notifyAttendees: boolean
  notificationsSent: boolean
  affectedAttendeeCount: number
}

export interface EventUpdateNotification {
  id: string
  eventUpdateId: string
  eventId: string
  recipientEmail: string
  recipientName: string
  notificationType: EventUpdate['changeType']
  sentAt: Date
  status: 'pending' | 'sent' | 'failed'
  errorMessage?: string
}

export interface EventChangeDetectionResult {
  hasChanges: boolean
  updates: EventUpdate[]
  requiresNotification: boolean
  affectedRegistrations: string[]
}

export interface EventUpdateEmailData {
  eventTitle: string
  organizationName: string
  recipientName: string
  changes: Array<{
    type: EventUpdate['changeType']
    fieldName: string
    oldValue: string
    newValue: string
    userFriendlyDescription: string
  }>
  eventDetails: {
    date: Date
    location: string
    description?: string
  }
  actionRequired?: string
  rsvpUpdateLink?: string
  unsubscribeLink?: string
}

export type EventUpdateTemplateType =
  | 'event_update_general'
  | 'event_update_time'
  | 'event_update_date'
  | 'event_update_location'
  | 'event_update_cancellation'
  | 'event_update_description'
  | 'event_update_title'

export interface EventUpdateSettings {
  organizationId: string
  autoNotifyOnChanges: boolean
  notificationTypes: {
    time: boolean
    date: boolean
    location: boolean
    cancellation: boolean
    description: boolean
    title: boolean
  }
  customMessage?: string
  delayNotificationMinutes: number // Allow time for additional changes
}