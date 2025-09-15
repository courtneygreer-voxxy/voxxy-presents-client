import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import CreateClubFlowEnhanced from '@/components/CreateClubFlowEnhanced'

export default function CreateClubPage() {
  const { currentUser } = useAuth()
  const [showFlow, setShowFlow] = useState(false)

  // If user has chosen to create a club, show the flow
  if (showFlow) {
    return <CreateClubFlowEnhanced />
  }

  // Show landing page with single create option
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Create Your Club</h1>
          <p className="text-gray-300 mt-2">Set up your community in just a few steps</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-white">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <Plus className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Create Your Club</h3>
                  <p className="text-sm text-gray-300 font-normal">Build your community profile</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-200">
                Build your club profile step by step. Add your branding, social links, and start connecting with your community.
              </p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Custom branding and messaging</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Full customization options</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Event management tools</span>
                </div>
              </div>

              <Button
                onClick={() => setShowFlow(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}