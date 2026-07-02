import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Mail,
  CheckCircle,
  XCircle,
  DollarSign,
  Bell,
  AlertCircle,
  Megaphone,
} from 'lucide-react'
import { type ArtistNotification, type NotificationType, NOTIFICATION_CONFIG } from '@/mocks/artistPortalData'

const ICON_MAP: Record<NotificationType, React.ElementType> = {
  invitation_received: Mail,
  application_confirmed: CheckCircle,
  status_approved: CheckCircle,
  status_rejected: XCircle,
  payment_received: DollarSign,
  event_update: Bell,
  bulletin: Megaphone,
  reminder: AlertCircle,
}

interface ArtistNotificationCardProps {
  notification: ArtistNotification
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export default function ArtistNotificationCard({ notification }: ArtistNotificationCardProps) {
  const config = NOTIFICATION_CONFIG[notification.type]
  const Icon = ICON_MAP[notification.type]

  return (
    <Card className={`${!notification.read ? 'border-primary/30' : ''}`}>
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Icon */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgClass}`}
          >
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={`text-xs ${notification.read ? 'font-medium text-foreground/80' : 'font-semibold text-foreground'}`}
              >
                {notification.title}
              </h4>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {formatTimestamp(notification.timestamp)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {notification.message}
            </p>

            <p className="text-[10px] text-muted-foreground/70 mt-1">
              {notification.organization_name} — {notification.event_title}
            </p>

            {notification.action_label && (
              <Button variant="link" size="sm" className="h-auto p-0 mt-1.5 text-xs">
                {notification.action_label}
              </Button>
            )}
          </div>

          {/* Unread dot */}
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
