import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, X } from "lucide-react"
import type { Organization } from '@/types/database'


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
    aboutImageUrl: organization.aboutImageUrl || '',
    aboutStory: organization.aboutStory || '',
    aboutOfferings: organization.aboutOfferings && organization.aboutOfferings.length > 0 ? organization.aboutOfferings : [''] as string[],
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
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingAbout, setUploadingAbout] = useState(false)
  
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

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG or PNG)')
      return
    }

    // Validate file size (10MB max for hero images)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      return
    }

    setUploadingHero(true)
    
    try {
      // Convert file to data URL for preview/storage
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setFormData(prev => ({
          ...prev,
          bannerUrl: dataUrl
        }))
        setUploadingHero(false)
      }
      reader.onerror = () => {
        alert('Error reading file')
        setUploadingHero(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading hero image:', error)
      alert('Error uploading file')
      setUploadingHero(false)
    }
  }

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG or PNG)')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      return
    }

    setUploadingAbout(true)
    
    try {
      // Convert file to data URL for preview/storage
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setFormData(prev => ({
          ...prev,
          aboutImageUrl: dataUrl
        }))
        setUploadingAbout(false)
      }
      reader.onerror = () => {
        alert('Error reading file')
        setUploadingAbout(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading about image:', error)
      alert('Error uploading file')
      setUploadingAbout(false)
    }
  }

  const addOffering = () => {
    setFormData(prev => ({
      ...prev,
      aboutOfferings: [...prev.aboutOfferings, '']
    }))
  }

  const removeOffering = (index: number) => {
    setFormData(prev => ({
      ...prev,
      aboutOfferings: prev.aboutOfferings.filter((_, i) => i !== index)
    }))
  }

  const updateOffering = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      aboutOfferings: prev.aboutOfferings.map((offering, i) => 
        i === index ? value : offering
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Only set local submitting state if not using external state
    if (!isSaving) {
      setIsSubmitting(true)
    }

    try {
      // Include default theme values since we removed the UI but the schema requires it
      // Filter out empty offerings
      const cleanedOfferings = formData.aboutOfferings.filter(offering => offering.trim() !== '')
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
      
      // Only include aboutOfferings if there are valid entries (Firebase doesn't allow undefined)
      if (cleanedOfferings.length > 0) {
        saveData.aboutOfferings = cleanedOfferings
      }
      
      // Filter out any undefined values from the entire object to prevent Firebase errors
      const removeUndefined = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj
        
        const cleaned = {} as any
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            if (typeof value === 'object' && value !== null) {
              cleaned[key] = removeUndefined(value)
            } else {
              cleaned[key] = value
            }
          }
        }
        return cleaned
      }
      
      const filteredSaveData = removeUndefined(saveData)
      await onSave(filteredSaveData)
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
              <Label htmlFor="background">Short Description</Label>
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

        {/* Default Location */}
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

        {/* Media & Branding */}
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
              <Label htmlFor="heroFile">Hero Background Upload</Label>
              <div className="space-y-2">
                <input
                  id="heroFile"
                  type="file"
                  accept=".jpeg,.jpg,.png"
                  onChange={handleHeroUpload}
                  disabled={uploadingHero}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {uploadingHero && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <span className="animate-spin">⭐</span>
                    Uploading hero background...
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Supported formats: JPEG, PNG. Max size: 10MB. Recommended: 1200x400px or larger
                </p>
                {formData.bannerUrl && !uploadingHero && (
                  <div className="mt-3">
                    <Label className="text-sm text-gray-600">Preview:</Label>
                    <div className="mt-1 relative h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={formData.bannerUrl} 
                        alt="Hero background preview" 
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

        {/* Club Background */}
        <Card>
          <CardHeader>
            <CardTitle>About Section</CardTitle>
            <CardDescription>
              Content and images for your organization's about section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="aboutImageFile">About Image Upload</Label>
              <div className="space-y-2">
                <input
                  id="aboutImageFile"
                  type="file"
                  accept=".jpeg,.jpg,.png"
                  onChange={handleAboutImageUpload}
                  disabled={uploadingAbout}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {uploadingAbout && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <span className="animate-spin">⭐</span>
                    Uploading about image...
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Supported formats: JPEG, PNG. Max size: 10MB. Recommended: 600x400px or larger
                </p>
                {formData.aboutImageUrl && !uploadingAbout && (
                  <div className="mt-3">
                    <Label className="text-sm text-gray-600">Preview:</Label>
                    <div className="mt-1 relative h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={formData.aboutImageUrl} 
                        alt="About image preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="aboutStory">Our Story</Label>
              <Textarea
                id="aboutStory"
                value={formData.aboutStory}
                onChange={(e) => handleInputChange('aboutStory', e.target.value)}
                placeholder="Tell the story of your organization - how it started, your mission, and what makes you unique..."
                rows={6}
              />
            </div>

            <div>
              <Label>What We Offer</Label>
              <div className="space-y-2">
                {formData.aboutOfferings.map((offering, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={offering}
                      onChange={(e) => updateOffering(index, e.target.value)}
                      placeholder="e.g., Weekly open studio sessions with shared materials"
                      className="flex-1"
                    />
                    {formData.aboutOfferings.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOffering(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOffering}
                  className="mt-2"
                >
                  Add Offering
                </Button>
              </div>
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