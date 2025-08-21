import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Trash2 } from "lucide-react"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import type { Organization } from '@/types/database'

interface OrganizationDangerZoneProps {
  organization: Organization
  onDelete: () => Promise<void>
  isDeleting?: boolean
}

export function OrganizationDangerZone({ 
  organization, 
  onDelete, 
  isDeleting = false 
}: OrganizationDangerZoneProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  
  const expectedText = organization.name
  const isConfirmationValid = confirmationText === expectedText

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
    setConfirmationText('')
  }

  const handleDeleteConfirm = async () => {
    if (!isConfirmationValid) return
    
    try {
      await onDelete()
      setShowDeleteModal(false)
    } catch (error) {
      // Error handling will be done by parent component
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setConfirmationText('')
  }

  return (
    <>
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible and destructive actions for this organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">Delete Organization</h4>
            <p className="text-sm text-red-800 mb-4">
              Permanently delete this organization and all associated data. This action cannot be undone.
            </p>
            <ul className="text-xs text-red-700 mb-4 list-disc list-inside space-y-1">
              <li>All events will be permanently deleted</li>
              <li>All registration data will be lost</li>
              <li>All subscriber information will be removed</li>
              <li>The organization URL will become available to others</li>
              <li>This action cannot be reversed</li>
            </ul>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Organization
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Organization"
        description={`Are you sure you want to delete "${organization.name}"? This action cannot be undone and will permanently remove all data associated with this organization.`}
        confirmText="Delete Forever"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800 font-medium mb-2">This will permanently delete:</p>
            <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
              <li>Organization profile and settings</li>
              <li>All events and their details</li>
              <li>All registration and waitlist data</li>
              <li>All subscriber information</li>
              <li>All uploaded images and content</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmText" className="text-sm font-medium">
              To confirm, type <span className="font-mono bg-gray-100 px-1 rounded">{expectedText}</span>
            </Label>
            <Input
              id="confirmText"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={expectedText}
              className={`font-mono ${
                confirmationText && !isConfirmationValid 
                  ? 'border-red-300 focus:border-red-300' 
                  : ''
              }`}
              disabled={isDeleting}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-xs text-red-600">Organization name does not match</p>
            )}
          </div>
        </div>
      </ConfirmationModal>
    </>
  )
}