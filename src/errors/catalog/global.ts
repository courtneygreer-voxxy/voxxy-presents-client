import type { MessageParams } from './index'

export const globalCatalog = {
  'global.network': 'Network error. Please check your connection and try again.',
  'global.requestFailed': 'Something went wrong. Please try again.',
  'global.unexpected': 'An unexpected error occurred. Please try again.',
  'global.boundaryTitle': 'Oops! Something went wrong',
  'global.boundaryDescription':
    "We encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page or returning to the home page.",
} as const satisfies Record<string, string | ((params: MessageParams) => string)>
