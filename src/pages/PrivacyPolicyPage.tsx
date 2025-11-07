import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  UserCheck,
  Share2,
  Cookie,
  Shield,
  User,
  UserX,
  RefreshCcw,
  MapPin,
  Smartphone,
  Globe,
  DollarSign,
  Clock
} from 'lucide-react'

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      {/* Simple Navigation */}
      <nav className="relative z-50 px-4 py-6 bg-gray-800/50 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto max-w-6xl">
          <Link to="/" className="text-2xl font-bold text-white">
            Voxxy Presents
          </Link>
        </div>
      </nav>

      {/* Content */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Privacy Policy
            </span>
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Effective Date: 4/23/2025 | Last Updated: 8/23/2025
          </p>

          <div className="flex gap-4 mb-12">
            <div className="w-1 bg-purple-500 rounded"></div>
            <p className="text-xl text-gray-300 leading-relaxed">
              At Voxxy, your privacy matters. This Privacy Policy explains how we collect, use, and protect your information when you use our website and mobile app.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Information We Collect</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-2">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-white">Personal Info:</strong> Name, email address, and any optional profile details you provide.</li>
                  <li><strong className="text-white">Guest Users:</strong> We may collect your email if you participate in polls or activity boards without registering.</li>
                  <li><strong className="text-white">Product Interaction Data:</strong> How you interact with app features, including activities created, votes cast, preferences selected, and navigation patterns within the app.</li>
                  <li><strong className="text-white">Usage & Device Data:</strong> IP address, browser type, device type, operating system, pages visited, time spent, and actions taken in the app.</li>
                  <li><strong className="text-white">Location Data:</strong> City-level and precise location (when enabled) to recommend events and activities.</li>
                  <li><strong className="text-white">Contacts:</strong> When you grant permission, we access your device contacts solely to help you find friends already using Voxxy. We do not store your full contact list.</li>
                  <li><strong className="text-white">Diagnostics:</strong> Crash logs and performance data to improve app stability and fix technical issues. This data is collected anonymously.</li>
                  <li><strong className="text-white">Push Notifications:</strong> Push notification tokens for sending alerts and updates.</li>
                  <li><strong className="text-white">Group Planning Preferences:</strong> Responses to Voxxy quizzes, polls, votes, and feedback tools.</li>
                  <li><strong className="text-white">Activity Preferences:</strong> Event preferences used for AI recommendations.</li>
                  <li><strong className="text-white">Communications:</strong> Feedback, support requests, and messages submitted through our contact forms.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">How We Use Your Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-2">
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide and personalize your Voxxy experience</li>
                  <li>Improve our product through analytics and feedback</li>
                  <li>Send updates, surveys, and support messages</li>
                  <li>Generate AI-driven recommendations for events and activities</li>
                  <li>Prevent fraud or abuse</li>
                </ul>
                <p className="pt-2 font-semibold text-white">We never sell your personal data.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Share2 className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Data Sharing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-3">
                <p>We only share your data with trusted third parties that help us operate, including:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>AWS (Hosting providers)</li>
                  <li>Google Places API (Venue information and location services)</li>
                  <li>Mixpanel (Analytics tools)</li>
                  <li>SendGrid (Email tools)</li>
                  <li>OpenAI (AI-powered recommendations)</li>
                </ul>
                <p>When you use Voxxy's recommendation features, we send your activity preferences, location, and group responses to OpenAI to generate personalized restaurant, bar, and activity suggestions. Some anonymized data may be sent to OpenAI for processing. These partners follow strict data protection practices.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Cookie className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Cookies & Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>We use cookies and similar technologies to remember your preferences and understand user behavior. You can manage cookie settings in your browser.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Data Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>We use encryption and secure storage to keep your data safe. While we do our best, no internet-based service is 100% secure.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Data Retention</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-white">Personal account data:</strong> Retained until you request deletion</li>
                  <li><strong className="text-white">Guest user emails:</strong> Deleted after 12 months if inactive</li>
                  <li><strong className="text-white">Poll and planning data:</strong> Retained for 18 months for analytics</li>
                  <li><strong className="text-white">Push notification tokens:</strong> Deleted after 90 days of inactivity</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Your Rights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-3">
                <ul className="list-disc list-inside space-y-1">
                  <li>Access or update your data</li>
                  <li>Request account deletion</li>
                  <li>Opt out of marketing communications</li>
                </ul>
                <p>Contact us anytime at <a href="mailto:team@voxxypresents.com" className="text-purple-400 hover:text-purple-300">team@voxxypresents.com</a> to exercise these rights.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserX className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Children's Privacy & Age Verification</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Voxxy is not designed for children under 13. We verify age during registration and may require parental consent where applicable. We don't knowingly collect information from children. If we discover that a child under 13 has provided us with personal information, we will delete it immediately. If you believe we have collected information from a child under 13, please contact us.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Location Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>When you create or respond to activities, we collect location information to provide recommendations near your chosen meeting spot. This data is used solely for providing our services and is not sold or used for advertising. You can choose not to provide location data, but this may limit our recommendation features.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Mobile App Permissions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-3">
                <p>Our mobile app may request the following permissions:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-white">Push Notifications:</strong> To send you activity updates and reminders (optional)</li>
                  <li><strong className="text-white">Camera/Photos:</strong> To upload profile pictures (optional)</li>
                  <li><strong className="text-white">Contacts:</strong> To help you find friends already using Voxxy (optional)</li>
                  <li><strong className="text-white">Location:</strong> To provide venue recommendations near you (optional)</li>
                </ul>
                <p>You can manage these permissions in your device settings at any time.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Data Linking & Anonymity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-3">
                <p><strong className="text-white">Data linked to your identity:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Name and email address</li>
                  <li>Profile photos</li>
                  <li>Location history and activity locations</li>
                  <li>Activities created and participated in</li>
                  <li>Votes, preferences, and interactions</li>
                  <li>Comments and messages</li>
                </ul>
                <p><strong className="text-white">Data NOT linked to your identity:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Contacts (used only for friend matching, not stored)</li>
                  <li>Crash logs and diagnostic data (collected anonymously)</li>
                </ul>
                <p>We do not use any of your data for tracking across other companies' apps or websites.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">International Users</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Voxxy is operated from the United States. If you use our services from outside the US, your data will be transferred to and processed in the US. By using Voxxy, you consent to this transfer.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">California Privacy Rights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-3">
                <p>California residents have additional rights under the CCPA:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Right to know what personal information we collect</li>
                  <li>Right to delete your personal information</li>
                  <li>Right to opt-out of data sales (we don't sell your data)</li>
                  <li>Right to non-discrimination for exercising your rights</li>
                </ul>
                <p>To exercise these rights, contact us at team@voxxypresents.com.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <RefreshCcw className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">Policy Updates</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>We may update this policy over time. If we make material changes, we'll notify you via email or on our site. Your continued use of Voxxy after changes means you accept the updated policy.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link to="/" className="text-purple-400 hover:text-purple-300 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative z-10 border-t border-white/10">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <p className="text-gray-400">&copy; 2025 Voxxy, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
