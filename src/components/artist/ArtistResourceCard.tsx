import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, ExternalLink, Calendar } from 'lucide-react'
import { type Resource } from '@/mocks/artistPortalData'
import type { BadgeVariant } from '@/components/ui/badge'

interface ArtistResourceCardProps {
  resource: Resource
}

const CATEGORY_BADGE: Record<Resource['category'], { label: string; variant: BadgeVariant }> = {
  getting_started: { label: 'Guide', variant: 'tintBlueSoft' },
  online_class: { label: 'Class', variant: 'tintPurpleSoft' },
  workshop: { label: 'Workshop', variant: 'tintGreenSoft' },
  partner: { label: 'Opportunity', variant: 'tintOrangeSoft' },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ArtistResourceCard({ resource }: ArtistResourceCardProps) {
  const badge = CATEGORY_BADGE[resource.category]

  return (
    <Card className="hover:border-primary/30 transition-colors group">
      <CardContent className="p-4 space-y-3">
        {/* Top Row: Badge + Free label */}
        <div className="flex items-center justify-between">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {resource.is_free && (
            <span className="text-[10px] font-medium text-green-400 uppercase tracking-wide">
              Free
            </span>
          )}
        </div>

        {/* Title + Description */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">{resource.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
            {resource.description}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{resource.location}</span>
          </div>
          {resource.date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(resource.date)}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <a
          href={resource.url}
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors group-hover:underline"
        >
          Learn More
          <ExternalLink className="w-3 h-3" />
        </a>
      </CardContent>
    </Card>
  )
}
