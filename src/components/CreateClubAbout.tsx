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
          <Heart className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Tell your story</h2>
        </div>
        <p className="text-gray-200">Share what makes your club special (totally optional, but people love it!) ✨</p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* About Story */}
        <div>
          <textarea
            id="aboutStory"
            placeholder="We started in Sarah's living room with just 3 friends and a dream to bring more music to Brooklyn. Now we're 200+ strong and still growing! We believe great music brings people together, and every event feels like a house party with your best friends... (optional)"
            value={data.aboutStory || ''}
            onChange={(e) => handleStoryChange(e.target.value)}
            className="w-full min-h-[120px] text-base p-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200 resize-none"
            autoFocus
          />
        </div>

        {/* What You Offer */}
        <div>
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white">What do you offer?</h3>
            <p className="text-sm text-gray-300">List the types of activities or experiences your club provides</p>
          </div>
          <div className="space-y-2">
            {offerings.map((offering, index) => (
              <div key={index} className="flex gap-2">
                <input
                  placeholder="Live music nights"
                  value={offering}
                  onChange={(e) => handleOfferingChange(index, e.target.value)}
                  className="flex-1 text-base py-3 px-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
                />
                {offerings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOffering(index)}
                    className="shrink-0 p-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOffering}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              Add another offering
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}