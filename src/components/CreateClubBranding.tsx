import React, { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Palette, Sparkles } from "lucide-react"
import { compressImage, validateImageFile } from '@/utils/imageCompression'
import type { CreateClubStepProps } from '@/types/createClub'

interface CreateClubBrandingProps extends CreateClubStepProps {}

export default function CreateClubBranding({ data, updateData }: CreateClubBrandingProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<'logo' | null>(null)

  const handleFileUpload = () => {
    logoInputRef.current?.click()
  }

  const processFile = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setUploading('logo')

    try {
      // Compress image for logo
      const maxSize = 200 // Logo: 200KB
      const cropToSquare = true // Crop logo to square

      const compressedDataUrl = await compressImage(file, maxSize, cropToSquare)

      // Update the data
      updateData({ logoUrl: compressedDataUrl })

    } catch (error) {
      console.error('Error processing logo:', error)
      alert('Error processing logo. Please try a different file.')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Palette className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-white">Make it yours</h2>
        </div>
        <p className="text-gray-200">Add some visual flair to your club page ✨</p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Logo Upload */}
        <Card className="bg-white/10 backdrop-blur-sm border-dashed border-2 border-white/30 hover:border-purple-400 transition-colors cursor-pointer"
              onClick={handleFileUpload}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Club Logo</h3>
              <p className="text-sm text-gray-300 mb-2">
                Upload a square image (recommended: 300x300px)
              </p>
              {uploading === 'logo' ? (
                <div className="mt-3">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-blue-300">Processing image...</p>
                </div>
              ) : data.logoUrl ? (
                <div className="mt-3">
                  <img
                    src={data.logoUrl}
                    alt="Logo preview"
                    className="w-16 h-16 object-cover rounded-lg mx-auto border"
                  />
                  <p className="text-xs text-green-300 mt-1">✓ Logo uploaded</p>
                </div>
              ) : (
                <p className="text-xs text-gray-300">Click to browse files</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Pro tip */}
      <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4 max-w-lg mx-auto">
        <div className="text-sm text-blue-200">
          <p className="font-medium mb-1">🚀 Pro tip</p>
          <p>A high-quality logo makes your club look more professional and helps attract members!</p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={logoInputRef}
        type="file"
        accept=".svg,.jpeg,.jpg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            processFile(file)
            e.target.value = '' // Reset input
          }
        }}
        className="hidden"
      />
    </div>
  )
}