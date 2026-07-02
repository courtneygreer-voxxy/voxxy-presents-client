import { mockNotifications } from '@/mocks/artistPortalData'
import ArtistNotificationCard from './ArtistNotificationCard'

export default function ArtistInboxTab() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : 'All caught up'}
        </p>
        {unreadCount > 0 && (
          <button className="text-xs text-primary hover:text-primary/80 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification Feed */}
      <div className="space-y-2">
        {mockNotifications.map((notification) => (
          <ArtistNotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  )
}
