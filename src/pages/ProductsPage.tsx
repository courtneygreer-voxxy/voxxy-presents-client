import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Smartphone, 
  Calendar, 
  Users,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle
} from "lucide-react"
import { Link } from "react-router-dom"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="relative z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-600">
            Voxxy Presents
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/features">Features</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            <Button asChild>
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2 text-sm font-medium mb-6">
            The Voxxy Ecosystem
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Complete Solutions for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Creative Communities
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            From event management to mobile apps and planning tools - discover the full suite 
            of products designed to help creative communities thrive.
          </p>
        </div>
      </section>

      {/* Products Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="space-y-16">
            
            {/* Voxxy Presents */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-green-100 text-green-800 mb-4">Available Now - Beta</Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Voxxy Presents
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  The complete community management platform for NYC's creative organizers. 
                  White-labeled event pages, automated billing, and venue partnerships - 
                  everything you need to scale your community.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Custom Event Pages</p>
                      <p className="text-sm text-gray-600">White-labeled community presence</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Revenue Tools</p>
                      <p className="text-sm text-gray-600">Subscriptions & payments</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Venue Network</p>
                      <p className="text-sm text-gray-600">NYC partnership access</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Analytics</p>
                      <p className="text-sm text-gray-600">Growth insights & reporting</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                    <Link to="/features">
                      Explore Features
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/contact">Join Pilot</Link>
                  </Button>
                </div>
              </div>
              
              <Card className="border-2 border-purple-200 shadow-2xl">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-6 text-center">
                    <Users className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Community First</h3>
                    <p className="text-gray-600 text-sm">
                      Built specifically for creative community organizers who want professional tools 
                      without losing the personal touch that makes their communities special.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Voxxy Mobile */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Card className="border-2 border-blue-200 shadow-2xl order-2 lg:order-1">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-6 text-center">
                    <Smartphone className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Mobile Experience</h3>
                    <p className="text-gray-600 text-sm">
                      Native mobile apps for iOS and Android that bring your community 
                      experience directly to your members' pockets.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-blue-100 text-blue-800">Coming Soon</Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    2025 Q2
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Voxxy Mobile
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Dedicated mobile apps that give your community members a seamless, 
                  native experience for event registration, community messaging, 
                  and staying connected on the go.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">Push notifications for events and updates</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">Offline event information and schedules</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">In-app community messaging and forums</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">Quick event check-ins and QR codes</span>
                  </div>
                </div>

                <Button variant="outline" disabled>
                  <Clock className="mr-2 h-4 w-4" />
                  Coming Q2 2025
                </Button>
              </div>
            </div>

            {/* Voxxy Planner */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-orange-100 text-orange-800">Coming Soon</Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    2025 Q3
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Voxxy Planner
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Advanced event planning and resource management tools for larger 
                  creative organizations. Budget tracking, vendor management, 
                  and collaborative planning workflows.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700">Budget planning and expense tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700">Vendor and supplier relationship management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700">Team collaboration and task assignment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-gray-700">Advanced analytics and ROI reporting</span>
                  </div>
                </div>

                <Button variant="outline" disabled>
                  <Clock className="mr-2 h-4 w-4" />
                  Coming Q3 2025
                </Button>
              </div>
              
              <Card className="border-2 border-orange-200 shadow-2xl">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg p-6 text-center">
                    <Calendar className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">Enterprise Planning</h3>
                    <p className="text-gray-600 text-sm">
                      For established creative organizations that need advanced planning tools 
                      and want to scale their operations professionally.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Better Together
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each Voxxy product works seamlessly with the others, creating a complete 
              ecosystem for your creative community.
            </p>
          </div>

          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold mb-2">Start with Presents</h3>
                  <p className="text-gray-600 text-sm">
                    Build your community foundation with event management and member engagement
                  </p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold mb-2">Add Mobile</h3>
                  <p className="text-gray-600 text-sm">
                    Enhance engagement with native mobile apps for your community members
                  </p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-bold mb-2">Scale with Planner</h3>
                  <p className="text-gray-600 text-sm">
                    Grow into advanced planning tools as your organization expands
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="flex justify-center mb-6">
            <Sparkles className="h-12 w-12 text-purple-200" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Begin with Voxxy Presents and build the creative community of your dreams
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link to="/contact">
                Join Pilot Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-purple-600"
              asChild
            >
              <Link to="/features">
                Explore Features
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}