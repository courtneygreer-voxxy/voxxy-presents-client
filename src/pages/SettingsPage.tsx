import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

interface SettingsPageProps {
  onBack?: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { userProfile } = useAuth();

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: userProfile?.name || '',
    email: userProfile?.email || '',
    companyName: '',
    bio: '',
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    newApplications: true,
    eventReminders: true,
    marketingEmails: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save to API
      console.log('Saving profile:', profileData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save changes. Please try again.');
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
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/60">Manage your account and preferences 🎨</p>
        </div>

        {/* Profile Information Section */}
        <div className="bg-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Profile Information</h2>
            <p className="text-white/60 text-sm">Update your account details</p>
          </div>

          <div className="space-y-6">
            {/* Full Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-white/90 font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Event Producer"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-white/90 font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="producer@voxxy.co"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-white/90 font-medium mb-2">
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                value={profileData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Voxxy Events Co."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-white/90 font-medium mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Passionate about creating amazing community events"
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Save Changes Button */}
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Notifications</h2>
            <p className="text-white/60 text-sm">Manage how you receive updates</p>
          </div>

          <div className="space-y-4">
            {/* New Applications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-1">New Applications</h3>
                <p className="text-white/60 text-sm">Get notified when vendors apply to your events</p>
              </div>
              <button
                onClick={() => toggleNotification('newApplications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.newApplications ? 'bg-gradient-to-r from-purple-600 to-blue-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.newApplications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Event Reminders */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-1">Event Reminders</h3>
                <p className="text-white/60 text-sm">Receive reminders for upcoming events</p>
              </div>
              <button
                onClick={() => toggleNotification('eventReminders')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.eventReminders ? 'bg-gradient-to-r from-purple-600 to-blue-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.eventReminders ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Marketing Emails */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-1">Marketing Emails</h3>
                <p className="text-white/60 text-sm">Updates about new features and tips</p>
              </div>
              <button
                onClick={() => toggleNotification('marketingEmails')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.marketingEmails ? 'bg-gradient-to-r from-purple-600 to-blue-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.marketingEmails ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="bg-white/5 rounded-2xl p-6 lg:p-8 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">Danger Zone</h3>
              <p className="text-white/60 text-sm">
                Permanently delete your account and all associated data
              </p>
            </div>
          </div>

          {showDeleteWarning && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm font-medium">
                <strong>Warning:</strong> This action cannot be undone. All your events, contacts, and data will be permanently deleted.
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (showDeleteWarning) {
                handleDeleteAccount();
              } else {
                setShowDeleteWarning(true);
              }
            }}
            className="w-full px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all"
          >
            Delete My Account
          </button>

          {showDeleteWarning && (
            <button
              onClick={() => setShowDeleteWarning(false)}
              className="w-full px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
