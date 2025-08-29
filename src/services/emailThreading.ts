// Email threading and conversation tracking utilities
import { EmailThread, EmailMessage, CreateEmailThreadData, CreateEmailMessageData } from '@/types/database'
import { EmailType } from '@/types/email'
import { emailUtils } from './emailService'

export interface ThreadingOptions {
  maxThreadLength?: number
  autoCloseAfterDays?: number
  organizationId?: string
}

/**
 * Email threading manager that handles RFC-compliant email conversation tracking
 */
export class EmailThreadingManager {
  private options: ThreadingOptions

  constructor(options: ThreadingOptions = {}) {
    this.options = {
      maxThreadLength: 50,
      autoCloseAfterDays: 30,
      ...options
    }
  }

  /**
   * Generate a unique Message-ID for email threading
   */
  generateMessageId(type: EmailType, entityId: string, domain: string = 'voxxypresents.com'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `<${type}.${entityId}.${timestamp}.${random}@${domain}>`
  }

  /**
   * Create a new email thread
   */
  createThread(data: CreateEmailThreadData): EmailThread {
    const thread: EmailThread = {
      id: this.generateThreadId(),
      subject: data.subject,
      participants: [...new Set(data.participants)], // Remove duplicates
      messageIds: [],
      organizationId: data.organizationId,
      eventId: data.eventId,
      type: data.type,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return thread
  }

  /**
   * Find existing thread by subject and participants or create new one
   */
  findOrCreateThread(
    subject: string, 
    participants: string[], 
    type: EmailType,
    organizationId?: string,
    eventId?: string
  ): CreateEmailThreadData {
    // This would typically query the database
    // For now, we return a new thread structure
    return {
      subject: this.normalizeSubject(subject),
      participants: [...new Set(participants.map(p => p.toLowerCase()))],
      messageIds: [],
      type,
      organizationId,
      eventId,
      status: 'active'
    }
  }

  /**
   * Add a message to an existing thread
   */
  addMessageToThread(
    threadId: string,
    messageData: CreateEmailMessageData,
    replyToMessageId?: string
  ): CreateEmailMessageData {
    const references = this.buildReferences(threadId, replyToMessageId)
    
    const message: CreateEmailMessageData = {
      ...messageData,
      threadId,
      messageId: this.generateMessageId(
        'organization_communication', // Default type, should be passed in
        threadId
      ),
      references,
      inReplyTo: replyToMessageId,
      status: 'queued',
      retryCount: 0
    }

    return message
  }

  /**
   * Build RFC 2822 compliant References header for email threading
   */
  buildReferences(threadId: string, replyToMessageId?: string): string[] {
    const references: string[] = []
    
    if (replyToMessageId) {
      references.push(replyToMessageId)
    }

    // In a real implementation, this would fetch the thread's message history
    // and build the complete references chain
    
    return references
  }

  /**
   * Normalize email subject for thread matching
   */
  normalizeSubject(subject: string): string {
    // Remove common reply prefixes
    return subject
      .replace(/^(Re:|RE:|Fwd:|FWD:)\s*/gi, '')
      .trim()
  }

  /**
   * Check if a thread should be auto-closed
   */
  shouldAutoCloseThread(thread: EmailThread): boolean {
    if (this.options.autoCloseAfterDays === undefined) return false
    
    const daysSinceUpdate = (Date.now() - thread.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceUpdate > this.options.autoCloseAfterDays
  }

  /**
   * Generate a unique thread ID
   */
  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }
}

/**
 * Conversation tracking utilities
 */
export class ConversationTracker {
  /**
   * Track when a conversation was initiated
   */
  static trackConversationStart(
    type: EmailType,
    participants: string[],
    organizationId?: string,
    eventId?: string
  ): ConversationMetadata {
    return {
      id: this.generateConversationId(),
      type,
      participants: [...new Set(participants.map(p => p.toLowerCase()))],
      organizationId,
      eventId,
      startedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      status: 'active'
    }
  }

  /**
   * Update conversation activity
   */
  static updateConversationActivity(
    conversationId: string,
    messageId: string
  ): Partial<ConversationMetadata> {
    return {
      lastActivity: new Date(),
      messageCount: 1, // This would increment the existing count
      lastMessageId: messageId
    }
  }

