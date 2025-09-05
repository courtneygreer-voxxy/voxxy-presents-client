import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import type { Organization } from '@/types/database'

interface WelcomeSectionProps {
  organization: Organization
  logoImage?: string
  showAdminControls?: boolean
}

export function WelcomeSection({ organization, logoImage, showAdminControls = false }: WelcomeSectionProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Card className="!bg-white/10 backdrop-blur-sm !border-white/20 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <img
                  src={logoImage || organization.logoUrl || "/placeholder-logo.png"}
                  alt={`${organization.name} Logo`}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/30 object-cover shadow-lg"
                />
              </div>
              
              {/* Welcome Content */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {organization.name}
                </h1>
                <p className="text-xl text-gray-300 mb-6">
                  {organization.description}
                </p>
                
                {/* Welcome Message */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    Welcome to {organization.name}
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-200">
                    {typeof organization.background === 'string' 
                      ? organization.background 
                      : 'Join our vibrant community and discover amazing events, connect with like-minded people, and be part of something special.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}