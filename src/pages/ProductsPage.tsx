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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-white/10 relative z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Voxxy Presents
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link to="/products" className="text-purple-400 font-medium">Products</Link>
            <Link to="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
            <Link to="/contact">Request Beta Access</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 z-10">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="bg-purple-500/20 border border-purple-400/30 text-purple-300 px-4 py-2 text-sm font-medium mb-6">
            The Voxxy Ecosystem
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Complete Solutions for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Event Organizers
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            From individual dining decisions to professional event infrastructure - discover the full suite
            of products designed to help people spend more time together.
          </p>
        </div>
      </section>

      {/* Products Overview */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="space-y-16">
            
            {/* Voxxy Presents */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-green-500/20 border border-green-400/30 text-green-300 mb-4">Available Now - Beta</Badge>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Voxxy Presents
                </h2>
                <p className="text-lg text-gray-200 mb-6">
                  Complete event infrastructure for club organizers running recurring events.
                  Professional RSVP management, venue coordination, and promotion tools handle the logistics
                  so you can focus on creating experiences.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Smart RSVP Management</p>
                      <p className="text-sm text-gray-300">Convert "maybe" responses to confirmed attendance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Venue Coordination Hub</p>
                      <p className="text-sm text-gray-300">Automated guest list sharing and capacity management</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Promotion Automation</p>
                      <p className="text-sm text-gray-300">Newsletter and social media tools that connect</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Recurring Event Series</p>
                      <p className="text-sm text-gray-300">Monthly pop-ups and weekly events made simple</p>
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
                  <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30" asChild>
                    <Link to="/contact">Join Beta</Link>
                  </Button>
                </div>
              </div>
              
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-2xl">
                <CardContent className="p-8">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
                    <Users className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2 text-white">Community First</h3>
                    <p className="text-gray-200 text-sm">
                      Built specifically for club organizers running recurring events who want professional infrastructure
                      without enterprise complexity or pricing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Voxxy Mobile */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-2xl order-2 lg:order-1">
                <CardContent className="p-8">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
                    <Smartphone className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2 text-white">Mobile Experience</h3>
                    <p className="text-gray-200 text-sm">
                      The starting point for social planning - where individuals discover experiences
                      they can share with their communities.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-blue-500/20 border border-blue-400/30 text-blue-300">Available Now</Badge>
                  <Badge className="bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 text-xs">
                    iPhone
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Voxxy Mobile
                </h2>
                <p className="text-lg text-gray-200 mb-6">
                  AI-powered restaurant discovery for friend groups who struggle with dining decisions.
                  Helps individuals find great spots to share with their groups, supporting the entire ecosystem of social planning.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-gray-200">AI-powered restaurant recommendations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-gray-200">Friend group dining coordination</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-gray-200">Social sharing and planning tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    <span className="text-gray-200">Saves time on "where should we eat?" decisions</span>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <a href="https://apps.apple.com/us/app/voxxy/id6746337878" target="_blank" rel="noopener noreferrer">
                    Download for iPhone
                  </a>
                </Button>
              </div>
            </div>

            {/* Voxxy Planner */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-orange-500/20 border border-orange-400/30 text-orange-300">Coming Soon</Badge>
                  <Badge className="bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    2025 Q3
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Voxxy Planner
                </h2>
                <p className="text-lg text-gray-200 mb-6">
                  Advanced trip and experience planning tools for groups who want to coordinate
                  complex social experiences. The natural evolution from individual discovery to group execution.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                    <span className="text-gray-200">Group trip planning and coordination</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                    <span className="text-gray-200">Complex event planning workflows</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                    <span className="text-gray-200">Budget tracking and expense management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                    <span className="text-gray-200">Collaborative planning tools</span>
                  </div>
                </div>

                <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white cursor-not-allowed opacity-10" disabled>
                  <Clock className="mr-2 h-4 w-4" />
                  Coming Q3 2025
                </Button>
              </div>
              
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-2xl">
                <CardContent className="p-8">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
                    <Calendar className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2 text-white">Enterprise Planning</h3>
                    <p className="text-gray-200 text-sm">
                      For groups and organizations ready to coordinate complex experiences and trips
                      with professional planning tools.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Better Together
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Each Voxxy product works seamlessly with the others, creating a complete
              ecosystem for social planning and community building.
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-2xl overflow-hidden">
            <CardContent className="p-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-purple-300" />
                  </div>
                  <h3 className="font-bold mb-2 text-white">Start with Mobile</h3>
                  <p className="text-gray-200 text-sm">
                    Individuals discover experiences and build social planning habits
                  </p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="h-8 w-8 text-blue-300" />
                  </div>
                  <h3 className="font-bold mb-2 text-white">Scale with Presents</h3>
                  <p className="text-gray-200 text-sm">
                    Organizers get professional infrastructure for recurring community events
                  </p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-orange-300" />
                  </div>
                  <h3 className="font-bold mb-2 text-white">Expand with Planner</h3>
                  <p className="text-gray-200 text-sm">
                    Advanced coordination tools for complex group experiences
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="flex justify-center mb-6">
            <Sparkles className="h-12 w-12 text-purple-300" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Begin with Voxxy Presents and build sustainable recurring events with professional infrastructure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link to="/contact">
                Join Beta Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30"
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