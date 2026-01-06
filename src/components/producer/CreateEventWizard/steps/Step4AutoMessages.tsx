import { Mail, Check, Sparkles } from 'lucide-react';

interface Step4AutoMessagesProps {
  selectedTemplateId?: number | null;
  onTemplateSelect?: (templateId: number | null) => void;
}

export default function Step4AutoMessages({
  selectedTemplateId = null,
  onTemplateSelect
}: Step4AutoMessagesProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-6 lg:p-8 border border-white/10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-500/20 rounded-full blur-xl" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-500/30 flex items-center justify-center border border-white/10">
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-3">
            Email Automation
          </h2>

          <p className="text-white/60 text-base max-w-md mx-auto leading-relaxed">
            Your event will automatically use our comprehensive email campaign to keep vendors informed throughout the event lifecycle.
          </p>
        </div>

        {/* Default Template Info */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Using System Default Template
                </h3>
                <p className="text-white/70 mb-3">
                  Your event will use our professional email campaign with 16 automated emails covering announcements, application updates, payment reminders, and event countdowns.
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Custom template creation coming soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Automated Sending</h4>
              <p className="text-sm text-white/60">
                Emails sent automatically based on event timeline and vendor actions
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Smart Filtering</h4>
              <p className="text-sm text-white/60">
                Target specific vendor groups by status, category, or payment status
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Delivery Tracking</h4>
              <p className="text-sm text-white/60">
                Monitor delivery status and engagement in real-time
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">16 Email Campaign</h4>
              <p className="text-sm text-white/60">
                Complete lifecycle from applications open to post-event thank you
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
