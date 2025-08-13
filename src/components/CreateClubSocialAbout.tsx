import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Globe, Calendar, DollarSign, Link, Plus, X, Heart } from "lucide-react"

interface CreateClubData {
  name: string
  description: string
  contactEmail: string
  defaultLocation: string
  defaultAddress: string
  logoUrl?: string
  bannerUrl?: string
  aboutImageUrl?: string
  primaryColor: string
  backgroundColor: string
  socialLinks: {
    instagram?: string
    website?: string
    eventbrite?: string
    venmo?: string
    other?: string
  }
  aboutStory?: string
  aboutOfferings?: string[]
}

interface CreateClubSocialAboutProps {
  data: CreateClubData
  updateData: (updates: Partial<CreateClubData>) => void
  onNext: () => void
}

export default function CreateClubSocialAbout({ data, updateData }: CreateClubSocialAboutProps) {
  const handleSocialLinkChange = (platform: keyof typeof data.socialLinks, value: string) => {
    updateData({
      socialLinks: {
        ...data.socialLinks,
        [platform]: value
      }
    })
  }

  const handleOfferingChange = (index: number, value: string) => {
    const newOfferings = [...(data.aboutOfferings || [''])]
    newOfferings[index] = value
    updateData({ aboutOfferings: newOfferings })
  }

  const addOffering = () => {
    updateData({
      aboutOfferings: [...(data.aboutOfferings || ['']), '']
    })
  }

  const removeOffering = (index: number) => {
    const newOfferings = data.aboutOfferings?.filter((_, i) => i !== index) || []
    updateData({ aboutOfferings: newOfferings.length > 0 ? newOfferings : [''] })
  }

  const socialPlatforms = [
    {
      key: 'instagram' as const,
      label: 'Instagram',
      icon: Instagram,
      placeholder: '@yourusername or full URL',
      description: 'Your Instagram handle or profile URL'
    },
    {
      key: 'website' as const,
      label: 'Website',
      icon: Globe,
      placeholder: 'https://yourwebsite.com',
      description: 'Your club\'s website or homepage'
    },
    {
      key: 'eventbrite' as const,
      label: 'Eventbrite',
      icon: Calendar,
      placeholder: 'https://eventbrite.com/o/your-organizer',
      description: 'Your Eventbrite organizer page'
    },
    {
      key: 'venmo' as const,
      label: 'Venmo',
      icon: DollarSign,
      placeholder: '@yourusername',
      description: 'For donations or payments'
    },
    {
      key: 'other' as const,
      label: 'Other Link',
      icon: Link,
      placeholder: 'https://any-other-link.com',
      description: 'Any other important link'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Social Links
          </CardTitle>
          <CardDescription>
            Connect your social media and external platforms (all optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon
            return (
              <div key={platform.key}>
                <Label htmlFor={platform.key} className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4" />
                  {platform.label}
                </Label>
                <Input
                  id={platform.key}
                  placeholder={platform.placeholder}
                  value={data.socialLinks[platform.key] || ''}
                  onChange={(e) => handleSocialLinkChange(platform.key, e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">{platform.description}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* About Story */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            About Your Club
          </CardTitle>
          <CardDescription>
            Share your club's story and mission (optional but recommended)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="aboutStory" className="text-base font-medium">
                Your Story
              </Label>
              <Textarea
                id="aboutStory"
                placeholder="Tell people about your club's mission, history, and what makes it special. What inspired you to start this community? What values do you share?"
                value={data.aboutStory || ''}
                onChange={(e) => updateData({ aboutStory: e.target.value })}
                className="mt-2 min-h-[120px]"
              />
              <p className="text-sm text-gray-500 mt-1">
                This will appear on your club's about section
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What We Offer */}
      <Card>
        <CardHeader>
          <CardTitle>What We Offer</CardTitle>
          <CardDescription>
            List the types of events, services, or experiences your club provides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.aboutOfferings?.map((offering, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={index === 0 ? "Live music events" : index === 1 ? "Community workshops" : "Art exhibitions"}
                  value={offering}
                  onChange={(e) => handleOfferingChange(index, e.target.value)}
                  className="flex-1"
                />
                {data.aboutOfferings && data.aboutOfferings.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOffering(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addOffering}
              className="w-full flex items-center gap-2 text-gray-600"
            >
              <Plus className="h-4 w-4" />
              Add Another Offering
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Examples:</strong> Live music events, Art workshops, Community discussions, 
              Networking meetups, Educational seminars, Creative collaborations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Preview: About Section</CardTitle>
          <CardDescription>How your about information will appear to visitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4" style={{ color: data.primaryColor }}>
              About {data.name || 'Your Club'}
            </h3>
            
            {data.aboutStory && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Our Story</h4>
                <p className="text-gray-700 leading-relaxed">{data.aboutStory}</p>
              </div>
            )}
            
            {data.aboutOfferings && data.aboutOfferings.some(offering => offering.trim()) && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">What We Offer</h4>
                <ul className="space-y-2">
                  {data.aboutOfferings
                    .filter(offering => offering.trim())
                    .map((offering, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: data.primaryColor }}
                        />
                        <span>{offering}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            
            {/* Social Links Preview */}
            {Object.values(data.socialLinks).some(link => link?.trim()) && (
              <div>
                <h4 className="font-semibold mb-3">Connect With Us</h4>
                <div className="flex gap-3">
                  {Object.entries(data.socialLinks)
                    .filter(([_, link]) => link?.trim())
                    .map(([platform, link]) => (
                      <div
                        key={platform}
                        className="px-3 py-1 rounded-full text-sm border"
                        style={{ borderColor: data.primaryColor, color: data.primaryColor }}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {!data.aboutStory && !data.aboutOfferings?.some(o => o.trim()) && (
              <p className="text-gray-500 italic">
                Add your story and offerings to see them appear here...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}