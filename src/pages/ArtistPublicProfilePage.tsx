import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  User,
  MapPin,
  Globe,
  Instagram,
  Eye,
  Calendar,
} from 'lucide-react'
import { useForceTheme } from '@/hooks/useForceTheme'
import { mockArtistProfile, mockShows } from '@/mocks/artistPortalData'

export default function ArtistPublicProfilePage() {
  useForceTheme('dark')
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Prototype: always show mock profile regardless of slug
  const profile = mockArtistProfile
  const upcomingShows = mockShows.filter((s) => !s.is_past && s.status === 'approved')

  return (
    <div className="dark voxxy-public-page min-h-screen">
      {/* Gradient Header */}
      <div className="voxxy-gradient-hero-split relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='53' cy='7' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='7' cy='53' r='2'/%3E%3Ccircle cx='53' cy='53' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 text-center">
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-2 border-white/20">
            <User className="w-12 h-12 text-white/80" />
          </div>

          {/* Name & Business */}
          <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
          {profile.business_name && (
            <p className="text-lg text-white/70 mt-1">{profile.business_name}</p>
          )}

          {/* Location */}
          {profile.location && (
            <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-white/60">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          )}

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {profile.instagram_handle && (
              <a
                href={`https://instagram.com/${profile.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-pink-300 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {profile.tiktok_handle && (
              <a
                href={`https://tiktok.com/@${profile.tiktok_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-cyan-300 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11V9.01a6.28 6.28 0 00-.82-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.79a8.18 8.18 0 004.76 1.52V6.86a4.83 4.83 0 01-1-.17z" />
                </svg>
              </a>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-blue-300 transition-colors"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* View Count */}
          <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-white/40">
            <Eye className="w-3 h-3" />
            <span>{profile.views_count} profile views</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Bio */}
        {profile.bio && (
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                About
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Shows */}
        {upcomingShows.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
                Upcoming Shows
              </h2>
              <div className="space-y-3">
                {upcomingShows.map((show) => (
                  <div
                    key={show.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{show.event_title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(show.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {show.venue_name} — {show.city}, {show.state}
                      </p>
                    </div>
                    <Badge variant="tintGreenSoft">{show.vendor_category}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Powered By */}
        <p className="text-center text-xs text-muted-foreground/50 py-4">
          Powered by{' '}
          <span className="font-semibold tracking-wider">VOXXY</span>
        </p>
      </div>
    </div>
  )
}
