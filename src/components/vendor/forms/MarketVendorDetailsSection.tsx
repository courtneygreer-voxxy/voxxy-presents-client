import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Plus } from 'lucide-react'
import { MarketVendorSpecificDetails } from '@/types/vendor'

interface MarketVendorDetailsSectionProps {
  data: Partial<MarketVendorSpecificDetails>
  onChange: (data: Partial<MarketVendorSpecificDetails>) => void
}

const COMMON_PRODUCT_TYPES = [
  'Jewelry', 'Art & Prints', 'Clothing', 'Accessories', 'Home Decor',
  'Ceramics & Pottery', 'Candles & Soaps', 'Plants & Flowers', 'Food Products',
  'Vintage & Antiques', 'Handmade Crafts', 'Textiles'
]

export function MarketVendorDetailsSection({ data, onChange }: MarketVendorDetailsSectionProps) {
  const [customProductType, setCustomProductType] = useState('')

  const addProductType = (product: string) => {
    if (product && !(data.productTypes || []).includes(product)) {
      onChange({
        ...data,
        productTypes: [...(data.productTypes || []), product]
      })
    }
  }

  const removeProductType = (product: string) => {
    onChange({
      ...data,
      productTypes: (data.productTypes || []).filter(p => p !== product)
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Market Vendor Details</h3>

      {/* Product Types */}
      <div className="space-y-2">
        <Label className="text-white">Product Types *</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_PRODUCT_TYPES.map(product => (
            <button
              key={product}
              type="button"
              onClick={() => {
                if ((data.productTypes || []).includes(product)) {
                  removeProductType(product)
                } else {
                  addProductType(product)
                }
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                (data.productTypes || []).includes(product)
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {product}
            </button>
          ))}
        </div>

        {/* Selected products */}
        {(data.productTypes || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {data.productTypes!.map(product => (
              <Badge key={product} variant="secondary" className="gap-1">
                {product}
                <button
                  type="button"
                  onClick={() => removeProductType(product)}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Custom product type */}
        <div className="flex gap-2">
          <Input
            value={customProductType}
            onChange={(e) => setCustomProductType(e.target.value)}
            placeholder="Add custom product type..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (customProductType.trim()) {
                  addProductType(customProductType.trim())
                  setCustomProductType('')
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (customProductType.trim()) {
                addProductType(customProductType.trim())
                setCustomProductType('')
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-white">Price Range *</Label>
        <Input
          value={data.priceRange || ''}
          onChange={(e) => onChange({ ...data, priceRange: e.target.value })}
          placeholder="e.g., $5-$50, $100-$500"
        />
        <p className="text-xs text-gray-400">Typical price range for your products</p>
      </div>

      {/* Booth Requirements */}
      <div className="space-y-4 p-4 bg-white/5 rounded-lg">
        <Label className="text-white font-medium">Booth Requirements (for market events)</Label>

        <div className="space-y-2">
          <Label className="text-white text-sm">Space Needed</Label>
          <Input
            value={data.boothRequirements?.spaceNeeded || ''}
            onChange={(e) => onChange({
              ...data,
              boothRequirements: {
                ...data.boothRequirements,
                spaceNeeded: e.target.value,
                needsElectricity: data.boothRequirements?.needsElectricity || false,
                needsWater: data.boothRequirements?.needsWater || false,
                indoorOutdoor: data.boothRequirements?.indoorOutdoor || 'both'
              }
            })}
            placeholder="e.g., 10x10, 20x10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <Label className="text-white text-sm">Needs Electricity</Label>
            <Switch
              checked={data.boothRequirements?.needsElectricity || false}
              onCheckedChange={(checked) => onChange({
                ...data,
                boothRequirements: {
                  ...data.boothRequirements,
                  spaceNeeded: data.boothRequirements?.spaceNeeded || '',
                  needsElectricity: checked,
                  needsWater: data.boothRequirements?.needsWater || false,
                  indoorOutdoor: data.boothRequirements?.indoorOutdoor || 'both'
                }
              })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <Label className="text-white text-sm">Needs Water</Label>
            <Switch
              checked={data.boothRequirements?.needsWater || false}
              onCheckedChange={(checked) => onChange({
                ...data,
                boothRequirements: {
                  ...data.boothRequirements,
                  spaceNeeded: data.boothRequirements?.spaceNeeded || '',
                  needsElectricity: data.boothRequirements?.needsElectricity || false,
                  needsWater: checked,
                  indoorOutdoor: data.boothRequirements?.indoorOutdoor || 'both'
                }
              })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white text-sm">Preferred Environment</Label>
          <Select
            value={data.boothRequirements?.indoorOutdoor || 'both'}
            onValueChange={(value) => onChange({
              ...data,
              boothRequirements: {
                ...data.boothRequirements,
                spaceNeeded: data.boothRequirements?.spaceNeeded || '',
                needsElectricity: data.boothRequirements?.needsElectricity || false,
                needsWater: data.boothRequirements?.needsWater || false,
                indoorOutdoor: value as 'indoor' | 'outdoor' | 'both'
              }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indoor">Indoor Only</SelectItem>
              <SelectItem value="outdoor">Outdoor Only</SelectItem>
              <SelectItem value="both">Indoor or Outdoor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory Size */}
      <div className="space-y-2">
        <Label className="text-white">Inventory Size</Label>
        <Select
          value={data.inventorySize || 'medium'}
          onValueChange={(value) => onChange({ ...data, inventorySize: value as 'small' | 'medium' | 'large' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (fits in a car)</SelectItem>
            <SelectItem value="medium">Medium (needs a van)</SelectItem>
            <SelectItem value="large">Large (needs a truck)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400">Typical amount of inventory you bring to events</p>
      </div>

      {/* Custom Orders */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div>
          <Label className="text-white font-medium">Accepts Custom Orders</Label>
          <p className="text-sm text-gray-300">Do you take custom requests?</p>
        </div>
        <Switch
          checked={data.acceptsCustomOrders || false}
          onCheckedChange={(checked) => onChange({ ...data, acceptsCustomOrders: checked })}
        />
      </div>

      {/* Ships Products */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
        <div>
          <Label className="text-white font-medium">Ships Products</Label>
          <p className="text-sm text-gray-300">Can customers order online for shipping?</p>
        </div>
        <Switch
          checked={data.shipsProducts || false}
          onCheckedChange={(checked) => onChange({ ...data, shipsProducts: checked })}
        />
      </div>
    </div>
  )
}
