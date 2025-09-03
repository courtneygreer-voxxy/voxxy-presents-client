import React from 'react'
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle } from "lucide-react"
import type { CreateClubStepProps } from '@/types/createClub'
import { FORM_STYLES } from '@/styles/forms'

interface CreateClubDescriptionProps extends CreateClubStepProps {}

export default function CreateClubDescription({ data, updateData }: CreateClubDescriptionProps) {
  const handleInputChange = (value: string) => {
    updateData({ description: value })
  }

  const charCount = data.description.length
  const maxChars = 600

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MessageCircle className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Describe your club</h2>
        </div>
        <p className="text-gray-200">Tell people what your club is all about and what they can expect 🌟</p>
      </div>

      <div className={FORM_STYLES.container.centered}>
        <textarea
          id="description"
          placeholder="We're a vibrant community bringing together music lovers and creative souls in the heart of Brooklyn. Come for the beats, stay for the friendships! 🎵"
          value={data.description}
          onChange={(e) => handleInputChange(e.target.value)}
          className={`${FORM_STYLES.textarea} min-h-[120px]`}
          maxLength={maxChars}
          autoFocus
        />
        <div className="flex justify-end mt-2">
          <span className={`text-sm ${charCount > maxChars * 0.9 ? 'text-orange-400' : 'text-gray-300'}`}>
            {charCount}/{maxChars}
          </span>
        </div>
      </div>

    </div>
  )
}