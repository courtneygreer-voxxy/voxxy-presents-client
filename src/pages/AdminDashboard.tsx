import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Shield, Building2, Store, Menu, X, LogOut, Mail, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/services/api";
import SettingsPage from './SettingsPage';
import EmailTestingPanel from '@/components/admin/EmailTestingPanel';

type NavItem = 'dashboard' | 'emails' | 'settings';

interface User {
  id: number
  email: string
  name: string
  role: 'consumer' | 'vendor' | 'venue_owner' | 'admin' | 'producer' | 'guest'
  status?: 'active' | 'suspended' | 'banned'
  confirmed_at: string | null
  created_at?: string
}

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userProfile, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const allUsers = await adminApi.getAllUsers();

      console.log('📥 Raw user data from API:', allUsers.slice(0, 3));

      // Filter to only show Voxxy Presents users (vendors and venue_owners/producers)
      const presentsUsers = allUsers.filter((user: User) => {
        if (!user.role) {
          return true;
        }
        return user.role === 'vendor' || user.role === 'venue_owner' || user.role === 'producer';
      });

      setUsers(presentsUsers);
      console.log(`✅ Loaded ${presentsUsers.length} users (filtered from ${allUsers.length} total)`);
    } catch (err) {
      console.error('❌ Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    if (!role) return 'bg-gray-500/20 border-gray-400/30 text-gray-300';
    switch (role) {
      case 'venue_owner':
      case 'producer':
        return 'bg-green-500/20 border-green-400/30 text-green-300';
      case 'vendor':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-300';
      case 'consumer':
        return 'bg-amber-500/20 border-amber-400/30 text-amber-300';
      case 'admin':
        return 'bg-purple-500/20 border-purple-400/30 text-purple-300';
      default:
        return 'bg-gray-500/20 border-gray-400/30 text-gray-300';
    }
  };

  const getRoleIcon = (role?: string) => {
    if (!role) return <Users className="h-4 w-4" />;
    switch (role) {
      case 'venue_owner':
      case 'producer':
        return <Building2 className="h-4 w-4" />;
      case 'vendor':
        return <Store className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getDisplayRole = (role?: string) => {
    if (!role) return 'No Role';
    switch (role) {
      case 'venue_owner':
        return 'Producer';
      case 'producer':
        return 'Producer';
      case 'vendor':
        return 'Vendor';
      case 'consumer':
        return 'Consumer';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const navItems = [
    { id: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'emails' as NavItem, label: 'Emails', icon: Mail },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#1a0d2e] overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        w-[220px]
        bg-[#0f0820] flex flex-col transition-all duration-300
        fixed lg:relative inset-y-0 left-0 z-50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-3xl font-bold text-white tracking-wider block mb-2">VOXXY</span>
              <p className="text-sm text-white/60">Admin</p>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-white/70 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Sign Out */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userProfile?.name || userProfile?.email}
              </p>
              <p className="text-xs text-white/60">Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Top Navbar */}
        <header className="h-14 bg-[#0f0820] border-b border-white/10 flex items-center px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-white/70 hover:text-white mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h2 className="text-white font-medium">
            {userProfile?.name || 'Admin Dashboard'}
          </h2>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {activeNav === 'settings' ? (
            <SettingsPage onBack={() => setActiveNav('dashboard')} />
          ) : activeNav === 'emails' ? (
            <EmailTestingPanel />
          ) : (
            <div className="p-4 lg:p-6">
              <div className="max-w-6xl mx-auto space-y-4 lg:space-y-6">
                {/* Header Section */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 lg:p-6">
                  <div className="flex items-center gap-3 lg:gap-4 mb-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-purple-300" />
                    </div>
                    <div>
                      <h1 className="text-xl lg:text-2xl font-bold text-white">Voxxy Presents Users</h1>
                      <p className="text-sm lg:text-base text-gray-300">Manage vendors and producers</p>
                    </div>
                  </div>

                  {userProfile?.email && (
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                      <p className="text-sm text-gray-300">
                        <strong className="text-white">Logged in as:</strong> {userProfile.email}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        <strong className="text-white">Role:</strong> Admin
                      </p>
                    </div>
                  )}
                </div>

                {/* Users Table Section */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 lg:mb-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-white">
                      All Users ({users.length})
                    </h3>
                    <Button
                      onClick={loadUsers}
                      variant="outline"
                      size="sm"
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15"
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Refresh'}
                    </Button>
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-300">Loading users...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300">No Voxxy Presents users found</p>
                    </div>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left px-3 lg:px-4 py-3 text-xs lg:text-sm font-semibold text-white">Name</th>
                              <th className="text-left px-3 lg:px-4 py-3 text-xs lg:text-sm font-semibold text-white">Email</th>
                              <th className="text-left px-3 lg:px-4 py-3 text-xs lg:text-sm font-semibold text-white">Role</th>
                              <th className="text-left px-3 lg:px-4 py-3 text-xs lg:text-sm font-semibold text-white">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm text-gray-200">
                                  {user.name || 'No name'}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm text-gray-200">
                                  {user.email}
                                </td>
                                <td className="px-3 lg:px-4 py-3">
                                  <Badge className={`${getRoleBadgeColor(user.role)} text-xs flex items-center gap-1 w-fit`}>
                                    {getRoleIcon(user.role)}
                                    {getDisplayRole(user.role)}
                                  </Badge>
                                </td>
                                <td className="px-3 lg:px-4 py-3">
                                  <Badge
                                    variant={user.confirmed_at ? "default" : "outline"}
                                    className={
                                      user.confirmed_at
                                        ? "bg-green-500/20 border-green-400/30 text-green-300 text-xs"
                                        : "bg-yellow-500/20 border-yellow-400/30 text-yellow-300 text-xs"
                                    }
                                  >
                                    {user.confirmed_at ? 'Verified' : 'Unverified'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
