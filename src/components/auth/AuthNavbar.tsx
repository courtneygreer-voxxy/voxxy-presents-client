import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, HelpCircle } from 'lucide-react'

export function AuthNavbar() {
  const navigate = useNavigate()

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border-b border-white/10">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors group"
      >
        <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-sm sm:text-base">Voxxy Presents</span>
      </button>
      <Button
        onClick={() => navigate('/contact')}
        variant="ghost"
        size="sm"
        className="text-gray-300 hover:text-white hover:bg-white/10 text-sm"
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Need Help?</span>
        <span className="sm:hidden">Help</span>
      </Button>
    </nav>
  )
}
