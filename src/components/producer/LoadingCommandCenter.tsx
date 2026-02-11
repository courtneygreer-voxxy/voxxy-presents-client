import SimsLoadingScreen from '@/components/ui/SimsLoadingScreen';

interface LoadingCommandCenterProps {
  eventName: string;
  progress?: string; // Optional progress message
}

export default function LoadingCommandCenter({ eventName, progress }: LoadingCommandCenterProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#1a0d2e] via-[#2d1b4e] to-[#1a0d2e]">
      <h2 className="text-2xl font-semibold text-white mb-2">
        Loading {eventName}
      </h2>
      <SimsLoadingScreen message={progress} />
    </div>
  );
}
