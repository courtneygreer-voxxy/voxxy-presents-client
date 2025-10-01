import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Building2,
  Coffee,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Shield,
  BarChart3,
  Clock,
  MessageCircle,
  Star,
  Zap,
  Target
} from 'lucide-react'
import { usePageTracking } from '@/hooks/usePageTracking'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { TrackedButton } from '@/components/analytics/TrackedButton'

export default function VenueOwnerBenefitsPage() {
  // Track page views
  usePageTracking('Venue Owner Benefits')

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Increase Foot Traffic',
      description: 'Connect with local event organizers who need unique spaces for their events.',
      details: 'Get discovered by club owners and organizers looking for the perfect venue for their next event.'
    },
    {
      icon: DollarSign,
      title: 'Generate Steady Revenue',
      description: 'Turn your unused space into a profitable revenue stream.',
      details: 'Set your own pricing and availability. Keep 100% of what you charge.'
    },
    {
      icon: Users,
      title: 'Build Community Connections',
      description: 'Become a hub for local events and community gatherings.',
      details: 'Foster relationships with event organizers and become their go-to venue choice.'
    },
    {
      icon: Shield,
      title: 'Safe & Secure Platform',
      description: 'All organizers are vetted and events are moderated for quality.',
      details: 'We ensure only legitimate events and responsible organizers use our platform.'
    },
    {
      icon: BarChart3,
      title: 'Track Your Performance',
      description: 'Get insights into booking trends, revenue, and venue popularity.',
      details: 'Understand what types of events work best at your venue and optimize accordingly.'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'You control when your venue is available for bookings.',
      details: 'Set your own schedule and block out dates when you need your space.'
    }
  ]

  const features = [
    'Professional venue profile with photo gallery',
    'Direct communication with event organizers',
    'Flexible pricing and availability controls',
    'Secure booking and payment management',
    'Performance analytics and insights',
    'Dedicated venue owner support'
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Create Your Venue Profile',
      description: 'Add photos, amenities, capacity, and pricing information.'
    },
    {
      step: 2,
      title: 'Get Discovered',
      description: 'Event organizers find your venue through our search platform.'
    },
    {
      step: 3,
      title: 'Receive Booking Requests',
      description: 'Review and approve event requests that fit your criteria.'
    },
    {
      step: 4,
      title: 'Host Amazing Events',
      description: 'Work with organizers to create memorable experiences.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='7' r='2' className='animate-pulse'/%3E%3Ccircle cx='30' cy='30' r='2' className='animate-pulse'/%3E%3Ccircle cx='7' cy='53' r='2' className='animate-pulse'/%3E%3Ccircle cx='53' cy='53' r='2' className='animate-pulse'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 px-4 py-6 bg-gray-800/50 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <TrackedLink
            to="/"
            className="text-2xl font-bold text-white hover:text-purple-400 transition-colors"
            trackingData={{
              link_text: 'Voxxy Presents Logo',
              destination_page: 'Home',
              current_page: 'Venue Owner Benefits',
              link_position: 'header'
            }}
          >
            Voxxy Presents
          </TrackedLink>
          <div className="flex items-center gap-4">
            <TrackedLink
              to="/login"
              className="text-gray-300 hover:text-white transition-colors"
              trackingData={{
                link_text: 'Login',
                destination_page: 'Login',
                current_page: 'Venue Owner Benefits',
                link_position: 'header'
              }}
            >
              Login
            </TrackedLink>
            <TrackedButton
              as={Link}
              to="/venues/create"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              trackingData={{
                button_text: 'List Your Venue',
                action_type: 'navigation',
                destination_page: 'Venue Create',
                current_page: 'Venue Owner Benefits'
              }}
            >
              List Your Venue
            </TrackedButton>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto max-w-6xl px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-600/30">
              For Venue Owners
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Monetize Your Space with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                {' '}Voxxy Presents
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Transform your venue into a thriving event destination. Connect with local organizers,
              generate steady revenue, and become the heart of your community's events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <TrackedButton
                as={Link}
                to="/venues/create"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3"
                trackingData={{
                  button_text: 'List Your Venue Now',
                  action_type: 'conversion',
                  destination_page: 'Venue Create',
                  current_page: 'Venue Owner Benefits',
                  button_position: 'hero'
                }}
              >
                <Building2 className="mr-2 h-5 w-5" />
                List Your Venue Now
              </TrackedButton>
              <TrackedLink
                to="/venues"
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
                trackingData={{
                  link_text: 'Browse Venues',
                  destination_page: 'Venue Search',
                  current_page: 'Venue Owner Benefits',
                  link_position: 'hero'
                }}
              >
                Browse Venues
                <ArrowRight className="ml-2 h-5 w-5" />
              </TrackedLink>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="container mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Venue Owners Choose Voxxy
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join hundreds of venue owners who are already maximizing their space potential
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-blue-400/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
                    <benefit.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white text-xl">{benefit.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">{benefit.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Getting started is simple. You can be live and taking bookings in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 mx-auto">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features List */}
        <section className="container mx-auto max-w-6xl px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Our platform provides all the tools you need to manage your venue listings and bookings efficiently.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600/20 to-teal-600/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <div className="text-center">
                  <Sparkles className="h-16 w-16 text-blue-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
                  <p className="text-gray-300 mb-6">
                    Join our growing community of successful venue owners
                  </p>
                  <TrackedButton
                    as={Link}
                    to="/venues/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    trackingData={{
                      button_text: 'Create Your Venue Listing',
                      action_type: 'conversion',
                      destination_page: 'Venue Create',
                      current_page: 'Venue Owner Benefits',
                      button_position: 'features_cta'
                    }}
                  >
                    Create Your Venue Listing
                  </TrackedButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stats */}
        <section className="container mx-auto max-w-6xl px-4 py-20">
          <div className="bg-gradient-to-br from-blue-600/10 to-teal-600/10 rounded-2xl p-8 md:p-12 backdrop-blur-sm border border-white/10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Join Our Success Stories
              </h2>
              <p className="text-xl text-gray-300">
                See what venue owners are achieving with Voxxy Presents
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
                <div className="text-gray-300">Venues Listed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-400 mb-2">2,000+</div>
                <div className="text-gray-300">Events Hosted</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">$250K+</div>
                <div className="text-gray-300">Revenue Generated</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto max-w-6xl px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Venue?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start generating revenue from your space today. It's free to list and you keep 100% of what you charge.
            </p>
            <TrackedButton
              as={Link}
              to="/venues/create"
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-lg px-12 py-4"
              trackingData={{
                button_text: 'List Your Venue - It\'s Free',
                action_type: 'conversion',
                destination_page: 'Venue Create',
                current_page: 'Venue Owner Benefits',
                button_position: 'final_cta'
              }}
            >
              <Zap className="mr-2 h-5 w-5" />
              List Your Venue - It's Free
            </TrackedButton>
          </div>
        </section>
      </div>
    </div>
  )
}