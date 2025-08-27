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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900">Let's name your club!</h2>
        </div>
        <p className="text-gray-600">Pick a memorable name and add a catchy tagline ✨</p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Club Name
          </label>
          <Input
            id="name"
            placeholder="Brooklyn Hearts Club"
            value={data.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="text-lg py-3 text-center"
            autoFocus
          />
        </div>
        
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
            Tagline
          </label>
          <Input
            id="tagline"
            placeholder="Where music meets community"
            value={data.tagline}
            onChange={(e) => handleTaglineChange(e.target.value)}
            className="text-base py-2 text-center"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            A short phrase that captures what you're all about
          </p>
        </div>
      </div>

      {/* Preview URL */}
      {data.name && (
        <Card className="bg-purple-50 border-purple-200 max-w-md mx-auto">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Your club will live at:</p>
              <div className="font-mono bg-white px-3 py-2 rounded border text-purple-600 text-sm">
                voxxypresents.com/{clubSlug}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}