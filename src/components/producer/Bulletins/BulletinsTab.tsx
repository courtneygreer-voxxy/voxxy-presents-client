import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bulletin, CreateBulletinRequest, UpdateBulletinRequest } from '../../../types/bulletin';
import { bulletinsApi } from '../../../services/api';
import { CreateBulletinModal } from './CreateBulletinModal';
import { BulletinsList } from './BulletinsList';
import { Button } from '../../ui/button';
import { Plus, Megaphone } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export function BulletinsTab() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const { currentUser } = useAuth();
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBulletin, setEditingBulletin] = useState<Bulletin | undefined>(undefined);

  const isProducer = currentUser?.role === 'venue_owner' || currentUser?.role === 'producer';

  useEffect(() => {
    if (eventSlug) {
      fetchBulletins();
    }
  }, [eventSlug]);

  const fetchBulletins = async () => {
    if (!eventSlug) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await bulletinsApi.getByEvent(eventSlug);
      setBulletins(response.bulletins);
    } catch (err) {
      console.error('Failed to fetch bulletins:', err);
      setError('Failed to load bulletins. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateBulletinRequest) => {
    if (!eventSlug) return;

    try {
      await bulletinsApi.create(eventSlug, data);
      await fetchBulletins();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create bulletin:', err);
      throw err;
    }
  };

  const handleUpdate = async (data: UpdateBulletinRequest) => {
    if (!editingBulletin) return;

    try {
      await bulletinsApi.update(editingBulletin.id, data);
      await fetchBulletins();
      setIsCreateModalOpen(false);
      setEditingBulletin(undefined);
    } catch (err) {
      console.error('Failed to update bulletin:', err);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bulletinsApi.delete(id);
      await fetchBulletins();
    } catch (err) {
      console.error('Failed to delete bulletin:', err);
      alert('Failed to delete bulletin. Please try again.');
    }
  };

  const handleTogglePin = async (id: number) => {
    try {
      await bulletinsApi.togglePin(id);
      await fetchBulletins();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      alert('Failed to update bulletin. Please try again.');
    }
  };

  const handleEdit = (bulletin: Bulletin) => {
    setEditingBulletin(bulletin);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingBulletin(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading bulletins...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-400 mb-4">{error}</div>
        <Button onClick={fetchBulletins} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Bulletins</h2>
            <p className="text-gray-400 text-sm">
              {isProducer
                ? 'Share important updates and announcements with vendors'
                : 'Stay updated with announcements from the event producer'}
            </p>
          </div>
        </div>

        {isProducer && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Bulletin
          </Button>
        )}
      </div>

      {/* Bulletins List */}
      <BulletinsList
        bulletins={bulletins}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        isProducer={isProducer}
      />

      {/* Create/Edit Modal */}
      <CreateBulletinModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingBulletin ? handleUpdate : handleCreate}
        editBulletin={editingBulletin}
      />
    </div>
  );
}
