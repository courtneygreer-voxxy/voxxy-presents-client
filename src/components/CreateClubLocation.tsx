import React from 'react'
import { Input } from "@/components/ui/input"
import { MapPin, Info } from "lucide-react"
import type { CreateClubStepProps } from '@/types/createClub'

interface CreateClubLocationProps extends CreateClubStepProps {}

export default function CreateClubLocation({ data, updateData }: CreateClubLocationProps) {
  const handleLocationChange = (value: string) => {
    updateData({ defaultLocation: value })
  }

  const handleAddressChange = (value: string) => {
    updateData({ defaultAddress: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MapPin className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Where do you usually meet?</h2>
        </div>
        <p className="text-gray-200">Help people know what to expect (you can always change this later) 📍</p>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <input
            id="defaultLocation"
            placeholder="Brooklyn Community Center"
            value={data.defaultLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full text-base py-3 px-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
            autoFocus
          />
        </div>

        <div>
          <input
            id="defaultAddress"
            placeholder="123 Community St, Brooklyn, NY 11201 (optional)"
            value={data.defaultAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            className="w-full text-base py-3 px-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Info note */}
      <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 rounded-lg p-4 max-w-lg mx-auto">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-300 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-200">
            <p className="font-medium mb-1">No pressure!</p>
            <p>You can change locations for each event. This just helps people know your general area and vibe.</p>
          </div>
        </div>
      </div>

    </div>
  )
}