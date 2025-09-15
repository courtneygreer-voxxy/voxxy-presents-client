import React from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, MessageCircle } from "lucide-react"
import type { CreateClubStepProps } from '@/types/createClub'
import { FORM_STYLES } from '@/styles/forms'

interface CreateClubNameProps extends CreateClubStepProps {}

export default function CreateClubName({ data, updateData }: CreateClubNameProps) {
  const handleNameChange = (value: string) => {
    updateData({ name: value })
  }

  const handleDescriptionChange = (value: string) => {
    updateData({ description: value })
  }

  // Generate URL-friendly slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  const clubSlug = generateSlug(data.name)
  const charCount = data.description.length
  const maxChars = 600

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-white">Name & describe your club</h2>
        </div>
        <p className="text-gray-200">Choose a memorable name and tell people what your club is all about</p>
      </div>

      <div className={FORM_STYLES.container.centered}>
        <div className="space-y-6">
          {/* Club Name */}
          <div className="space-y-2">
            <p className={FORM_STYLES.labelCentered}>Club Name</p>
            <input
              id="name"
              placeholder="Brooklyn Hearts Club"
              value={data.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={FORM_STYLES.inputCentered}
              autoFocus
            />
          </div>

          {/* Club Description */}
          <div className="space-y-2">
            <p className={FORM_STYLES.labelCentered}>Short Description</p>
            <textarea
              id="description"
              placeholder="We're a vibrant community bringing together music lovers and creative souls in the heart of Brooklyn. Come for the beats, stay for the friendships! 🎵"
              value={data.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className={`${FORM_STYLES.textarea} min-h-[120px]`}
              maxLength={maxChars}
            />
            <div className="flex justify-end">
              <span className={`text-sm ${charCount > maxChars * 0.9 ? 'text-orange-400' : 'text-gray-300'}`}>
                {charCount}/{maxChars}
              </span>
            </div>
          </div>
        </div>

        {/* Preview URL */}
        {data.name && (
          <div className="text-center py-3 px-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg mt-6">
            <p className="text-xs text-gray-300 mb-2">Your club URL</p>
            <div className="font-mono bg-white/10 px-3 py-2 rounded-md border border-white/20 text-purple-300 text-sm">
              voxxypresents.com/{clubSlug}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}