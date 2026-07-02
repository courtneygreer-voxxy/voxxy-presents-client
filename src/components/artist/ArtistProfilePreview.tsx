import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, MapPin, Globe, Instagram, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ProfilePreviewData {
  name: string
  businessName: string
  bio: string
  location: string
  instagramHandle: string
  tiktokHandle: string
  website: string
  slug: string
}

interface ArtistProfilePreviewProps {
  data: ProfilePreviewData
}

export default function ArtistProfilePreview({ data }: ArtistProfilePreviewProps) {
  const [copied, setCopied] = useState(false)

  const profileUrl = `voxxypresents.com/artists/${data.slug}`

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${profileUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="text-center">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-primary" />
          </div>

          {/* Name & Business */}
          <h3 className="text-sm font-semibold text-foreground">
            {data.name || 'Your Name'}
          </h3>
          {data.businessName && (
            <p className="text-xs text-muted-foreground mt-0.5">{data.businessName}</p>
          )}

          {/* Location */}
          {data.location && (
            <div className="flex items-center justify-center gap-1 mt-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{data.location}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {data.bio && (
          <p className="text-xs text-muted-foreground leading-relaxed text-center">{data.bio}</p>
        )}

        {/* Social Links */}
        {(data.instagramHandle || data.tiktokHandle || data.website) && (
          <div className="flex items-center justify-center gap-3">
            {data.instagramHandle && (
              <a
                href={`https://instagram.com/${data.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 transition-colors"
                title={`@${data.instagramHandle.replace('@', '')}`}
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {data.tiktokHandle && (
              <a
                href={`https://tiktok.com/@${data.tiktokHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                title={`@${data.tiktokHandle.replace('@', '')}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11V9.01a6.28 6.28 0 00-.82-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.79a8.18 8.18 0 004.76 1.52V6.86a4.83 4.83 0 01-1-.17z" />
                </svg>
              </a>
            )}
            {data.website && (
              <a
                href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title={data.website}
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Share URL */}
        <div className="pt-2 border-t border-border">
          <p className="text-[10px] text-muted-foreground/70 text-center mb-2 uppercase tracking-wide">
            Your public profile
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[10px] text-muted-foreground bg-muted/50 rounded px-2 py-1.5 truncate">
              {profileUrl}
            </code>
            <Button variant="outline" size="icon" onClick={handleCopy} className="flex-shrink-0">
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
