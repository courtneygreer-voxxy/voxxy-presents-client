import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { mockShows } from '@/mocks/artistPortalData'
import ArtistShowCard from './ArtistShowCard'

type ShowFilter = 'all' | 'upcoming' | 'past'

export default function ArtistShowsTab() {
  const [filter, setFilter] = useState<ShowFilter>('upcoming')

  const filteredShows = mockShows.filter((show) => {
    if (filter === 'upcoming') return !show.is_past
    if (filter === 'past') return show.is_past
    return true
  })

  const upcomingCount = mockShows.filter((s) => !s.is_past).length
  const pastCount = mockShows.filter((s) => s.is_past).length

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'upcoming' as ShowFilter, label: 'Upcoming', count: upcomingCount },
          { id: 'past' as ShowFilter, label: 'Past', count: pastCount },
          { id: 'all' as ShowFilter, label: 'All', count: mockShows.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth
              ${
                filter === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            {tab.label}
            <Badge variant="tintMuted" className="text-[10px] h-4 min-w-[16px] px-1">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Show Cards */}
      {filteredShows.length > 0 ? (
        <div className="space-y-3">
          {filteredShows.map((show) => (
            <ArtistShowCard key={show.id} show={show} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            {filter === 'upcoming'
              ? 'No upcoming shows. Apply to events to see them here!'
              : filter === 'past'
                ? 'No past shows yet.'
                : 'No shows to display.'}
          </p>
        </div>
      )}
    </div>
  )
}
