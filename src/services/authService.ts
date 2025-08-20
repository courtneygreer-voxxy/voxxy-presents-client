import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  applyActionCode,
  checkActionCode,
  User as FirebaseUser,
  UserCredential,
  AuthError
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createUser, getUser } from '@/lib/database'
import type { User } from '@/types/database'

export interface SignUpData {
  email: string
  password: string
  displayName: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  user: FirebaseUser
  isNewUser?: boolean
}

// Custom error class for auth service
export class AuthServiceError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

// Sign up with email and password
export const signUp = async ({ email, password, displayName }: SignUpData): Promise<AuthResult> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password)
    const { user } = userCredential
    
    // Update the user's display name
    await updateProfile(user, {
      displayName: displayName
    })
    
    // Create user profile in Firestore
    await createUser(user.uid, {
      email: user.email!,
      name: displayName,
      role: 'organizer', // All new users are club organizers
      organizationIds: [], // Will be populated when they create clubs
      emailNotifications: true
    })
    
    // Send email verification with allowlisted domain or fallback to default
    try {
      // Try with custom action URL first
      const actionCodeSettings = {
        url: `${window.location.origin}/profile`, // Redirect to profile after verification
        handleCodeInApp: true
      }
      await sendEmailVerification(user, actionCodeSettings)
    } catch (error) {
      // If unauthorized domain, fallback to default Firebase email verification
      const authError = error as AuthError
      if (authError.code === 'auth/unauthorized-continue-uri') {
        console.warn('Domain not allowlisted, using default email verification')
        await sendEmailVerification(user) // No custom URL, uses Firebase default
      } else if (authError.code === 'auth/too-many-requests') {
        // Don't retry on rate limiting - just throw with better message
        throw new AuthServiceError(
          authError.code,
          'Too many verification attempts. Please wait a few minutes before trying again.'
        )
      } else {
        throw error // Re-throw other errors
      }
    }
    
    return { user, isNewUser: true }
  } catch (error) {
    console.error('Sign up error:', error)
    throw new AuthServiceError(
      (error as AuthError).code, 
      getAuthErrorMessage((error as AuthError).code)
    )
  }
}

// Sign in with email and password
export const signIn = async ({ email, password }: SignInData): Promise<AuthResult> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
    const { user } = userCredential
    
    return { user, isNewUser: false }
  } catch (error) {
    console.error('Sign in error:', error)
    throw new AuthServiceError(
      (error as AuthError).code,
      getAuthErrorMessage((error as AuthError).code)
    )
  }
}

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Sign out error:', error)
    throw new AuthServiceError(
      (error as AuthError).code,
      'Failed to sign out. Please try again.'
    )
  }
}

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error('Password reset error:', error)
    throw new AuthServiceError(
      (error as AuthError).code,
      getAuthErrorMessage((error as AuthError).code)
    )
  }
}

// Resend email verification
export const resendEmailVerification = async (user: FirebaseUser): Promise<void> => {
  try {
    // Try with custom action URL first
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/profile`, // Redirect to profile after verification
        handleCodeInApp: true
      }
      await sendEmailVerification(user, actionCodeSettings)
    } catch (error) {
      // If unauthorized domain, fallback to default Firebase email verification
      const authError = error as AuthError
      if (authError.code === 'auth/unauthorized-continue-uri') {
        console.warn('Domain not allowlisted, using default email verification')
        await sendEmailVerification(user) // No custom URL, uses Firebase default
      } else if (authError.code === 'auth/too-many-requests') {
        // Don't retry on rate limiting - just throw with better message
        throw new AuthServiceError(
          authError.code,
          'Too many verification attempts. Please wait a few minutes before trying again.'
        )
      } else {
        throw error // Re-throw other errors
      }
    }
  } catch (error) {
    console.error('Email verification error:', error)
    throw new AuthServiceError(
      (error as AuthError).code,
      'Failed to send verification email. Please try again.'
    )
  }
}

// Handle email verification action code
export const handleEmailVerification = async (actionCode: string): Promise<boolean> => {
  try {
    // Verify the action code is valid and not expired
    await checkActionCode(auth, actionCode)
    
    // Apply the action code to verify the email
    await applyActionCode(auth, actionCode)
    
    // Reload the current user to get updated emailVerified status
    if (auth.currentUser) {
      await auth.currentUser.reload()
    }
    
    return true
  } catch (error) {
    console.error('Email verification error:', error)
    const authError = error as AuthError
    
    // Handle specific error cases
    if (authError.code === 'auth/expired-action-code') {
      throw new AuthServiceError(authError.code, 'This verification link has expired. Please request a new one.')
    } else if (authError.code === 'auth/invalid-action-code') {
      throw new AuthServiceError(authError.code, 'This verification link is invalid. Please request a new one.')
    } else if (authError.code === 'auth/user-disabled') {
      throw new AuthServiceError(authError.code, 'This account has been disabled.')
    } else {
      throw new AuthServiceError(authError.code, 'Failed to verify email. Please try again.')
    }
  }
}

// Check if URL contains email verification parameters
export const checkForEmailVerificationInURL = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  const mode = urlParams.get('mode')
  const actionCode = urlParams.get('oobCode')
  
  if (mode === 'verifyEmail' && actionCode) {
    return actionCode
  }
  
  return null
}

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    return await getUser(uid)
  } catch (error) {
    console.error('Get user profile error:', error)
    return null
  }
}

// Convert Firebase Auth error codes to user-friendly messages
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email address is already registered. Please sign in or use a different email.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email address. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/too-many-requests': 'Too many requests. Please wait a few minutes before trying again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again.',
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/invalid-verification-id': 'Invalid verification ID. Please try again.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/missing-password': 'Please enter your password.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
  }
  
  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.'
}

// Password validation utility
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Email validation utility
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}