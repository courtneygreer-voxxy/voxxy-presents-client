import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Save,
  Bell,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Globe,
  Eye,
  EyeOff,
  Trash2,
  Download
} from 'lucide-react'
import type { Venue } from '@/types/venue'

interface VenueOwnerSettingsProps {
  venue: Venue
  onUpdate: (updatedVenue: Venue) => void
}

export function VenueOwnerSettings({ venue, onUpdate }: VenueOwnerSettingsProps) {
  const [notifications, setNotifications] = useState({
    emailNewRequests: true,
    emailApprovals: true,
    emailReminders: false,
    smsUrgent: false,
    weeklyReports: true,
    marketingEmails: false
  })

  const [bookingSettings, setBookingSettings] = useState({
    autoApproval: false,
    requireDeposit: true,
    advanceBookingDays: 30,
    cancellationPolicy: 'flexible',
    minBookingHours: 2,
    maxBookingHours: 12
  })

  const [publicProfile, setPublicProfile] = useState({
    isPubliclyVisible: true,
    showContactInfo: false,
    showPricing: true,
    allowDirectBooking: false,
    instantBooking: false
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('notifications')

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      console.log('Saving venue settings:', {
        notifications,
        bookingSettings,
        publicProfile
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveMessage('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      // TODO: Replace with actual API call
      console.log('Exporting venue data')

      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSaveMessage('Data export will be emailed to you shortly.')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error exporting data:', error)
      setSaveMessage('Failed to export data. Please try again.')
    }
  }

  const handleDeleteVenue = async () => {
    if (!window.confirm('Are you sure you want to delete this venue? This action cannot be undone.')) {
      return
    }

    try {
      // TODO: Replace with actual API call
      console.log('Deleting venue:', venue.id)

      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would redirect to a "venue deleted" page
      setSaveMessage('Venue deletion request submitted for review.')
    } catch (error) {
      console.error('Error deleting venue:', error)
      setSaveMessage('Failed to delete venue. Please contact support.')
    }
  }

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'booking', label: 'Booking Settings', icon: Calendar },
    { id: 'profile', label: 'Public Profile', icon: Globe },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'data', label: 'Data & Export', icon: Download }
  ]

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {saveMessage && (
        <Alert className={`${saveMessage.includes('successfully') || saveMessage.includes('emailed') ? 'bg-green-400/10 border-green-400/30' : 'bg-red-400/10 border-red-400/30'}`}>
          <AlertDescription className={saveMessage.includes('successfully') || saveMessage.includes('emailed') ? 'text-green-300' : 'text-red-300'}>
            {saveMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </h3>
            <nav className="space-y-2">
              {sections.map(section => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      activeSection === section.id
                        ? 'bg-purple-600/50 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </h2>
                    <p className="text-gray-300 mt-1">Manage how you receive updates about your venue</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">New booking requests</Label>
                          <p className="text-gray-400 text-sm">Get notified when someone requests to book your venue</p>
                        </div>
                        <Switch
                          checked={notifications.emailNewRequests}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNewRequests: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Booking approvals and changes</Label>
                          <p className="text-gray-400 text-sm">Updates about approved, cancelled, or modified bookings</p>
                        </div>
                        <Switch
                          checked={notifications.emailApprovals}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailApprovals: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Event reminders</Label>
                          <p className="text-gray-400 text-sm">Reminders about upcoming events at your venue</p>
                        </div>
                        <Switch
                          checked={notifications.emailReminders}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailReminders: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Weekly reports</Label>
                          <p className="text-gray-400 text-sm">Summary of bookings, revenue, and activity</p>
                        </div>
                        <Switch
                          checked={notifications.weeklyReports}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      SMS Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Urgent notifications only</Label>
                          <p className="text-gray-400 text-sm">Last-minute cancellations and time-sensitive updates</p>
                        </div>
                        <Switch
                          checked={notifications.smsUrgent}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsUrgent: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Settings */}
            {activeSection === 'booking' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Settings
                  </h2>
                  <p className="text-gray-300 mt-1">Configure how bookings work for your venue</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Approval Process</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Auto-approve qualified requests</Label>
                          <p className="text-gray-400 text-sm">Automatically approve requests that meet your criteria</p>
                        </div>
                        <Switch
                          checked={bookingSettings.autoApproval}
                          onCheckedChange={(checked) => setBookingSettings(prev => ({ ...prev, autoApproval: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Require deposit</Label>
                          <p className="text-gray-400 text-sm">Require a deposit to confirm bookings</p>
                        </div>
                        <Switch
                          checked={bookingSettings.requireDeposit}
                          onCheckedChange={(checked) => setBookingSettings(prev => ({ ...prev, requireDeposit: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Booking Limits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Advance booking (days)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          value={bookingSettings.advanceBookingDays}
                          onChange={(e) => setBookingSettings(prev => ({ ...prev, advanceBookingDays: parseInt(e.target.value) || 30 }))}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
                        />
                        <p className="text-gray-400 text-sm mt-1">How far in advance people can book</p>
                      </div>
                      <div>
                        <Label className="text-white">Cancellation policy</Label>
                        <Select value={bookingSettings.cancellationPolicy} onValueChange={(value) => setBookingSettings(prev => ({ ...prev, cancellationPolicy: value }))}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="flexible" className="text-white hover:bg-gray-700">Flexible (24h notice)</SelectItem>
                            <SelectItem value="moderate" className="text-white hover:bg-gray-700">Moderate (7 days notice)</SelectItem>
                            <SelectItem value="strict" className="text-white hover:bg-gray-700">Strict (30 days notice)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Minimum booking (hours)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="24"
                          value={bookingSettings.minBookingHours}
                          onChange={(e) => setBookingSettings(prev => ({ ...prev, minBookingHours: parseInt(e.target.value) || 2 }))}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Maximum booking (hours)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="168"
                          value={bookingSettings.maxBookingHours}
                          onChange={(e) => setBookingSettings(prev => ({ ...prev, maxBookingHours: parseInt(e.target.value) || 12 }))}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Public Profile Settings */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Public Profile Settings
                  </h2>
                  <p className="text-gray-300 mt-1">Control how your venue appears to the public</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Visibility</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Public venue listing</Label>
                          <p className="text-gray-400 text-sm">Show your venue in public search results</p>
                        </div>
                        <Switch
                          checked={publicProfile.isPubliclyVisible}
                          onCheckedChange={(checked) => setPublicProfile(prev => ({ ...prev, isPubliclyVisible: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Show contact information</Label>
                          <p className="text-gray-400 text-sm">Display your contact details on public profile</p>
                        </div>
                        <Switch
                          checked={publicProfile.showContactInfo}
                          onCheckedChange={(checked) => setPublicProfile(prev => ({ ...prev, showContactInfo: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Show pricing information</Label>
                          <p className="text-gray-400 text-sm">Display your rates on public profile</p>
                        </div>
                        <Switch
                          checked={publicProfile.showPricing}
                          onCheckedChange={(checked) => setPublicProfile(prev => ({ ...prev, showPricing: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Booking Options</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Allow direct booking requests</Label>
                          <p className="text-gray-400 text-sm">Let people submit booking requests from your public profile</p>
                        </div>
                        <Switch
                          checked={publicProfile.allowDirectBooking}
                          onCheckedChange={(checked) => setPublicProfile(prev => ({ ...prev, allowDirectBooking: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Instant booking</Label>
                          <p className="text-gray-400 text-sm">Allow immediate booking confirmation for qualified requests</p>
                        </div>
                        <Switch
                          checked={publicProfile.instantBooking}
                          onCheckedChange={(checked) => setPublicProfile(prev => ({ ...prev, instantBooking: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-blue-400/10 border-blue-400/30">
                    <Globe className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-gray-300">
                      Your public profile URL: <span className="text-blue-400">voxxy.com/venues/{venue.slug}</span>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {/* Security & Privacy Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Privacy
                  </h2>
                  <p className="text-gray-300 mt-1">Manage your account security and data privacy</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Account Security</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Two-factor authentication</Label>
                          <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          Enable 2FA
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Password</Label>
                          <p className="text-gray-400 text-sm">Change your account password</p>
                        </div>
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Data Privacy</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Analytics and performance tracking</Label>
                          <p className="text-gray-400 text-sm">Help us improve the platform with usage analytics</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Marketing communications</Label>
                          <p className="text-gray-400 text-sm">Receive updates about new features and promotions</p>
                        </div>
                        <Switch
                          checked={notifications.marketingEmails}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketingEmails: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing & Payments Settings */}
            {activeSection === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Payments
                  </h2>
                  <p className="text-gray-300 mt-1">Manage your subscription and payment methods</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Current Plan</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-600/80 text-white">Pro Plan</Badge>
                          <span className="text-white font-medium">$29/month</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">Unlimited events, advanced analytics, priority support</p>
                      </div>
                      <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        Manage Plan
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Payment Method</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">•••• •••• •••• 4242</p>
                        <p className="text-gray-400 text-sm">Expires 12/26</p>
                      </div>
                      <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        Update Card
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Billing History</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-white text-sm">Pro Plan - December 2024</p>
                          <p className="text-gray-400 text-xs">Paid on Dec 1, 2024</p>
                        </div>
                        <span className="text-green-400 text-sm">$29.00</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-white text-sm">Pro Plan - November 2024</p>
                          <p className="text-gray-400 text-xs">Paid on Nov 1, 2024</p>
                        </div>
                        <span className="text-green-400 text-sm">$29.00</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                      View All Invoices
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Export Settings */}
            {activeSection === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Data & Export
                  </h2>
                  <p className="text-gray-300 mt-1">Manage your venue data and account</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Data Export</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Export venue data</Label>
                          <p className="text-gray-400 text-sm">Download all your venue information, bookings, and analytics</p>
                        </div>
                        <Button
                          onClick={handleExportData}
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4">
                    <h3 className="font-medium text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Danger Zone
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Delete venue</Label>
                          <p className="text-gray-400 text-sm">Permanently delete this venue and all associated data</p>
                        </div>
                        <Button
                          onClick={handleDeleteVenue}
                          variant="outline"
                          className="bg-red-600/20 border-red-400/30 text-red-400 hover:bg-red-600/30"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Venue
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-white/20">
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}