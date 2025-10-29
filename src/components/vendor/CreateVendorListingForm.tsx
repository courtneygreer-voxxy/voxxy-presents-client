import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import vendorService from '../../services/vendorService'
import { VendorType } from '../../types/vendor'
import { Building2, Music, Camera, Zap, UtensilsCrossed, Store, CheckCircle2 } from 'lucide-react'

interface CreateVendorListingFormProps {
  onSuccess?: () => void
}

const VENDOR_TYPE_INFO: Record<VendorType, { label: string; icon: React.ReactNode; placeholder: string }> = {
  venue: {
    label: 'Venue',
    icon: <Building2 className="h-5 w-5" />,
    placeholder: 'Describe your venue: type, capacity, location, unique features...'
  },
  artist: {
    label: 'Artist/Performer',
    icon: <Music className="h-5 w-5" />,
    placeholder: 'Describe your performance style, genres, typical set length, equipment needs...'
  },
  photographer: {
    label: 'Photographer',
    icon: <Camera className="h-5 w-5" />,
    placeholder: 'Describe your photography style, specialties, equipment, packages offered...'
  },
  lighting_tech: {
    label: 'Lighting Technician',
    icon: <Zap className="h-5 w-5" />,
    placeholder: 'Describe your lighting services, equipment available, experience level...'
  },
  catering: {
    label: 'Catering',
    icon: <UtensilsCrossed className="h-5 w-5" />,
    placeholder: 'Describe your cuisine, menu options, dietary accommodations, service style...'
  },
  entertainer: {
    label: 'Entertainer',
    icon: <Music className="h-5 w-5" />,
    placeholder: 'Describe your entertainment services, performance type, audience size...'
  },
  entertainment: {
    label: 'Entertainment',
    icon: <Music className="h-5 w-5" />,
    placeholder: 'Describe your entertainment services, performance type, audience size...'
  },
  market_vendor: {
    label: 'Market Vendor',
    icon: <Store className="h-5 w-5" />,
    placeholder: 'Describe your products, booth setup requirements, ideal market types...'
  }
}

export const CreateVendorListingForm: React.FC<CreateVendorListingFormProps> = ({ onSuccess }) => {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get vendor info from user profile
  const vendorType = userProfile?.vendorProfile?.vendorType || 'venue'
  const businessName = userProfile?.vendorProfile?.businessName || userProfile?.name || ''
  const contactEmail = userProfile?.email || ''

  const vendorInfo = VENDOR_TYPE_INFO[vendorType as VendorType]

  console.log('📝 CreateVendorListingForm - Rendering')
  console.log('  - User Profile:', userProfile)
  console.log('  - Vendor Type:', vendorType)
  console.log('  - Business Name:', businessName)
  console.log('  - Contact Email:', contactEmail)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!description.trim()) {
      setError('Please provide a description of your services')
      return
    }

    if (!userProfile) {
      setError('You must be logged in to create a vendor listing')
      return
    }

    setLoading(true)

    try {
      // Create the vendor listing
      const newVendor = await vendorService.createVendor({
        name: businessName,
        description: description.trim(),
        vendorType: vendorType as VendorType,
        photos: [],
        contactInfo: {
          email: contactEmail,
        },
        pricingType: 'custom',
        ownerName: userProfile.name || 'Unknown',
        ownerEmail: userProfile.email || contactEmail,
        preferredContactMethod: userProfile.vendorProfile?.preferredContactMethod || 'email',
      })

      console.log('✅ Vendor listing created:', newVendor.id)

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess()
      } else {
        // Refresh the page to load the new vendor listing
        window.location.reload()
      }
    } catch (err: any) {
      console.error('Error creating vendor listing:', err)
      setError(err.message || 'Failed to create vendor listing. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background dots */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-600/20 rounded-lg text-purple-400">
            {vendorInfo.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Create Your {vendorInfo.label} Listing</h2>
            <p className="text-gray-400 text-sm">Tell producers about your services</p>
          </div>
        </div>

        {/* Info summary */}
        <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">{businessName}</p>
              <p className="text-gray-400 text-sm">{vendorInfo.label}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">{contactEmail}</p>
              <p className="text-gray-400 text-sm">Contact email</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={vendorInfo.placeholder}
              rows={6}
              className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />
            <p className="text-gray-400 text-xs mt-2">
              This will be visible to event producers browsing vendors. You can add photos, pricing, and other details later.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || !description.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/')}
              variant="outline"
              className="border-white/20 text-gray-300 hover:bg-white/5"
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Help text */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            <strong className="text-white">What happens next?</strong><br />
            Once you create your listing, you'll be able to browse events, apply for opportunities, and add more details to your profile (photos, website, social media, etc.) before submitting applications.
          </p>
        </div>
      </div>
    </div>
  )
}
