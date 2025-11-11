import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type NavItem = 'events' | 'network' | 'settings';

export default function ProducerDashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>('events');
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { id: 'events' as NavItem, label: 'Events', icon: Calendar },
    { id: 'network' as NavItem, label: 'Network', icon: Users },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#1a0d2e] overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-[220px] bg-[#0f0820] flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <img src="/PresentsHeader2.svg" alt="Voxxy Presents" className="h-20 mb-2" />
          <p className="text-sm text-white/60">Event Producer</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
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

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userProfile?.name?.charAt(0)?.toUpperCase() || 'P'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userProfile?.name || 'Producer'}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-white/60">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-14 bg-[#0f0820] border-b border-white/10 flex items-center px-6">
          <h2 className="text-white font-medium">
            {userProfile?.name || 'Producer Dashboard'}
          </h2>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Empty for now - content will be added later */}
          <div className="text-white/40 text-center mt-20">
            <p className="text-lg">Dashboard content coming soon...</p>
          </div>
        </main>
      </div>
    </div>
  );
}
