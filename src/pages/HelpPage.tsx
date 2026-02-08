import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight, MessageCircle, Book, ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"
import { usePageTracking } from "@/hooks/usePageTracking"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageTracking('Help')

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "How do I get started?",
      answer: "Request beta access through our contact form. Once approved, you'll receive an onboarding email with your login credentials and a link to our step-by-step setup guide."
    },
    {
      question: "What's included in each pricing tier?",
      answer: "Our Starter plan ($80/month) includes up to 10 events per year and 10k vendor contacts. Growth ($160/month) includes 50 events and 50k contacts with advanced features. Enterprise ($400/month) offers unlimited events and contacts with dedicated support."
    },
    {
      question: "Is there a contract or commitment?",
      answer: "No long-term contracts required. All plans are month-to-month and you can cancel anytime."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) and ACH bank transfers for annual plans."
    },
    {
      question: "Can I import my existing vendor lists?",
      answer: "Yes! You can import vendor contacts via CSV upload. Our system will automatically map fields and detect duplicates."
    },
    {
      question: "Does Voxxy work with Eventbrite, Luma, or other event tools?",
      answer: "Voxxy is designed to replace disconnected event tools with one unified platform. We're building integrations with popular ticketing platforms - reach out to discuss your specific needs."
    },
    {
      question: "I'm an artist/vendor — is Voxxy free for me?",
      answer: "Yes! Voxxy is completely free for artists and vendors. You'll receive a vendor portal to manage applications, view event details, and communicate with producers."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
      <Navigation activePage="help" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 md:px-12 bg-gradient-to-br from-voxxy-purple-deep to-voxxy-purple-mid">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-300">HELP CENTER</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            We're here to help
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
            Real humans, fast responses. Whether you need onboarding support or have a quick question, we've got you.
          </p>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Email Support */}
            <Card className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold mb-4">Email Support</CardTitle>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Reach our team directly for questions about your account, event setup, or anything else. We respond within 1–2 business days.
                </p>
                <a
                  href="mailto:team@voxxypresents.com"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold"
                >
                  team@voxxypresents.com →
                </a>
              </CardContent>
            </Card>

            {/* Onboarding Guide */}
            <Card className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Book className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold mb-4">Onboarding Guide</CardTitle>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Step-by-step walkthrough for setting up your first event, importing vendors, configuring email flows, and going live.
                </p>
                <a
                  href="https://docs.voxxypresents.com/onboarding"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Read the Guide →
                </a>
              </CardContent>
            </Card>

            {/* Community Discord */}
            <Card className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold mb-4">Community Discord</CardTitle>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Connect with other event producers, share tips, and get quick answers from the Voxxy team and community.
                </p>
                <a
                  href="https://discord.gg/voxxy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Join Discord →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 md:px-12 bg-gray-50">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-600 mb-4">FAQ</p>
            <h2 className="text-4xl font-bold text-gray-900">Common questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-purple-600 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
