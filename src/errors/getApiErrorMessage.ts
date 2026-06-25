import { normalizeApiError, type NormalizeContext } from './normalizeApiError'

export function getApiErrorMessage(
  error: unknown,
  context: NormalizeContext = 'default'
): string {
  return normalizeApiError(error, { context }).message
}
