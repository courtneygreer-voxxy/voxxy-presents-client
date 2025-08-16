import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Eye, Mail, MapPin, Instagram, Globe, Calendar, DollarSign, Link } from "lucide-react"
import type { CreateClubPreviewProps } from '@/types/createClub'
import { getDisplayAboutStory, getDisplayOfferings, isDefaultContent } from '@/utils/defaultContent'

export default function CreateClubPreview({ data, isCreating, onCreate }: CreateClubPreviewProps) {
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const clubSlug = generateSlug(data.name)

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return Instagram
      case 'website': return Globe
      case 'eventbrite': return Calendar
      case 'venmo': return DollarSign
      case 'other': return Link
      default: return Link
    }
  }

  const completionChecks = [
    { label: 'Club name', completed: !!data.name, required: true },
    { label: 'Description', completed: !!data.description, required: true },
    { label: 'Contact email', completed: !!data.contactEmail, required: true },
    { label: 'Location info', completed: !!data.defaultLocation, required: false },
    { label: 'About story', completed: !!data.aboutStory, required: false },
    { label: 'Logo uploaded', completed: !!data.logoUrl, required: false },
    { label: 'Header photo', completed: !!data.bannerUrl, required: false },
    { label: 'Social links', completed: Object.values(data.socialLinks).some(link => link?.trim()), required: false },
  ]

  const requiredCompleted = completionChecks.filter(check => check.required).every(check => check.completed)
  const totalCompleted = completionChecks.filter(check => check.completed).length
  const completionPercentage = Math.round((totalCompleted / completionChecks.length) * 100)

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Setup Complete ({completionPercentage}%)
          </CardTitle>
          <CardDescription className="text-green-700">
            {requiredCompleted 
              ? "Your club is ready to be created! Optional items can be added later."
              : "Please complete all required fields before creating your club."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {completionChecks.map((check, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  check.completed 
                    ? 'bg-green-600 text-white' 
                    : check.required 
                      ? 'bg-red-200 text-red-600' 
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {check.completed && <CheckCircle className="h-3 w-3" />}
                </div>
                <span className={`text-sm ${
                  check.completed ? 'text-green-800' : check.required ? 'text-red-700' : 'text-gray-600'
                }`}>
                  {check.label}
                  {check.required && !check.completed && ' *'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Club Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Club Preview
          </CardTitle>
          <CardDescription>
            This is how your club page will look to visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Header Banner */}
            {data.bannerUrl ? (
              <img 
                src={data.bannerUrl} 
                alt="Club banner" 
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-48 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-lg font-semibold opacity-75">Your header photo will appear here</h3>
                  <p className="text-sm opacity-60">Upload one in the branding step</p>
                </div>
              </div>
            )}
            
            {/* Main Content */}
            <div className="p-6">
              {/* Club Header Info */}
              <div className="mb-6 -mt-12">
                <div className="bg-white rounded-lg p-6 shadow-lg border mx-4">
                  <div className="flex items-start gap-4">
                    {data.logoUrl ? (
                      <img 
                        src={data.logoUrl} 
                        alt="Club logo" 
                        className="w-20 h-20 object-cover rounded-full border-2 border-white shadow-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-xs text-center">Logo<br/>Here</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {data.name}
                      </h1>
                      <p className="text-gray-600 text-sm md:text-base">{data.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{data.contactEmail}</span>
                </div>
                {data.defaultLocation && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{data.defaultLocation}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {Object.values(data.socialLinks).some(link => link?.trim()) && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Connect With Us</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.socialLinks)
                      .filter(([_, link]) => link?.trim())
                      .map(([platform, link]) => {
                        const Icon = getSocialIcon(platform)
                        return (
                          <Badge 
                            key={platform} 
                            variant="outline" 
                            className="flex items-center gap-1 border-purple-300 text-purple-600"
                          >
                            <Icon className="h-3 w-3" />
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </Badge>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* About Story - Always show with default if empty */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Our Story</h3>
                <p className={`leading-relaxed ${
                  isDefaultContent(data.aboutStory || '', data.name) 
                    ? 'text-gray-500 italic' 
                    : 'text-gray-700'
                }`}>
                  {getDisplayAboutStory(data.aboutStory, data.name)}
                </p>
              </div>

              {/* Offerings - Always show with defaults if empty */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-lg">What We Offer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getDisplayOfferings(data.aboutOfferings).map((offering, index) => (
                    <div key={index} className={`flex items-center gap-3 rounded-lg p-3 ${
                      (data.aboutOfferings && data.aboutOfferings.some(o => o.trim()))
                        ? 'bg-purple-50'
                        : 'bg-gray-50'
                    }`}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        (data.aboutOfferings && data.aboutOfferings.some(o => o.trim()))
                          ? 'bg-purple-500'
                          : 'bg-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        (data.aboutOfferings && data.aboutOfferings.some(o => o.trim()))
                          ? 'text-gray-800'
                          : 'text-gray-500 italic'
                      }`}>
                        {offering}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Event Preview */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50 text-center">
                <h3 className="font-semibold mb-2 text-gray-700">Your Events Will Appear Here</h3>
                <div className="text-sm text-gray-500 space-y-1 mb-4">
                  <p>Once you create your club, you can start adding events.</p>
                  <p>Members will see event details and registration options right here!</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled
                >
                  Sample Registration Button
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL Preview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Your Club URL</h3>
            <div className="bg-white p-3 rounded-lg border font-mono text-lg">
              voxxypresents.com/<span className="text-purple-600">{clubSlug}</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              This is where people will find your club online
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Button */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-purple-900 mb-2">Ready to launch your club? 🚀</h3>
            <p className="text-purple-700 mb-4">
              Once created, you can start planning events and building your community!
            </p>
            <Button
              size="lg"
              onClick={onCreate}
              disabled={!requiredCompleted || isCreating}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating Your Club...
                </>
              ) : (
                'Create My Club'
              )}
            </Button>
            {!requiredCompleted && (
              <p className="text-sm text-red-600 mt-2">
                Please complete all required fields (marked with *) before creating your club.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}