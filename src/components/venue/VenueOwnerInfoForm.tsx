import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VenueCreationRequest } from '@/types/venue'

interface VenueOwnerInfoFormProps {
  initialData?: Partial<VenueCreationRequest>
  userEmail: string
  userName: string
  onComplete: (data: Partial<VenueCreationRequest>) => void
  onBack: () => void
}

export function VenueOwnerInfoForm({ initialData, userEmail, userName, onComplete, onBack }: VenueOwnerInfoFormProps) {
  const [formData, setFormData] = useState({
    ownerName: initialData?.ownerName || userName,
    ownerEmail: initialData?.ownerEmail || userEmail,
    ownerPhone: initialData?.ownerPhone || '',
    businessInfo: initialData?.businessInfo || '',
    message: initialData?.message || '',
    preferredContactMethod: initialData?.preferredContactMethod || ('email' as 'email' | 'phone')
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.ownerName.trim()) newErrors.ownerName = 'Name is required'
    if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Email is required'
    if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) newErrors.ownerEmail = 'Valid email is required'
    if (formData.preferredContactMethod === 'phone' && !formData.ownerPhone.trim()) {
      newErrors.ownerPhone = 'Phone number required when phone is preferred contact method'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onComplete(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Contact Information</h3>
          <p className="text-gray-300">
            How should event organizers and our team reach you?
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ownerName" className="text-white">Full Name *</Label>
            <Input
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 ${errors.ownerName ? 'border-red-400' : ''}`}
            />
            {errors.ownerName && <p className="text-red-400 text-sm mt-1">{errors.ownerName}</p>}
          </div>

          <div>
            <Label htmlFor="ownerEmail" className="text-white">Email Address *</Label>
            <Input
              id="ownerEmail"
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
              className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 ${errors.ownerEmail ? 'border-red-400' : ''}`}
            />
            {errors.ownerEmail && <p className="text-red-400 text-sm mt-1">{errors.ownerEmail}</p>}
          </div>

          <div>
            <Label htmlFor="ownerPhone" className="text-white">Phone Number</Label>
            <Input
              id="ownerPhone"
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
              placeholder="(555) 123-4567"
              className={`bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 ${errors.ownerPhone ? 'border-red-400' : ''}`}
            />
            {errors.ownerPhone && <p className="text-red-400 text-sm mt-1">{errors.ownerPhone}</p>}
          </div>

          <div>
            <Label htmlFor="preferredContactMethod" className="text-white">Preferred Contact Method</Label>
            <Select
              value={formData.preferredContactMethod}
              onValueChange={(value) => handleInputChange('preferredContactMethod', value as 'email' | 'phone')}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="email" className="text-white hover:bg-gray-700">Email</SelectItem>
                <SelectItem value="phone" className="text-white hover:bg-gray-700">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Business Information</h3>
          <p className="text-gray-300">
            Tell us more about your business (optional)
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessInfo" className="text-white">Business Details</Label>
            <Textarea
              id="businessInfo"
              value={formData.businessInfo}
              onChange={(e) => handleInputChange('businessInfo', e.target.value)}
              placeholder="Tell us about your business, years in operation, special certifications, etc."
              rows={3}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-white">Additional Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Anything else you'd like our team to know?"
              rows={3}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Continue to Review
        </Button>
      </div>
    </form>
  )
}