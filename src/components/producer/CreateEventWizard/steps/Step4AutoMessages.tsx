import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { TemplateSelectorModal } from '../../Email';

interface Step4AutoMessagesProps {
  selectedTemplateId?: number | null;
  onTemplateSelect?: (templateId: number | null) => void;
}

export default function Step4AutoMessages({
  selectedTemplateId = null,
  onTemplateSelect
}: Step4AutoMessagesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(selectedTemplateId);

  const handleTemplateSelect = (templateId: number | null) => {
    setCurrentTemplateId(templateId);
    if (onTemplateSelect) {
      onTemplateSelect(templateId);
    }
  };

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
            Choose an email campaign template to automate vendor communications throughout your event lifecycle.
          </p>
        </div>

        {/* Template Selection */}
        <div className="max-w-2xl mx-auto">
          {currentTemplateId ? (
            <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Email Campaign Selected
                  </h3>
                  <p className="text-white/70 mb-4">
                    Your event will use automated email sequences to keep vendors informed throughout the application, approval, and event process.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm text-purple-400 hover:text-purple-300 underline"
                  >
                    Change template
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border-2 border-white/10 rounded-xl p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Choose Email Campaign Template
                </h3>
                <p className="text-white/60 mb-6">
                  Select from pre-built email sequences or start with the default template.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all"
                >
                  Select Email Template
                </button>
                <p className="mt-4 text-sm text-white/40">
                  You can customize emails after creating your event
                </p>
              </div>
            </div>
          )}

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
                Target specific vendor groups by status, category, or location
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Delivery Tracking</h4>
              <p className="text-sm text-white/60">
                Monitor opens, bounces, and engagement in real-time
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Full Customization</h4>
              <p className="text-sm text-white/60">
                Edit content, timing, and recipients for each email
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selector Modal */}
      <TemplateSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleTemplateSelect}
        selectedTemplateId={currentTemplateId}
      />
    </div>
  );
}
