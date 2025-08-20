import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Users, ArrowRight, Calculator, Minus, Plus } from "lucide-react"
import { Link } from "react-router-dom"

export default function PricingPage() {
  const [seats, setSeats] = useState(3)
  
  const basePrice = 15
  const additionalSeatPrice = 5
  const totalPrice = basePrice + (Math.max(0, seats - 3) * additionalSeatPrice)

  const incrementSeats = () => setSeats(prev => prev + 1)
  const decrementSeats = () => setSeats(prev => Math.max(1, prev - 1))

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
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2 text-sm font-medium mb-6">
            Simple, Transparent Pricing
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Pricing That Scales{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              With Your Community
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Start building your community with transparent, affordable pricing. 
            No hidden fees, no surprises - just the tools you need to succeed.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Pricing Card */}
            <Card className="border-2 border-purple-200 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <Badge className="bg-purple-600 text-white w-fit mx-auto mb-4">
                  Beta Access
                </Badge>
                <CardTitle className="text-3xl font-bold">Voxxy Presents</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Everything you need to build and manage your creative community
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-900">${basePrice}</span>
                    <span className="text-lg text-gray-500 ml-2">/month</span>
                  </div>
                  <p className="text-gray-600">Includes up to 3 team seats</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Custom branded community pages</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Automated recurring event management</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Member subscription & billing automation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Community engagement tools</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>NYC venue partnership access</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Priority support & onboarding</span>
                  </li>
                </ul>

                <Separator className="my-6" />
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Additional team members:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${additionalSeatPrice}/month per extra seat
                  </p>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6 mt-8" asChild>
                  <Link to="/contact">
                    Sign Up for Pilot
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pricing Calculator */}
            <div className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-purple-600" />
                    Pricing Calculator
                  </CardTitle>
                  <CardDescription>
                    See exactly what you'll pay based on your team size
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">
                        Team Members
                      </label>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={decrementSeats}
                          disabled={seats <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center space-x-2 min-w-[120px] justify-center">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-lg font-semibold">{seats}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={incrementSeats}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Base plan (up to 3 seats)</span>
                        <span>${basePrice}</span>
                      </div>
                      {seats > 3 && (
                        <div className="flex justify-between text-gray-600">
                          <span>{seats - 3} additional seat{seats > 4 ? 's' : ''}</span>
                          <span>+${(seats - 3) * additionalSeatPrice}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total per month</span>
                        <span className="text-purple-600">${totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">What's included in the pilot program?</h4>
                    <p className="text-sm text-gray-600">
                      Full access to all features, priority support, and direct input on product development.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Can I change my team size?</h4>
                    <p className="text-sm text-gray-600">
                      Yes, you can add or remove team members at any time. Billing adjusts automatically.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Is there a long-term commitment?</h4>
                    <p className="text-sm text-gray-600">
                      No contracts required. Cancel anytime during the pilot program.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start building?
          </h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Join NYC's creative community organizers in our pilot program
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link to="/contact">
              Apply for Beta Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}