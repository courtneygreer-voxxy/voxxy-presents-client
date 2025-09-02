import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Mail,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Rocket,
  Users,
  CreditCard
} from "lucide-react"
import { Link } from "react-router-dom"

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const faqItems: FAQItem[] = [
    {
      question: "What is included in the beta program?",
      answer: "The beta program includes full access to all Voxxy Presents features, priority customer support, direct input on product development, and special beta pricing. You'll work closely with our team to ensure the platform meets your community's specific needs.",
      category: "Getting Started"
    },
    {
      question: "How quickly can I set up my community?",
      answer: "Most organizers have their basic community setup within 24 hours. Our onboarding process includes a 1-on-1 setup call, template selection, and migration assistance if you're moving from another platform. Complex customizations may take 2-3 business days.",
      category: "Getting Started"
    },
    {
      question: "Can I customize the branding to match my community?",
      answer: "Absolutely! Voxxy Presents is white-labeled, meaning your community pages will showcase your brand, not ours. You can customize colors, logos, fonts, and even use a custom domain. We want your community to feel authentically yours.",
      category: "Customization"
    },
    {
      question: "How does the venue partnership network work?",
      answer: "We're building partnerships with creative spaces and venues. Through your dashboard, you can browse available venues, check availability, and book directly. Our network includes art studios, event spaces, galleries, and community centers.",
      category: "Features"
    },
    {
      question: "What payment methods do you support?",
      answer: "We integrate with Stripe to support all major credit cards, ACH transfers, and digital wallets like Apple Pay and Google Pay. You can also set up sliding scale pricing to make your events accessible to all community members.",
      category: "Billing"
    },
    {
      question: "How do recurring events work?",
      answer: "Set up your recurring events once (weekly art classes, monthly meetups, etc.) and we handle all the scheduling, registration, and reminders automatically. You can customize individual events in the series or pause/resume as needed.",
      category: "Features"
    },
    {
      question: "Can I migrate my existing member list?",
      answer: "Yes! We provide migration assistance to help you import your existing member data from spreadsheets, Eventbrite, Meetup, or other platforms. We'll work with you during onboarding to ensure a smooth transition.",
      category: "Getting Started"
    },
    {
      question: "What kind of support do you provide?",
      answer: "Beta members get priority support via email and scheduled calls. We also provide comprehensive documentation, video tutorials, and a getting-started guide. Most questions are answered within 4 hours during business days.",
      category: "Support"
    },
    {
      question: "Is there a minimum commitment?",
      answer: "No long-term contracts required during the beta program. You can cancel at any time. We believe in earning your business through great service and results, not binding contracts.",
      category: "Billing"
    },
    {
      question: "How do you handle member data and privacy?",
      answer: "We're SOC 2 compliant and use enterprise-grade security. Your member data is encrypted, backed up daily, and never shared with third parties. You maintain full ownership and control of your community data at all times.",
      category: "Security"
    }
  ]

  const categories = Array.from(new Set(faqItems.map(item => item.category)))

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-5"
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
            <Link to="/products" className="text-gray-300 hover:text-white transition-colors">Products</Link>
            <Link to="/help" className="text-purple-400 font-medium">Help Center</Link>
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
            Help Center
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            How can we{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              help you succeed?
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Find answers to common questions, access our getting started guide, 
            or get in touch with our support team.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              className="pl-10 pr-4 py-3 text-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-6 w-6 text-purple-300" />
                </div>
                <CardTitle className="text-white">Getting Started Guide</CardTitle>
                <CardDescription className="text-gray-200">
                  Complete walkthrough for setting up your first community
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30">
                  View Guide
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-green-300" />
                </div>
                <CardTitle className="text-white">Schedule a Call</CardTitle>
                <CardDescription className="text-gray-200">
                  Book a 1-on-1 session with our customer success team
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30" asChild>
                  <Link to="/contact">
                    Book Call
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-blue-300" />
                </div>
                <CardTitle className="text-white">Email Support</CardTitle>
                <CardDescription className="text-gray-200">
                  Get help via email - most questions answered in 4 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30" asChild>
                  <a href="mailto:team@voxxypresents.com">
                    Email Us
                    <Mail className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-200">
              Quick answers to common questions from community organizers
            </p>
          </div>

          <div className="space-y-4">
            {filteredFAQs.map((item, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-sm">
                <CardHeader 
                  className="cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <Badge className="bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 text-xs">
                        {item.category}
                      </Badge>
                      <CardTitle className="text-left text-lg font-medium text-white">
                        {item.question}
                      </CardTitle>
                    </div>
                    {expandedFAQ === index ? (
                      <ChevronDown className="h-5 w-5 text-gray-300 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                {expandedFAQ === index && (
                  <CardContent className="pt-0">
                    <p className="text-gray-200 leading-relaxed ml-16">
                      {item.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-200 mb-4">
                Try a different search term or contact our support team
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                <Link to="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Additional Resources
            </h2>
            <p className="text-lg text-gray-200">
              Dive deeper into specific topics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg">
              <CardHeader>
                <Users className="h-8 w-8 text-purple-400 mb-3" />
                <CardTitle className="text-white">Community Management</CardTitle>
                <CardDescription className="text-gray-200">
                  Best practices for growing and engaging your creative community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li>• Member onboarding strategies</li>
                  <li>• Engagement tactics that work</li>
                  <li>• Building community guidelines</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg">
              <CardHeader>
                <CreditCard className="h-8 w-8 text-green-400 mb-3" />
                <CardTitle className="text-white">Revenue & Pricing</CardTitle>
                <CardDescription className="text-gray-200">
                  Strategies for sustainable community monetization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li>• Pricing models that work</li>
                  <li>• Sliding scale implementation</li>
                  <li>• Subscription management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-400 mb-3" />
                <CardTitle className="text-white">Event Planning</CardTitle>
                <CardDescription className="text-gray-200">
                  Tools and tips for successful creative events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-300">
                  <li>• Venue selection guide</li>
                  <li>• Event promotion strategies</li>
                  <li>• Managing registrations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border-y border-white/10 relative z-10">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still need help?
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            Our team is here to help you succeed. Get in touch for personalized support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact">
                Contact Support
                <MessageCircle className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30"
              asChild
            >
              <a href="mailto:team@voxxypresents.com">
                Email Us
                <Mail className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}