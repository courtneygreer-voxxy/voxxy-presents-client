import type { MessageParams } from './index'

export const emailCatalog = {
  'email.sendFailed': 'Failed to send email.',
  'email.sendFailedDescription': 'An unexpected error occurred.',
  'email.sendSuccess': (p: MessageParams) => String(p.message ?? 'Email sent successfully.'),
  'email.sendSuccessDescription': (p: MessageParams) => {
    const sent = p.sentCount ?? 0
    const failed = p.failedCount ?? 0
    return failed
      ? `Sent to ${sent} recipients (${failed} failed)`
      : `Sent to ${sent} recipients`
  },
} as const satisfies Record<string, string | ((params: MessageParams) => string)>
