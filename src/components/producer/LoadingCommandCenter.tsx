import { LayoutGrid } from 'lucide-react';

interface LoadingCommandCenterProps {
  eventName: string;
  progress?: string; // Optional progress message
}

export default function LoadingCommandCenter({ eventName, progress }: LoadingCommandCenterProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a0d2e] via-[#2d1b4e] to-[#1a0d2e]">
      <div className="text-center">
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          {/* Animated waves */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-purple-500/30 rounded-full animate-ping" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border-2 border-purple-400/20 rounded-full animate-pulse" />
          </div>

          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-600/20 to-blue-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-purple-500/30">
              <LayoutGrid className="w-12 h-12 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-semibold text-white mb-2">
          {progress || 'Loading Command Center'}
        </h2>
        <p className="text-white/60 mb-4">{eventName}</p>

        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
