import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'
import { registrationsApi, ApiError } from '@/services/api'

export interface EditVendorDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Local applicant row id (e.g. reg-123) for state updates */
  applicantId: string
  registrationId: number
  /** Maps to Rails registration `name` (contact name) — will be split into first/last */
  initialContactName: string
  initialPhone: string
  initialLocation?: string
  initialProducerNotes?: string
  initialTags?: string[]
  initialInstagramHandle?: string
  initialTiktokHandle?: string
  initialWebsite?: string
  initialAffiliation?: string
  /** Shown read-only — not in Rails `update_params` */
  emailReadOnly: string
  onSaved: (
    applicantId: string,
    patch: {
      contact_name: string
      phone: string
      location?: string
      producer_notes?: string
      tags?: string[]
      instagram_handle?: string
      tiktok_handle?: string
      website?: string
      affiliation?: string
    },
  ) => void
}

export function EditVendorDetailsModal({
  open,
  onOpenChange,
  applicantId,
  registrationId,
  initialContactName,
  initialPhone,
  initialLocation,
  initialProducerNotes,
  initialTags,
  initialInstagramHandle,
  initialTiktokHandle,
  initialWebsite,
  emailReadOnly,
  onSaved,
  initialAffiliation,
}: EditVendorDetailsModalProps) {
  const nameParts = initialContactName.split(' ', 2)
  const [firstName, setFirstName] = useState(nameParts[0] || '')
  const [lastName, setLastName] = useState(nameParts[1] || '')
  const [phone, setPhone] = useState(initialPhone)
  const [location, setLocation] = useState(initialLocation || '')
  const [producerNotes, setProducerNotes] = useState(initialProducerNotes || '')
  const [tags, setTags] = useState<string[]>(initialTags || [])
  const [tagInput, setTagInput] = useState('')
  const [instagramHandle, setInstagramHandle] = useState(initialInstagramHandle || '')
  const [tiktokHandle, setTiktokHandle] = useState(initialTiktokHandle || '')
  const [website, setWebsite] = useState(initialWebsite || '')
  const [affiliation, setAffiliation] = useState(initialAffiliation || '')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const parts = initialContactName.split(' ', 2)
      setFirstName(parts[0] || '')
      setLastName(parts[1] || '')
      setPhone(initialPhone || '')
      setLocation(initialLocation || '')
      setProducerNotes(initialProducerNotes || '')
      setTags(initialTags || [])
      setTagInput('')
      setInstagramHandle(initialInstagramHandle || '')
      setTiktokHandle(initialTiktokHandle || '')
      setWebsite(initialWebsite || '')
      setAffiliation(initialAffiliation || '')
      setFormError(null)
    }
  }, [
    open,
    initialContactName,
    initialPhone,
    initialLocation,
    initialProducerNotes,
    initialTags,
    initialInstagramHandle,
    initialTiktokHandle,
    initialWebsite,
    initialAffiliation,
  ])

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      // Send all fields to API, including empty values (to allow clearing)
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
      await registrationsApi.update(registrationId, {
        name: fullName,
        phone: phone.trim(),
        location: location.trim(),
        producer_notes: producerNotes.trim(),
        tags: tags,
        instagram_handle: instagramHandle.trim(),
        tiktok_handle: tiktokHandle.trim(),
        website: website.trim(),
        affiliation: affiliation.trim(),
      })
      onSaved(applicantId, {
        contact_name: fullName,
        phone: phone.trim(),
        location: location.trim(),
        producer_notes: producerNotes.trim(),
        tags: tags,
        instagram_handle: instagramHandle.trim(),
        tiktok_handle: tiktokHandle.trim(),
        website: website.trim(),
        affiliation: affiliation.trim(),
      })
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        setFormError(err.errors.join(' '))
      } else if (err instanceof Error) {
        setFormError(err.message)
      } else {
        setFormError('Could not save changes.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-muted text-foreground sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-foreground">Edit vendor details</DialogTitle>
            <p className="text-xs text-foreground/60 pt-1">
              Update contact info, location, tags, and producer notes. Status, category, and payment
              use their existing controls.
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-email" className="text-xs text-foreground/80">
                Email
              </Label>
              <Input
                id="edit-vendor-email"
                value={emailReadOnly}
                disabled
                className="bg-background/10 border-border text-xs opacity-80"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-vendor-first-name" className="text-xs text-foreground/80">
                  First Name *
                </Label>
                <Input
                  id="edit-vendor-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-background/5 border-border text-xs"
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-vendor-last-name" className="text-xs text-foreground/80">
                  Last Name
                </Label>
                <Input
                  id="edit-vendor-last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-background/5 border-border text-xs"
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-phone" className="text-xs text-foreground/80">
                Phone
              </Label>
              <Input
                id="edit-vendor-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-background/5 border-border text-xs"
                autoComplete="tel"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-location" className="text-xs text-foreground/80">
                Location
              </Label>
              <Input
                id="edit-vendor-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-background/5 border-border text-xs"
                placeholder="e.g., Brooklyn, NY"
              />
            </div>
            {/* Social Media */}
            <div className="pt-1 border-t border-border">
              <p className="text-xs font-medium text-foreground/70 mb-2">Social & Links</p>
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-vendor-instagram" className="text-xs text-foreground/80">
                    Instagram
                  </Label>
                  <Input
                    id="edit-vendor-instagram"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="bg-background/5 border-border text-xs"
                    placeholder="@handle"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-vendor-tiktok" className="text-xs text-foreground/80">
                    TikTok
                  </Label>
                  <Input
                    id="edit-vendor-tiktok"
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value)}
                    className="bg-background/5 border-border text-xs"
                    placeholder="@handle"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-vendor-website" className="text-xs text-foreground/80">
                    Website
                  </Label>
                  <Input
                    id="edit-vendor-website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-background/5 border-border text-xs"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-tags" className="text-xs text-foreground/80">
                Tags
              </Label>
              <div className="space-y-2">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary dark:text-primary border border-primary/20"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-slate-800 dark:hover:text-primary"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    id="edit-vendor-tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="bg-background/5 border-border text-xs"
                    placeholder="Type tag and press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="border-border text-xs"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-notes" className="text-xs text-foreground/80">
                Affiliation
              </Label>
              <Textarea
                id="edit-vendor-affiliation"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                className="bg-background/5 border-border text-xs min-h-[80px]"
                placeholder="e.g., studio, gallery, or business affiliation"
              />
              <p className="text-[10px] text-foreground/50">Notes are only visible to you</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vendor-notes" className="text-xs text-foreground/80">
                Producer Notes
              </Label>
              <Textarea
                id="edit-vendor-notes"
                value={producerNotes}
                onChange={(e) => setProducerNotes(e.target.value)}
                className="bg-background/5 border-border text-xs min-h-[80px]"
                placeholder="Internal notes about this vendor..."
              />
              <p className="text-[10px] text-foreground/50">Notes are only visible to you</p>
            </div>
            {formError && (
              <p className="text-xs text-red-400 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1.5">
                {formError}
              </p>
            )}
          </div>
          <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" className="voxxy-btn-solid" disabled={saving || !firstName.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
