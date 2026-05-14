import { useState } from 'react';
import { Bulletin } from '../../../types/bulletin';
import { Button } from '../../ui/button';
import { Pin, Trash2, Edit, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BulletinCardProps {
  bulletin: Bulletin;
  onEdit: (bulletin: Bulletin) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number) => void;
  isProducer: boolean;
}

export function BulletinCard({
  bulletin,
  onEdit,
  onDelete,
  onTogglePin,
  isProducer
}: BulletinCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPin, setIsTogglingPin] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this bulletin?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(bulletin.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePin = async () => {
    setIsTogglingPin(true);
    try {
      await onTogglePin(bulletin.id);
    } finally {
      setIsTogglingPin(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`voxxy-gradient-card-deep rounded-lg p-6 border ${
      bulletin.pinned ? 'border-primary' : 'border-border'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {/* Author Avatar */}
          <div className="w-10 h-10 rounded-full voxxy-accent-tile flex items-center justify-center font-medium">
            {getInitials(bulletin.author.name)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground font-semibold">{bulletin.subject}</h3>
              {bulletin.pinned && (
                <Pin className="w-4 h-4 text-primary fill-primary" />
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              {bulletin.author.name} · {formatDistanceToNow(new Date(bulletin.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Action Buttons (Producer Only) */}
        {isProducer && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTogglePin}
              disabled={isTogglingPin}
              className={`${
                bulletin.pinned
                  ? 'text-primary hover:text-primary/70'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Pin className={`w-4 h-4 ${bulletin.pinned ? 'fill-primary' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(bulletin)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="text-muted-foreground whitespace-pre-wrap mb-4">
        {bulletin.body}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-border">
        <div className="flex items-center gap-1">
          <Check className="w-4 h-4" />
          <span>{bulletin.read_count} read</span>
        </div>
        <div>
          <span>{bulletin.view_count} views</span>
        </div>
        {bulletin.read_by_current_user && (
          <div className="text-primary">
            ✓ Read
          </div>
        )}
      </div>
    </div>
  );
}
