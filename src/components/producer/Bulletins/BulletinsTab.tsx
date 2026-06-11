import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Bulletin, CreateBulletinRequest, UpdateBulletinRequest } from '../../../types/bulletin'
import { bulletinsApi } from '../../../services/api'
import { CreateBulletinModal } from './CreateBulletinModal'
import { BulletinsList } from './BulletinsList'
import { Button } from '../../ui/button'
import { Plus, Megaphone } from 'lucide-react'
import { logger } from '@/utils/logger'

interface BulletinsTabProps {
  eventSlug?: string
}

export function BulletinsTab({ eventSlug: eventSlugProp }: BulletinsTabProps = {}) {
  const { eventSlug: eventSlugParam } = useParams<{ eventSlug: string }>()
  const eventSlug = eventSlugProp || eventSlugParam
  const [bulletins, setBulletins] = useState<Bulletin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingBulletin, setEditingBulletin] = useState<Bulletin | undefined>(undefined)

  useEffect(() => {
    if (eventSlug) {
      fetchBulletins()
    }
  }, [eventSlug])

  const fetchBulletins = async () => {
    if (!eventSlug) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await bulletinsApi.getByEvent(eventSlug)
      setBulletins(response.bulletins)
    } catch (err) {
      logger.error('Failed to fetch bulletins', { eventSlug, error: err })
      setError('Failed to load bulletins. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: CreateBulletinRequest) => {
    if (!eventSlug) return

    try {
      await bulletinsApi.create(eventSlug, data)
      await fetchBulletins()
      setIsCreateModalOpen(false)
    } catch (err) {
      logger.error('Failed to create bulletin', { eventSlug, error: err })
      throw err
    }
  }

  const handleUpdate = async (data: UpdateBulletinRequest) => {
    if (!editingBulletin) return

    try {
      await bulletinsApi.update(editingBulletin.id, data)
      await fetchBulletins()
      setIsCreateModalOpen(false)
      setEditingBulletin(undefined)
    } catch (err) {
      logger.error('Failed to update bulletin', { bulletinId: editingBulletin.id, error: err })
      throw err
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await bulletinsApi.delete(id)
      await fetchBulletins()
    } catch (err) {
      logger.error('Failed to delete bulletin', { bulletinId: id, error: err })
      alert('Failed to delete bulletin. Please try again.')
    }
  }

  const handleTogglePin = async (id: number) => {
    try {
      await bulletinsApi.togglePin(id)
      await fetchBulletins()
    } catch (err) {
      logger.error('Failed to toggle pin', { bulletinId: id, error: err })
      alert('Failed to update bulletin. Please try again.')
    }
  }

  const handleEdit = (bulletin: Bulletin) => {
    setEditingBulletin(bulletin)
    setIsCreateModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingBulletin(undefined)
  }

  // Sort bulletins: pinned first, then by created_at (newest first)
  // This ensures correct display even if backend doesn't sort properly
  const sortedBulletins = useMemo(() => {
    return [...bulletins].sort((a, b) => {
      // First, sort by pinned status (pinned = true comes first)
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1
      }
      // Then sort by created_at (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [bulletins])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading bulletins...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-400 mb-4">{error}</div>
        <Button onClick={fetchBulletins} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg voxxy-accent-tile flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Bulletins</h2>
            <p className="text-muted-foreground text-sm">
              Share important updates and announcements with vendors
            </p>
          </div>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="voxxy-btn-solid">
          <Plus className="w-4 h-4 mr-2" />
          Create Bulletin
        </Button>
      </div>

      {/* Bulletins List */}
      <BulletinsList
        bulletins={sortedBulletins}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        isProducer={true}
      />

      {/* Create/Edit Modal */}
      {eventSlug && (
        <CreateBulletinModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSubmit={editingBulletin ? handleUpdate : handleCreate}
          editBulletin={editingBulletin}
          eventSlug={eventSlug}
        />
      )}
    </div>
  )
}
