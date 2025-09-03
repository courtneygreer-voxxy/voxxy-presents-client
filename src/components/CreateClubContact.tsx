import React from 'react'
import { Input } from "@/components/ui/input"
import { Mail, Shield } from "lucide-react"
import type { CreateClubStepProps } from '@/types/createClub'
import { FORM_STYLES } from '@/styles/forms'

interface CreateClubContactProps extends CreateClubStepProps {}

export default function CreateClubContact({ data, updateData }: CreateClubContactProps) {
  const handleInputChange = (value: string) => {
    updateData({ contactEmail: value })
  }

  const isValidEmail = (email: string) => {
    return email.includes('@') && email.includes('.')
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Mail className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">How can people reach you?</h2>
        </div>
        <p className="text-gray-200">We'll use this for important updates and member questions 📧</p>
      </div>

      <div className={FORM_STYLES.container.narrow}>
        <input
          id="contactEmail"
          type="email"
          placeholder="hello@brooklynhearts.com"
          value={data.contactEmail}
          onChange={(e) => handleInputChange(e.target.value)}
          className={`${FORM_STYLES.inputLargeCentered}`}
          autoFocus
        />
        {data.contactEmail && !isValidEmail(data.contactEmail) && (
          <p className="text-orange-400 text-sm mt-2 text-center">
            Hmm, that doesn't look like a valid email address
          </p>
        )}
      </div>

      {/* Privacy note */}
      <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-blue-300 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Privacy first</p>
            <p>This email will be public on your club page. Members can use it to ask questions about events.</p>
          </div>
        </div>
      </div>

    </div>
  )
}