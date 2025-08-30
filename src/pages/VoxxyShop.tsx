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
      title: "Venue Marketplace",
      description: "Search and book venues for your events",
      priority: "Phase 1",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Shirt,
      title: "Custom Merchandise",
      description: "Order t-shirts, stickers, and branded materials",
      priority: "Phase 2", 
      color: "text-green-600 bg-green-100"
    },
    {
      icon: Calendar,
      title: "Party Supplies",
      description: "Rent local party supplies and equipment",
      priority: "Phase 2",
      color: "text-purple-600 bg-purple-100"
    },
    {
      icon: Music,
      title: "Entertainment Directory",
      description: "Find DJs, bands, and performers for your events",
      priority: "Phase 3",
      color: "text-orange-600 bg-orange-100"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Store className="h-8 w-8 text-purple-600" />
                Voxxy Shop
              </h1>
              <p className="text-gray-600 mt-1">Your one-stop marketplace for event needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Coming Soon Banner */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Coming Soon: Your Event Marketplace
            </h2>
            <p className="text-purple-100 text-lg mb-6 max-w-2xl mx-auto">
              We're building the ultimate marketplace where club owners can find everything they need 
              to create amazing events. From venues to merchandise, we've got you covered.
            </p>
            <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
              <Clock className="h-4 w-4 mr-2" />
              Launching Q2 2025
            </Badge>
          </CardContent>
        </Card>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {upcomingFeatures.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Card key={feature.title} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${feature.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {feature.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Beta Signup */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Get Early Access
            </h3>
            <p className="text-blue-800 mb-6 max-w-md mx-auto">
              Join our beta program to be the first to access new marketplace features 
              and help shape the future of event planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Request Beta Access
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700">
                Stay Updated
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Development Timeline */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Development Roadmap
            </CardTitle>
            <CardDescription>
              Here's what we're working on and when you can expect new features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-4 h-4 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">Q1 2025 - Foundation</h4>
                    <Badge variant="outline" className="text-xs">Current</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Platform architecture, user interface design, and venue marketplace development
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">Venue Search</Badge>
                    <Badge variant="secondary" className="text-xs">Booking System</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-4 h-4 bg-gray-300 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">Q2 2025 - Launch</h4>
                    <Badge className="text-xs bg-green-100 text-green-800">Planned</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Public marketplace launch with venues and custom merchandise ordering
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">T-shirt Printing</Badge>
                    <Badge variant="secondary" className="text-xs">Party Supplies</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-4 h-4 bg-gray-300 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">Q3 2025 - Expansion</h4>
                    <Badge variant="outline" className="text-xs">Future</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Entertainment directory and advanced marketplace features
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">DJ Directory</Badge>
                    <Badge variant="secondary" className="text-xs">Reviews & Ratings</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}