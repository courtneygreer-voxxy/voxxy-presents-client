import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Save, Eye, Upload, Link } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ImageCarousel from "./ImageCarousel"
import { compressImage, validateImageFile } from '@/utils/imageCompression'
import type { Organization } from '@/types/database'

interface AboutImagesManagerProps {
  organization: Organization
  onSave: (updates: Partial<Organization>) => Promise<void>
  isSaving?: boolean
}

export default function AboutImagesManager({ organization, onSave, isSaving = false }: AboutImagesManagerProps) {
  // Initialize with current aboutImages or fall back to single aboutImageUrl
  const initialImages = organization.aboutImages && organization.aboutImages.length > 0 
    ? [...organization.aboutImages]
    : organization.aboutImageUrl 
      ? [organization.aboutImageUrl]
      : []
  
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file')

  const addImage = () => {
    if (newImageUrl.trim()) {
      // Check if we're approaching the limit
      if (imageUrls.length >= 5) {
        alert('Maximum 5 images allowed to stay within storage limits. Please remove some images first.')
        return
      }
      
      setImageUrls(prev => [...prev, newImageUrl.trim()])
      setNewImageUrl('')
      setHasChanges(true)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if we're approaching the limit (max 5 images to be safe)
    if (imageUrls.length >= 5) {
      alert('Maximum 5 images allowed to stay within storage limits. Please remove some images first.')
      e.target.value = ''
      return
    }

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setIsUploading(true)
    
    try {
      // Handle SVG files differently (but still compress them)
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          // Check SVG size and warn if too large
          if (dataUrl.length > 150 * 1024) { // 150KB limit for SVGs
            alert('SVG file is too large. Please use a smaller SVG file.')
            setIsUploading(false)
            return
          }
          setImageUrls(prev => [...prev, dataUrl])
          setHasChanges(true)
          setIsUploading(false)
          // Reset file input
          e.target.value = ''
        }
        reader.onerror = () => {
          alert('Error reading SVG file')
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      } else {
        // Compress regular images very aggressively for about images
        // Target ~150KB per image to allow 5 images + other org data within 1MB
        const compressedDataUrl = await compressImage(file, 150, false) // 150KB target, no cropping
        
        // Double-check size after compression
        if (compressedDataUrl.length > 200 * 1024) { // 200KB hard limit
          alert('Image is still too large after compression. Please try a smaller image.')
          setIsUploading(false)
          return
        }
        
        setImageUrls(prev => [...prev, compressedDataUrl])
        setHasChanges(true)
        setIsUploading(false)
        // Reset file input
        e.target.value = ''
      }
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Error processing image. Please try a different file.')
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const updateImage = (index: number, url: string) => {
    setImageUrls(prev => prev.map((img, i) => i === index ? url : img))
    setHasChanges(true)
  }

  const moveImageUp = (index: number) => {
    if (index > 0) {
      setImageUrls(prev => {
        const newUrls = [...prev]
        ;[newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]]
        return newUrls
      })
      setHasChanges(true)
    }
  }

  const moveImageDown = (index: number) => {
    if (index < imageUrls.length - 1) {
      setImageUrls(prev => {
        const newUrls = [...prev]
        ;[newUrls[index], newUrls[index + 1]] = [newUrls[index + 1], newUrls[index]]
        return newUrls
      })
      setHasChanges(true)
    }
  }

  const handleSave = async () => {
    try {
      const updates: Partial<Organization> = {
        aboutImages: imageUrls.length > 0 ? imageUrls : undefined,
        // Keep single aboutImageUrl for backwards compatibility
        aboutImageUrl: imageUrls.length > 0 ? imageUrls[0] : undefined
      }
      
      await onSave(updates)
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save about images:', error)
    }
  }

  const handleReset = () => {
    setImageUrls(initialImages)
    setNewImageUrl('')
    setHasChanges(false)
  }

  return (
    <div className="admin-dark">
    <Card className="!bg-white/10 backdrop-blur-sm !border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">About Section Images</CardTitle>
            <CardDescription className="text-gray-300">
              Manage images that appear in the About section of your club page
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        {showPreview && (
          <div className="border border-white/20 rounded-lg p-4 bg-white/5 backdrop-blur-sm">
            <Label className="text-sm font-medium text-white mb-2 block">Preview</Label>
            <div className="w-full max-w-md">
              <ImageCarousel
                images={imageUrls}
                altText={`${organization.name} About`}
                className="w-full h-48"
              />
            </div>
          </div>
        )}

        {/* Add New Image */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Add New Image</Label>
          
          <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'file' | 'url')}>
            <TabsList className="grid w-full grid-cols-2 !bg-white/10 border border-white/20">
              <TabsTrigger value="file" className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white">
                <Upload className="h-4 w-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white">
                <Link className="h-4 w-4" />
                Image URL
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-2">
              <input
                id="imageFile"
                type="file"
                accept=".svg,.jpeg,.jpg,.png"
                onChange={handleFileUpload}
                disabled={isUploading || imageUrls.length >= 5}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isUploading && (
                <p className="text-xs text-blue-400 flex items-center gap-1">
                  <span className="animate-spin">⭐</span>
                  Processing and compressing image...
                </p>
              )}
              <p className="text-xs text-gray-400">
                Upload JPEG, PNG, or SVG files (max 20MB source). Images will be heavily compressed to stay within database limits. Maximum 5 images.
              </p>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="newImageUrl"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  onKeyPress={(e) => e.key === 'Enter' && addImage()}
                />
                <Button onClick={addImage} disabled={!newImageUrl.trim() || imageUrls.length >= 5}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Paste a direct link to an image file hosted elsewhere
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Current Images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className={`text-sm font-medium ${imageUrls.length >= 5 ? 'text-red-600' : imageUrls.length >= 4 ? 'text-orange-600' : ''}`}>
              Current Images ({imageUrls.length}/5)
            </Label>
            {imageUrls.length > 0 && (
              <p className="text-xs text-gray-400">
                First image will be the main image
              </p>
            )}
            {imageUrls.length >= 5 && (
              <p className="text-xs text-red-600 font-medium">
                ⚠️ Maximum limit reached. Remove images to add new ones.
              </p>
            )}
          </div>

          {imageUrls.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <p>No images added yet</p>
              <p className="text-sm">Add image URLs above to get started</p>
            </div>
          )}

          {imageUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                <img
                  src={url}
                  alt={`About image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <Input
                  value={url}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="Image URL"
                  className="text-sm"
                />
              </div>

              <div className="flex items-center gap-1">
                {index === 0 && imageUrls.length > 1 && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Main
                  </span>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveImageUp(index)}
                  disabled={index === 0}
                  title="Move up"
                >
                  ↑
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveImageDown(index)}
                  disabled={index === imageUrls.length - 1}
                  title="Move down"
                >
                  ↓
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="text-red-600 hover:text-red-700"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Save/Reset Actions */}
        {hasChanges && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Save className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  )
}