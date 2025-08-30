import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Ticket, 
  DollarSign,
  TrendingUp,
  Users,
  Settings,
  Clock,
  Star
} from "lucide-react"

export function TicketManagementManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Ticket Management
          <Badge variant="secondary" className="ml-2">
            Coming Soon
          </Badge>
        </CardTitle>
        <CardDescription>
          Advanced ticket sales, pricing, and analytics tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Coming Soon Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-purple-900 mb-2">
              Advanced Ticketing Coming Soon
            </h3>
            <p className="text-purple-700 mb-4 max-w-md mx-auto">
              Professional ticket management tools are currently in development. 
              Get ready for powerful features to manage your event sales.
            </p>
          </div>

          {/* Preview Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Dynamic Pricing</h4>
              </div>
              <p className="text-sm text-gray-600">
                Set up tiered pricing, early bird discounts, and promotional codes
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Attendee Management</h4>
              </div>
              <p className="text-sm text-gray-600">
                Track registrations, manage waitlists, and handle check-ins
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Sales Analytics</h4>
              </div>
              <p className="text-sm text-gray-600">
                Real-time sales data, conversion tracking, and revenue insights
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <Settings className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium">Integration Tools</h4>
              </div>
              <p className="text-sm text-gray-600">
                Connect with payment processors, CRM systems, and marketing tools
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Development Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Basic Event Creation</div>
                  <div className="text-xs text-gray-600">Available now</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Platform Import & Sync</div>
                  <div className="text-xs text-gray-600">In development</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Advanced Ticketing</div>
                  <div className="text-xs text-gray-600">Coming Q2 2025</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">
              Want early access? Join our beta program!
            </p>
            <Button variant="outline" size="sm">
              Request Beta Access
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}