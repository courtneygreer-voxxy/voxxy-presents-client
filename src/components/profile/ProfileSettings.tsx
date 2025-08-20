import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Trash2, 
  Camera,
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { updateProfile } from 'firebase/auth'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function ProfileSettings() {
  const { currentUser, userProfile, isEmailVerified, resendVerification } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    emailNotifications: userProfile?.emailNotifications ?? true,
  })

  const userInitials = (currentUser?.displayName || currentUser?.email || 'U')
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSaveProfile = async () => {
    if (!currentUser) return

    setSaving(true)
    setMessage(null)

    try {
      // Update Firebase Auth profile
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: formData.displayName || null
        })
      }

      // Update Firestore profile
      if (userProfile) {
        const userDocRef = doc(db, 'users', currentUser.uid)
        await updateDoc(userDocRef, {
          name: formData.displayName,
          emailNotifications: formData.emailNotifications,
          updatedAt: new Date()
        })
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleResendVerification = async () => {
    setIsResendingVerification(true)
    setMessage(null)
    
    try {
      await resendVerification()
      setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' })
    } catch (error) {
      console.error('Failed to resend verification:', error)
      setMessage({ type: 'error', text: 'Failed to send verification email. Please try again.' })
    } finally {
      setIsResendingVerification(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: currentUser?.displayName || '',
      emailNotifications: userProfile?.emailNotifications ?? true,
    })
    setIsEditing(false)
    setMessage(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription>
            Update your profile details and display information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={currentUser?.photoURL || undefined} />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-xl font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h4 className="font-medium">Profile Photo</h4>
              <p className="text-sm text-gray-600">
                Profile photos are currently managed through Google or other OAuth providers.
              </p>
              <Button size="sm" variant="outline" disabled>
                <Camera className="h-4 w-4 mr-2" />
                Change Photo (Coming Soon)
              </Button>
            </div>
          </div>

          <Separator />

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="flex space-x-2">
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter your display name"
              />
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              This name will be displayed on your clubs and in communications.
            </p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={currentUser?.email || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              Email address cannot be changed. Contact support if you need to update this.
            </p>
          </div>

          {/* Save/Cancel buttons */}
          {isEditing && (
            <div className="flex space-x-2">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Account Security</span>
          </CardTitle>
          <CardDescription>
            Manage your account security and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Verification */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Email Verification</h4>
              <p className="text-sm text-gray-600">
                {isEmailVerified 
                  ? 'Your email address has been verified.'
                  : 'Please verify your email address to access all features.'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isEmailVerified ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                >
                  {isResendingVerification ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Email
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Password */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-gray-600">
                Last updated: {currentUser?.metadata.lastSignInTime && 
                  new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()}
              </p>
            </div>
            <Button size="sm" variant="outline" disabled>
              Change Password (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Preferences</span>
          </CardTitle>
          <CardDescription>
            Configure your notification and communication preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive email updates about your clubs and events
              </p>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          {/* Auto-save preferences */}
          {formData.emailNotifications !== (userProfile?.emailNotifications ?? true) && !isEditing && (
            <div className="pt-2">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>
            Irreversible account actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Account deletion is not yet available. If you need to delete your account, 
              please contact support. This action cannot be undone and will permanently 
              delete all your clubs and data.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Button variant="destructive" disabled className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Delete Account (Coming Soon)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}