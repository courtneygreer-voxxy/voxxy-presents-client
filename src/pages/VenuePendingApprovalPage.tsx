import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Building2, Mail, CheckCircle, ArrowLeft } from 'lucide-react'

export default function VenuePendingApprovalPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <Card className="bg-white/15 backdrop-blur-md border border-white/30">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-full flex items-center justify-center mb-6">
                <Clock className="h-10 w-10 text-yellow-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-4">
                Venue Submission Under Review
              </CardTitle>
              <p className="text-gray-300 text-lg">
                Thank you for submitting your venue! Our team is currently reviewing your application.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status Timeline */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-400" />
                  Approval Process Timeline
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Venue Submitted</p>
                      <p className="text-gray-400 text-sm">Your venue details have been received</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white animate-spin" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Under Review</p>
                      <p className="text-gray-400 text-sm">Our team is reviewing your venue (24-48 hours)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-300 font-medium">Notification</p>
                      <p className="text-gray-400 text-sm">You'll receive an email when approved</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-blue-400/10 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-3">What happens next?</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Our team will verify your venue information and photos</li>
                  <li>• We'll check that your venue meets our quality standards</li>
                  <li>• You'll receive an email notification within 48 hours</li>
                  <li>• Once approved, you'll gain access to your venue dashboard</li>
                  <li>• Event organizers will be able to discover and book your venue</li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="bg-purple-400/10 backdrop-blur-sm border border-purple-400/30 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-3">Need help or have questions?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  If you have any questions about the approval process or need to update your venue information,
                  please don't hesitate to reach out to our team.
                </p>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                  onClick={() => navigate('/contact')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('/voxxy-shop')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Browse Other Venues
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/venues/create')}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                >
                  Add Another Venue
                </Button>
              </div>

              <div className="text-center pt-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}