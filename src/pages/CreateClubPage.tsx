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
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden flex flex-col">
      {/* Animated Background Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23a855f7' fillOpacity='0.4'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 backdrop-blur-md border-b border-white/20 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
            Create Your Club
          </h1>
          <p className="text-gray-200 text-lg">Set up your community in just a few steps</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="bg-gradient-to-br from-white/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border-2 border-white/20 hover:border-purple-400/50 transition-all duration-300 cursor-pointer group shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)]">
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
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold text-lg py-6 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}