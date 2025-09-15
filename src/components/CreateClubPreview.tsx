import React from 'react'
import { Button } from "@/components/ui/button"
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
      case 'venmo': return DollarSign
      case 'other': return Link
      default: return Link
    }
  }

  const completionChecks = [
    { label: 'Club name', completed: !!data.name, required: true },
    { label: 'Club description', completed: !!data.description, required: true },
    { label: 'Contact email', completed: !!data.contactEmail, required: true },
    { label: 'Location info', completed: !!data.defaultLocation, required: false },
    { label: 'About story', completed: !!data.aboutStory, required: false },
    { label: 'Logo uploaded', completed: !!data.logoUrl, required: false },
    { label: 'Social links', completed: Object.values(data.socialLinks).some(link => link?.trim()), required: false },
  ]

  const requiredCompleted = completionChecks.filter(check => check.required).every(check => check.completed)
  const totalCompleted = completionChecks.filter(check => check.completed).length
  const completionPercentage = Math.round((totalCompleted / completionChecks.length) * 100)

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg">
        <div className="p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-green-300 mb-2">
            <CheckCircle className="h-5 w-5" />
            Setup Complete ({completionPercentage}%)
          </h3>
          <p className="text-green-200 mb-4">
            {requiredCompleted
              ? "Your club is ready to be created! Optional items can be added later."
              : "Please complete all required fields before creating your club."
            }
          </p>
        </div>
        <div className="px-6 pb-6">
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
                  check.completed ? 'text-green-200' : check.required ? 'text-red-300' : 'text-gray-300'
                }`}>
                  {check.label}
                  {check.required && !check.completed && ' *'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Club Preview */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
        <div className="p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
            <Eye className="h-5 w-5" />
            Club Preview
          </h3>
          <p className="text-gray-200 mb-4">
            This is how your club page will look to visitors
          </p>
        </div>
        <div className="px-6 pb-6">
          <div className="space-y-8">
            {/* Component 1: Welcome Section - Matching WelcomeSection structure */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {data.logoUrl ? (
                    <img
                      src={data.logoUrl}
                      alt={`${data.name} Logo`}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/30 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full border-4 border-white/30 shadow-lg flex items-center justify-center">
                      <span className="text-gray-300 text-sm text-center">Logo<br/>Here</span>
                    </div>
                  )}
                </div>

                {/* Welcome Content */}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {data.name}
                  </h1>
                  <p className="text-xl text-gray-300 mb-6">
                    {data.description}
                  </p>

                  {/* Welcome Message */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h2 className="text-2xl font-semibold text-white mb-3">
                      Welcome to {data.name}
                    </h2>
                    <p className="text-lg leading-relaxed text-gray-200">
                      {getDisplayAboutStory(data.aboutStory, data.name)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Component 2: Upcoming Events Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              <h3 className="text-3xl font-bold text-center text-white mb-10">
                Upcoming Events
              </h3>
              <div className="text-center py-12">
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 bg-white/5">
                  <h4 className="font-semibold mb-2 text-gray-200">Your Events Will Appear Here</h4>
                  <div className="text-sm text-gray-300 space-y-1 mb-4">
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

            {/* Component 3: About Section - Matching OrganizationPage About structure */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
              <h3 className="text-4xl font-bold text-center text-white mb-12">
                About {data.name}
              </h3>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="w-full h-96 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-center">
                      Your about images will appear here<br/>
                      <span className="text-sm">Add them after creating your club</span>
                    </span>
                  </div>
                </div>
                <div className="h-96 flex flex-col">
                  <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    <div>
                      <h4 className="text-2xl font-semibold text-white mb-4">Our Story</h4>
                      <div className="text-gray-200 leading-relaxed space-y-4">
                        <p className={isDefaultContent(data.aboutStory || '', data.name) ? 'italic text-gray-400' : ''}>
                          {getDisplayAboutStory(data.aboutStory, data.name)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-2xl font-semibold text-white mb-4">What We Offer</h4>
                      <ul className="space-y-2 text-gray-200">
                        {getDisplayOfferings(data.aboutOfferings).map((offering, index) => (
                          <li key={index} className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-3 ${
                              (data.aboutOfferings && data.aboutOfferings.some(o => o.trim()))
                                ? 'bg-purple-600'
                                : 'bg-gray-500'
                            }`}></div>
                            <span className={
                              (data.aboutOfferings && data.aboutOfferings.some(o => o.trim()))
                                ? ''
                                : 'italic text-gray-400'
                            }>
                              {offering}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-2xl font-semibold text-white mb-4">Connect With Us</h4>
                    <div className="flex items-center gap-4">
                      {Object.values(data.socialLinks).some(link => link?.trim()) ? (
                        Object.entries(data.socialLinks)
                          .filter(([_, link]) => link?.trim())
                          .map(([platform, link]) => {
                            const Icon = getSocialIcon(platform)
                            return (
                              <div
                                key={platform}
                                className="text-gray-300 hover:text-purple-400 transition-colors"
                                title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                              >
                                <Icon className="h-6 w-6" />
                              </div>
                            )
                          })
                      ) : (
                        <span className="text-gray-400 italic text-sm">Social links will appear here when added</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* URL Preview */}
      <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg">
        <div className="p-6">
          <div className="text-center">
            <h3 className="font-semibold text-blue-300 mb-2">Your Club URL</h3>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 font-mono text-lg text-white">
              voxxypresents.com/<span className="text-purple-400">{clubSlug}</span>
            </div>
            <p className="text-sm text-blue-200 mt-2">
              This is where people will find your club online
            </p>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg">
        <div className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-purple-300 mb-2">Ready to launch your club? 🚀</h3>
            <p className="text-purple-200 mb-4">
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
              <p className="text-sm text-red-300 mt-2">
                Please complete all required fields (marked with *) before creating your club.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}