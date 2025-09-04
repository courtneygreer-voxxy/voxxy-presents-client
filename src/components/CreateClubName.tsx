import React from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import type { CreateClubStepProps } from '@/types/createClub'
import { FORM_STYLES } from '@/styles/forms'

interface CreateClubNameProps extends CreateClubStepProps {}

export default function CreateClubName({ data, updateData }: CreateClubNameProps) {
  const handleNameChange = (value: string) => {
    updateData({ name: value })
  }

  const handleTaglineChange = (value: string) => {
    updateData({ tagline: value })
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

  return (
    <div className={FORM_STYLES.container.centered}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Name your club</h2>
        <p className="text-gray-200">Choose a memorable name and tagline</p>
      </div>

      <div className="space-y-4">
        <div>
          <input
            id="name"
            placeholder="Brooklyn Hearts Club"
            value={data.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={FORM_STYLES.inputCentered}
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <p className={FORM_STYLES.labelCentered}>Tagline</p>
          <input
            id="tagline"
            placeholder="Where music meets community"
            value={data.tagline}
            onChange={(e) => handleTaglineChange(e.target.value)}
            className={FORM_STYLES.inputCentered}
          />
        </div>
      </div>

      {/* Preview URL */}
      {data.name && (
        <div className="text-center py-3 px-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <p className="text-xs text-gray-300 mb-2">Your club URL</p>
          <div className="font-mono bg-white/10 px-3 py-2 rounded-md border border-white/20 text-purple-300 text-sm">
            voxxypresents.com/{clubSlug}
          </div>
        </div>
      )}
    </div>
  )
}