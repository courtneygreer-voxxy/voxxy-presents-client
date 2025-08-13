import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Palette, Image, X } from "lucide-react"

interface CreateClubData {
  name: string
  description: string
  contactEmail: string
  defaultLocation: string
  defaultAddress: string
  logoUrl?: string
  bannerUrl?: string
  aboutImageUrl?: string
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

interface CreateClubBrandingProps {
  data: CreateClubData
  updateData: (updates: Partial<CreateClubData>) => void
  onNext: () => void
}

const PRESET_COLORS = [
  { name: 'Purple', primary: '#8B5CF6', bg: '#FFFFFF' },
  { name: 'Blue', primary: '#3B82F6', bg: '#FFFFFF' },
  { name: 'Green', primary: '#10B981', bg: '#FFFFFF' },
  { name: 'Pink', primary: '#EC4899', bg: '#FFFFFF' },
  { name: 'Orange', primary: '#F59E0B', bg: '#FFFFFF' },
  { name: 'Red', primary: '#EF4444', bg: '#FFFFFF' },
  { name: 'Indigo', primary: '#6366F1', bg: '#FFFFFF' },
  { name: 'Teal', primary: '#14B8A6', bg: '#FFFFFF' },
]

export default function CreateClubBranding({ data, updateData }: CreateClubBrandingProps) {
  const [uploading, setUploading] = useState({
    logo: false,
    banner: false,
    about: false
  })

  const handleFileUpload = async (type: 'logo' | 'banner' | 'about', file: File) => {
    // Validate file type
    const validTypes = ['image/svg+xml', 'image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (SVG, JPEG, or PNG)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(prev => ({ ...prev, [type]: true }))

    try {
      // Convert file to data URL for preview/storage
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        
        if (type === 'logo') {
          updateData({ logoUrl: dataUrl })
        } else if (type === 'banner') {
          updateData({ bannerUrl: dataUrl })
        } else if (type === 'about') {
          updateData({ aboutImageUrl: dataUrl })
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const removeImage = (type: 'logo' | 'banner' | 'about') => {
    if (type === 'logo') {
      updateData({ logoUrl: undefined })
    } else if (type === 'banner') {
      updateData({ bannerUrl: undefined })
    } else if (type === 'about') {
      updateData({ aboutImageUrl: undefined })
    }
  }

  const selectColorScheme = (colors: { primary: string; bg: string }) => {
    updateData({
      primaryColor: colors.primary,
      backgroundColor: colors.bg
    })
  }

  return (
    <div className="space-y-6">
      {/* Color Scheme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Scheme
          </CardTitle>
          <CardDescription>
            Choose colors that represent your club's personality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {PRESET_COLORS.map((scheme) => (
              <button
                key={scheme.name}
                onClick={() => selectColorScheme(scheme)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  data.primaryColor === scheme.primary
                    ? 'border-gray-800 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: scheme.primary }}
                  />
                  <span className="text-sm font-medium">{scheme.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primaryColor"
                  type="color"
                  value={data.primaryColor}
                  onChange={(e) => updateData({ primaryColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={data.primaryColor}
                  onChange={(e) => updateData({ primaryColor: e.target.value })}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={data.backgroundColor}
                  onChange={(e) => updateData({ backgroundColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={data.backgroundColor}
                  onChange={(e) => updateData({ backgroundColor: e.target.value })}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Club Logo
          </CardTitle>
          <CardDescription>
            Upload your club's logo (optional but recommended)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.logoUrl ? (
            <div className="flex items-center gap-4">
              <img 
                src={data.logoUrl} 
                alt="Club logo" 
                className="w-16 h-16 object-contain rounded-lg border"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">Logo uploaded</p>
                <p className="text-xs text-gray-500">This will appear across your club pages</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeImage('logo')}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={uploading.logo}
                    className="mb-2"
                  >
                    {uploading.logo ? 'Uploading...' : 'Choose Logo'}
                  </Button>
                  <p className="text-sm text-gray-500">SVG, PNG, JPG up to 5MB</p>
                </div>
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload('logo', file)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banner Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Banner Image</CardTitle>
          <CardDescription>
            A wide banner image for your club's header (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.bannerUrl ? (
            <div className="space-y-3">
              <img 
                src={data.bannerUrl} 
                alt="Banner" 
                className="w-full h-32 object-cover rounded-lg border"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Banner uploaded</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeImage('banner')}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    disabled={uploading.banner}
                  >
                    {uploading.banner ? 'Uploading...' : 'Choose Banner'}
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Recommended: 1200x400px or similar wide format
                  </p>
                </div>
              </div>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload('banner', file)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>See how your club's colors will look</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="p-6 rounded-lg border"
            style={{ backgroundColor: data.backgroundColor }}
          >
            <div className="flex items-center gap-3 mb-4">
              {data.logoUrl && (
                <img src={data.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              )}
              <h3 className="text-xl font-bold" style={{ color: data.primaryColor }}>
                {data.name || 'Your Club Name'}
              </h3>
            </div>
            <p className="text-gray-700 mb-4">
              {data.description || 'Your club description will appear here...'}
            </p>
            <button 
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: data.primaryColor }}
            >
              Sample Button
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}