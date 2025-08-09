import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, X } from "lucide-react"
import type { Organization } from '@/types/database'

// Curated stock images for hero backgrounds
const curatedBackgrounds = [
  {
    id: 'art-studio',
    name: 'Art Studio',
    url: '/curated/art-studio-hero.jpg',
    thumbnail: '/curated/art-studio-thumb.jpg'
  },
  {
    id: 'gallery-space',
    name: 'Gallery Space', 
    url: '/curated/gallery-space-hero.jpg',
    thumbnail: '/curated/gallery-space-thumb.jpg'
  },
  {
    id: 'creative-workspace',
    name: 'Creative Workspace',
    url: '/curated/creative-workspace-hero.jpg', 
    thumbnail: '/curated/creative-workspace-thumb.jpg'
  },
  {
    id: 'art-supplies',
    name: 'Art Supplies',
    url: '/curated/art-supplies-hero.jpg',
    thumbnail: '/curated/art-supplies-thumb.jpg'
  },
  {
    id: 'community-event',
    name: 'Community Event',
    url: '/curated/community-event-hero.jpg',
    thumbnail: '/curated/community-event-thumb.jpg'
  },
  {
    id: 'abstract-art',
    name: 'Abstract Art',
    url: '/curated/abstract-art-hero.jpg',
    thumbnail: '/curated/abstract-art-thumb.jpg'
  }
]

interface OrganizationEditFormProps {
  organization: Organization
  onSave: (updates: Partial<Organization>) => Promise<void>
  onCancel: () => void
  isFullPage?: boolean
  isSaving?: boolean
}

