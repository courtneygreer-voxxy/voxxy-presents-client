import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, organizationsApi } from '@/services/api';
import { AlertTriangle } from 'lucide-react';
import { EventbriteConnection } from '@/components/producer/PaymentIntegrations';

interface SettingsPageProps {
  onBack?: () => void;
}

interface Organization {
  id: number;
  slug: string;
  name: string;
  user_id: number;
  timezone?: string;
  description?: string;
  logo_url?: string;
  contact?: {
    website?: string;
    instagram?: string;
    phone?: string;
    email?: string;
  };
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  verified?: boolean;
}

type SettingsSubTab = 'organization' | 'integrations' | 'notifications';

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { userProfile, refreshUserProfile } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('organization');

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: userProfile?.name || '',
    email: userProfile?.email || '',
    bio: '',
  });

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
  });

  // Fetch user's organization
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!userProfile?.id) return;

      try {
        setLoadingOrg(true);
        const orgs = await organizationsApi.getAll();
        const userOrg = orgs.find((org: Organization) => org.user_id === userProfile.id);

        if (userOrg) {
          setOrganization(userOrg);
          // Populate organization form with fetched data (extract from nested structure)
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
          });
        }
      } catch (err) {
        console.error('Failed to fetch organization:', err);
      } finally {
        setLoadingOrg(false);
      }
    };

    fetchOrganization();
  }, [userProfile]);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    newApplications: true,
    eventReminders: true,
    marketingEmails: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const handleSaveChanges = async () => {
    if (!userProfile?.id) {
      alert('User profile not loaded');
      return;
    }

    setIsSaving(true);
    try {
      console.log('🔵 [Settings] Current profile before update:', userProfile);
      console.log('🔵 [Settings] Current organization:', organization);
      console.log('🔵 [Settings] Saving profile data:', profileData);

      // Update user profile via API
      const userPayload = {
        name: profileData.fullName,
        email: profileData.email,
      };
      console.log('🔵 [Settings] Updating user with:', userPayload);
      await authApi.updateUser(userProfile.id, userPayload);

      // Update organization if exists
      if (organization) {
        console.log('🔵 [Settings] Updating organization:', organizationData);
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
        });
        console.log('✅ [Settings] Organization updated');
      }

      // Refresh the user profile to get updated data
      console.log('🔵 [Settings] Refreshing user profile...');
      await refreshUserProfile();
      console.log('🔵 [Settings] User profile refreshed');

      alert('Profile and organization information updated successfully!');
    } catch (error: any) {
      console.error('❌ [Settings] Failed to save profile:', error);
      alert(`Failed to save changes: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement delete account API call
      alert('Account deletion will be available soon. Please contact support to delete your account.');
      setShowDeleteWarning(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleOrganizationChange = (field: string, value: string) => {
    setOrganizationData(prev => ({ ...prev, [field]: value }));
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  const inputClasses = "w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/15 transition-all";

  const subTabs: { id: SettingsSubTab; label: string }[] = [
    { id: 'organization', label: 'Organization' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-white mb-1">Settings</h1>
          <p className="text-xs text-white/60">Manage your account and preferences</p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-all relative ${
                activeSubTab === tab.id ? 'text-white' : 'text-white/60 hover:text-white/80'
              }`}
            >
              {tab.label}
              {activeSubTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-500" />
              )}
            </button>
          ))}
        </div>

        {/* Organization Tab */}
        {activeSubTab === 'organization' && (
          <>
            {/* Profile Information */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white mb-0.5">Profile Information</h2>
                <p className="text-xs text-white/60">Update your account details</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-xs text-white/60 mb-1">
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
                    <label htmlFor="email" className="block text-xs text-white/60 mb-1">
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
                  <label htmlFor="bio" className="block text-xs text-white/60 mb-1">
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

            {/* Organization Information */}
            {organization && (
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-white mb-0.5">Organization Information</h2>
                  <p className="text-xs text-white/60">Manage your organization profile and contact details</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="orgName" className="block text-xs text-white/60 mb-1">
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
                      <label htmlFor="orgTimezone" className="block text-xs text-white/60 mb-1">
                        Timezone
                      </label>
                      <select
                        id="orgTimezone"
                        value={organizationData.timezone}
                        onChange={(e) => handleOrganizationChange('timezone', e.target.value)}
                        className={`${inputClasses} appearance-none cursor-pointer`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' fill-opacity='0.6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
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
                    <label htmlFor="orgDescription" className="block text-xs text-white/60 mb-1">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="orgWebsite" className="block text-xs text-white/60 mb-1">
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
                      <label htmlFor="orgInstagram" className="block text-xs text-white/60 mb-1">
                        Instagram Handle
                      </label>
                      <input
                        id="orgInstagram"
                        type="text"
                        value={organizationData.instagram_handle}
                        onChange={(e) => handleOrganizationChange('instagram_handle', e.target.value)}
                        placeholder="@yourhandle"
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="orgLogo" className="block text-xs text-white/60 mb-1">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="orgEmail" className="block text-xs text-white/60 mb-1">
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
                      <label htmlFor="orgPhone" className="block text-xs text-white/60 mb-1">
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

                  <div>
                    <label htmlFor="orgAddress" className="block text-xs text-white/60 mb-1">
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
                      <label htmlFor="orgCity" className="block text-xs text-white/60 mb-1">
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
                      <label htmlFor="orgState" className="block text-xs text-white/60 mb-1">
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
                      <label htmlFor="orgZip" className="block text-xs text-white/60 mb-1">
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

                  {/* Verification Status (Read-only) */}
                  {organization.verified !== undefined && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/70">Verification Status:</span>
                        <span className={`text-xs font-medium ${organization.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                          {organization.verified ? '✓ Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}

        {/* Integrations Tab */}
        {activeSubTab === 'integrations' && organization && (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white mb-0.5">Integrations</h2>
              <p className="text-xs text-white/60">Connect external services to sync data</p>
            </div>

            <EventbriteConnection
              organizationId={organization.id}
              onConnectionChange={(connected) => {
                console.log('Eventbrite connection changed:', connected);
              }}
            />
          </div>
        )}

        {activeSubTab === 'integrations' && !organization && !loadingOrg && (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <p className="text-xs text-white/60">Create an organization to manage integrations.</p>
          </div>
        )}

        {/* Notifications Tab */}
        {activeSubTab === 'notifications' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white mb-0.5">Notifications</h2>
              <p className="text-xs text-white/60">Manage how you receive updates</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <div>
                  <h3 className="text-sm text-white font-medium mb-0.5">New Applications</h3>
                  <p className="text-xs text-white/60">Get notified when vendors apply to your events</p>
                </div>
                <button
                  onClick={() => toggleNotification('newApplications')}
                  className={`relative w-11 h-6 rounded-full transition-all ${
                    notifications.newApplications ? 'bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg shadow-purple-500/30' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      notifications.newApplications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <div>
                  <h3 className="text-sm text-white font-medium mb-0.5">Event Reminders</h3>
                  <p className="text-xs text-white/60">Receive reminders for upcoming events</p>
                </div>
                <button
                  onClick={() => toggleNotification('eventReminders')}
                  className={`relative w-11 h-6 rounded-full transition-all ${
                    notifications.eventReminders ? 'bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg shadow-purple-500/30' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      notifications.eventReminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <div>
                  <h3 className="text-sm text-white font-medium mb-0.5">Marketing Emails</h3>
                  <p className="text-xs text-white/60">Updates about new features and tips</p>
                </div>
                <button
                  onClick={() => toggleNotification('marketingEmails')}
                  className={`relative w-11 h-6 rounded-full transition-all ${
                    notifications.marketingEmails ? 'bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg shadow-purple-500/30' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      notifications.marketingEmails ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone - Always visible */}
        <div className="bg-gradient-to-br from-red-600/10 to-red-700/10 backdrop-blur-sm rounded-lg p-4 border border-red-500/30">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm text-white font-semibold mb-0.5">Danger Zone</h3>
              <p className="text-xs text-white/70">
                Permanently delete your account and all associated data
              </p>
            </div>
          </div>

          {showDeleteWarning && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-3">
              <p className="text-red-300 text-xs">
                <strong className="font-semibold">Warning:</strong> This action cannot be undone. All your events, contacts, and data will be permanently deleted.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (showDeleteWarning) {
                  handleDeleteAccount();
                } else {
                  setShowDeleteWarning(true);
                }
              }}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all hover:shadow-lg hover:shadow-red-500/25"
            >
              Delete My Account
            </button>

            {showDeleteWarning && (
              <button
                onClick={() => setShowDeleteWarning(false)}
                className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
