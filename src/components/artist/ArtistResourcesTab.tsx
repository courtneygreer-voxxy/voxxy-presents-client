import { mockResources, RESOURCE_CATEGORIES } from '@/mocks/artistPortalData'
import { BookOpen, Video, MapPin, Handshake } from 'lucide-react'
import ArtistResourceCard from './ArtistResourceCard'

const SECTION_ICONS: Record<string, React.ElementType> = {
  BookOpen,
  Video,
  MapPin,
  Handshake,
}

export default function ArtistResourcesTab() {
  const categories = Object.entries(RESOURCE_CATEGORIES) as [
    keyof typeof RESOURCE_CATEGORIES,
    (typeof RESOURCE_CATEGORIES)[keyof typeof RESOURCE_CATEGORIES],
  ][]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {categories.map(([key, config]) => {
        const resources = mockResources.filter((r) => r.category === key)
        if (resources.length === 0) return null

        const Icon = SECTION_ICONS[config.icon]

        return (
          <section key={key}>
            <div className="flex items-center gap-2 mb-3">
              {Icon && <Icon className="w-4 h-4 text-primary" />}
              <h2 className="text-sm font-semibold text-foreground">{config.label}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {resources.map((resource) => (
                <ArtistResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
