import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { authApi, organizationsApi } from '@/services/api'
import { stripeService } from '@/services/stripeService'
import {
  AlertTriangle,
  User,
  Building2,
  MapPin,
  Globe,
  HelpCircle,
  CreditCard,
  ExternalLink,
  Loader2,
  Key,
  Mail,
  Webhook,
  Copy,
  RotateCw,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { toast } from 'sonner'
import FullDataExportSection from '@/components/producer/Settings/FullDataExportSection'

interface SettingsPageProps {
  onBack?: () => void
  onStartGuide?: () => void
}

interface Organization {
  id: number
  slug: string
  name: string
  user_id: number
  timezone?: string
  description?: string
  logo_url?: string
  contact?: {
    website?: string
    instagram?: string
    phone?: string
    email?: string
  }
  location?: {
    address?: string
    city?: string
    state?: string
    zip_code?: string
  }
  verified?: boolean
}

export default function SettingsPage({ onBack, onStartGuide }: SettingsPageProps) {
  const { userProfile, refreshUserProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loadingOrg, setLoadingOrg] = useState(true)

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: userProfile?.name || '',
    email: userProfile?.email || '',
    bio: '',
  })

  // Organization form state
  const [organizationData, setOrganizationData] = useState({
    name: '',
    timezone: 'America/Los_Angeles',
    description: '',
    logo_url: '',
    website: '',
    instagram_handle: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  })

  // Fetch user's organization
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!userProfile?.id) return

      try {
        setLoadingOrg(true)
        const orgs = await organizationsApi.getAll()
        const userOrg = orgs.find((org: Organization) => org.user_id === userProfile.id)

        if (userOrg) {
          setOrganization(userOrg)
          setOrganizationData({
            name: userOrg.name || '',
            timezone: userOrg.timezone || 'America/Los_Angeles',
            description: userOrg.description || '',
            logo_url: userOrg.logo_url || '',
            website: userOrg.contact?.website || '',
            instagram_handle: userOrg.contact?.instagram || '',
            phone: userOrg.contact?.phone || '',
            email: userOrg.contact?.email || '',
            address: userOrg.location?.address || '',
            city: userOrg.location?.city || '',
            state: userOrg.location?.state || '',
            zip_code: userOrg.location?.zip_code || '',
          })
        }
      } catch (err) {
        console.error('Failed to fetch organization:', err)
      } finally {
        setLoadingOrg(false)
      }
    }

    fetchOrganization()
  }, [userProfile])

  // Fetch webhook config
  useEffect(() => {
    const fetchWebhookConfig = async () => {
      if (!organization?.slug) return

      try {
        setLoadingWebhook(true)
        const config = await organizationsApi.getWebhookConfig(organization.slug)
        setWebhookConfig(config)
      } catch (err) {
        console.error('Failed to fetch webhook config:', err)
      } finally {
        setLoadingWebhook(false)
      }
    }

    fetchWebhookConfig()
  }, [organization])

  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteWarning, setShowDeleteWarning] = useState(false)
  const [isLoadingBilling, setIsLoadingBilling] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)

  // Webhook state
  const [webhookConfig, setWebhookConfig] = useState<{
    webhook_url: string
    webhook_token: string
  } | null>(null)
  const [loadingWebhook, setLoadingWebhook] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [copiedPayload, setCopiedPayload] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleSaveChanges = async () => {
    if (!userProfile?.id) {
      alert('User profile not loaded')
      return
    }

    setIsSaving(true)
    try {
      const userPayload = {
        name: profileData.fullName,
        email: profileData.email,
      }
      await authApi.updateUser(userProfile.id, userPayload)

      if (organization) {
        await organizationsApi.update(organization.slug, {
          name: organizationData.name,
          timezone: organizationData.timezone,
          description: organizationData.description,
          logo_url: organizationData.logo_url,
          website: organizationData.website,
          instagram_handle: organizationData.instagram_handle,
          phone: organizationData.phone,
          email: organizationData.email,
          address: organizationData.address,
          city: organizationData.city,
          state: organizationData.state,
          zip_code: organizationData.zip_code,
        })
      }

      await refreshUserProfile()
      alert('Profile and organization information updated successfully!')
    } catch (error: any) {
      console.error('Failed to save profile:', error)
      alert(`Failed to save changes: ${error.message || 'Please try again.'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      alert(
        'Account deletion will be available soon. Please contact support to delete your account.',
      )
      setShowDeleteWarning(false)
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  const handleManageBilling = async () => {
    setIsLoadingBilling(true)
    try {
      const { url } = await stripeService.createBillingPortalSession()
      window.open(url, '_blank')
      setIsLoadingBilling(false)
    } catch (error) {
      console.error('Failed to open billing portal:', error)
      alert('Failed to open billing portal. Please try again or contact support.')
      setIsLoadingBilling(false)
    }
  }

  const handleResetPassword = async () => {
    if (!userProfile?.email) {
      toast.error('Unable to send reset email - email not found')
      return
    }

    setIsResettingPassword(true)
    try {
      await authApi.requestPasswordReset(userProfile.email)
      toast.success(`Password reset email sent to ${userProfile.email}`)
      setEmailSent(true)
      setResendDisabled(true)
      // Enable resend after 30 seconds
      setTimeout(() => setResendDisabled(false), 30000)
    } catch (error: any) {
      console.error('Failed to send password reset:', error)
      toast.error(error.message || 'Failed to send password reset email')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleCloseResetModal = () => {
    setShowResetPasswordModal(false)
    // Reset states when modal closes
    setTimeout(() => {
      setEmailSent(false)
      setResendDisabled(false)
    }, 300) // Small delay for smooth modal close animation
  }

  const handleChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOrganizationChange = (field: string, value: string) => {
    setOrganizationData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCopyWebhookUrl = async () => {
    if (!webhookConfig?.webhook_url) return

    try {
      await navigator.clipboard.writeText(webhookConfig.webhook_url)
      setCopiedWebhook(true)
      toast.success('Webhook URL copied to clipboard!')
      setTimeout(() => setCopiedWebhook(false), 2000)
    } catch (err) {
      console.error('Failed to copy webhook URL:', err)
      toast.error('Failed to copy URL')
    }
  }

  const handleCopyN8nPayload = async () => {
    const payloadTemplate = `{
  "eventbrite_event_id": "={{ $json.event.id }}",
  "application_code": "={{ $json.attendee.answers.application_code }}",
  "eventbrite_order_id": "={{ $json.order.id }}",
  "email": "={{ $json.attendee.profile.email }}",
  "first_name": "={{ $json.attendee.profile.first_name }}",
  "last_name": "={{ $json.attendee.profile.last_name }}",
  "payment_date": "={{ $json.order.created }}",
  "payment_amount": "={{ $json.order.costs.gross.value }}",
  "currency": "={{ $json.order.costs.gross.currency }}",
  "ticket_type": "={{ $json.attendee.ticket_class_name }}"
}`

    try {
      await navigator.clipboard.writeText(payloadTemplate)
      setCopiedPayload(true)
      toast.success('n8n payload template copied to clipboard!')
      setTimeout(() => setCopiedPayload(false), 2000)
    } catch (err) {
      console.error('Failed to copy payload template:', err)
      toast.error('Failed to copy template')
    }
  }

  const handleRegenerateWebhookToken = async () => {
    if (!organization?.slug) return

    setIsRegenerating(true)
    try {
      const config = await organizationsApi.regenerateWebhookToken(organization.slug)
      setWebhookConfig(config)
      toast.success('Webhook token regenerated! Update your n8n workflow with the new URL.')
      setShowRegenerateModal(false)
    } catch (err: any) {
      console.error('Failed to regenerate webhook token:', err)
      toast.error(err.message || 'Failed to regenerate token')
    } finally {
      setIsRegenerating(false)
    }
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const inputClasses = cn(
    'voxxy-input-frost w-full rounded-lg px-3 py-2 text-sm',
    'focus:ring-2 focus:ring-ring/40',
  )

  const innerGlassWell = cn('voxxy-surface-subtle rounded-lg p-3 shadow-sm')

  const sectionShell = cn('glass-card p-4 shadow-sm')

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header removed - now in Dashboard.tsx header */}

        {/* Help & Guide */}
        <div className={sectionShell}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-4 w-4 text-primary dark:text-violet-400" />
              <div>
                <span className="text-sm font-semibold text-foreground">Need Help?</span>
                <p className="text-xs text-muted-foreground">Take a guided tour of the dashboard</p>
              </div>
            </div>
            <button
              onClick={onStartGuide}
              className="voxxy-btn-cta flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Start Guide
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className={sectionShell}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-sm font-semibold text-foreground">Dashboard Appearance</span>
              <p className="text-xs text-muted-foreground">
                Switch between light and dark theme for your dashboard
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className={cn(sectionShell, 'space-y-6')}>
          {/* Profile Section */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <User className="h-4 w-4 text-primary dark:text-violet-400" />
              <div>
                <span className="text-sm font-semibold text-foreground">Profile</span>
                <p className="text-xs text-muted-foreground font-normal">Name, email, and bio</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-medium text-foreground/85 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Event Producer"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-foreground/85 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="producer@voxxy.co"
                    className={inputClasses}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="bio" className="block text-xs font-medium text-foreground/85 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Passionate about creating amazing community events"
                  rows={3}
                  className={`${inputClasses} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="border-t border-border dark:border-violet-500/25" />

          <div>
            <div className="flex items-center gap-3 mb-3">
              <User className="h-4 w-4 text-primary dark:text-violet-400" />
              <div>
                <span className="text-sm font-semibold text-foreground">Account Information</span>
                <p className="text-xs text-muted-foreground font-normal">
                  Account status and permissions
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={innerGlassWell}>
                  <label className="block text-xs font-medium text-foreground/85 mb-1">Role</label>
                  <p
                    className={`text-sm font-semibold ${
                      userProfile?.role === 'admin'
                        ? 'text-violet-700 dark:text-violet-400'
                        : userProfile?.role === 'venue_owner' || userProfile?.role === 'producer'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : userProfile?.role === 'vendor'
                            ? 'text-foreground'
                            : 'text-foreground'
                    }`}
                  >
                    {userProfile?.role?.toUpperCase() || 'N/A'}
                  </p>
                </div>
                <div className={innerGlassWell}>
                  <label className="block text-xs font-medium text-foreground/85 mb-1">
                    Payment Status
                  </label>
                  <p
                    className={`text-sm font-semibold ${
                      userProfile?.subscription_active
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-destructive'
                    }`}
                  >
                    {userProfile?.subscription_display_status || 'UNPAID'}
                  </p>
                </div>
                <div className={innerGlassWell}>
                  <label className="block text-xs font-medium text-foreground/85 mb-1">
                    Product Context
                  </label>
                  <p className="text-sm text-foreground font-semibold">
                    {userProfile?.product_context?.toUpperCase() || 'N/A'}
                  </p>
                </div>
              </div>
              <div className={innerGlassWell}>
                <label className="block text-xs font-medium text-foreground/85 mb-1">
                  Account Status
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userProfile?.confirmed_at && (
                    <span className="rounded border border-emerald-600/35 bg-emerald-500/10 px-2 py-1 font-mono text-xs text-emerald-700 dark:border-emerald-500/45 dark:text-emerald-400">
                      EMAIL_VERIFIED
                    </span>
                  )}
                  {!userProfile?.confirmed_at && (
                    <span className="px-2 py-1 rounded text-xs font-mono border border-border bg-muted text-muted-foreground">
                      EMAIL_UNVERIFIED
                    </span>
                  )}
                  {(userProfile?.role === 'venue_owner' || userProfile?.role === 'producer') &&
                    !userProfile?.subscription_active && (
                      <span className="px-2 py-1 rounded text-xs font-mono border border-destructive/40 bg-destructive/10 text-destructive">
                        PAYMENT_REQUIRED
                      </span>
                    )}
                  {userProfile?.role === 'admin' && (
                    <span className="rounded border border-violet-600/35 bg-violet-500/10 px-2 py-1 font-mono text-xs text-violet-700 dark:border-violet-500/40 dark:text-violet-400">
                      ADMIN_ACCESS
                    </span>
                  )}
                </div>
              </div>

              {/* Billing Management - Only for paid producers */}
              {(userProfile?.role === 'venue_owner' || userProfile?.role === 'producer') &&
                userProfile?.subscription_active && (
                  <div
                    className={cn(
                      'rounded-lg border border-border bg-gradient-to-br from-primary/[0.06] via-muted/40 to-accent/[0.08] p-4',
                      'dark:border-violet-400/45 dark:from-violet-950/50 dark:via-primary/15/35 dark:to-voxxy-pink/10 dark:backdrop-blur-sm',
                    )}
                  >
                    <div className="flex flex-1 items-start justify-between gap-4">
                      <div className="flex flex-1 items-start gap-3">
                        <div className={cn(innerGlassWell, 'p-2')}>
                          <CreditCard className="h-4 w-4 text-primary dark:text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground mb-1">
                            Subscription Active
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            You have an active Producer Monthly subscription ($80/month)
                          </p>
                          <button
                            onClick={handleManageBilling}
                            disabled={isLoadingBilling}
                            className="voxxy-btn-cta inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoadingBilling ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Opening...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3.5 h-3.5" />
                                Manage Billing
                                <ExternalLink className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-border pt-3 dark:border-violet-500/30">
                      <p className="text-[10px] text-muted-foreground">
                        Update payment method, view invoices, or cancel subscription
                      </p>
                    </div>
                  </div>
                )}

              {/* Password Reset - Only for verified accounts */}
              {userProfile?.confirmed_at && (
                <div
                  className={cn(
                    'rounded-lg border border-border bg-gradient-to-br from-primary/[0.06] via-muted/40 to-accent/[0.08] p-4',
                    'dark:border-violet-400/45 dark:from-violet-950/50 dark:via-primary/15/35 dark:to-voxxy-pink/10 dark:backdrop-blur-sm',
                  )}
                >
                  <div className="flex flex-1 items-start justify-between gap-4">
                    <div className="flex flex-1 items-start gap-3">
                      <div className={cn(innerGlassWell, 'p-2')}>
                        <Key className="h-4 w-4 text-primary dark:text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          Password Reset
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          Send a password reset link to {userProfile.email}
                        </p>
                        <button
                          onClick={() => setShowResetPasswordModal(true)}
                          className="voxxy-btn-cta inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Send Reset Email
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border pt-3 dark:border-violet-500/30">
                    <p className="text-[10px] text-muted-foreground">
                      You'll receive an email with instructions to reset your password
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organization Details Section */}
          {organization && (
            <>
              <div className="border-t border-border dark:border-violet-500/25" />

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-4 w-4 text-primary dark:text-violet-400" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      Organization Details
                    </span>
                    <p className="text-xs text-muted-foreground font-normal">
                      Name, description, timezone, and logo
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="orgName"
                        className="block text-xs font-medium text-foreground/85 mb-1"
                      >
                        Organization Name
                      </label>
                      <input
                        id="orgName"
                        type="text"
                        value={organizationData.name}
                        onChange={(e) => handleOrganizationChange('name', e.target.value)}
                        placeholder="Voxxy Events Co."
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="orgTimezone"
                        className="block text-xs font-medium text-foreground/85 mb-1"
                      >
                        Timezone
                      </label>
                      <select
                        id="orgTimezone"
                        value={organizationData.timezone}
                        onChange={(e) => handleOrganizationChange('timezone', e.target.value)}
                        className={`${inputClasses} cursor-pointer pr-9 bg-no-repeat bg-[length:12px_12px] bg-[right_0.75rem_center] [background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E")] dark:[background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 9L1 4h10z'/%3E%3C/svg%3E")]`}
                      >
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Phoenix">Arizona (MST)</option>
                        <option value="America/Anchorage">Alaska Time (AKT)</option>
                        <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="orgDescription"
                      className="block text-xs font-medium text-foreground/85 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="orgDescription"
                      value={organizationData.description}
                      onChange={(e) => handleOrganizationChange('description', e.target.value)}
                      placeholder="Tell us about your organization..."
                      rows={3}
                      className={`${inputClasses} resize-none`}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="orgLogo"
                      className="block text-xs font-medium text-foreground/85 mb-1"
                    >
                      Logo URL
                    </label>
                    <input
                      id="orgLogo"
                      type="url"
                      value={organizationData.logo_url}
                      onChange={(e) => handleOrganizationChange('logo_url', e.target.value)}
                      placeholder="https://yoursite.com/logo.png"
                      className={inputClasses}
                    />
                  </div>
                  {organization.verified !== undefined && (
                    <div className={innerGlassWell}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Verification Status:</span>
                        <span
                          className={`text-xs font-medium ${organization.verified ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}
                        >
                          {organization.verified ? '✓ Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Location Section */}
          {organization && (
            <>
              <div className="border-t border-border dark:border-violet-500/25" />

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="h-4 w-4 text-primary dark:text-violet-400" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">Location</span>
                    <p className="text-xs text-muted-foreground font-normal">Address and region</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="orgAddress"
                      className="block text-xs font-medium text-foreground/85 mb-1"
                    >
                      Street Address
                    </label>
                    <input
                      id="orgAddress"
                      type="text"
                      value={organizationData.address}
                      onChange={(e) => handleOrganizationChange('address', e.target.value)}
                      placeholder="123 Main Street"
                      className={inputClasses}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="orgCity"
                        className="block text-xs font-medium text-foreground/85 mb-1"
                      >
                        City
                      </label>
                      <input
                        id="orgCity"
                        type="text"
                        value={organizationData.city}
                        onChange={(e) => handleOrganizationChange('city', e.target.value)}
                        placeholder="San Francisco"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="orgState"
                        className="block text-xs font-medium text-foreground/85 mb-1"
                      >
                        State
                      </label>
                      <input
                        id="orgState"
                        type="text"
                        value={organizationData.state}
                        onChange={(e) => handleOrganizationChange('state', e.target.value)}
                        placeholder="CA"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="orgZip"
                        className="block text-xs font-medium text-foreground/85 mb-1"
                      >
                        Zip Code
                      </label>
                      <input
                        id="orgZip"
                        type="text"
                        value={organizationData.zip_code}
                        onChange={(e) => handleOrganizationChange('zip_code', e.target.value)}
                        placeholder="94103"
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Contact & Social Section */}
          {organization && (
            <>
              <div className="border-t border-border dark:border-violet-500/25" />

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="h-4 w-4 text-primary dark:text-violet-400" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">Contact & Social</span>
                    <p className="text-xs text-muted-foreground font-normal">
                      Website, social media, phone, and email
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="orgWebsite"
                        className="block text-xs font-medium text-foreground/85 mb-1"
                      >
                        Website
                      </label>
                      <input
                        id="orgWebsite"
                        type="url"
                        value={organizationData.website}
                        onChange={(e) => handleOrganizationChange('website', e.target.value)}
                        placeholder="https://yoursite.com"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="orgInstagram"
                        className="block text-xs font-medium text-foreground/85 mb-1"
                      >
                        Instagram Handle
                      </label>
                      <input
                        id="orgInstagram"
                        type="text"
                        value={organizationData.instagram_handle}
                        onChange={(e) =>
                          handleOrganizationChange('instagram_handle', e.target.value)
                        }
                        placeholder="@yourhandle"
                        className={inputClasses}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="orgEmail"
                        className="block text-xs font-medium text-foreground/85 mb-1"
                      >
                        Organization Email
                      </label>
                      <input
                        id="orgEmail"
                        type="email"
                        value={organizationData.email}
                        onChange={(e) => handleOrganizationChange('email', e.target.value)}
                        placeholder="contact@yourorg.com"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="orgPhone"
                        className="block text-xs font-medium text-foreground/85 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        id="orgPhone"
                        type="tel"
                        value={organizationData.phone}
                        onChange={(e) => handleOrganizationChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Webhook Integration Section */}
          {organization && webhookConfig && (
            <>
              <div className="border-t border-border dark:border-violet-500/25" />

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Webhook className="h-4 w-4 text-primary dark:text-violet-400" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      n8n Webhook Integration
                    </span>
                    <p className="text-xs text-muted-foreground font-normal">
                      Automatically sync Eventbrite payments via n8n workflows
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div
                    className={cn(
                      'rounded-lg border border-border bg-gradient-to-br from-primary/[0.06] via-muted/40 to-accent/[0.08] p-4',
                      'dark:border-violet-400/45 dark:from-violet-950/50 dark:via-primary/15/35 dark:to-voxxy-pink/10 dark:backdrop-blur-sm',
                    )}
                  >
                    <div className="flex flex-1 items-start justify-between gap-4 mb-3">
                      <div className="flex flex-1 items-start gap-3">
                        <div className={cn(innerGlassWell, 'p-2')}>
                          <Webhook className="h-4 w-4 text-primary dark:text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground mb-1">
                            Webhook URL
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Use this URL in your n8n HTTP Request node to send payment notifications
                          </p>
                          <div className={cn(innerGlassWell, 'mb-3')}>
                            <code className="text-xs text-foreground font-mono break-all">
                              {webhookConfig.webhook_url}
                            </code>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCopyWebhookUrl}
                              className="voxxy-btn-cta inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                            >
                              {copiedWebhook ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy URL
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setShowRegenerateModal(true)}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border border-border bg-muted text-foreground hover:bg-muted/80 transition-colors"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                              Regenerate Token
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border pt-3 dark:border-violet-500/30">
                      <p className="text-[10px] text-muted-foreground mb-2">
                        <strong>How to use:</strong> Copy this URL and paste it into your n8n HTTP
                        Request node. When Eventbrite payments are received, n8n will POST to this
                        endpoint to automatically mark registrations as paid.
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        <strong>⚠️ Warning:</strong> Regenerating the token will invalidate the old
                        URL immediately. Update your n8n workflow before regenerating.
                      </p>
                    </div>
                  </div>

                  {/* n8n Payload Template */}
                  <div
                    className={cn(
                      'rounded-lg border border-border bg-gradient-to-br from-primary/[0.06] via-muted/40 to-accent/[0.08] p-4',
                      'dark:border-violet-400/45 dark:from-violet-950/50 dark:via-primary/15/35 dark:to-voxxy-pink/10 dark:backdrop-blur-sm',
                    )}
                  >
                    <div className="flex flex-1 items-start justify-between gap-4 mb-3">
                      <div className="flex flex-1 items-start gap-3">
                        <div className={cn(innerGlassWell, 'p-2')}>
                          <Copy className="h-4 w-4 text-primary dark:text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground mb-1">
                            n8n Payload Template
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Universal payload template that works for all events - automatically
                            detects the correct event via Eventbrite Event ID
                          </p>
                          <div className={cn(innerGlassWell, 'mb-3 overflow-x-auto')}>
                            <pre className="text-[10px] text-foreground font-mono whitespace-pre">
                              {`{
  "eventbrite_event_id": "={{ $json.event.id }}",
  "application_code": "={{ $json.attendee.answers.application_code }}",
  "eventbrite_order_id": "={{ $json.order.id }}",
  "email": "={{ $json.attendee.profile.email }}",
  "first_name": "={{ $json.attendee.profile.first_name }}",
  "last_name": "={{ $json.attendee.profile.last_name }}",
  "payment_date": "={{ $json.order.created }}",
  "payment_amount": "={{ $json.order.costs.gross.value }}",
  "currency": "={{ $json.order.costs.gross.currency }}",
  "ticket_type": "={{ $json.attendee.ticket_class_name }}"
}`}
                            </pre>
                          </div>
                          <button
                            onClick={handleCopyN8nPayload}
                            className="voxxy-btn-cta inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                          >
                            {copiedPayload ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy Template
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border pt-3 dark:border-violet-500/30">
                      <p className="text-[10px] text-muted-foreground mb-2">
                        <strong>✨ Auto-Detection:</strong> This template automatically detects
                        which Voxxy event to use based on the Eventbrite Event ID. No need to
                        configure anything per-event!
                      </p>
                      <p className="text-[10px] text-muted-foreground mb-2">
                        <strong>How it works:</strong> When you add an Eventbrite payment link to a
                        vendor category in Event Settings, we automatically extract and store the
                        Eventbrite Event ID. When n8n sends this payload, we match it to the correct
                        Voxxy event.
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        <strong>Setup:</strong> Paste this template into your n8n HTTP Request
                        node's Body (JSON format). Configure your workflow once, then reuse it for
                        all future events!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="px-4 py-2 text-sm rounded-lg voxxy-btn-cta font-semibold hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Data Export */}
        {organization && (
          <FullDataExportSection
            organizationId={organization.id}
            organizationSlug={organization.slug}
          />
        )}

        {/* Danger Zone */}
        <div className="rounded-lg border border-destructive/40 bg-card dark:bg-card/90 p-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm text-foreground font-semibold mb-0.5">Danger Zone</h3>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
          </div>

          {showDeleteWarning && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 mb-3">
              <p className="text-xs text-destructive">
                <strong className="font-semibold">Warning:</strong> This action cannot be undone.
                All your events, contacts, and data will be permanently deleted.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (showDeleteWarning) {
                  handleDeleteAccount()
                } else {
                  setShowDeleteWarning(true)
                }
              }}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-destructive-foreground font-medium transition-all hover:shadow-lg hover:shadow-red-500/25"
            >
              Delete My Account
            </button>

            {showDeleteWarning && (
              <button
                onClick={() => setShowDeleteWarning(false)}
                className="px-4 py-2 text-sm rounded-lg border border-border bg-muted text-foreground hover:bg-muted/80 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Password Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetPasswordModal}
        onClose={handleCloseResetModal}
        onConfirm={handleResetPassword}
        title={emailSent ? 'Email Sent!' : 'Send Password Reset Email?'}
        description={
          emailSent
            ? `We've sent a password reset link to ${userProfile?.email}. Check your inbox and follow the instructions. Didn't receive it? You can resend in a moment.`
            : `We'll send a password reset link to ${userProfile?.email}. Check your inbox and follow the instructions to reset your password.`
        }
        confirmText={
          emailSent
            ? resendDisabled
              ? 'Email Sent - Wait 30s...'
              : 'Resend Email'
            : 'Send Reset Email'
        }
        cancelText={emailSent ? 'Close' : 'Cancel'}
        isDestructive={false}
        isLoading={isResettingPassword || (emailSent && resendDisabled)}
      />

      {/* Regenerate Webhook Token Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        onConfirm={handleRegenerateWebhookToken}
        title="Regenerate Webhook Token?"
        description="This will generate a new webhook URL and immediately invalidate the old one. Make sure to update your n8n workflow with the new URL after regenerating, or your payment sync will stop working."
        confirmText="Regenerate Token"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isRegenerating}
      />
    </div>
  )
}
