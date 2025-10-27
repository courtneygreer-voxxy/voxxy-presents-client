import React from 'react'
import { VendorType } from '@/types/vendor'
import { Building2, ChefHat, Mic2, ShoppingBag } from 'lucide-react'

interface VendorTypeOption {
  type: VendorType
  label: string
  description: string
  icon: React.ReactNode
  color: string
  examples: string
}

const VENDOR_TYPE_OPTIONS: VendorTypeOption[] = [
  {
    type: 'venue',
    label: 'Venue',
    description: 'Physical event spaces for hosting gatherings',
    icon: <Building2 className="h-8 w-8" />,
    color: 'purple',
    examples: 'Bars, restaurants, community centers, event spaces'
  },
  {
    type: 'catering',
    label: 'Catering',
    description: 'Food and beverage services for events',
    icon: <ChefHat className="h-8 w-8" />,
    color: 'orange',
    examples: 'Restaurants, food trucks, catering companies'
  },
  {
    type: 'entertainment',
    label: 'Entertainment',
    description: 'Performers and entertainers for events',
    icon: <Mic2 className="h-8 w-8" />,
    color: 'pink',
    examples: 'DJs, bands, comedians, dancers, speakers'
  },
  {
    type: 'market_vendor',
    label: 'Market Vendor',
    description: 'Artisans and vendors selling products',
    icon: <ShoppingBag className="h-8 w-8" />,
    color: 'green',
    examples: 'Jewelry, art, clothing, crafts, local products'
  }
]

interface VendorTypeSelectorProps {
  selectedType?: VendorType
  onSelect: (type: VendorType) => void
  disabled?: boolean
}

export function VendorTypeSelector({ selectedType, onSelect, disabled = false }: VendorTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">What type of vendor are you?</h3>
        <p className="text-sm text-gray-300">Select the category that best describes your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VENDOR_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedType === option.type
          const colorClasses = {
            purple: {
              border: 'border-purple-500',
              bg: 'bg-purple-500/20',
              icon: 'text-purple-400',
              hover: 'hover:border-purple-400'
            },
            orange: {
              border: 'border-orange-500',
              bg: 'bg-orange-500/20',
              icon: 'text-orange-400',
              hover: 'hover:border-orange-400'
            },
            pink: {
              border: 'border-pink-500',
              bg: 'bg-pink-500/20',
              icon: 'text-pink-400',
              hover: 'hover:border-pink-400'
            },
            green: {
              border: 'border-green-500',
              bg: 'bg-green-500/20',
              icon: 'text-green-400',
              hover: 'hover:border-green-400'
            }
          }

          const colors = colorClasses[option.color as keyof typeof colorClasses]

          return (
            <button
              key={option.type}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(option.type)}
              className={`
                relative p-6 rounded-lg border-2 transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${
                  isSelected
                    ? `${colors.border} ${colors.bg}`
                    : `border-white/20 bg-white/5 ${colors.hover}`
                }
                hover:shadow-lg
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full ${colors.border} ${colors.bg} flex items-center justify-center`}>
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
              )}

              {/* Icon */}
              <div className={`mb-4 ${isSelected ? colors.icon : 'text-gray-400'}`}>
                {option.icon}
              </div>

              {/* Label */}
              <h4 className="text-lg font-semibold text-white mb-2 text-left">
                {option.label}
              </h4>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-3 text-left">
                {option.description}
              </p>

              {/* Examples */}
              <p className="text-xs text-gray-400 text-left italic">
                Examples: {option.examples}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
