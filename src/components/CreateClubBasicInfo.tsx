import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Mail, MapPin, FileText } from "lucide-react"

interface CreateClubData {
  name: string
  description: string
  contactEmail: string
  defaultLocation: string
  defaultAddress: string
  primaryColor: string
  backgroundColor: string
  socialLinks: {
    instagram?: string
    website?: string
    eventbrite?: string
    venmo?: string
    other?: string
  }
  aboutStory?: string
  aboutOfferings?: string[]
}

interface CreateClubBasicInfoProps {
  data: CreateClubData
  updateData: (updates: Partial<CreateClubData>) => void
  onNext: () => void
}

export default function CreateClubBasicInfo({ data, updateData }: CreateClubBasicInfoProps) {
  const handleInputChange = (field: keyof CreateClubData, value: string) => {
    updateData({ [field]: value })
  }

  // Generate URL-friendly slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  const clubSlug = generateSlug(data.name)

  return (
    <div className="space-y-6">
      {/* Preview URL */}
      {data.name && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Your club will be available at:</span>
              <span className="font-mono bg-white px-2 py-1 rounded border">
                voxxypresents.com/{clubSlug}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Club Name */}
        <div className="md:col-span-2">
          <Label htmlFor="name" className="flex items-center gap-2 text-base font-semibold">
            <Building2 className="h-4 w-4" />
            Club Name *
          </Label>
          <Input
            id="name"
            placeholder="Brooklyn Hearts Club"
            value={data.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            This will be the public name of your organization
          </p>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <Label htmlFor="description" className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4" />
            Description *
          </Label>
          <Textarea
            id="description"
            placeholder="A vibrant community bringing together music lovers and creative souls in the heart of Brooklyn..."
            value={data.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="mt-2 min-h-[100px]"
          />
          <p className="text-sm text-gray-500 mt-1">
            Brief description that will appear on your club's main page
          </p>
        </div>

        {/* Contact Email */}
        <div>
          <Label htmlFor="contactEmail" className="flex items-center gap-2 text-base font-semibold">
            <Mail className="h-4 w-4" />
            Contact Email *
          </Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="hello@brooklynhearts.com"
            value={data.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Public contact email for inquiries
          </p>
        </div>

        {/* Default Location */}
        <div>
          <Label htmlFor="defaultLocation" className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="h-4 w-4" />
            Default Event Location
          </Label>
          <Input
            id="defaultLocation"
            placeholder="Brooklyn Community Center"
            value={data.defaultLocation}
            onChange={(e) => handleInputChange('defaultLocation', e.target.value)}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Common venue name for your events (optional)
          </p>
        </div>

        {/* Default Address */}
        <div className="md:col-span-2">
          <Label htmlFor="defaultAddress" className="text-base font-semibold">
            Default Event Address
          </Label>
          <Input
            id="defaultAddress"
            placeholder="123 Community St, Brooklyn, NY 11201"
            value={data.defaultAddress}
            onChange={(e) => handleInputChange('defaultAddress', e.target.value)}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Default address for events (can be changed per event)
          </p>
        </div>
      </div>

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-900">💡 Tips for Success</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• Choose a memorable name that reflects your community's vibe</p>
          <p>• Keep your description engaging but concise (2-3 sentences work well)</p>
          <p>• Use a professional email that matches your brand</p>
          <p>• Location info helps attendees know what to expect</p>
        </CardContent>
      </Card>
    </div>
  )
}