export function OrganizationEditForm({ 
  organization, 
  onSave, 
  onCancel, 
  isFullPage = false, 
  isSaving = false 
}: OrganizationEditFormProps) {
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description,
    background: organization.background,
    contactEmail: organization.contactEmail,
    logoUrl: organization.logoUrl || '',
    bannerUrl: organization.bannerUrl || '',
    socialLinks: {
      instagram: organization.socialLinks.instagram || '',
      website: organization.socialLinks.website || '',
      eventbrite: organization.socialLinks.eventbrite || '',
      venmo: organization.socialLinks.venmo || '',
      other: organization.socialLinks.other || ''
    },
    settings: {
      defaultLocation: organization.settings.defaultLocation,
      defaultAddress: organization.settings.defaultAddress
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  
  // Use external saving state if provided (for full page mode)
  const submitting = isSaving || isSubmitting

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/svg+xml', 'image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (SVG, JPEG, or PNG)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 5MB')
      return
    }

    setUploadingLogo(true)
    
    try {
      // Convert file to data URL for preview/storage
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setFormData(prev => ({
          ...prev,
          logoUrl: dataUrl
        }))
        setUploadingLogo(false)
      }
      reader.onerror = () => {
        alert('Error reading file')
        setUploadingLogo(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Error uploading file')
      setUploadingLogo(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Only set local submitting state if not using external state
    if (!isSaving) {
      setIsSubmitting(true)
    }

    try {
      // Include default theme values since we removed the UI but the schema requires it
      const saveData = {
        ...formData,
        settings: {
          ...formData.settings,
          theme: {
            primaryColor: "#8b5cf6", // Default purple
            backgroundColor: "#ffffff" // Default white
          }
        }
      }
      await onSave(saveData)
    } catch (error) {
      console.error('Failed to save organization:', error)
      // Error handling will be done by parent component
    } finally {
      if (!isSaving) {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className={isFullPage ? "" : "p-6"}>
      {!isFullPage && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Organization</h2>
            <p className="text-gray-600">Update your organization's details and settings</p>
          </div>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core details about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Organization Name"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@organization.com"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description for headers and previews"
              />
            </div>
            
            <div>
              <Label htmlFor="background">Background</Label>
              <Textarea
                id="background"
                value={formData.background}
                onChange={(e) => handleInputChange('background', e.target.value)}
                placeholder="Detailed description about your organization"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Media & Branding</CardTitle>
            <CardDescription>
              Images and visual identity for your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logoFile">Logo Upload</Label>
              <div className="space-y-2">
                <input
                  id="logoFile"
                  type="file"
                  accept=".svg,.jpeg,.jpg,.png"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {uploadingLogo && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <span className="animate-spin">⭐</span>
                    Uploading logo...
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Supported formats: SVG, JPEG, PNG. Max size: 5MB
                </p>
                {formData.logoUrl && !uploadingLogo && (
                  <div className="flex items-center gap-2 mt-2">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo preview" 
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    <span className="text-sm text-gray-600">Current logo</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="heroBackground">Hero Background</Label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {curatedBackgrounds.map((bg) => (
                    <div 
                      key={bg.id}
                      className={`relative rounded-lg border-2 cursor-pointer transition-all ${
                        formData.bannerUrl === bg.url 
                          ? 'border-purple-500 ring-2 ring-purple-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('bannerUrl', bg.url)}
                    >
                      <img 
                        src={bg.thumbnail} 
                        alt={bg.name}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                          {bg.name}
                        </span>
                      </div>
                      {formData.bannerUrl === bg.url && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t">
                  <Label htmlFor="customBannerUrl" className="text-sm text-gray-600">Or use custom URL:</Label>
                  <Input
                    id="customBannerUrl"
                    value={formData.bannerUrl.startsWith('/curated/') ? '' : formData.bannerUrl}
                    onChange={(e) => handleInputChange('bannerUrl', e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="mt-1"
                  />
                </div>
                
                {formData.bannerUrl && (
                  <div className="mt-3">
                    <Label className="text-sm text-gray-600">Preview:</Label>
                    <div className="mt-1 relative h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={formData.bannerUrl} 
                        alt="Banner preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-white font-medium">Hero Background Preview</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Default Location</CardTitle>
            <CardDescription>
              Default venue information for events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultLocation">Venue Name</Label>
              <Input
                id="defaultLocation"
                value={formData.settings.defaultLocation}
                onChange={(e) => handleNestedInputChange('settings', 'defaultLocation', e.target.value)}
                placeholder="Venue Name"
              />
            </div>
            
            <div>
              <Label htmlFor="defaultAddress">Address</Label>
              <Input
                id="defaultAddress"
                value={formData.settings.defaultAddress}
                onChange={(e) => handleNestedInputChange('settings', 'defaultAddress', e.target.value)}
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media & Links</CardTitle>
            <CardDescription>
              Connect your social media accounts and external links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram Handle</Label>
                <Input
                  id="instagram"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'instagram', e.target.value)}
                  placeholder="@yourhandle"
                />
              </div>
              <div>
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  value={formData.socialLinks.website}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <Label htmlFor="eventbrite">Eventbrite URL</Label>
                <Input
                  id="eventbrite"
                  value={formData.socialLinks.eventbrite}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'eventbrite', e.target.value)}
                  placeholder="https://eventbrite.com/your-profile"
                />
              </div>
              <div>
                <Label htmlFor="venmo">Venmo Handle</Label>
                <Input
                  id="venmo"
                  value={formData.socialLinks.venmo}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'venmo', e.target.value)}
                  placeholder="@yourvenmo"
                />
              </div>
              <div>
                <Label htmlFor="other">Other Social Link</Label>
                <Input
                  id="other"
                  value={formData.socialLinks.other}
                  onChange={(e) => handleNestedInputChange('socialLinks', 'other', e.target.value)}
                  placeholder="https://linktr.ee/yourpage"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {!isFullPage && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
        
        {/* Full page mode: floating save button */}
        {isFullPage && (
          <div className="sticky bottom-6 flex justify-center">
            <Button 
              type="submit" 
              disabled={submitting}
              className="shadow-lg"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}