import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, Camera, Loader2 } from 'lucide-react'
import { mockArtistProfile } from '@/mocks/artistPortalData'
import ArtistProfilePreview from './ArtistProfilePreview'
import { toast } from 'sonner'

export default function ArtistProfileTab() {
  const [formData, setFormData] = useState({
    firstName: mockArtistProfile.name.split(' ')[0] || '',
    lastName: mockArtistProfile.name.split(' ').slice(1).join(' ') || '',
    businessName: mockArtistProfile.business_name,
    bio: mockArtistProfile.bio,
    phone: mockArtistProfile.phone,
    email: mockArtistProfile.email,
    instagramHandle: mockArtistProfile.instagram_handle,
    tiktokHandle: mockArtistProfile.tiktok_handle,
    website: mockArtistProfile.website,
    city: mockArtistProfile.city,
    state: mockArtistProfile.state,
    isPublic: mockArtistProfile.public,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Profile updated successfully')
    }, 800)
  }

  const bioCharCount = formData.bio.length
  const bioCharLimit = 500

  const inputClass =
    'bg-background/5 border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20'

  // Data for live preview
  const previewData = {
    name: `${formData.firstName} ${formData.lastName}`.trim(),
    businessName: formData.businessName,
    bio: formData.bio,
    location: [formData.city, formData.state].filter(Boolean).join(', '),
    instagramHandle: formData.instagramHandle,
    tiktokHandle: formData.tiktokHandle,
    website: formData.website,
    slug: mockArtistProfile.slug,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form — Left 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-md hover:bg-primary/80 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Profile Photo</p>
                  <p className="text-[10px] text-muted-foreground">JPG, PNG up to 5MB</p>
                </div>
              </div>

              <Separator />

              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground/70">First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground/70">Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground/70">
                  Artist / Business Name
                </Label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="Your studio or brand name"
                  className={inputClass}
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-foreground/70">Bio</Label>
                  <span
                    className={`text-[10px] ${
                      bioCharCount > bioCharLimit ? 'text-red-400' : 'text-muted-foreground'
                    }`}
                  >
                    {bioCharCount}/{bioCharLimit}
                  </span>
                </div>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell producers about your work, style, and experience..."
                  className={`min-h-[100px] ${inputClass}`}
                  maxLength={bioCharLimit}
                />
              </div>

              <Separator />

              {/* Contact Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground/70">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(555) 555-5555"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground/70">
                    Email{' '}
                    <span className="text-muted-foreground/50 text-[10px]">
                      (change via Settings)
                    </span>
                  </Label>
                  <Input value={formData.email} disabled className={`${inputClass} opacity-50`} />
                </div>
              </div>

              {/* Social Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground/70">Instagram</Label>
                  <Input
                    value={formData.instagramHandle}
                    onChange={(e) => handleChange('instagramHandle', e.target.value)}
                    placeholder="@handle"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground/70">TikTok</Label>
                  <Input
                    value={formData.tiktokHandle}
                    onChange={(e) => handleChange('tiktokHandle', e.target.value)}
                    placeholder="@handle"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground/70">Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="yoursite.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Location Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground/70">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Brooklyn"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground/70">State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="NY"
                    className={inputClass}
                  />
                </div>
              </div>

              <Separator />

              {/* Public Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Public Profile</p>
                  <p className="text-[10px] text-muted-foreground">
                    When enabled, producers and anyone with your link can view your profile
                  </p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleChange('isPublic', checked)}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={isSaving} variant="gradient" size="lg">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview — Right column */}
        <div className="space-y-4">
          <div className="sticky top-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Public Preview
            </p>
            <ArtistProfilePreview data={previewData} />
          </div>
        </div>
      </div>
    </div>
  )
}
