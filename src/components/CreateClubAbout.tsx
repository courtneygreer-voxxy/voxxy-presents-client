import React from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Heart, Plus, X } from "lucide-react"
import type { CreateClubStepProps } from '@/types/createClub'

interface CreateClubAboutProps extends CreateClubStepProps {}

export default function CreateClubAbout({ data, updateData }: CreateClubAboutProps) {
  const handleStoryChange = (value: string) => {
    updateData({ aboutStory: value })
  }

  const handleOfferingChange = (index: number, value: string) => {
    const newOfferings = [...(data.aboutOfferings || [''])]
    newOfferings[index] = value
    updateData({ aboutOfferings: newOfferings })
  }

  const addOffering = () => {
    const newOfferings = [...(data.aboutOfferings || []), '']
    updateData({ aboutOfferings: newOfferings })
  }

  const removeOffering = (index: number) => {
    const newOfferings = (data.aboutOfferings || []).filter((_, i) => i !== index)
    updateData({ aboutOfferings: newOfferings.length > 0 ? newOfferings : [''] })
  }

  const offerings = data.aboutOfferings || ['']

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">Tell your story</h2>
        </div>
        <p className="text-gray-600">Share what makes your club special (totally optional, but people love it!) ✨</p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* About Story */}
        <div>
          <Textarea
            id="aboutStory"
            placeholder="We started in Sarah's living room with just 3 friends and a dream to bring more music to Brooklyn. Now we're 200+ strong and still growing! We believe great music brings people together, and every event feels like a house party with your best friends... (optional)"
            value={data.aboutStory || ''}
            onChange={(e) => handleStoryChange(e.target.value)}
            className="min-h-[120px] text-base"
            autoFocus
          />
        </div>

        {/* What You Offer */}
        <div>
          <div className="space-y-2">
            {offerings.map((offering, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Live music nights"
                  value={offering}
                  onChange={(e) => handleOfferingChange(index, e.target.value)}
                  className="text-base"
                />
                {offerings.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOffering(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addOffering}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add another offering
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}