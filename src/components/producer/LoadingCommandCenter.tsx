import SimsLoadingScreen from '@/components/ui/SimsLoadingScreen'

interface LoadingCommandCenterProps {
  eventName: string
  progress?: string // Optional progress message
}

export default function LoadingCommandCenter({ eventName, progress }: LoadingCommandCenterProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen voxxy-gradient-page-cool">
      <h2 className="text-2xl font-semibold text-foreground mb-2">Loading {eventName}</h2>
      <SimsLoadingScreen message={progress} />
    </div>
  )
}
