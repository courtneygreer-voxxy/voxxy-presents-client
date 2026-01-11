import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, organizationsApi } from '@/services/api';
import { AlertTriangle } from 'lucide-react';

interface SettingsPageProps {
  onBack?: () => void;
}

interface Organization {
  id: number;
  slug: string;
  name: string;
  user_id: number;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { userProfile, refreshUserProfile } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: userProfile?.name || '',
    email: userProfile?.email || '',
    companyName: '',
    bio: '',
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
          // Update companyName with organization name
          setProfileData(prev => ({
            ...prev,
            companyName: userOrg.name || '',
          }));
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

      // Update organization if exists and name changed
      if (organization && profileData.companyName && profileData.companyName !== organization.name) {
        console.log('🔵 [Settings] Updating organization name to:', profileData.companyName);
        await organizationsApi.update(organization.slug, {
          name: profileData.companyName,
        });
        console.log('✅ [Settings] Organization updated');
      }

      // Refresh the user profile to get updated data
      console.log('🔵 [Settings] Refreshing user profile...');
      await refreshUserProfile();
      console.log('🔵 [Settings] User profile refreshed');

      alert('Profile and organization updated successfully! Check the sidebar.');
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-sm text-white/60">Manage your account and preferences</p>
        </div>

        {/* Profile Information Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Profile Information</h2>
            <p className="text-sm text-white/60">Update your account details</p>
          </div>

          <div className="space-y-5">
            {/* Full Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm text-white/70 font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Event Producer"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/15 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm text-white/70 font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="producer@voxxy.co"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm text-white/70 font-medium mb-2">
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                value={profileData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Voxxy Events Co."
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/15 transition-all"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm text-white/70 font-medium mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Passionate about creating amazing community events"
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/15 transition-all resize-none"
              />
            </div>

            {/* Save Changes Button */}
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 mt-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Notifications</h2>
            <p className="text-sm text-white/60">Manage how you receive updates</p>
          </div>

          <div className="space-y-4">
            {/* New Applications */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <div>
                <h3 className="text-sm text-white font-medium mb-1">New Applications</h3>
                <p className="text-xs text-white/60">Get notified when vendors apply to your events</p>
              </div>
              <button
                onClick={() => toggleNotification('newApplications')}
                className={`relative w-14 h-7 rounded-full transition-all ${
                  notifications.newApplications ? 'bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg shadow-purple-500/30' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    notifications.newApplications ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Event Reminders */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <div>
                <h3 className="text-sm text-white font-medium mb-1">Event Reminders</h3>
                <p className="text-xs text-white/60">Receive reminders for upcoming events</p>
              </div>
              <button
                onClick={() => toggleNotification('eventReminders')}
                className={`relative w-14 h-7 rounded-full transition-all ${
                  notifications.eventReminders ? 'bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg shadow-purple-500/30' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    notifications.eventReminders ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Marketing Emails */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <div>
                <h3 className="text-sm text-white font-medium mb-1">Marketing Emails</h3>
                <p className="text-xs text-white/60">Updates about new features and tips</p>
              </div>
              <button
                onClick={() => toggleNotification('marketingEmails')}
                className={`relative w-14 h-7 rounded-full transition-all ${
                  notifications.marketingEmails ? 'bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg shadow-purple-500/30' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    notifications.marketingEmails ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="bg-gradient-to-br from-red-600/10 to-red-700/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-red-500/30 mt-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base text-white font-semibold mb-1">Danger Zone</h3>
              <p className="text-sm text-white/70">
                Permanently delete your account and all associated data
              </p>
            </div>
          </div>

          {showDeleteWarning && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4">
              <p className="text-red-300 text-sm">
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
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all hover:shadow-lg hover:shadow-red-500/25"
            >
              Delete My Account
            </button>

            {showDeleteWarning && (
              <button
                onClick={() => setShowDeleteWarning(false)}
                className="px-6 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all"
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
