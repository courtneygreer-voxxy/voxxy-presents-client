import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  UserCheck,
  User,
  Slash,
  Code,
  CloudOff,
  AlertTriangle,
  Power,
  Gavel,
  Mail,
  Shield,
  CreditCard,
  MessageSquare,
  AlertCircle
} from 'lucide-react'

export default function TermsOfServicePage() {
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
              Terms of Service
            </span>
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Effective Date: 4/23/2025 | Last Updated: 4/23/2025
          </p>

          <div className="flex gap-4 mb-12">
            <div className="w-1 bg-purple-500 rounded"></div>
            <p className="text-xl text-gray-300 leading-relaxed">
              Welcome to Voxxy! By using our website, mobile app, and services, you agree to these terms. You must be at least 13 years old to use Voxxy.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">1. Agreement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>These Terms of Service are a binding contract between you and Voxxy AI, Inc., a Delaware corporation. By using Voxxy, you agree to abide by these terms and our Privacy Policy.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">2. Eligibility</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p><strong className="text-white">You must be at least 13 years old to use Voxxy.</strong> By creating an account or using our services, you confirm that you meet this age requirement. If you are under 13, you may not use Voxxy without parental consent.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">3. Your Account</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="list-disc list-inside space-y-2">
                  <li>You're responsible for keeping your account details accurate and secure.</li>
                  <li>You're liable for any activity that happens through your account.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Slash className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">4. Acceptable Use</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-2">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Break the law</li>
                  <li>Disrupt our services</li>
                  <li>Attempt to reverse-engineer or misuse the app</li>
                  <li>Submit harmful or false content</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Code className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">5. Ownership & IP</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>All content on Voxxy, including designs, code, logos, and copy, belongs to Voxxy AI, Inc.. You may not copy or reuse it without permission.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Code className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">6. AI Services & Content Generation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Voxxy uses AI services (including OpenAI) to generate recommendations. You retain rights to your submitted data, but Voxxy and its AI providers may process it for recommendations and improvements.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CloudOff className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">7. Availability</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>We're constantly improving. We may change or remove features at any time without notice. We're not responsible for downtime.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">8. Liability Disclaimer</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-2">
                <p>VOXXY IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY DELAWARE LAW:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>We disclaim all warranties, express or implied</li>
                  <li>We're not liable for any indirect, incidental, special, or consequential damages</li>
                  <li>Our total liability will not exceed $100 or the amount you've paid us in the past 12 months, whichever is greater</li>
                  <li>We're not responsible for third-party services, venues, or recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Power className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">9. Termination</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>We may suspend or terminate your account for any violations of these terms.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Gavel className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">10. Governing Law</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>These Terms are governed by the laws of the State of Delaware, without regard to its conflict of law principles.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">11. Indemnification</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-2">
                <p>You agree to defend, indemnify, and hold Voxxy AI, Inc.., its officers, directors, employees, and agents harmless from any claims, damages, or expenses (including attorney's fees) arising from:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your violation of these Terms</li>
                  <li>Your use of the service</li>
                  <li>Content you submit through Voxxy</li>
                  <li>Your violation of any law or third-party rights</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">12. Payment Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-2">
                <p>If we introduce paid features:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All fees are non-refundable unless required by law</li>
                  <li>We may change prices with 30 days notice</li>
                  <li>You're responsible for all applicable taxes</li>
                  <li>Failure to pay may result in service termination</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">13. Dispute Resolution</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p><strong className="text-white">PLEASE READ CAREFULLY:</strong> Any disputes will be resolved through binding arbitration in Delaware, not in court. You waive your right to a jury trial and class actions. This doesn't affect your rights to file complaints with government agencies.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">14. User Content</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-2">
                <p>When you submit content to Voxxy:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You retain ownership of your content</li>
                  <li>You grant us a worldwide, royalty-free license to use, modify, and display it for operating Voxxy</li>
                  <li>You confirm you have the right to share this content</li>
                  <li>We may remove content that violates these terms</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-2xl text-white">15. Contact</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p>Have questions? Contact us at:</p>
                <p className="mt-2">
                  Voxxy AI, Inc.<br />
                  Email: <a href="mailto:team@voxxypresents.com" className="text-purple-400 hover:text-purple-300">team@voxxypresents.com</a>
                </p>
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
