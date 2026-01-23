import { Bulletin } from '../../../types/bulletin';
import { BulletinCard } from './BulletinCard';

interface BulletinsListProps {
  bulletins: Bulletin[];
  onEdit: (bulletin: Bulletin) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number) => void;
  isProducer: boolean;
}

export function BulletinsList({
  bulletins,
  onEdit,
  onDelete,
  onTogglePin,
  isProducer
}: BulletinsListProps) {
  if (bulletins.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">No bulletins yet</div>
        <p className="text-gray-500 text-sm">
          Create your first bulletin to share updates with vendors
        </p>
      </div>
    );
  }

  // Separate pinned and regular bulletins
  const pinnedBulletins = bulletins.filter(b => b.pinned);
  const regularBulletins = bulletins.filter(b => !b.pinned);

  return (
    <div className="space-y-4">
      {/* Pinned Bulletins */}
      {pinnedBulletins.length > 0 && (
        <div className="space-y-4">
          {pinnedBulletins.map(bulletin => (
            <BulletinCard
              key={bulletin.id}
              bulletin={bulletin}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              isProducer={isProducer}
            />
          ))}
        </div>
      )}

      {/* Regular Bulletins */}
      {regularBulletins.length > 0 && (
        <div className="space-y-4">
          {regularBulletins.map(bulletin => (
            <BulletinCard
              key={bulletin.id}
              bulletin={bulletin}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              isProducer={isProducer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
