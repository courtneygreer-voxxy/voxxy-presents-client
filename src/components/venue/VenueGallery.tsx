import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface VenueGalleryProps {
  photos: string[]
  venueName: string
}

export function VenueGallery({ photos, venueName }: VenueGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)

  if (!photos || photos.length === 0) {
    return (
      <Card className="aspect-video bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No photos available</p>
      </Card>
    )
  }

  const openLightbox = (index: number) => {
    setSelectedPhoto(index)
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const nextPhoto = () => {
    if (selectedPhoto !== null) {
      setSelectedPhoto((selectedPhoto + 1) % photos.length)
    }
  }

  const prevPhoto = () => {
    if (selectedPhoto !== null) {
      setSelectedPhoto(selectedPhoto === 0 ? photos.length - 1 : selectedPhoto - 1)
    }
  }

  return (
    <>
      {/* Main Gallery Carousel - Larger Images Full Width */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="relative w-64 h-48 flex-shrink-0 overflow-hidden rounded-lg group hover:opacity-95 transition-opacity"
            >
              <img
                src={photo}
                alt={`${venueName} - Photo ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
            </button>
          ))}

          {/* Show placeholder if no photos */}
          {photos.length === 0 && (
            <div className="w-64 h-48 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-gray-400 text-sm">No photos available</span>
            </div>
          )}
        </div>

        {/* Scroll indicator for many photos */}
        {photos.length > 2 && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none rounded-r-lg" />
        )}
      </div>

      {/* Show all photos button if more than 4 */}
      {photos.length > 4 && (
        <Button 
          variant="outline" 
          className="mt-4 w-full bg-white/10 border-white/20 text-white hover:bg-white/15"
          onClick={() => openLightbox(0)}
        >
          View All {photos.length} Photos
        </Button>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-5xl max-h-full p-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Main Image */}
            <img
              src={photos[selectedPhoto]}
              alt={`${venueName} - Photo ${selectedPhoto + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Photo Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
              {selectedPhoto + 1} of {photos.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}