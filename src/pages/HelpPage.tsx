import React, { useEffect, useState } from 'react'
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { usePageTracking } from "@/hooks/usePageTracking"
import { TrackedLink } from "@/components/analytics/TrackedLink"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  usePageTracking('Help')

  const faqs = [
    {
      question: "How do I get started?",
      answer: "Send us a message through our contact form or email team@voxxypresents.com. We'll set up a quick call to understand your events, get you onboarded, and have you live within a day. No lengthy implementation process — most producers are up and running in under an hour."
    },
    {
      question: "What's included in each pricing tier?",
      answer: "Every tier includes the full Voxxy platform: vendor CRM, automated email workflows, application review tools, SMS integration, and access to our marketplace add-ons. The tiers differ by the number of events per year and vendor contacts. Starter ($80/mo) supports up to 10 events and 10k contacts. Growth ($160/mo) supports up to 50 events and 50k contacts. Enterprise ($400/mo) gives you unlimited everything. All tiers include a 2% transaction fee on payments."
    },
    {
      question: "Is there a contract or commitment?",
      answer: "No long-term contracts. You can cancel anytime. We believe the product should earn your business every month, not a contract."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We use Stripe for all payment processing. You can pay with any major credit or debit card. For vendor payments collected through Voxxy, funds are deposited directly to your connected Stripe account."
    },
    {
      question: "Can I import my existing vendor lists?",
      answer: "Yes. You can import vendor contacts via CSV to get your CRM populated immediately. We also support manual entry and vendors self-registering through your application forms."
    },
    {
      question: "Does Voxxy work with Eventbrite, Luma, or other event tools?",
      answer: "Yes. Through our Zapier integration and growing marketplace of add-ons, you can connect Voxxy to Eventbrite, Luma, and hundreds of other tools. Sync event registrations, push data to spreadsheets, and trigger automations across your existing workflow."
    },
    {
      question: "I'm an artist/vendor — is Voxxy free for me?",
      answer: "Yes. Artists and vendors use Voxxy for free. You can discover events, apply to shows, track your applications, and connect with audiences — all at no cost. The platform is paid for by the event producers who use it to manage their operations."
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
      <Navigation activePage="help" />

      {/* Hero Section */}
      <section className="relative pt-[140px] pb-16 px-6 md:px-12 bg-gradient-to-br from-voxxy-purple-deep to-voxxy-purple-mid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-voxxy-purple-brand/15 via-transparent to-transparent"></div>

        <div className="container mx-auto max-w-[1000px] relative z-10">
          <div className="text-center">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-light mb-4">Help Center</div>
            <h1 className="text-[48px] font-display font-bold text-white mb-4 leading-tight">We're here to help</h1>
            <p className="text-[18px] text-white/60 max-w-[600px] mx-auto">
              Real humans, fast responses. Whether you need onboarding support or have a quick question, we've got you.
            </p>
          </div>
        </div>
      </section>

      {/* Help Resources */}
      <section className="py-[100px] px-6 md:px-12 bg-gray-50">
        <div className="container mx-auto max-w-[1200px]">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="text-4xl mb-5">📧</div>
              <h3 className="text-[20px] font-display font-bold mb-2.5">Email Support</h3>
              <p className="text-[15px] leading-relaxed text-gray-600 mb-5">
                Reach our team directly for questions about your account, event setup, or anything else. We respond within 1–2 business days.
              </p>
              <a href="mailto:team@voxxypresents.com" className="text-voxxy-purple-brand font-semibold text-[14px] hover:underline">
                team@voxxypresents.com →
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="text-4xl mb-5">📚</div>
              <h3 className="text-[20px] font-display font-bold mb-2.5">Onboarding Guide</h3>
              <p className="text-[15px] leading-relaxed text-gray-600 mb-5">
                Step-by-step walkthrough for setting up your first event, importing vendors, configuring email flows, and going live.
              </p>
              <a
                href="https://doc.clickup.com/90131126378/d/h/2ky3qp3a-7993/2ec4ea816970d24"
                target="_blank"
                rel="noopener noreferrer"
                className="text-voxxy-purple-brand font-semibold text-[14px] hover:underline"
              >
                Read the Guide →
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="text-4xl mb-5">💬</div>
              <h3 className="text-[20px] font-display font-bold mb-2.5">Community Discord</h3>
              <p className="text-[15px] leading-relaxed text-gray-600 mb-5">
                Connect with other event producers, share tips, and get quick answers from the Voxxy team and community.
              </p>
              <a
                href="https://discord.com/channels/1427678461190733885/1445229738636349460"
                target="_blank"
                rel="noopener noreferrer"
                className="text-voxxy-purple-brand font-semibold text-[14px] hover:underline"
              >
                Join Discord →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-[100px] px-6 md:px-12 bg-white">
        <div className="container mx-auto max-w-[1200px]">
          <div className="text-center mb-14">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-voxxy-purple-brand mb-4">FAQ</div>
            <h2 className="text-[42px] font-display font-bold text-gray-900">Common questions</h2>
          </div>

          <div className="max-w-[700px] mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-gray-200 py-6"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <h3 className="text-[18px] font-display font-bold text-gray-900 pr-8 group-hover:text-voxxy-purple-brand transition-colors">
                    {faq.question}
                  </h3>
                  <span className="text-[24px] text-voxxy-purple-brand flex-shrink-0 transition-transform duration-200" style={{
                    transform: openFaq === index ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}>
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: openFaq === index ? '300px' : '0',
                    paddingTop: openFaq === index ? '16px' : '0'
                  }}
                >
                  <p className="text-[15px] leading-relaxed text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
