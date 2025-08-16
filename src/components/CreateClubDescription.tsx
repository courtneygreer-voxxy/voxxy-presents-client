import React from 'react'
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle } from "lucide-react"
import type { CreateClubStepProps } from '@/types/createClub'

interface CreateClubDescriptionProps extends CreateClubStepProps {}

export default function CreateClubDescription({ data, updateData }: CreateClubDescriptionProps) {
  const handleInputChange = (value: string) => {
    updateData({ description: value })
  }

  const charCount = data.description.length
  const maxChars = 200

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MessageCircle className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">What's your club about?</h2>
        </div>
        <p className="text-gray-600">Give people a taste of what they'll experience 🌟</p>
      </div>

      <div className="max-w-lg mx-auto">
        <Textarea
          id="description"
          placeholder="We're a vibrant community bringing together music lovers and creative souls in the heart of Brooklyn. Come for the beats, stay for the friendships! 🎵"
          value={data.description}
          onChange={(e) => handleInputChange(e.target.value)}
          className="min-h-[120px] text-base"
          maxLength={maxChars}
          autoFocus
        />
        <div className="flex justify-end mt-2">
          <span className={`text-sm ${charCount > maxChars * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
            {charCount}/{maxChars}
          </span>
        </div>
      </div>

    </div>
  )
}