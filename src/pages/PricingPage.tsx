import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Calendar, 
  BarChart3,
  Mail,
  MessageCircle
} from "lucide-react"
import { Link } from "react-router-dom"

export default function PricingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="relative z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-600">
            Voxxy Presents
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</Link>
            <Link to="/pricing" className="text-purple-600 font-medium">Pricing</Link>
            <Link to="/products" className="text-gray-600 hover:text-purple-600 transition-colors">Products</Link>
            <Link to="/help" className="text-gray-600 hover:text-purple-600 transition-colors">Help Center</Link>
            <Link to="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</Link>
          </div>
          <Button asChild>
            <Link to="/contact">Request Beta Access</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Beta Pricing Available
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Simple, Transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Pricing
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our paid beta program and help shape the future of community event management
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Beta Plan */}
            <Card className="border-2 border-purple-200 shadow-xl relative">
              <CardHeader className="text-center pb-6">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold">Beta Access</CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Full platform access with founding member benefits
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-center mb-8">
                  <span className="text-5xl font-bold text-gray-900">$15</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-sm text-purple-600 mt-2">
                  Special beta pricing - Limited time
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Unlimited events and attendees</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Custom branded community pages</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Smart ticketing and group management</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Cross-platform event publishing</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>AI-powered engagement tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Revenue optimization insights</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="font-medium text-purple-600">1-on-1 onboarding session</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="font-medium text-purple-600">Direct product input & feedback</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="font-medium text-purple-600">Priority support</span>
                  </li>
                </ul>


                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6" asChild>
                  <Link to="/contact">
                    Request Beta Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Future Plans */}
            <Card className="border shadow-lg">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">Coming Soon</CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Additional plans for different community sizes
                </CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-gray-400">TBD</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Pricing based on beta feedback
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Help Us Build This
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Your beta feedback will help us design the perfect pricing tiers for communities of all sizes
                  </p>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>• Starter plans for small communities</p>
                    <p>• Professional plans for growing organizations</p>
                    <p>• Enterprise solutions for large venues</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full text-lg py-6" asChild>
                  <Link to="/contact">
                    Get Product Updates
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start building?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Lock in special beta pricing and help build the future of community event management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link to="/contact">
                Request Beta Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 text-white border-white hover:bg-white hover:text-purple-600" asChild>
              <a href="mailto:team@voxxyai.com">
                <Mail className="mr-2 h-5 w-5" />
                Ask Questions
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}