import type { MessageParams } from './index'

export const authCatalog = {
  'auth.invalidCredentials': 'Invalid email or password. Please try again.',
  'auth.sessionExpired': 'Your session has expired. Please sign in again.',
  'auth.forbidden': "You don't have permission to perform this action.",
  'auth.signInFailed': 'Sign in failed. Please try again.',
  'auth.signUpFailed': 'Sign up failed. Please try again.',
  'auth.signOutFailed': 'Sign out failed. Please try again.',
  'auth.resetPasswordFailed': 'Could not send password reset email. Please try again.',
  'auth.devLoginFailed':
    'Dev login failed. Is the Rails server running on port 3001 with seed data?',
} as const satisfies Record<string, string | ((params: MessageParams) => string)>
