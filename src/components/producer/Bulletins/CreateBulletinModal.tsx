import { useState, useEffect } from 'react';
import { Mail, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { bulletinsApi } from '@/services/api';
import { toast } from 'sonner';
import type { Bulletin, CreateBulletinRequest, EmailAudienceCriteria, RecipientPreview } from '@/types/bulletin';

interface CreateBulletinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBulletinRequest) => Promise<void>;
  editBulletin?: Bulletin;
  eventSlug: string;
}

export function CreateBulletinModal({
  isOpen,
  onClose,
  onSubmit,
  editBulletin,
  eventSlug,
}: CreateBulletinModalProps) {
  const { userProfile } = useAuth();
  const [subject, setSubject] = useState(editBulletin?.subject || '');
  const [body, setBody] = useState(editBulletin?.body || '');
  const [pinned, setPinned] = useState(editBulletin?.pinned || false);
  const [sendEmail, setSendEmail] = useState(editBulletin?.send_email_notification || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audience selection state
  const [audienceType, setAudienceType] = useState<'approved' | 'all' | 'custom'>('approved');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['approved', 'confirmed']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [recipientPreview, setRecipientPreview] = useState<RecipientPreview | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Build audience criteria based on selections
  const buildAudienceCriteria = (): EmailAudienceCriteria => {
    if (audienceType === 'all') {
      return { include_all: true };
    } else if (audienceType === 'custom') {
      return {
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        vendor_categories: selectedCategories.length > 0 ? selectedCategories : undefined
      };
    } else {
      // 'approved' - default behavior
      return { statuses: ['approved', 'confirmed'] };
    }
  };

  // Fetch recipient preview whenever audience selection changes
  useEffect(() => {
    console.log('🔍 [Bulletin Preview] useEffect triggered', {
      sendEmail,
      eventSlug,
      audienceType,
      selectedStatuses,
      selectedCategories
    });

    if (!sendEmail || !eventSlug) {
      console.log('❌ [Bulletin Preview] Skipping fetch:', { sendEmail, eventSlug });
      return;
    }

    const fetchPreview = async () => {
      try {
        setLoadingPreview(true);
        const criteria = buildAudienceCriteria();
        console.log('📤 [Bulletin Preview] Fetching with criteria:', criteria);
        const preview = await bulletinsApi.previewRecipients(eventSlug, criteria);
        console.log('📥 [Bulletin Preview] Received preview:', preview);
        setRecipientPreview(preview);
      } catch (err) {
        console.error('❌ [Bulletin Preview] Failed to fetch:', err);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [sendEmail, audienceType, selectedStatuses, selectedCategories, eventSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !body.trim()) {
      setError('Subject and message are required');
      return;
    }

    // Show confirmation modal if sending email
    if (sendEmail) {
      setShowConfirmModal(true);
    } else {
      await submitBulletin();
    }
  };

  const submitBulletin = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const data: CreateBulletinRequest = {
        subject,
        body,
        pinned,
        send_email_notification: sendEmail,
        email_audience_criteria: sendEmail ? buildAudienceCriteria() : undefined
      };

      await onSubmit(data);
      handleClose();

      if (sendEmail && recipientPreview) {
        toast.success(`Bulletin posted and emailed to ${recipientPreview.total} vendors`);
      } else {
        toast.success('Bulletin posted successfully');
      }
    } catch (err) {
      console.error('Failed to create bulletin:', err);
      setError(err instanceof Error ? err.message : 'Failed to create bulletin');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setBody('');
    setPinned(false);
    setSendEmail(false);
    setAudienceType('approved');
    setSelectedStatuses(['approved', 'confirmed']);
    setSelectedCategories([]);
    setRecipientPreview(null);
    setError(null);
    setShowConfirmModal(false);
    onClose();
  };

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl bg-gradient-to-b from-[#2a1f3d] to-[#1f1530] border-purple-500/20 p-0 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <DialogTitle className="text-2xl font-bold text-white">
              {editBulletin ? 'Edit Bulletin Message' : 'Create Bulletin Message'}
            </DialogTitle>
          </div>

          {/* Producer Info */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {userProfile?.name ? getInitials(userProfile.name) : 'GG'}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold">{userProfile?.name || 'Producer'}</p>
                <p className="text-sm text-white/60">Producer</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Subject */}
            <Input
              type="text"
              placeholder="Subject or title for your message..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50"
              autoFocus
            />

            {/* Body */}
            <div className="space-y-2">
              <Textarea
                placeholder="What would you like to share with vendors?"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 resize-none"
              />
              <p className="text-xs text-white/50">
                You can format your message with:
              </p>
              <ul className="text-xs text-white/40 space-y-1 pl-4">
                <li>• Bullet points</li>
                <li>• Multiple paragraphs</li>
                <li>• Important announcements</li>
              </ul>
            </div>

            {/* Pin Option */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="text-sm font-medium text-white">Pin this message</p>
                <p className="text-xs text-white/60">Pinned messages appear at the top</p>
              </div>
              <Switch
                checked={pinned}
                onCheckedChange={setPinned}
              />
            </div>

            {/* Send Email Option */}
            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Send as Email</p>
                  <p className="text-xs text-white/60">Email vendors with this bulletin</p>
                </div>
              </div>
              <Switch
                checked={sendEmail}
                onCheckedChange={setSendEmail}
              />
            </div>

            {/* Audience Selection (shown when email is enabled) */}
            {sendEmail && (
              <div className="space-y-4 border-t border-white/10 pt-4">
                <label className="text-sm font-medium text-white/90 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Email Audience
                </label>

                {/* Audience Type Selector */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setAudienceType('approved')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      audienceType === 'approved'
                        ? 'bg-purple-600 text-white border-2 border-purple-400'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Approved Vendors
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceType('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      audienceType === 'all'
                        ? 'bg-purple-600 text-white border-2 border-purple-400'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    All Vendors
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceType('custom')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      audienceType === 'custom'
                        ? 'bg-purple-600 text-white border-2 border-purple-400'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {/* Custom Audience Options */}
                {audienceType === 'custom' && (
                  <div className="space-y-3 bg-white/5 rounded-lg p-4 border border-white/10">
                    {/* Status Checkboxes */}
                    <div>
                      <label className="text-xs text-white/60 mb-2 block">Vendor Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['pending', 'approved', 'confirmed', 'rejected', 'waitlist'].map(status => (
                          <label key={status} className="flex items-center gap-2 text-sm text-white/80 hover:text-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedStatuses.includes(status)}
                              onChange={() => toggleStatus(status)}
                              className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="capitalize">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Category Selector */}
                    <div>
                      <label className="text-xs text-white/60 mb-2 block">Categories (leave empty for all)</label>
                      <Input
                        placeholder="Enter category names (comma-separated)"
                        value={selectedCategories.join(', ')}
                        onChange={(e) => setSelectedCategories(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      />
                    </div>
                  </div>
                )}

                {/* Recipient Preview */}
                {loadingPreview ? (
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3 text-center">
                    <p className="text-sm text-white/60">Loading recipient count...</p>
                  </div>
                ) : recipientPreview && recipientPreview.total > 0 ? (
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
                    <p className="text-sm text-white/90">
                      Will send to <strong className="text-purple-300 text-lg">{recipientPreview.total}</strong> vendor{recipientPreview.total !== 1 ? 's' : ''}
                    </p>
                    {Object.keys(recipientPreview.by_category).length > 0 && (
                      <p className="text-xs text-white/60 mt-1">
                        {Object.entries(recipientPreview.by_category).map(([cat, count]) =>
                          `${count} ${cat || 'Uncategorized'}`
                        ).join(', ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                    <p className="text-sm text-yellow-200">
                      No vendors match the selected criteria
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !subject.trim() || !body.trim() || (sendEmail && recipientPreview?.total === 0)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isSubmitting ? 'Posting...' : 'Post to Bulletin'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      {showConfirmModal && recipientPreview && (
        <Dialog open={showConfirmModal} onOpenChange={() => setShowConfirmModal(false)}>
          <DialogContent className="max-w-md bg-gradient-to-b from-[#2a1f3d] to-[#1f1530] border-purple-500/20">
            <DialogTitle className="text-xl font-bold text-white">
              Send Bulletin Email?
            </DialogTitle>

            <div className="space-y-4 pt-4">
              <p className="text-white/80">
                This will send an email to <strong className="text-purple-300 text-lg">{recipientPreview.total}</strong> vendor{recipientPreview.total !== 1 ? 's' : ''}.
              </p>

              {Object.keys(recipientPreview.by_category).length > 0 && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-2">Breakdown by category:</p>
                  <ul className="text-sm text-white/80 space-y-1">
                    {Object.entries(recipientPreview.by_category).map(([cat, count]) => (
                      <li key={cat}>• {count} {cat || 'Uncategorized'}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Object.keys(recipientPreview.by_status).length > 0 && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-2">Breakdown by status:</p>
                  <ul className="text-sm text-white/80 space-y-1">
                    {Object.entries(recipientPreview.by_status).map(([status, count]) => (
                      <li key={status} className="capitalize">• {count} {status}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitBulletin}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {isSubmitting ? 'Sending...' : 'Confirm & Send'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
