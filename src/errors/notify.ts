import { toast } from 'sonner'
import { getMessage, type MessageParams } from './catalog'
import { normalizeApiError, type NormalizeContext } from './normalizeApiError'

export type NotifyChannel = 'toast' | 'inline'

export interface NotifyOptions {
  key?: string
  params?: MessageParams
  fallback?: string
  channel?: NotifyChannel
  description?: string
}

function resolveMessage(options: NotifyOptions): string {
  if (options.key) {
    return getMessage(options.key, options.params ?? {})
  }
  if (options.fallback) {
    return options.fallback
  }
  return getMessage('global.unexpected')
}

function dispatch(
  type: 'error' | 'success' | 'warning',
  options: NotifyOptions
): string {
  const message = resolveMessage(options)
  const channel = options.channel ?? 'toast'

  if (channel === 'inline') {
    return message
  }

  const toastOptions = options.description ? { description: options.description } : undefined

  switch (type) {
    case 'error':
      toast.error(message, toastOptions)
      break
    case 'success':
      toast.success(message, toastOptions)
      break
    case 'warning':
      toast.warning(message, toastOptions)
      break
  }

  return message
}

export const notify = {
  error(options: NotifyOptions): string {
    return dispatch('error', options)
  },
  success(options: NotifyOptions): string {
    return dispatch('success', options)
  },
  warning(options: NotifyOptions): string {
    return dispatch('warning', options)
  },
  fromApiError(
    error: unknown,
    options: {
      context?: NormalizeContext
      key?: string
      channel?: NotifyChannel
      showToast?: boolean
    } = {}
  ): string {
    const normalized = normalizeApiError(error, { context: options.context })
    const notifyOptions: NotifyOptions = {
      key: options.key ?? normalized.key,
      fallback: normalized.message,
      channel: options.showToast === false ? 'inline' : (options.channel ?? 'inline'),
    }
    if (options.showToast) {
      notifyOptions.channel = 'toast'
      return dispatch('error', notifyOptions)
    }
    return resolveMessage(notifyOptions)
  },
}

export { normalizeApiError, getMessage }
