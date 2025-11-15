import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Settings, Store, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SettingsPage from './SettingsPage';

type NavItem = 'events' | 'network' | 'settings';

export default function VendorDashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>('events');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userProfile, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const navItems = [
    { id: 'events' as NavItem, label: 'Events', icon: Calendar },
    { id: 'network' as NavItem, label: 'Network', icon: Users },
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
              <img src="/PresentsHeader2.svg" alt="Voxxy Presents" className="h-20 mb-2" />
              <p className="text-sm text-white/60">Vendor</p>
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
            {userProfile?.name || 'Vendor Dashboard'}
          </h2>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {activeNav === 'settings' ? (
            <SettingsPage onBack={() => setActiveNav('events')} />
          ) : (
            <div className="p-4 lg:p-6">
              {/* Empty for now - content will be added later */}
              <div className="text-white/40 text-center mt-20">
                <p className="text-base lg:text-lg">Dashboard content coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
