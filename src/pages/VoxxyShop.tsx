import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Store,
  MapPin,
  Shirt,
  Music,
  Calendar,
  Sparkles,
  Clock,
  Star
} from 'lucide-react'

export default function VoxxyShop() {
  const navigate = useNavigate()

  const upcomingFeatures = [
    {
      icon: MapPin,
      title: "Venues",
      description: "Find your perfect space",
      emoji: "🏢",
      priority: "Available Now",
      color: "purple"
    },
    {
      icon: Calendar,
      title: "Party Supplies",
      description: "Everything for amazing parties",
      emoji: "🎉",
      priority: "Coming Soon",
      color: "pink"
    },
    {
      icon: Music,
      title: "Entertainment",
      description: "DJs, bands & performers",
      emoji: "🎵",
      priority: "Coming Soon",
      color: "green"
    },
    {
      icon: Shirt,
      title: "Custom Merch",
      description: "Branded gear that rocks",
      emoji: "👕",
      priority: "Coming Soon", 
      color: "purple"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative">
      {/* Header */}
      <div className="relative bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-white hover:text-blue-300 bg-transparent hover:bg-transparent p-0 h-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Store className="h-8 w-8 text-purple-400" />
                Voxxy Shop
              </h1>
              <p className="text-gray-300 mt-1">Your one-stop marketplace for event needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Intro Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
            Event Marketplace
          </h1>
          <p className="text-2xl text-gray-300 font-light">
            Everything you need to throw unforgettable events ✨
          </p>
        </div>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {upcomingFeatures.map((feature) => {
            const isVenueMarketplace = feature.title === "Venues"
            const isAvailable = feature.priority === "Available Now"
            
            return (
              <Card 
                key={feature.title}
                className={`group relative bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:border-white/30 ${
                  isVenueMarketplace ? 'cursor-pointer' : ''
                }`}
                onClick={isVenueMarketplace ? () => navigate('/voxxy-shop/venues') : undefined}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.emoji}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-200 text-lg font-light">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Badge 
                      variant={isAvailable ? "secondary" : "outline"} 
                      className={`text-sm px-4 py-2 backdrop-blur-sm ${
                        isAvailable 
                          ? 'bg-green-500/20 text-green-300 border-green-400/50' 
                          : 'bg-white/10 text-gray-300 border-white/30'
                      }`}
                    >
                      {feature.priority}
                    </Badge>
                  </div>
                  
                  {isVenueMarketplace && (
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-blue-300 text-sm font-medium">Click to explore venues →</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-6">🚀</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to create magic?
            </h3>
            <p className="text-gray-200 text-xl mb-8 max-w-md mx-auto font-light">
              Start building your event empire today
            </p>
            <Button size="lg" className="bg-blue-600/90 backdrop-blur-sm hover:bg-blue-600 text-white px-8 py-3 text-lg border border-blue-400/30">
              Create Your First Club
            </Button>
          </CardContent>
        </Card>

        {/* What's Coming */}
        <Card className="mt-12 bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🗓️</div>
            <h3 className="text-2xl font-bold text-white mb-6">What's coming next</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl mb-2">🎉</div>
                <h4 className="text-lg font-semibold text-blue-300 mb-2">Spring 2025</h4>
                <p className="text-gray-200 text-sm">Party supplies marketplace</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎵</div>
                <h4 className="text-lg font-semibold text-blue-300 mb-2">Summer 2025</h4>
                <p className="text-gray-200 text-sm">Entertainment booking</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">👕</div>
                <h4 className="text-lg font-semibold text-blue-300 mb-2">Fall 2025</h4>
                <p className="text-gray-200 text-sm">Custom merchandise</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}