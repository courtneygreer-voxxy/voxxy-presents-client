import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOrganization } from '@/hooks/useOrganization'
import { SubscriptionModal } from '@/components/SubscriptionModal'
import { Loader, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SubscribePage() {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const navigate = useNavigate()
  const { organization, loading } = useOrganization(orgSlug || '')
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Auto-click the subscribe button once org loads to open modal
    if (organization && !loading && buttonRef.current) {
      setTimeout(() => {
        buttonRef.current?.click()
      }, 100)
    }
  }, [organization, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative text-center">
          <Loader className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md mx-4">
          <h1 className="text-2xl font-bold text-white mb-4">Organization Not Found</h1>
          <p className="text-gray-300 mb-6">The organization you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      {/* Content */}
      <div className="relative text-center max-w-lg">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-12 mb-6">
          <Heart className="h-16 w-16 text-purple-400 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Join {organization.name}!
          </h1>
          <p className="text-xl text-purple-200 mb-8">
            Subscribe to get updates about events and announcements
          </p>

          <SubscriptionModal
            organization={organization}
            trigger={
              <Button
                ref={buttonRef}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6 h-auto"
              >
                <Heart className="h-5 w-5 mr-2 animate-pulse" />
                Subscribe Now
              </Button>
            }
          />

          <p className="text-sm text-gray-400 mt-6">
            Or{' '}
            <button
              onClick={() => navigate(`/${orgSlug}`)}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              visit {organization.name}'s page
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
