import React, { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Palette, Sparkles } from "lucide-react"
import { compressImage, validateImageFile } from '@/utils/imageCompression'
import type { CreateClubStepProps } from '@/types/createClub'

interface CreateClubBrandingProps extends CreateClubStepProps {}

export default function CreateClubBranding({ data, updateData }: CreateClubBrandingProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null)

  const handleFileUpload = (type: 'logo' | 'banner') => {
    if (type === 'logo') {
      logoInputRef.current?.click()
    } else {
      bannerInputRef.current?.click()
    }
  }

  const processFile = async (file: File, type: 'logo' | 'banner') => {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setUploading(type)
    
    try {
      // Compress image based on type
      const maxSize = type === 'logo' ? 200 : 400 // Logo: 200KB, Banner: 400KB
      const cropToSquare = type === 'logo' // Crop logo to square, keep banner aspect ratio
      
      const compressedDataUrl = await compressImage(file, maxSize, cropToSquare)
      
      // Update the data
      if (type === 'logo') {
        updateData({ logoUrl: compressedDataUrl })
      } else {
        updateData({ bannerUrl: compressedDataUrl })
      }
      
    } catch (error) {
      console.error(`Error processing ${type}:`, error)
      alert(`Error processing ${type}. Please try a different file.`)
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Palette className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">Make it yours</h2>
        </div>
        <p className="text-gray-600">Add some visual flair to your club page ✨</p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Logo Upload */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => handleFileUpload('logo')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Club Logo</h3>
              <p className="text-sm text-gray-500 mb-2">
                Upload a square image (recommended: 300x300px)
              </p>
              {uploading === 'logo' ? (
                <div className="mt-3">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-blue-600">Processing image...</p>
                </div>
              ) : data.logoUrl ? (
                <div className="mt-3">
                  <img 
                    src={data.logoUrl} 
                    alt="Logo preview" 
                    className="w-16 h-16 object-cover rounded-lg mx-auto border"
                  />
                  <p className="text-xs text-green-600 mt-1">✓ Logo uploaded</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Click to browse files</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Header Photo Upload */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => handleFileUpload('banner')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Header Photo</h3>
              <p className="text-sm text-gray-500 mb-2">
                Upload a wide image (recommended: 1200x400px)
              </p>
              {uploading === 'banner' ? (
                <div className="mt-3">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-blue-600">Processing image...</p>
                </div>
              ) : data.bannerUrl ? (
                <div className="mt-3">
                  <img 
                    src={data.bannerUrl} 
                    alt="Header preview" 
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <p className="text-xs text-green-600 mt-1">✓ Header uploaded</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Click to browse files</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon: Design Themes */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              Design Themes
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Coming Soon
              </Badge>
            </CardTitle>
            <CardDescription className="text-purple-700">
              Choose from beautiful backgrounds and color schemes to match your club's vibe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {/* Preview placeholders */}
              {[
                { name: 'Minimal', color: 'bg-gray-100' },
                { name: 'Vibrant', color: 'bg-gradient-to-br from-pink-200 to-purple-200' },
                { name: 'Nature', color: 'bg-gradient-to-br from-green-200 to-blue-200' }
              ].map((theme, index) => (
                <div key={index} className="text-center">
                  <div className={`${theme.color} h-16 rounded-lg mb-2 opacity-50`} />
                  <p className="text-xs text-purple-600 font-medium">{theme.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pro tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">🚀 Pro tip</p>
          <p>High-quality images make your club look more professional and help attract members!</p>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept=".svg,.jpeg,.jpg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            processFile(file, 'logo')
            e.target.value = '' // Reset input
          }
        }}
        className="hidden"
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept=".svg,.jpeg,.jpg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            processFile(file, 'banner')
            e.target.value = '' // Reset input
          }
        }}
        className="hidden"
      />
    </div>
  )
}