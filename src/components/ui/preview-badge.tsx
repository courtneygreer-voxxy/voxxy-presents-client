import React from 'react'
import { Badge } from './badge'
import { Sparkles, TestTube, Eye } from 'lucide-react'

interface PreviewBadgeProps {
  variant?: 'preview' | 'beta' | 'coming-soon'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PreviewBadge({ variant = 'preview', size = 'sm', className }: PreviewBadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'preview':
        return {
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          icon: <Eye className="h-3 w-3 mr-1" />,
          text: 'Preview',
        }
      case 'beta':
        return {
          className: 'bg-primary/10 text-slate-800 hover:bg-primary/20',
          icon: <TestTube className="h-3 w-3 mr-1" />,
          text: 'Beta',
        }
      case 'coming-soon':
        return {
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
          icon: <Sparkles className="h-3 w-3 mr-1" />,
          text: 'Coming Soon',
        }
      default:
        return {
          className: 'bg-muted text-gray-800',
          icon: null,
          text: 'Preview',
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1'
      case 'md':
        return 'text-sm px-3 py-1'
      case 'lg':
        return 'text-base px-4 py-2'
      default:
        return 'text-xs px-2 py-1'
    }
  }

  const variantConfig = getVariantStyles()
  const sizeClass = getSizeStyles()

  return (
    <Badge
      variant="secondary"
      className={`${variantConfig.className} ${sizeClass} ${className} font-medium inline-flex items-center`}
    >
      {variantConfig.icon}
      {variantConfig.text}
    </Badge>
  )
}
