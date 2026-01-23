import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import type { Bulletin, CreateBulletinRequest } from '@/types/bulletin';

interface CreateBulletinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBulletinRequest) => Promise<void>;
  editBulletin?: Bulletin;
}

export function CreateBulletinModal({
  isOpen,
  onClose,
  onSubmit,
  editBulletin,
}: CreateBulletinModalProps) {
  const { userProfile } = useAuth();
  const [subject, setSubject] = useState(editBulletin?.subject || '');
  const [body, setBody] = useState(editBulletin?.body || '');
  const [pinned, setPinned] = useState(editBulletin?.pinned || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !body.trim()) {
      setError('Subject and message are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({ subject, body, pinned });
      handleClose();
    } catch (err) {
      console.error('Failed to create bulletin:', err);
      setError(err instanceof Error ? err.message : 'Failed to create bulletin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setBody('');
    setPinned(false);
    setError(null);
    onClose();
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-b from-[#2a1f3d] to-[#1f1530] border-purple-500/20 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {editBulletin ? 'Edit Bulletin Message' : 'Create Bulletin Message'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
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
              disabled={isSubmitting || !subject.trim() || !body.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isSubmitting ? 'Posting...' : 'Post to Bulletin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
