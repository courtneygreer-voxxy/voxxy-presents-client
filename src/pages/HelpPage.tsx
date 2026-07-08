import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowRight, MessageCircle, Book, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTracking } from '@/hooks/usePageTracking'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useForceTheme } from '@/hooks/useForceTheme'

export default function HelpPage() {
  useForceTheme('dark')
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
      question: 'How do I get started?',
      answer:
        "Request beta access through our contact form. Once approved, you'll receive an onboarding email with your login credentials and a link to our step-by-step setup guide.",
    },
    {
      question: "What's included in each pricing tier?",
      answer:
        'Our Starter plan ($80/month) includes up to 10 events per year and 10k vendor contacts. Growth ($160/month) includes 50 events and 50k contacts with advanced features. Enterprise ($400/month) offers unlimited events and contacts with dedicated support.',
    },
    {
      question: 'Is there a contract or commitment?',
      answer:
        'No long-term contracts required. All plans are month-to-month and you can cancel anytime.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, Mastercard, American Express) and ACH bank transfers for annual plans.',
    },
    {
      question: 'Can I import my existing vendor lists?',
      answer:
        'Yes! You can import vendor contacts via CSV upload. Our system will automatically map fields and detect duplicates.',
    },
    {
      question: 'Does Voxxy work with Eventbrite, Luma, or other event tools?',
      answer:
        "Voxxy is designed to replace disconnected event tools with one unified platform. We're building integrations with popular ticketing platforms - reach out to discuss your specific needs.",
    },
    {
      question: "I'm an artist/vendor. Is Voxxy free for me?",
      answer:
        "Yes! Voxxy is completely free for artists and vendors. You'll receive a vendor portal to manage applications, view event details, and communicate with producers.",
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden voxxy-gradient-marketing-hero">
      <Navigation activePage="help" />

      {/* Hero Section */}
      <section className="relative px-6 pb-20 pt-[140px] md:px-12">
        <div className="absolute inset-0 bg-gradient-radial from-voxxy-purple-brand/15 via-transparent to-transparent opacity-60"></div>

        <div className="container mx-auto max-w-[900px] text-center relative z-10">
          <h1 className="mb-5 text-[52px] font-display font-bold leading-[1.1] tracking-tight text-white md:text-[56px]">
            We're here to{' '}
            <em className="not-italic bg-gradient-to-r from-[#cc30e8] via-[#9054e3] to-[#651ae9] bg-clip-text text-transparent">
              help
            </em>
          </h1>
          <p className="mx-auto mb-0 max-w-[700px] text-[18px] leading-relaxed text-white/65">
            Real humans, fast responses. Whether you need onboarding support or have a quick
            question, we've got you.
          </p>

          {/* Divider */}
          <div className="mt-9 flex items-center justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-voxxy-pink/40"></div>
            <div className="mx-4 w-2 h-2 rounded-full bg-voxxy-pink/40"></div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-voxxy-pink/40"></div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="bg-[#faf9fc] py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[1200px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">
              Support Options
            </div>
            <h2 className="mb-4 text-[42px] font-display font-bold leading-tight text-slate-950">
              Get the help you need
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Email Support */}
            <Card className="marketing-card border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 bg-voxxy-purple-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-voxxy-purple-brand" />
                </div>
                <CardTitle className="mb-4 text-[20px] font-display font-bold text-slate-950">
                  Email Support
                </CardTitle>
                <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
                  Reach our team directly for questions about your account, event setup, or anything
                  else. We respond within 1-2 business days.
                </p>
                <a
                  href="mailto:team@heyvoxxy.com"
                  className="inline-flex items-center text-[15px] font-semibold text-violet-700 hover:text-violet-900"
                >
                  team@heyvoxxy.com →
                </a>
              </CardContent>
            </Card>

            {/* Onboarding Guide */}
            <Card className="marketing-card border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 bg-voxxy-purple-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Book className="h-8 w-8 text-voxxy-purple-brand" />
                </div>
                <CardTitle className="mb-4 text-[20px] font-display font-bold text-slate-950">
                  Onboarding Guide
                </CardTitle>
                <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
                  Step-by-step walkthrough for setting up your first event, importing vendors,
                  configuring email flows, and going live.
                </p>
                <a
                  href="https://docs.voxxypresents.com/onboarding"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[15px] font-semibold text-violet-700 hover:text-violet-900"
                >
                  Read the Guide →
                </a>
              </CardContent>
            </Card>

            {/* Community Discord */}
            <Card className="marketing-card border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 bg-voxxy-purple-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-voxxy-purple-brand" />
                </div>
                <CardTitle className="mb-4 text-[20px] font-display font-bold text-slate-950">
                  Community Discord
                </CardTitle>
                <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
                  Connect with other event producers, share tips, and get quick answers from the
                  Voxxy team and community.
                </p>
                <a
                  href="https://discord.gg/voxxy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[15px] font-semibold text-violet-700 hover:text-violet-900"
                >
                  Join Discord →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="voxxy-gradient-marketing-hero py-[100px] px-6 md:px-12">
        <div className="container mx-auto max-w-[900px]">
          <div className="mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-primary mb-4">
              FAQ
            </div>
            <h2 className="text-[42px] font-display font-bold leading-tight text-white">
              Common questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/6 transition-all hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/6"
                >
                  <span className="pr-4 text-[16px] font-semibold text-white">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-primary flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-[15px] leading-relaxed text-white/70">{faq.answer}</p>
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
