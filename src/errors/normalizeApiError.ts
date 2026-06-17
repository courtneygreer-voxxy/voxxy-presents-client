import { ApiError } from '@/services/api'
import { getMessage } from './catalog'

export type NormalizeContext = 'auth' | 'default'

export interface NormalizedError {
  key?: string
  message: string
  status?: number
  errors?: string[]
  passThrough: boolean
}

interface ApiLikeError {
  message: string
  status?: number
  errors?: string[]
  name?: string
}

function isApiLikeError(error: unknown): error is ApiLikeError {
  return error instanceof Error && typeof (error as ApiLikeError).message === 'string'
}

export function normalizeApiError(
  error: unknown,
  options: { context?: NormalizeContext } = {}
): NormalizedError {
  const context = options.context ?? 'default'

  if (!isApiLikeError(error)) {
    return {
      key: 'global.unexpected',
      message: getMessage('global.unexpected'),
      passThrough: false,
    }
  }

  const status = error instanceof ApiError ? error.status : error.status
  const errors = error instanceof ApiError ? error.errors : error.errors
  const rawMessage = error.message?.trim() ?? ''

  if (status === 0) {
    return {
      key: 'global.network',
      message: getMessage('global.network'),
      status,
      passThrough: false,
    }
  }

  if (status === 403) {
    return {
      key: 'auth.forbidden',
      message: getMessage('auth.forbidden'),
      status,
      errors,
      passThrough: false,
    }
  }

  if (status === 401) {
    if (context === 'auth') {
      const message = rawMessage || getMessage('auth.invalidCredentials')
      return {
        key: rawMessage ? undefined : 'auth.invalidCredentials',
        message,
        status,
        errors,
        passThrough: !!rawMessage,
      }
    }
    return {
      key: 'auth.sessionExpired',
      message: getMessage('auth.sessionExpired'),
      status,
      errors,
      passThrough: false,
    }
  }

  if (status === 422 && errors && errors.length > 0) {
    return {
      message: errors[0],
      status,
      errors,
      passThrough: true,
    }
  }

  if (rawMessage) {
    return {
      message: rawMessage,
      status,
      errors,
      passThrough: true,
    }
  }

  return {
    key: 'global.requestFailed',
    message: getMessage('global.requestFailed'),
    status,
    errors,
    passThrough: false,
  }
}
