import React from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import type { CreateClubStepProps } from '@/types/createClub'

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
    <div className="max-w-lg mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Name your club</h2>
        <p className="text-gray-200 text-lg">Choose a memorable name and tagline</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <input
            id="name"
            placeholder="Brooklyn Hearts Club"
            value={data.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full text-xl py-4 px-6 text-center bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
            autoFocus
          />
          <p className="text-sm text-gray-300 text-center">Club name</p>
        </div>
        
        <div className="space-y-3">
          <input
            id="tagline"
            placeholder="Where music meets community"
            value={data.tagline}
            onChange={(e) => handleTaglineChange(e.target.value)}
            className="w-full text-lg py-3 px-6 text-center bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
          />
          <p className="text-sm text-gray-300 text-center">Tagline</p>
        </div>
      </div>

      {/* Preview URL */}
      {data.name && (
        <div className="text-center py-4 px-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <p className="text-sm text-gray-300 mb-2">Your club URL</p>
          <div className="font-mono bg-white/10 px-4 py-2 rounded-md border border-white/20 text-purple-300 text-base">
            voxxypresents.com/{clubSlug}
          </div>
        </div>
      )}
    </div>
  )
}