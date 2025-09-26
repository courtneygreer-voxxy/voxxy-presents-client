import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            How should event organizers and our team reach you?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ownerName">Full Name *</Label>
            <Input
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              className={errors.ownerName ? 'border-red-500' : ''}
            />
            {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>}
          </div>

          <div>
            <Label htmlFor="ownerEmail">Email Address *</Label>
            <Input
              id="ownerEmail"
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
              className={errors.ownerEmail ? 'border-red-500' : ''}
            />
            {errors.ownerEmail && <p className="text-red-500 text-sm mt-1">{errors.ownerEmail}</p>}
          </div>

          <div>
            <Label htmlFor="ownerPhone">Phone Number</Label>
            <Input
              id="ownerPhone"
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
              placeholder="(555) 123-4567"
              className={errors.ownerPhone ? 'border-red-500' : ''}
            />
            {errors.ownerPhone && <p className="text-red-500 text-sm mt-1">{errors.ownerPhone}</p>}
          </div>

          <div>
            <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
            <Select
              value={formData.preferredContactMethod}
              onValueChange={(value) => handleInputChange('preferredContactMethod', value as 'email' | 'phone')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Tell us more about your business (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="businessInfo">Business Details</Label>
            <Textarea
              id="businessInfo"
              value={formData.businessInfo}
              onChange={(e) => handleInputChange('businessInfo', e.target.value)}
              placeholder="Tell us about your business, years in operation, special certifications, etc."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="message">Additional Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Anything else you'd like our team to know?"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">
          Continue to Review
        </Button>
      </div>
    </form>
  )
}