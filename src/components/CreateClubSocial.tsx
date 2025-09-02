import React from 'react'
import { Input } from "@/components/ui/input"
import { Share2 } from "lucide-react"
import type { CreateClubStepProps, CreateClubData } from '@/types/createClub'

interface CreateClubSocialProps extends CreateClubStepProps {}

export default function CreateClubSocial({ data, updateData }: CreateClubSocialProps) {
  const handleSocialChange = (platform: keyof CreateClubData['socialLinks'], value: string) => {
    updateData({
      socialLinks: {
        ...data.socialLinks,
        [platform]: value
      }
    })
  }

  const socialInputs = [
    {
      key: 'instagram' as const,
      emoji: '📸',
      placeholder: 'Instagram: @brooklynhearts or full URL'
    },
    {
      key: 'website' as const,
      emoji: '🌐',
      placeholder: 'Website: https://brooklynhearts.com'
    },
    {
      key: 'eventbrite' as const,
      emoji: '🎫',
      placeholder: 'Eventbrite: https://eventbrite.com/o/...'
    },
    {
      key: 'meetup' as const,
      emoji: '👥',
      placeholder: 'Meetup: https://meetup.com/...'
    },
    {
      key: 'linktree' as const,
      emoji: '🌳',
      placeholder: 'Linktree: https://linktr.ee/...'
    },
    {
      key: 'venmo' as const,
      emoji: '💰',
      placeholder: 'Venmo: @brooklyn-hearts'
    },
    {
      key: 'other' as const,
      emoji: '🔗',
      placeholder: 'Other: Discord, Slack, WhatsApp, etc.'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Share2 className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Connect your socials</h2>
        </div>
        <p className="text-gray-200">Help people find you everywhere (all optional!) 🔗</p>
      </div>

      <div className="max-w-lg mx-auto space-y-3">
        {socialInputs.map(({ key, emoji, placeholder }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-lg">{emoji}</span>
            <input
              id={key}
              placeholder={placeholder}
              value={data.socialLinks[key] || ''}
              onChange={(e) => handleSocialChange(key, e.target.value)}
              className="flex-1 text-base py-3 px-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-200"
            />
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4 max-w-lg mx-auto">
        <div className="text-sm text-green-200">
          <p className="font-medium mb-1">🚀 Pro tip</p>
          <p>Adding social links helps people get excited before events and stay connected between meetups!</p>
        </div>
      </div>

    </div>
  )
}