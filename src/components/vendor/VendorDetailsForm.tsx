/**
 * VendorDetailsForm - Unified form for creating/editing all vendor types
 *
 * This form dynamically renders vendor-type-specific sections based on the selected vendor type.
 * Priority vendor types: venue, catering (per user requirements)
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VendorCreationRequest, VendorType } from '@/types/vendor'
import { VendorTypeSelector } from './VendorTypeSelector'
import { CateringDetailsSection } from './forms/CateringDetailsSection'
import { EntertainmentDetailsSection } from './forms/EntertainmentDetailsSection'
import { MarketVendorDetailsSection } from './forms/MarketVendorDetailsSection'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface VendorDetailsFormProps {
  initialData?: Partial<VendorCreationRequest>
  onComplete: (data: Partial<VendorCreationRequest>) => void
  onBack: () => void
}

export function VendorDetailsForm({ initialData, onComplete, onBack }: VendorDetailsFormProps) {
  const [step, setStep] = useState<'type' | 'common' | 'specific'>('type')
  const [formData, setFormData] = useState<Partial<VendorCreationRequest>>({
    vendorType: initialData?.vendorType || 'venue',
    name: initialData?.name || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    pricingType: initialData?.pricingType || 'both',
    photos: initialData?.photos || [],
    contactInfo: initialData?.contactInfo || {
      email: '',
      phone: '',
      website: '',
      instagram: '',
      tiktok: ''
    },
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleVendorTypeSelect = (type: VendorType) => {
    setFormData(prev => ({ ...prev, vendorType: type }))
    setStep('common')
  }

  const handleCommonDataComplete = () => {
    // Validate common fields
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) newErrors.name = 'Name is required'
    if (!formData.description?.trim()) newErrors.description = 'Description is required'
    if (!formData.contactInfo?.email?.trim()) newErrors.email = 'Email is required'

    // Venue requires address
    if (formData.vendorType === 'venue' && !formData.address?.trim()) {
      newErrors.address = 'Address is required for venues'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    // If venue (no additional details needed in Phase 2), complete immediately
    // Otherwise, move to vendor-specific details
    if (formData.vendorType === 'venue') {
      onComplete(formData)
    } else {
      setStep('specific')
    }
  }

  const handleSpecificDetailsChange = (details: any) => {
    const vendorType = formData.vendorType!

    setFormData(prev => ({
      ...prev,
      [`${vendorType}Details`]: details
    }))
  }

  const handleFinalSubmit = () => {
    // Validate vendor-specific required fields
    const newErrors: Record<string, string> = {}

    if (formData.vendorType === 'catering') {
      if (!(formData.cateringDetails?.cuisineTypes?.length)) {
        newErrors.cuisineTypes = 'At least one cuisine type is required'
      }
      if (!(formData.cateringDetails?.serviceTypes?.length)) {
        newErrors.serviceTypes = 'At least one service type is required'
      }
    }

    if (formData.vendorType === 'entertainment') {
      if (!(formData.entertainmentDetails?.genres?.length)) {
        newErrors.genres = 'At least one genre is required'
      }
    }

    if (formData.vendorType === 'market_vendor') {
      if (!(formData.marketVendorDetails?.productTypes?.length)) {
        newErrors.productTypes = 'At least one product type is required'
      }
      if (!formData.marketVendorDetails?.priceRange) {
        newErrors.priceRange = 'Price range is required'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onComplete(formData)
  }

  // Step 1: Select Vendor Type
  if (step === 'type') {
    return (
      <div className="space-y-6">
        <VendorTypeSelector
          selectedType={formData.vendorType}
          onSelect={handleVendorTypeSelect}
        />

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    )
  }

  // Step 2: Common Vendor Information
  if (step === 'common') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Vendor Information</h3>
          <p className="text-sm text-gray-300">
            Tell us about your {formData.vendorType === 'venue' ? 'venue' : formData.vendorType === 'catering' ? 'catering business' : formData.vendorType === 'entertainment' ? 'entertainment services' : 'products'}
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label className="text-white">Business Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }))
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
            }}
            placeholder="e.g., Brooklyn Hearts Club, Joe's BBQ, DJ Smooth"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-white">Description *</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, description: e.target.value }))
              if (errors.description) setErrors(prev => ({ ...prev, description: '' }))
            }}
            placeholder="Describe what makes your business special..."
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
        </div>

        {/* Address (required for venues, optional for others) */}
        <div className="space-y-2">
          <Label className="text-white">
            Address {formData.vendorType === 'venue' ? '*' : '(Optional)'}
          </Label>
          <Input
            value={formData.address}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, address: e.target.value }))
              if (errors.address) setErrors(prev => ({ ...prev, address: '' }))
            }}
            placeholder="123 Main St, Brooklyn, NY 11201"
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && <p className="text-xs text-red-400">{errors.address}</p>}
          {formData.vendorType !== 'venue' && (
            <p className="text-xs text-gray-400">Optional - helps customers find you</p>
          )}
        </div>

        {/* Pricing Type */}
        <div className="space-y-2">
          <Label className="text-white">Pricing Type *</Label>
          <Select
            value={formData.pricingType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, pricingType: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="both">Both Free & Paid</SelectItem>
              <SelectItem value="custom">Custom Pricing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 p-4 bg-white/5 rounded-lg">
          <Label className="text-white font-medium">Contact Information</Label>

          <div className="space-y-2">
            <Label className="text-white text-sm">Email *</Label>
            <Input
              type="email"
              value={formData.contactInfo?.email || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo!, email: e.target.value }
                }))
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
              }}
              placeholder="contact@yourbusiness.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">Phone</Label>
              <Input
                value={formData.contactInfo?.phone || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo!, phone: e.target.value }
                }))}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Website</Label>
              <Input
                value={formData.contactInfo?.website || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo!, website: e.target.value }
                }))}
                placeholder="https://yourbusiness.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">Instagram</Label>
              <Input
                value={formData.contactInfo?.instagram || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo!, instagram: e.target.value }
                }))}
                placeholder="@yourbusiness"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">TikTok</Label>
              <Input
                value={formData.contactInfo?.tiktok || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo!, tiktok: e.target.value }
                }))}
                placeholder="@yourbusiness"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => setStep('type')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button type="button" onClick={handleCommonDataComplete}>
            {formData.vendorType === 'venue' ? 'Complete' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  // Step 3: Vendor-Specific Details (only for catering, entertainment, market vendors)
  return (
    <div className="space-y-6">
      {formData.vendorType === 'catering' && (
        <CateringDetailsSection
          data={formData.cateringDetails || {}}
          onChange={handleSpecificDetailsChange}
        />
      )}

      {formData.vendorType === 'entertainment' && (
        <EntertainmentDetailsSection
          data={formData.entertainmentDetails || {}}
          onChange={handleSpecificDetailsChange}
        />
      )}

      {formData.vendorType === 'market_vendor' && (
        <MarketVendorDetailsSection
          data={formData.marketVendorDetails || {}}
          onChange={handleSpecificDetailsChange}
        />
      )}

      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">Please fill in all required fields</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => setStep('common')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button type="button" onClick={handleFinalSubmit}>
          Complete
        </Button>
      </div>
    </div>
  )
}

// Backward-compatible export (uses venue as default type)
export { VendorDetailsForm as VenueDetailsForm }