  /**
   * Get conversation statistics
   */
  static getConversationStats(messages: EmailMessage[]): ConversationStats {
    if (messages.length === 0) {
      return {
        totalMessages: 0,
        avgResponseTime: 0,
        longestThread: 0,
        participantCount: 0,
        firstMessage: undefined,
        lastMessage: undefined
      }
    }

    const sortedMessages = messages.sort((a, b) => 
      (a.sentAt?.getTime() || 0) - (b.sentAt?.getTime() || 0)
    )

    const participants = new Set(
      messages.flatMap(m => [m.from, ...m.to])
    )

    const responseTimes: number[] = []
    for (let i = 1; i < sortedMessages.length; i++) {
      const prev = sortedMessages[i - 1]
      const curr = sortedMessages[i]
      
      if (prev.sentAt && curr.sentAt && prev.from !== curr.from) {
        responseTimes.push(curr.sentAt.getTime() - prev.sentAt.getTime())
      }
    }

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0

    return {
      totalMessages: messages.length,
      avgResponseTime: Math.round(avgResponseTime / 1000 / 60), // Convert to minutes
      longestThread: messages.length,
      participantCount: participants.size,
      firstMessage: sortedMessages[0],
      lastMessage: sortedMessages[sortedMessages.length - 1]
    }
  }

  private static generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }
}

/**
 * Email threading hooks for React components
 */
export function useEmailThreading(threadId?: string) {
  // This would be implemented as a React hook in a real application
  // For now, we return the basic structure
  
  return {
    thread: null as EmailThread | null,
    messages: [] as EmailMessage[],
    loading: false,
    error: null as Error | null,
    
    // Actions
    sendReply: async (content: string, replyToId?: string) => {
      // Implementation would call the email API
      console.log('Sending reply:', { content, replyToId, threadId })
    },
    
    closeThread: async () => {
      // Implementation would call the email API
      console.log('Closing thread:', threadId)
    },
    
    markAsRead: async (messageId: string) => {
      // Implementation would update message status
      console.log('Marking as read:', messageId)
    }
  }
}

// Supporting interfaces
export interface ConversationMetadata {
  id: string
  type: EmailType
  participants: string[]
  organizationId?: string
  eventId?: string
  startedAt: Date
  lastActivity: Date
  messageCount: number
  status: 'active' | 'closed' | 'archived'
  lastMessageId?: string
}

export interface ConversationStats {
  totalMessages: number
  avgResponseTime: number // in minutes
  longestThread: number
  participantCount: number
  firstMessage?: EmailMessage
  lastMessage?: EmailMessage
}

/**
 * Thread search and filtering utilities
 */
export class ThreadSearchManager {
  /**
   * Search threads by various criteria
   */
  static searchThreads(threads: EmailThread[], criteria: ThreadSearchCriteria): EmailThread[] {
    return threads.filter(thread => {
      // Text search in subject
      if (criteria.query) {
        const query = criteria.query.toLowerCase()
        if (!thread.subject.toLowerCase().includes(query)) {
          return false
        }
      }

      // Filter by type
      if (criteria.type && thread.type !== criteria.type) {
        return false
      }

      // Filter by organization
      if (criteria.organizationId && thread.organizationId !== criteria.organizationId) {
        return false
      }

      // Filter by status
      if (criteria.status && thread.status !== criteria.status) {
        return false
      }

      // Filter by date range
      if (criteria.dateRange) {
        const threadDate = thread.createdAt.getTime()
        if (criteria.dateRange.start && threadDate < criteria.dateRange.start.getTime()) {
          return false
        }
        if (criteria.dateRange.end && threadDate > criteria.dateRange.end.getTime()) {
          return false
        }
      }

      // Filter by participants
      if (criteria.participants && criteria.participants.length > 0) {
        const hasParticipant = criteria.participants.some(email => 
          thread.participants.includes(email.toLowerCase())
        )
        if (!hasParticipant) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Sort threads by various criteria
   */
  static sortThreads(threads: EmailThread[], sortBy: ThreadSortOption): EmailThread[] {
    return threads.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.updatedAt.getTime() - a.updatedAt.getTime()
        
        case 'oldest':
          return a.updatedAt.getTime() - b.updatedAt.getTime()
        
        case 'subject':
          return a.subject.localeCompare(b.subject)
        
        case 'participants':
          return a.participants.length - b.participants.length
        
        case 'messages':
          return b.messageIds.length - a.messageIds.length
        
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime()
      }
    })
  }
}

export interface ThreadSearchCriteria {
  query?: string
  type?: EmailType
  organizationId?: string
  status?: 'active' | 'closed'
  dateRange?: {
    start?: Date
    end?: Date
  }
  participants?: string[]
}

export type ThreadSortOption = 'newest' | 'oldest' | 'subject' | 'participants' | 'messages'

// Export default instance for convenience
export const emailThreading = new EmailThreadingManager()
export const conversationTracker = ConversationTracker