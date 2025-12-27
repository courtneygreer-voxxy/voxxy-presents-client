import { Mail, Sparkles } from 'lucide-react';

export default function Step4AutoMessages() {
  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-6 lg:p-8 border border-white/10">
        <div className="text-center py-16">
          {/* Icon with gradient background */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-500/20 rounded-full blur-xl" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-500/30 flex items-center justify-center border border-white/10">
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title with gradient text */}
          <h2 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-3">
            Automatic Messages
          </h2>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white/80 text-sm font-medium">Coming Soon</span>
          </div>

          {/* Simple description */}
          <p className="text-white/60 text-base max-w-md mx-auto leading-relaxed">
            Customize automated emails for application confirmations, approvals, and event reminders.
          </p>

          {/* Subtle info note */}
          <div className="mt-8 max-w-sm mx-auto">
            <p className="text-white/40 text-sm">
              Default email notifications are already active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
