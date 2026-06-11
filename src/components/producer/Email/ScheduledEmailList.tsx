import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Mail,
  ChevronDown,
  ChevronUp,
  Megaphone,
  FileText,
  CreditCard,
  Calendar,
  PartyPopper,
  MessageSquare,
  Settings2,
} from 'lucide-react'
import type { ScheduledEmail, ScheduledEmailStatus, EmailCategory } from '@/types/email'
import ScheduledEmailCard from './ScheduledEmailCard'

interface ScheduledEmailListProps {
  emails: ScheduledEmail[]
  onEdit?: (email: ScheduledEmail) => void
  onPreview?: (email: ScheduledEmail) => void
  onPause?: (emailId: number) => Promise<void>
  onResume?: (emailId: number) => Promise<void>
  onSendNow?: (emailId: number) => Promise<void>
  onDelete?: (emailId: number) => Promise<void>
}

type FilterType = 'all' | ScheduledEmailStatus

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Emails' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'paused', label: 'Paused' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

// Category configuration with icons and colors
const CATEGORY_CONFIG: Record<
  EmailCategory,
  { label: string; icon: any; color: string; bgColor: string }
> = {
  pre_application: {
    label: 'Event Announcements',
    icon: Megaphone,
    color: 'text-primary',
    bgColor: 'bg-primary/20',
  },
  application: {
    label: 'Application Updates',
    icon: FileText,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
  payment: {
    label: 'Payment Reminders',
    icon: CreditCard,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  pre_event: {
    label: 'Event Countdown',
    icon: Calendar,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  event_day: {
    label: 'Event Day',
    icon: PartyPopper,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  post_event: {
    label: 'Post-Event',
    icon: MessageSquare,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  system: {
    label: 'System Notifications',
    icon: Settings2,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  event_announcements: {
    label: 'Event Announcements',
    icon: Megaphone,
    color: 'text-primary',
    bgColor: 'bg-primary/20',
  },
  application_updates: {
    label: 'Application Updates',
    icon: FileText,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
  payment_reminders: {
    label: 'Payment Reminders',
    icon: CreditCard,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  event_countdown: {
    label: 'Event Countdown',
    icon: Calendar,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  event_updates: {
    label: 'Event Updates',
    icon: Settings2,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
}

export default function ScheduledEmailList({
  emails,
  onEdit,
  onPreview,
  onPause,
  onResume,
  onSendNow,
  onDelete,
}: ScheduledEmailListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterType>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<EmailCategory>>(
    new Set(['pre_application', 'application', 'payment', 'pre_event']),
  )

  // Infer category from email name/trigger if category not explicitly set
  const inferCategory = (email: ScheduledEmail): EmailCategory => {
    const name = email.name.toLowerCase()
    const trigger = email.trigger_type

    // Check for payment-related emails
    if (name.includes('payment') || trigger.includes('payment')) {
      return 'payment'
    }

    // Check for application-related emails
    if (
      name.includes('application') ||
      name.includes('approval') ||
      name.includes('rejected') ||
      name.includes('waitlist')
    ) {
      return 'application'
    }

    // Check for event countdown/pre-event
    if (trigger === 'days_before_event' || name.includes('days before')) {
      return 'pre_event'
    }

    // Check for event day
    if (trigger === 'on_event_date' || name.includes('day of')) {
      return 'event_day'
    }

    // Check for post-event
    if (trigger === 'days_after_event') {
      return 'post_event'
    }

    // Check for announcement/invitation
    if (
      name.includes('announcement') ||
      name.includes('immediate') ||
      name.includes('invitation')
    ) {
      return 'pre_application'
    }

    // Default to pre_application
    return 'pre_application'
  }

  // Filter and search emails
  const filteredEmails = useMemo(() => {
    let result = emails

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((email) => email.status === statusFilter)
    }

    // Search by name or subject
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (email) =>
          email.name.toLowerCase().includes(query) ||
          email.subject_template.toLowerCase().includes(query),
      )
    }

    // Sort by scheduled_for date (ascending)
    return result.sort((a, b) => {
      const dateA = a.scheduled_for ? new Date(a.scheduled_for).getTime() : 0
      const dateB = b.scheduled_for ? new Date(b.scheduled_for).getTime() : 0
      return dateA - dateB
    })
  }, [emails, searchQuery, statusFilter])

  // Group emails by category
  const emailsByCategory = useMemo(() => {
    const grouped: Partial<Record<EmailCategory, ScheduledEmail[]>> = {}

    filteredEmails.forEach((email) => {
      // Try to infer category from email name if not explicitly set
      const category = inferCategory(email)
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category]!.push(email)
    })

    return grouped
  }, [filteredEmails])

  // Statistics
  const stats = useMemo(() => {
    return {
      total: emails.length,
      scheduled: emails.filter((e) => e.status === 'scheduled').length,
      paused: emails.filter((e) => e.status === 'paused').length,
      sent: emails.filter((e) => e.status === 'sent').length,
      failed: emails.filter((e) => e.status === 'failed').length,
    }
  }, [emails])

  const toggleCategory = (category: EmailCategory) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background/5 border border-border mb-4">
          <Mail className="w-8 h-8 text-foreground/40" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Scheduled Emails</h3>
        <p className="text-foreground/60">
          Emails will be automatically generated based on your event template.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background/5 border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-foreground/60" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterType)}
            className="px-4 py-2.5 bg-background/5 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.value !== 'all' && ` (${stats[option.value as keyof typeof stats] || 0})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">
          Showing {filteredEmails.length} of {emails.length} emails
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-primary hover:text-primary/70 transition-colors"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Grouped Email Cards */}
      {filteredEmails.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(emailsByCategory).map(([category, categoryEmails]) => {
            const config =
              CATEGORY_CONFIG[category as EmailCategory] || CATEGORY_CONFIG['event_announcements']
            const Icon = config.icon
            const isExpanded = expandedCategories.has(category as EmailCategory)

            return (
              <div
                key={category}
                className="glass-card overflow-hidden rounded-xl border border-primary/20"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category as EmailCategory)}
                  className="w-full p-5 flex items-center justify-between hover:bg-background/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-foreground">{config.label}</h3>
                      <p className="text-sm text-foreground/60">
                        {categoryEmails?.length || 0}{' '}
                        {categoryEmails?.length === 1 ? 'email' : 'emails'}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-foreground/60" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-foreground/60" />
                  )}
                </button>

                {/* Category Emails */}
                {isExpanded && categoryEmails && categoryEmails.length > 0 && (
                  <div className="border-t border-border">
                    <div className="p-4 space-y-3">
                      {categoryEmails.map((email) => (
                        <ScheduledEmailCard
                          key={`${email.id}-${email.scheduled_for}`}
                          email={email}
                          onEdit={onEdit}
                          onPreview={onPreview}
                          onPause={onPause}
                          onResume={onResume}
                          onSendNow={onSendNow}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-foreground/80 dark:text-foreground/60">No emails match your filters</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
            }}
            className="mt-4 text-sm text-violet-900 hover:text-violet-800 dark:text-primary dark:hover:text-primary/70 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
