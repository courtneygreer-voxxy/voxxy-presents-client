import { Loader } from 'lucide-react'

interface LoadingTransitionProps {
  message?: string
  submessage?: string
}

/**
 * Loading transition screen shown during authentication redirects
 * Eliminates "frozen" screen feeling during role-based routing
 */
export function LoadingTransition({
  message = 'Loading...',
  submessage = 'This will only take a moment...'
}: LoadingTransitionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      {/* Loading content */}
      <div className="relative text-center">
        <Loader className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-white text-xl font-semibold">{message}</p>
        {submessage && (
          <p className="text-gray-300 text-sm mt-2">{submessage}</p>
        )}
      </div>
    </div>
  )
}
