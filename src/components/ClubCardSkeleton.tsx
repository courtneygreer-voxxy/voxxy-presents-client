import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton loader for club cards
 * Shown while club data is loading to provide visual feedback
 */
export function ClubCardSkeleton() {
  return (
    <Card className="bg-background/10 backdrop-blur-sm border border-border overflow-hidden">
      <CardHeader className="space-y-2">
        {/* Club name skeleton */}
        <div className="h-6 bg-background/20 rounded animate-pulse w-3/4" />
        {/* Club slug skeleton */}
        <div className="h-4 bg-background/20 rounded animate-pulse w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Description line 1 */}
        <div className="h-4 bg-background/20 rounded animate-pulse w-full" />
        {/* Description line 2 */}
        <div className="h-4 bg-background/20 rounded animate-pulse w-5/6" />

        {/* Stats/buttons area */}
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-background/20 rounded animate-pulse flex-1" />
          <div className="h-8 bg-background/20 rounded animate-pulse flex-1" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Grid of skeleton loaders for clubs management page
 */
export function ClubsLoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ClubCardSkeleton key={i} />
      ))}
    </div>
  )
}
