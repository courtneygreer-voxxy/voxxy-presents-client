import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from "lucide-react"
import type { AssetUpload, UploadResult } from '@/types/design'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  maxSize?: number // MB
  acceptedTypes?: string[]
}

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const DEFAULT_MAX_SIZE = 5 // 5MB

export function ImageUpload({ 
  onImageUpload, 
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES 
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [upload, setUpload] = useState<AssetUpload | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use JPG, PNG, or WebP.`
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`
    }

    return null
  }

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const validationError = validateFile(file)
    
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)

    try {
      const preview = await createPreview(file)
      const uploadData: AssetUpload = {
        file,
        preview,
        type: 'image',
        name: file.name,
        size: file.size,
      }

      setUpload(uploadData)
      setUploadStatus('idle')
    } catch (err) {
      setError('Failed to process the image. Please try again.')
    }
  }, [maxSize, acceptedTypes])

  const simulateUpload = useCallback(async (): Promise<UploadResult> => {
    // Simulate upload progress
    setUploadStatus('uploading')
    setUploadProgress(0)

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.random() * 15 + 5
          if (next >= 100) {
            clearInterval(interval)
            // In production, this would be the actual uploaded URL
            resolve({
              success: true,
              url: upload!.preview, // Using preview for demo
              assetId: `asset-${Date.now()}`,
            })
            return 100
          }
          return next
        })
      }, 200)
    })
  }, [upload])

  const handleUpload = useCallback(async () => {
    if (!upload) return

    try {
      const result = await simulateUpload()
      
      if (result.success && result.url) {
        setUploadStatus('success')
        onImageUpload(result.url)
        
        // Reset after 2 seconds
        setTimeout(() => {
          setUpload(null)
          setUploadProgress(0)
          setUploadStatus('idle')
        }, 2000)
      } else {
        setUploadStatus('error')
        setError(result.error || 'Upload failed')
      }
    } catch (err) {
      setUploadStatus('error')
      setError('Upload failed. Please try again.')
    }
  }, [upload, simulateUpload, onImageUpload])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }, [handleFiles])

  const clearUpload = useCallback(() => {
    setUpload(null)
    setUploadProgress(0)
    setUploadStatus('idle')
    setError(null)
  }, [])

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!upload && (
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className={`rounded-full p-4 mb-4 ${
              dragActive ? 'bg-primary/10' : 'bg-muted/50'
            }`}>
              <Upload className={`h-8 w-8 ${
                dragActive ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            
            <h3 className="font-medium text-foreground mb-2">
              {dragActive ? 'Drop your image here' : 'Upload Background Image'}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Drag and drop an image, or click to browse your files
            </p>
            
            <input
              type="file"
              accept={acceptedTypes.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            
            <Button
              asChild
              variant="outline"
              className="cursor-pointer"
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose Image
              </label>
            </Button>
            
            <p className="text-xs text-muted-foreground mt-3">
              Supports JPG, PNG, WebP up to {maxSize}MB
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Preview and Progress */}
      {upload && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={upload.preview}
                  alt={upload.name}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                {uploadStatus === 'success' && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-sm text-foreground truncate">
                      {upload.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(upload.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  
                  {uploadStatus === 'idle' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearUpload}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadStatus === 'uploading' && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Uploading... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}

                {/* Upload Actions */}
                {uploadStatus === 'idle' && (
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                )}

                {uploadStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">Upload complete!</span>
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600">Upload failed</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUpload}
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Tips */}
      {!upload && !error && (
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Tips for best results:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Use high-resolution images (at least 1200px wide)</li>
            <li>Images with good contrast work best with text overlays</li>
            <li>Landscape orientation works better for page backgrounds</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ImageUpload