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
      {/* Main Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {/* Primary Photo */}
        <div className="md:col-span-2 md:row-span-2">
          <button
            onClick={() => openLightbox(0)}
            className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg group hover:opacity-95 transition-opacity"
          >
            <img
              src={photos[0]}
              alt={`${venueName} - Main photo`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
          </button>
        </div>

        {/* Additional Photos */}
        {photos.slice(1, 5).map((photo, index) => (
          <button
            key={index + 1}
            onClick={() => openLightbox(index + 1)}
            className="relative h-32 md:h-[11.5rem] overflow-hidden rounded-lg group hover:opacity-95 transition-opacity"
          >
            <img
              src={photo}
              alt={`${venueName} - Photo ${index + 2}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
            
            {/* Show "View All" overlay on last visible photo if there are more */}
            {index === 3 && photos.length > 5 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-semibold">+{photos.length - 5} more</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Show all photos button if more than 5 */}
      {photos.length > 5 && (
        <Button 
          variant="outline" 
          className="mt-4 w-full md:w-auto"
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